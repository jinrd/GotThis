package com.studyflow.backend.tag.entity;

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
@Table (name = "tag")
public class Tag extends BaseTimeEntity{

    @Id 
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne (fetch = FetchType.LAZY, optional = false)
    @JoinColumn (name = "user_id", nullable = false)
    private User user;

    @Column (nullable = false, length = 30)
    private String name;

    @Column(length = 7)
    private String color;

    protected Tag(){}

    private Tag(User user, String name, String color) {
        this.user = user;
        this.name = name;
        this.color = color;
    }

    public static Tag create(User user, String name, String color) {
        return new Tag(user, name, color);
    }

    public void update(String name, String color) {
        if(name != null) {
            this.name = name;
        }
        if(color != null) {
            this.color = color;
        }
    }

    public void clearColor() {
        this.color = null;
    }

    public Long getId() {
        return id;
    }
    public User getUser() {
        return user;
    }
    public String getName() {
        return name;
    }
    public String getColor() {
        return color;
    }
}
