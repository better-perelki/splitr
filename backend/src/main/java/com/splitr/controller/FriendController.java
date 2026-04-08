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

    @PostMapping("/request")
    @Operation(summary = "Send a friend request")
    public ResponseEntity<Void> sendRequest(@RequestBody SendFriendRequest request,
                                            Authentication auth) {
        friendService.sendRequest(userId(auth), request.receiverId());
        return ResponseEntity.status(201).build();
    }

    @PostMapping("/request/by-username")
    @Operation(summary = "Send a friend request using username")
    public ResponseEntity<Void> sendByUsername(@RequestParam String username,
                                               Authentication auth) {
        friendService.sendRequestByUsername(userId(auth), username);
        return ResponseEntity.status(201).build();
    }

    @PostMapping("/request/{id}/accept")
    @Operation(summary = "Accept a friend request")
    public ResponseEntity<Void> acceptRequest(@PathVariable UUID id,
                                              Authentication auth) {
        friendService.accept(id, userId(auth));
        return ResponseEntity.ok().build();
    }

    @PostMapping("/request/{id}/decline")
    @Operation(summary = "Decline a friend request")
    public ResponseEntity<Void> declineRequest(@PathVariable UUID id,
                                               Authentication auth) {
        friendService.decline(id, userId(auth));
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/request/{id}")
    @Operation(summary = "Cancel sent friend request")
    public ResponseEntity<Void> cancelRequest(@PathVariable UUID id,
                                              Authentication auth) {
        friendService.cancelRequest(id, userId(auth));
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    @Operation(summary = "Get friends list with balances")
    public ResponseEntity<List<Friendship>> getFriends(Authentication auth) {
        return ResponseEntity.ok(friendService.getFriends(userId(auth)));
    }

    @GetMapping("/pending")
    @Operation(summary = "Get incoming friend requests")
    public ResponseEntity<List<FriendRequestDetails>> getPending(Authentication auth) {
        return ResponseEntity.ok(friendService.getPending(userId(auth)));
    }

    @GetMapping("/sent")
    @Operation(summary = "Get sent friend requests")
    public ResponseEntity<List<FriendRequestDetails>> getSent(Authentication auth) {
        return ResponseEntity.ok(friendService.getSent(userId(auth)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Remove a friend")
    public ResponseEntity<Void> removeFriend(@PathVariable UUID id,
                                             Authentication auth) {
        friendService.removeFriend(id, userId(auth));
        return ResponseEntity.noContent().build();
    }

    private UUID userId(Authentication auth) {
        return (UUID) auth.getPrincipal();
    }
}