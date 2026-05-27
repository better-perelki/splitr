package com.splitr.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ExchangeRateResponse(
    String currencyFrom,
    String currencyTo,
    BigDecimal rate,
    BigDecimal convertedAmount,
    LocalDate rateDate
) {}
