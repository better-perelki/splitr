package com.splitr.controller;

import com.splitr.dto.*;
import com.splitr.service.UserService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public UserProfileResponse getProfile(Authentication auth) {
        return userService.getProfile(userId(auth));
    }

    @PutMapping("/me")
    public UserProfileResponse updateProfile(Authentication auth,
                                             @Valid @RequestBody UpdateProfileRequest request) {
        return userService.updateProfile(userId(auth), request);
    }

    @PostMapping("/me/avatar")
    public UserProfileResponse uploadAvatar(Authentication auth,
                                            @RequestParam("file") MultipartFile file) {
        return userService.uploadAvatar(userId(auth), file);
    }

    @GetMapping("/search")
    public List<UserSearchResponse> search(@RequestParam("q") String query) {
        return userService.search(query);
    }

    @GetMapping("/all")
    public List<UserSummary> getAllUsers(Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        return userService.getAllUsersExcluding(userId);
    }

    private UUID userId(Authentication auth) {
        return (UUID) auth.getPrincipal();
    }
}
