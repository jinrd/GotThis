package com.studyflow.backend.status.entity;

import java.util.List;

import com.studyflow.backend.global.entity.BaseTimeEntity;
import com.studyflow.backend.global.ordering.GapOrdering;
import com.studyflow.backend.tasklist.entity.TaskList;

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
@Table (name = "status")
public class Status extends BaseTimeEntity{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "task_list_id", nullable = false)
    private TaskList taskList;

    @Column(nullable = false, length = 30)
    private String name;

    @Column(nullable = false)
    private double sortOrder;

    @Column(name = "is_done", nullable = false)
    private boolean done;

    protected Status(){}
    private Status(TaskList taskList, String name, double sortOrder, boolean done) {
        this.taskList = taskList;
        this.name = name;
        this.sortOrder = sortOrder;
        this.done = done;
    }

    public static Status create(TaskList taskList, String name, double sortOrder, boolean done) {
        return new Status(taskList, name, sortOrder, done);
    }

    public void update(String name, Boolean done) {
        if(name != null) {
            this.name = name;
        }

        if(done != null) {
            this.done = done;
        }
    }

    public void changeSortOrder(double sortOrder) {
        this.sortOrder = sortOrder;
    }

    public static List<Status> defaults(TaskList taskList) {
    return List.of(
        create(taskList, "할 일", GapOrdering.nth(0), false),
        create(taskList, "진행 중", GapOrdering.nth(1), false),
        create(taskList, "완료", GapOrdering.nth(2), true)
    );
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

    public double getSortOrder() {
        return sortOrder;
    }

    public boolean isDone() {
        return done;
    }
}
