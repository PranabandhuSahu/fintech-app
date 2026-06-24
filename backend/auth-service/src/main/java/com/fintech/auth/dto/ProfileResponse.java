package com.fintech.auth.dto;

import com.fintech.auth.model.User;

import java.time.Instant;

public class ProfileResponse {

    private Long userId;
    private String username;
    private String email;
    private String fullName;
    private Instant memberSince;

    public static ProfileResponse from(User user) {
        ProfileResponse r = new ProfileResponse();
        r.userId = user.getId();
        r.username = user.getUsername();
        r.email = user.getEmail();
        r.fullName = user.getFullName();
        r.memberSince = user.getCreatedAt();
        return r;
    }

    public Long getUserId() {
        return userId;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    public String getFullName() {
        return fullName;
    }

    public Instant getMemberSince() {
        return memberSince;
    }
}
