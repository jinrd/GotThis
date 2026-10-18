package com.studyflow.backend.task.entity;

import java.time.LocalDate;

import com.studyflow.backend.global.entity.BaseTimeEntity;
import com.studyflow.backend.status.entity.Status;
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
@Table (name = "task")
public class Task extends BaseTimeEntity{

    @Id 
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "task_list_id", nullable = false)
    private TaskList taskList;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "status_id", nullable = false)
    private Status status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Task parent;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(length = 2000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Priority priority;

    private LocalDate dueDate;

    @Column (nullable = false)
    private double sortOrder;

    protected Task() {}

    private Task(TaskList taskList, Status status, Task parent, String title, String description, Priority priority, LocalDate dueDate, double sortOrder) {
        this.taskList = taskList;
        this.status = status;
        this.parent = parent;
        this.title = title;
        this.description = description;
        this.priority = priority;
        this.dueDate = dueDate;
        this.sortOrder = sortOrder;
    }

    public static Task create(TaskList taskList, Status status, Task parent, String title, String description, Priority priority, LocalDate dueDate, double sortOrder) {
        if(priority == null) {
            priority = Priority.NONE;
        }

        return new Task(taskList, status, parent, title, description, priority, dueDate, sortOrder);
    }

    public void update(String title, String description, Priority priority, LocalDate dueDate) {
        if(title != null) {
            this.title = title;
        }

        if(description != null) {
            this.description = description;
        }

        if(priority != null) {
            this.priority = priority;
        }

        if(dueDate != null) {
            this.dueDate = dueDate;
        }
    }

    public void changeStatus(Status status, double sortOrder) {
        this.status = status;
        this.sortOrder = sortOrder;
    }

    public void clearDueDate() {
        this.dueDate = null;
    }

    public void changeSortOrder(double sortOrder) {
        this.sortOrder = sortOrder;
    }

    public Long getId() { return id; }
    public TaskList getTaskList() { return taskList; }
    public Status getStatus() { return status; }
    public Task getParent() { return parent; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public Priority getPriority() { return priority; }
    public LocalDate getDueDate() { return dueDate; }
    public double getSortOrder() { return sortOrder; }

}
