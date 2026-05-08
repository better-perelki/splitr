package com.splitr.controller;

import com.splitr.dto.*;
import com.splitr.service.BalanceService;
import com.splitr.service.GroupService;
import com.splitr.service.SettlementService;
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
    private final BalanceService balanceService;
    private final SettlementService settlementService;

    public GroupController(GroupService groupService,
                           BalanceService balanceService,
                           SettlementService settlementService) {
        this.groupService = groupService;
        this.balanceService = balanceService;
        this.settlementService = settlementService;
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

    @PostMapping("/{id}/leave")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void leaveGroup(Authentication auth, @PathVariable("id") UUID groupId) {
        groupService.leaveGroup(userId(auth), groupId);
    }

    @PostMapping("/{id}/transfer-admin/{newAdminId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void transferAdminRole(Authentication auth,
                                  @PathVariable("id") UUID groupId,
                                  @PathVariable("newAdminId") UUID newAdminId) {
        groupService.transferAdminRole(userId(auth), groupId, newAdminId);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteGroup(Authentication auth, @PathVariable("id") UUID groupId) {
        groupService.deleteGroup(userId(auth), groupId);
    }

    @GetMapping("/{id}/balances")
    public GroupBalanceResponse getBalances(Authentication auth, @PathVariable("id") UUID groupId) {
        return balanceService.calculateBalances(groupId);
    }

    @PostMapping("/{id}/settlements")
    @ResponseStatus(HttpStatus.CREATED)
    public SettlementResponse createSettlement(Authentication auth,
                                               @PathVariable("id") UUID groupId,
                                               @Valid @RequestBody SettlementCreateRequest request) {
        return settlementService.createSettlement(userId(auth), groupId, request);
    }

    @DeleteMapping("/{id}/settlements/{settlementId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void revertSettlement(Authentication auth,
                                 @PathVariable("id") UUID groupId,
                                 @PathVariable("settlementId") UUID settlementId) {
        settlementService.revertSettlement(userId(auth), groupId, settlementId);
    }

    @GetMapping("/{id}/settlements")
    public List<SettlementResponse> listSettlements(Authentication auth,
                                                     @PathVariable("id") UUID groupId) {
        return settlementService.listSettlements(userId(auth), groupId);
    }

    private UUID userId(Authentication auth) {
        return (UUID) auth.getPrincipal();
    }
}