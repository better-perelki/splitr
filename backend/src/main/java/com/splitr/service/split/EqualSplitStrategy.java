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
public class EqualSplitStrategy implements SplitStrategy {

    @Override
    public SplitType getType() {
        return SplitType.EQUAL;
    }

    @Override
    public List<SplitResult> calculate(BigDecimal total, List<SplitInput> inputs) {
        if (inputs == null || inputs.isEmpty()) {
            throw new IllegalArgumentException("At least one participant is required");
        }
        BigDecimal count = BigDecimal.valueOf(inputs.size());
        BigDecimal base = total.divide(count, SplitMath.SCALE, RoundingMode.DOWN);

        Map<UUID, BigDecimal> preliminary = new LinkedHashMap<>();
        for (SplitInput in : inputs) preliminary.put(in.userId(), base);

        Map<UUID, BigDecimal> reconciled = SplitMath.reconcileToTotal(total, preliminary);
        return inputs.stream()
                .map(in -> new SplitResult(in.userId(), reconciled.get(in.userId()), null, null, null))
                .toList();
    }
}
