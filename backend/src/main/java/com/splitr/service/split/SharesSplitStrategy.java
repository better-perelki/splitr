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
public class SharesSplitStrategy implements SplitStrategy {

    @Override
    public SplitType getType() {
        return SplitType.SHARES;
    }

    @Override
    public List<SplitResult> calculate(BigDecimal total, List<SplitInput> inputs) {
        if (inputs == null || inputs.isEmpty()) {
            throw new IllegalArgumentException("At least one participant is required");
        }
        BigDecimal totalShare = BigDecimal.ZERO;
        for (SplitInput in : inputs) {
            if (in.share() == null) {
                throw new IllegalArgumentException("Share is required for every participant");
            }
            if (in.share().signum() <= 0) {
                throw new IllegalArgumentException("Share must be positive");
            }
            totalShare = totalShare.add(in.share());
        }

        Map<UUID, BigDecimal> preliminary = new LinkedHashMap<>();
        for (SplitInput in : inputs) {
            BigDecimal amount = total.multiply(in.share()).divide(totalShare, 6, RoundingMode.HALF_UP);
            preliminary.put(in.userId(), amount);
        }
        Map<UUID, BigDecimal> reconciled = SplitMath.reconcileToTotal(total, preliminary);
        return inputs.stream()
                .map(in -> new SplitResult(in.userId(), reconciled.get(in.userId()), in.share(), null, null))
                .toList();
    }
}
