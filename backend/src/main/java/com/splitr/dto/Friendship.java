package com.splitr.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record Friendship(UUID id,
                        UserSummary user,
                        BigDecimal balance) {
}
