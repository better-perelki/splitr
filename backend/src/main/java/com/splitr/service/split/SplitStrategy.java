package com.splitr.service.split;

import com.splitr.dto.SplitInput;
import com.splitr.entity.SplitType;

import java.math.BigDecimal;
import java.util.List;

public interface SplitStrategy {

    SplitType getType();

    List<SplitResult> calculate(BigDecimal total, List<SplitInput> inputs);
}
