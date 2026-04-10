package com.splitr.controller;

import com.splitr.dto.*;
import com.splitr.service.GroupService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/groups")
public class GroupController {

    private final GroupService groupService;

    public GroupController(GroupService groupService) {
        this.groupService = groupService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public GroupResponse createGroup(Authentication auth, @Valid @RequestBody GroupCreateRequest request) {
        return groupService.createGroup(userId(auth), request);
    }

    @GetMapping
    public List<GroupResponse> getUserGroups(Authentication auth) {
        return groupService.getUserGroups(userId(auth));
    }

    @GetMapping("/{id}")
    public GroupDetailsResponse getGroupDetails(Authentication auth, @PathVariable("id") UUID groupId) {
        return groupService.getGroupDetails(userId(auth), groupId);
    }

    @PutMapping("/{id}")
    public GroupResponse updateGroup(Authentication auth, 
                                     @PathVariable("id") UUID groupId, 
                                     @Valid @RequestBody GroupUpdateRequest request) {
        return groupService.updateGroup(userId(auth), groupId, request);
    }

    @PostMapping("/{id}/members")
    @ResponseStatus(HttpStatus.CREATED)
    public void addMember(Authentication auth, 
                          @PathVariable("id") UUID groupId, 
                          @Valid @RequestBody AddMemberRequest request) {
        groupService.addMember(userId(auth), groupId, request);
    }

    @DeleteMapping("/{id}/members/{userId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeMember(Authentication auth, 
                             @PathVariable("id") UUID groupId, 
                             @PathVariable("userId") UUID targetUserId) {
        groupService.removeMember(userId(auth), groupId, targetUserId);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteGroup(Authentication auth, @PathVariable("id") UUID groupId) {
        groupService.deleteGroup(userId(auth), groupId);
    }

    private UUID userId(Authentication auth) {
        return (UUID) auth.getPrincipal();
    }
}
