package com.splitr.service;

import com.splitr.dto.*;
import com.splitr.entity.User;
import com.splitr.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    public UserService(UserRepository userRepository, FileStorageService fileStorageService) {
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(UUID userId) {
        var user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return new UserProfileResponse(
                user.getId(), user.getEmail(), user.getPhone(), user.getUsername(),
                user.getAvatarUrl(), user.getDefaultCurrency(), user.getTimezone(),
                user.getCreatedAt());
    }

    @Transactional
    public UserProfileResponse updateProfile(UUID userId, UpdateProfileRequest request) {
        var user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (request.username() != null && !request.username().isBlank()) {
            if (!request.username().equals(user.getUsername()) && userRepository.existsByUsername(request.username())) {
                throw new IllegalArgumentException("Username already taken");
            }
            user.setUsername(request.username());
        }
        if (request.phone() != null) user.setPhone(request.phone().isBlank() ? null : request.phone());
        if (request.defaultCurrency() != null) user.setDefaultCurrency(request.defaultCurrency());
        if (request.timezone() != null) user.setTimezone(request.timezone());

        user = userRepository.save(user);
        return new UserProfileResponse(
                user.getId(), user.getEmail(), user.getPhone(), user.getUsername(),
                user.getAvatarUrl(), user.getDefaultCurrency(), user.getTimezone(),
                user.getCreatedAt());
    }

    @Transactional
    public UserProfileResponse uploadAvatar(UUID userId, org.springframework.web.multipart.MultipartFile file) {
        var user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String url = fileStorageService.store(file, "avatars/" + userId);
        user.setAvatarUrl(url);
        user = userRepository.save(user);

        return new UserProfileResponse(
                user.getId(), user.getEmail(), user.getPhone(), user.getUsername(),
                user.getAvatarUrl(), user.getDefaultCurrency(), user.getTimezone(),
                user.getCreatedAt());
    }

    @Transactional(readOnly = true)
    public List<UserSearchResponse> search(String query) {
        if (query == null || query.isBlank()) return List.of();
        return userRepository.searchByEmailOrPhone(query.trim()).stream()
                .map(u -> new UserSearchResponse(u.getId(), u.getEmail(), u.getPhone(), u.getUsername(), u.getAvatarUrl()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<UserSummary> getAllUsers() {
        List<User> users = userRepository.findAll();

        return users.stream()
                .map(u -> new UserSummary(
                        u.getId(),
                        u.getUsername(),
                        u.getEmail(),
                        u.getAvatarUrl()
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<UserSummary> getAllUsersExcluding(UUID userId) {
        List<User> users = userRepository.findAll();

        return users.stream()
                .filter(u -> !u.getId().equals(userId))
                .map(u -> new UserSummary(
                        u.getId(),
                        u.getUsername(),
                        u.getEmail(),
                        u.getAvatarUrl()
                ))
                .toList();
    }
}
