package com.studyflow.backend.tasklist.entity;

import com.studyflow.backend.global.entity.BaseTimeEntity;
import com.studyflow.backend.user.entity.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
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
    private double sortOrder;

    @ManyToOne (fetch = FetchType.LAZY, optional = false)
    @JoinColumn (name="user_id", nullable = false)
    private User user;

    protected TaskList() {}

    private TaskList(User user, String name, String color, double sortOrder) {
        this.user = user;
        this.name = name;
        this.color = color;
        this.sortOrder = sortOrder;
    }

    public static TaskList create(User user, String name, String color, double sortOrder) {
        return new TaskList(user, name, color, sortOrder);
    }
    
    public void update(String name, String color) {
        if (name != null) {
            this.name = name;
        }
        if (color != null) {
            this.color = color;
        }
    }

    public void changeSortOrder(double sortOrder) {
        this.sortOrder = sortOrder;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getColor() { return color; }
    public double getSortOrder() { return sortOrder; }
}
