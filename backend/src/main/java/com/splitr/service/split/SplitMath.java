package com.splitr.service.split;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

final class SplitMath {

    static final int SCALE = 2;
    static final BigDecimal CENT = new BigDecimal("0.01");

    private SplitMath() {}

    /**
     * Rounds preliminary amounts down to 2 decimals, then distributes remainder cents
     * deterministically (ascending user id order) until sum matches total.
     */
    static Map<UUID, BigDecimal> reconcileToTotal(BigDecimal total, Map<UUID, BigDecimal> preliminary) {
        Map<UUID, BigDecimal> result = new LinkedHashMap<>();
        BigDecimal sum = BigDecimal.ZERO.setScale(SCALE);
        for (Map.Entry<UUID, BigDecimal> entry : preliminary.entrySet()) {
            BigDecimal rounded = entry.getValue().setScale(SCALE, RoundingMode.DOWN);
            result.put(entry.getKey(), rounded);
            sum = sum.add(rounded);
        }

        BigDecimal totalNorm = total.setScale(SCALE, RoundingMode.HALF_UP);
        BigDecimal diff = totalNorm.subtract(sum);
        int cents = diff.movePointRight(SCALE).intValueExact();
        if (cents == 0) return result;

        List<UUID> sorted = new ArrayList<>(result.keySet());
        Collections.sort(sorted);

        if (cents > 0) {
            for (int i = 0; i < cents; i++) {
                UUID id = sorted.get(i % sorted.size());
                result.put(id, result.get(id).add(CENT));
            }
        } else {
            int n = -cents;
            for (int i = 0; i < n; i++) {
                UUID id = sorted.get(sorted.size() - 1 - (i % sorted.size()));
                result.put(id, result.get(id).subtract(CENT));
            }
        }
        return result;
    }
}
