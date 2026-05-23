package com.splitr.controller;

import com.splitr.dto.*;
import com.splitr.service.BalanceService;
import com.splitr.service.UserService;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final BalanceService balanceService;

    public UserController(UserService userService, BalanceService balanceService) {
        this.userService = userService;
        this.balanceService = balanceService;
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
    public List<UserSearchResponse> search(@RequestParam("q") String query,
                                           @RequestParam(defaultValue = "0") int page,
                                           @RequestParam(defaultValue = "20") int size) {
        return userService.search(query, PageRequest.of(page, Math.min(size, 50)));
    }

    @GetMapping("/all")
    public List<UserSummary> getAllUsers(Authentication auth,
                                        @RequestParam(defaultValue = "0") int page,
                                        @RequestParam(defaultValue = "20") int size) {
        return userService.getAllUsersExcluding(userId(auth), PageRequest.of(page, Math.min(size, 50)));
    }

    @GetMapping("/summary/{id}")
    public UserSummary getUserSummary(@PathVariable("id") UUID id) {
        return userService.getUserSummary(id);
    }

    @GetMapping("/me/wallet-summary")
    public WalletSummaryResponse getWalletSummary(Authentication auth) {
        return balanceService.getWalletSummary(userId(auth));
    }

    private UUID userId(Authentication auth) {
        return (UUID) auth.getPrincipal();
    }
}
