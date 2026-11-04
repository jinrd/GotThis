package com.studyflow.backend.fielddefinition.entity;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigInteger;
import java.util.List;
import java.util.stream.Stream;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

import com.studyflow.backend.global.exception.BusinessException;
import com.studyflow.backend.global.exception.ErrorCode;

class FieldDefinitionTest {

    // normalizeValue는 목록을 쓰지 않으므로 taskList는 null로 둔다
    private static FieldDefinition field(FieldType type) {
        List<String> options = (type == FieldType.SELECT) ? List.of("a", "b") : null;
        return FieldDefinition.create(null, "테스트", type, options, 0);
    }

    @Test
    @DisplayName("타입에 맞는 값은 그대로 저장한다")
    void acceptsValidValues() {
        assertThat(field(FieldType.TEXT).normalizeValue("메모")).isEqualTo("메모");
        assertThat(field(FieldType.TEXT).normalizeValue("x".repeat(1000))).isEqualTo("x".repeat(1000));
        assertThat(field(FieldType.NUMBER).normalizeValue(3)).isEqualTo(3);
        assertThat(field(FieldType.NUMBER).normalizeValue(3.5)).isEqualTo(3.5);
        assertThat(field(FieldType.NUMBER).normalizeValue(12345678901234L)).isEqualTo(12345678901234L);
        assertThat(field(FieldType.CHECKBOX).normalizeValue(true)).isEqualTo(true);
        assertThat(field(FieldType.SELECT).normalizeValue("b")).isEqualTo("b");
    }

    @Test
    @DisplayName("DATE는 yyyy-MM-dd 문자열로 정규화한다")
    void normalizesDate() {
        assertThat(field(FieldType.DATE).normalizeValue("2026-11-04")).isEqualTo("2026-11-04");
    }

    static Stream<Arguments> invalidValues() {
        return Stream.of(
                Arguments.of(FieldType.TEXT, 1),
                Arguments.of(FieldType.TEXT, "x".repeat(1001)),
                Arguments.of(FieldType.NUMBER, "3"),
                Arguments.of(FieldType.NUMBER, true),
                Arguments.of(FieldType.NUMBER, Double.POSITIVE_INFINITY),
                Arguments.of(FieldType.NUMBER, BigInteger.TEN.pow(400)),  // JSON의 초대형 정수
                Arguments.of(FieldType.DATE, "2026-13-01"),
                Arguments.of(FieldType.DATE, "2026-1-5"),
                Arguments.of(FieldType.DATE, 20261104),
                Arguments.of(FieldType.CHECKBOX, "true"),
                Arguments.of(FieldType.SELECT, "z"),
                Arguments.of(FieldType.SELECT, List.of("a")));
    }

    @ParameterizedTest(name = "{0}에 {1} → 거부")
    @MethodSource("invalidValues")
    @DisplayName("타입에 맞지 않는 값은 INVALID_PROPERTY_VALUE로 거부한다")
    void rejectsInvalidValues(FieldType type, Object value) {
        assertThatThrownBy(() -> field(type).normalizeValue(value))
                .isInstanceOf(BusinessException.class)
                .satisfies(e -> assertThat(((BusinessException) e).getErrorCode())
                        .isEqualTo(ErrorCode.INVALID_PROPERTY_VALUE))
                .hasMessageContaining("'테스트' 필드");
    }

    @Test
    @DisplayName("options는 방어적 복사되어 바깥 리스트를 바꿔도 영향이 없다")
    void optionsAreCopied() {
        List<String> source = new java.util.ArrayList<>(List.of("a"));
        FieldDefinition select = FieldDefinition.create(null, "단계", FieldType.SELECT, source, 0);

        source.add("b");

        assertThat(select.getOptions()).containsExactly("a");
    }
}
