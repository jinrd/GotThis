package com.studyflow.backend.global.ordering;

import static com.studyflow.backend.global.ordering.GapOrdering.GAP;
import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class GapOrderingTest {

    @Test
    @DisplayName("간격은 2^16이다 (상수 오타 방지)")
    void gapIsPowerOfTwo() {
        assertThat(GAP).isEqualTo(65536.0);
    }

    @Test
    @DisplayName("after: 빈 줄이면 GAP, 아니면 마지막 값 + GAP")
    void after() {
        assertThat(GapOrdering.after(null)).isEqualTo(GAP);
        assertThat(GapOrdering.after(3 * GAP)).isEqualTo(4 * GAP);
    }

    @Test
    @DisplayName("between: 앞뒤 중간값, 한쪽이 비면 맨 앞/맨 뒤 규칙")
    void between() {
        assertThat(GapOrdering.between(null, null)).isEqualTo(GAP);         // 빈 줄
        assertThat(GapOrdering.between(GAP, 2 * GAP)).isEqualTo(1.5 * GAP); // 사이
        assertThat(GapOrdering.between(null, GAP)).isEqualTo(GAP / 2);      // 맨 앞
        assertThat(GapOrdering.between(3 * GAP, null)).isEqualTo(4 * GAP);  // 맨 뒤
    }

    @Test
    @DisplayName("between 결과는 항상 prev와 next 사이에 있다")
    void betweenIsStrictlyInside() {
        double prev = 1.0;
        double next = 1.001;
        double x = GapOrdering.between(prev, next);

        assertThat(x).isGreaterThan(prev).isLessThan(next);
    }

    @Test
    @DisplayName("hasRoom: 빈 줄·맨 뒤·넉넉한 틈은 true, 좁은 틈은 false")
    void hasRoom() {
        assertThat(GapOrdering.hasRoom(null, null)).isTrue();
        assertThat(GapOrdering.hasRoom(GAP, null)).isTrue();
        assertThat(GapOrdering.hasRoom(GAP, 2 * GAP)).isTrue();

        // 실수 경계값(1.0001 - 1.0 = 0.0000999…)은 피하고 확실히 좁은 값을 쓴다
        assertThat(GapOrdering.hasRoom(1.0, 1.00001)).isFalse();
        assertThat(GapOrdering.hasRoom(null, 0.00001)).isFalse();
    }

    @Test
    @DisplayName("nth: 재정렬 값은 (index + 1) * GAP")
    void nth() {
        assertThat(GapOrdering.nth(0)).isEqualTo(GAP);
        assertThat(GapOrdering.nth(2)).isEqualTo(3 * GAP);
    }

    @Test
    @DisplayName("맨 앞에 반복 삽입해도 30번은 재정렬 없이 버틴다")
    void repeatedInsertAtFront() {
        Double first = GAP;
        int inserts = 0;
        while (GapOrdering.hasRoom(null, first)) {
            first = GapOrdering.between(null, first);
            inserts++;
        }

        assertThat(inserts).isGreaterThanOrEqualTo(30);
    }

    @Test
    @DisplayName("같은 틈에 반복 삽입해도 30번은 버티고, 재정렬하면 다시 공간이 생긴다")
    void repeatedInsertIntoSameGap() {
        double prev = GAP;
        Double next = 2 * GAP;
        int inserts = 0;
        while (GapOrdering.hasRoom(prev, next)) {
            next = GapOrdering.between(prev, next); // 새 카드가 항상 prev 바로 뒤에 들어간다
            inserts++;
        }

        assertThat(inserts).isGreaterThanOrEqualTo(30);
        assertThat(GapOrdering.hasRoom(GapOrdering.nth(0), GapOrdering.nth(1))).isTrue();
    }
}
