package com.splitr.dto;

import java.util.List;

public record SupportedCurrenciesResponse(
    List<String> currencies
) {}
