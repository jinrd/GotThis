package com.studyflow.backend.fielddefinition.entity;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import com.studyflow.backend.global.entity.BaseTimeEntity;
import com.studyflow.backend.global.exception.BusinessException;
import com.studyflow.backend.global.exception.ErrorCode;
import com.studyflow.backend.tasklist.entity.TaskList;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity 
@Table (name = "field_definition")
public class FieldDefinition extends BaseTimeEntity{

    private static final int MAX_TEXT_LENGTH = 1000;

    @Id 
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne (fetch = FetchType.LAZY, optional = false)
    @JoinColumn (name = "task_list_id", nullable = false)
    private TaskList taskList;

    @Column (nullable = false, length = 50)
    private String name;

    @Enumerated (EnumType.STRING)
    @Column (nullable = false, length = 20)
    private FieldType type;

    @JdbcTypeCode (SqlTypes.JSON)
    private List<String> options;

    @Column (nullable = false)
    private double sortOrder;



    protected FieldDefinition() {}

    private FieldDefinition(TaskList taskList, String name, FieldType type, List<String> options, double sortOrder) {
        this.taskList = taskList;
        this.name = name;
        this.type = type;
        this.options = options;
        this.sortOrder = sortOrder;
    }

    public static FieldDefinition create(TaskList taskList, String name, FieldType type, List<String> options, double sortOrder) {
        if(options != null) {
            options = List.copyOf(options);
        }

        return new FieldDefinition(taskList, name, type, options, sortOrder);

    }

    public void rename(String name) {
        this.name = name;
    }

    public void changeOptions(List<String> options) {
        this.options = List.copyOf(options);
    }

    public void changeSortOrder(double sortOrder) {
        this.sortOrder = sortOrder;
    }

    public String propertyKey() {
        return String.valueOf(id);
    }

    // 이 필드에 저장할 형태로 바꿔서 반환한다. 맞지 않으면 예외를 던진다.
    public Object normalizeValue(Object value) {
        return switch (type) {
            case TEXT -> {
                if (!(value instanceof String s) || s.length() > MAX_TEXT_LENGTH) {
                    throw invalidValue(MAX_TEXT_LENGTH + "자 이하의 문자열이어야 합니다.");
                }
                yield s;
            }
            case NUMBER -> {
                if (!(value instanceof Number n) || !Double.isFinite(n.doubleValue())) {
                    throw invalidValue("숫자여야 합니다.");
                }
                yield n;
            }
            case DATE -> {
                if (!(value instanceof String s)) {
                    throw invalidValue("yyyy-MM-dd 형식의 날짜여야 합니다.");
                }
                try {
                    yield LocalDate.parse(s).toString();
                } catch (DateTimeParseException e) {
                    throw invalidValue("yyyy-MM-dd 형식의 날짜여야 합니다.");
                }
            }
            case CHECKBOX -> {
                if (!(value instanceof Boolean b)) {
                    throw invalidValue("true 또는 false여야 합니다.");
                }
                yield b;
            }
            case SELECT -> {
                if (!(value instanceof String s) || !options.contains(s)) {
                    throw invalidValue("선택지 " + options + " 중 하나여야 합니다.");
                }
                yield s;
            }
        };
    }

    private BusinessException invalidValue(String reason) {
        return new BusinessException(ErrorCode.INVALID_PROPERTY_VALUE, "'" + name + "' 필드: " + reason);
    }

    public Long getId() {
        return id;
    }
    public TaskList getTaskList() {
        return taskList;
    }
    public String getName() {
        return name;
    }
    public FieldType getType() {
        return type;
    }
    public List<String> getOptions() {
        return options;
    }
    public double getSortOrder() {
        return sortOrder;
    }
}
