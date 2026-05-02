package com.splitr.service.split;

import com.splitr.dto.SplitInput;
import com.splitr.entity.SplitType;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Component
public class ExactSplitStrategy implements SplitStrategy {

    @Override
    public SplitType getType() {
        return SplitType.EXACT;
    }

    @Override
    public List<SplitResult> calculate(BigDecimal total, List<SplitInput> inputs) {
        if (inputs == null || inputs.isEmpty()) {
            throw new IllegalArgumentException("At least one participant is required");
        }
        BigDecimal sum = BigDecimal.ZERO;
        for (SplitInput in : inputs) {
            if (in.amount() == null) {
                throw new IllegalArgumentException("Amount is required for every participant");
            }
            if (in.amount().signum() < 0) {
                throw new IllegalArgumentException("Amount cannot be negative");
            }
            sum = sum.add(in.amount());
        }
        if (sum.compareTo(total) != 0) {
            throw new IllegalArgumentException("Exact amounts must sum to total, got " + sum.toPlainString());
        }
        return inputs.stream()
                .map(in -> new SplitResult(
                        in.userId(),
                        in.amount().setScale(SplitMath.SCALE, RoundingMode.HALF_UP),
                        null, null, null))
                .toList();
    }
}
