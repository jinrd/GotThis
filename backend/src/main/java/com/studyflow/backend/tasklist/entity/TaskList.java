package com.studyflow.backend.tasklist.entity;

import com.studyflow.backend.global.entity.BaseTimeEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity 
@Table (name = "task_list")
public class TaskList extends BaseTimeEntity{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(length = 7)
    private String color;

    @Column(nullable = false)
    private int sortOrder;

    protected TaskList() {}

    private TaskList(String name, String color, int sortOrder) {
        this.name = name;
        this.color = color;
        this.sortOrder = sortOrder;
    }

    public static TaskList create(String name, String color, int sortOrder) {
        return new TaskList(name, color, sortOrder);
    }
    
    public void update(String name, String color) {
        if (name != null) {
            this.name = name;
        }
        if (color != null) {
            this.color = color;
        }
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getColor() { return color; }
    public int getSortOrder() { return sortOrder; }
}
