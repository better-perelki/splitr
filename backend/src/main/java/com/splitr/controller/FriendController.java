package com.splitr.controller;

import com.splitr.dto.*;
import com.splitr.service.FriendService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/friends")
@Tag(name = "Friends", description = "Operations for managing friends and friend requests")
public class FriendController {

    private final FriendService friendService;

    public FriendController(FriendService friendService) {
        this.friendService = friendService;
    }

    private UUID getAuthenticatedUserId(Authentication authentication) {
        return (UUID) authentication.getPrincipal();
    }

    @PostMapping("/request")
    @Operation(summary = "Send a friend request")
    public ResponseEntity<Void> sendRequest(@RequestBody SendFriendRequest request,
                                            Authentication authentication) {
        friendService.sendRequest(getAuthenticatedUserId(authentication), request.receiverId());
        return ResponseEntity.status(201).build();
    }

    @PostMapping("/request/{id}/accept")
    @Operation(summary = "Accept a friend request")
    public ResponseEntity<Void> acceptRequest(@PathVariable UUID id,
                                              Authentication authentication) {
        friendService.accept(id, getAuthenticatedUserId(authentication));
        return ResponseEntity.ok().build();
    }

    @PostMapping("/request/{id}/decline")
    @Operation(summary = "Decline a friend request")
    public ResponseEntity<Void> declineRequest(@PathVariable UUID id,
                                               Authentication authentication) {
        friendService.decline(id, getAuthenticatedUserId(authentication));
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/request/{id}")
    @Operation(summary = "Cancel sent friend request")
    public ResponseEntity<Void> cancelRequest(@PathVariable UUID id,
                                              Authentication authentication) {
        friendService.cancelRequest(id, getAuthenticatedUserId(authentication));
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    @Operation(summary = "Get friends list with balances")
    public ResponseEntity<List<Friendship>> getFriends(Authentication authentication) {
        return ResponseEntity.ok(friendService.getFriends(getAuthenticatedUserId(authentication)));
    }

    @GetMapping("/pending")
    @Operation(summary = "Get incoming friend requests")
    public ResponseEntity<List<FriendRequestDetails>> getPending(Authentication authentication) {
        return ResponseEntity.ok(friendService.getPending(getAuthenticatedUserId(authentication)));
    }

    @GetMapping("/sent")
    @Operation(summary = "Get sent friend requests")
    public ResponseEntity<List<FriendRequestDetails>> getSent(Authentication authentication) {
        return ResponseEntity.ok(friendService.getSent(getAuthenticatedUserId(authentication)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Remove a friend")
    public ResponseEntity<Void> removeFriend(@PathVariable UUID id,
                                             Authentication authentication) {
        friendService.removeFriend(id, getAuthenticatedUserId(authentication));
        return ResponseEntity.noContent().build();
    }
}