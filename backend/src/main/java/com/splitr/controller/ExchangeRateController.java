package com.splitr.controller;

import com.splitr.dto.ExchangeRateResponse;
import com.splitr.dto.SupportedCurrenciesResponse;
import com.splitr.service.ExchangeRateService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/exchange-rates")
public class ExchangeRateController {

    private final ExchangeRateService exchangeRateService;

    public ExchangeRateController(ExchangeRateService exchangeRateService) {
        this.exchangeRateService = exchangeRateService;
    }

    /**
     * Converts an amount between two currencies using the historical rate for the given date.
     * Used by the frontend for live conversion preview in the expense form.
     */
    @GetMapping("/convert")
    public ExchangeRateResponse convert(
            @RequestParam String from,
            @RequestParam String to,
            @RequestParam BigDecimal amount,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        BigDecimal rate = exchangeRateService.getRate(from, to, date);
        BigDecimal convertedAmount = exchangeRateService.convert(amount, from, to, date);

        return new ExchangeRateResponse(from, to, rate, convertedAmount, date);
    }

    /**
     * Returns the list of currency codes for which we have exchange rates.
     */
    @GetMapping("/supported-currencies")
    public SupportedCurrenciesResponse supportedCurrencies() {
        List<String> currencies = exchangeRateService.getSupportedCurrencies();
        return new SupportedCurrenciesResponse(currencies);
    }
}
