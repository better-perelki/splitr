package com.splitr.service.split;

import com.splitr.entity.SplitType;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
public class SplitStrategyFactory {

    private final Map<SplitType, SplitStrategy> strategies;

    public SplitStrategyFactory(List<SplitStrategy> strategies) {
        this.strategies = strategies.stream()
                .collect(Collectors.toUnmodifiableMap(SplitStrategy::getType, Function.identity()));
    }

    public SplitStrategy forType(SplitType type) {
        SplitStrategy strategy = strategies.get(type);
        if (strategy == null) {
            throw new IllegalArgumentException("Unsupported split type: " + type);
        }
        return strategy;
    }
}
