package com.studyflow.backend.task.entity;

import com.studyflow.backend.global.entity.BaseTimeEntity;
import com.studyflow.backend.tag.entity.Tag;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity 
@Table (name = "task_tag")
public class TaskTag extends BaseTimeEntity{

    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne (fetch = FetchType.LAZY, optional = false)
    @JoinColumn (name = "task_id", nullable = false)
    private Task task;

    @ManyToOne (fetch = FetchType.LAZY, optional = false)
    @JoinColumn (name = "tag_id" , nullable = false)
    private Tag tag;

    protected TaskTag(){}
    private TaskTag(Task task, Tag tag) {
        this.task = task;
        this.tag = tag;
    }

    public static TaskTag create(Task task, Tag tag) {
        return new TaskTag(task, tag);
    }

    public Long getId() {
        return id;
    }
    public Tag getTag() {
        return tag;
    }
    public Task getTask() {
        return task;
    }
}
