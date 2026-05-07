package com.splitr.service.split;

import com.splitr.dto.SplitInput;
import com.splitr.entity.SplitType;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Component
public class PercentageSplitStrategy implements SplitStrategy {

    private static final BigDecimal HUNDRED = new BigDecimal("100");

    @Override
    public SplitType getType() {
        return SplitType.PERCENTAGE;
    }

    @Override
    public List<SplitResult> calculate(BigDecimal total, List<SplitInput> inputs) {
        if (inputs == null || inputs.isEmpty()) {
            throw new IllegalArgumentException("At least one participant is required");
        }
        BigDecimal sum = BigDecimal.ZERO;
        for (SplitInput in : inputs) {
            if (in.percentage() == null) {
                throw new IllegalArgumentException("Percentage is required for every participant");
            }
            if (in.percentage().signum() < 0) {
                throw new IllegalArgumentException("Percentage cannot be negative");
            }
            sum = sum.add(in.percentage());
        }
        if (sum.compareTo(HUNDRED) != 0) {
            throw new IllegalArgumentException("Percentages must sum to 100, got " + sum.toPlainString());
        }

        Map<UUID, BigDecimal> preliminary = new LinkedHashMap<>();
        for (SplitInput in : inputs) {
            BigDecimal amount = total.multiply(in.percentage()).divide(HUNDRED, 6, RoundingMode.HALF_UP);
            preliminary.put(in.userId(), amount);
        }
        Map<UUID, BigDecimal> reconciled = SplitMath.reconcileToTotal(total, preliminary);
        return inputs.stream()
                .map(in -> new SplitResult(in.userId(), reconciled.get(in.userId()), null, in.percentage(), null))
                .toList();
    }
}
