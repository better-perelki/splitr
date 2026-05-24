package com.splitr.service;

import com.splitr.entity.ExchangeRate;
import com.splitr.repository.ExchangeRateRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ExchangeRateService {

    private static final Logger log = LoggerFactory.getLogger(ExchangeRateService.class);
    private static final String BASE_CURRENCY = "PLN";
    private static final MathContext MC = new MathContext(18);

    private final ExchangeRateRepository exchangeRateRepository;
    private final RestClient restClient;

    public ExchangeRateService(ExchangeRateRepository exchangeRateRepository,
                               @Value("${app.exchange-rates.nbp-base-url:http://api.nbp.pl/api}") String nbpBaseUrl) {
        this.exchangeRateRepository = exchangeRateRepository;
        this.restClient = RestClient.builder()
                .baseUrl(nbpBaseUrl)
                .build();
    }

    /**
     * Fetches Table A exchange rates from NBP for the given date and stores them.
     * NBP returns rates as {currency} → PLN (mid rate).
     * We store both directions: {currency}→PLN and PLN→{currency}.
     */
    @Transactional
    public void fetchLatestRates() {
        try {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> tables = restClient.get()
                    .uri("/exchangerates/tables/A/?format=json")
                    .retrieve()
                    .body(List.class);

            saveRatesFromTable(tables, null);
        } catch (RestClientException e) {
            log.warn("Failed to fetch latest NBP rates: {}", e.getMessage());
        }
    }

    @Transactional
    public void fetchAndStoreRates(LocalDate date) {
        if (exchangeRateRepository.existsByRateDate(date)) {
            log.debug("Rates for {} already exist, skipping fetch", date);
            return;
        }

        try {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> tables = restClient.get()
                    .uri("/exchangerates/tables/A/{date}/?format=json", date.toString())
                    .retrieve()
                    .body(List.class);

            saveRatesFromTable(tables, date);
        } catch (RestClientException e) {
            log.warn("Failed to fetch NBP rates for {} (may be non-business day): {}", date, e.getMessage());
        }
    }

    private void saveRatesFromTable(List<Map<String, Object>> tables, LocalDate expectedDate) {
        if (tables == null || tables.isEmpty()) {
            log.warn("No rate table returned");
            return;
        }

        Map<String, Object> table = tables.get(0);
        String effectiveDateStr = (String) table.get("effectiveDate");
        LocalDate actualDate = effectiveDateStr != null ? LocalDate.parse(effectiveDateStr) : expectedDate;
        
        if (actualDate == null) {
            return;
        }

        if (exchangeRateRepository.existsByRateDate(actualDate)) {
            log.debug("Rates for {} already exist, skipping save", actualDate);
            return;
        }

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> rates = (List<Map<String, Object>>) table.get("rates");
        if (rates == null) {
            log.warn("No rates in table for date {}", actualDate);
            return;
        }

        List<ExchangeRate> toSave = new ArrayList<>();
        for (Map<String, Object> rateEntry : rates) {
            String code = (String) rateEntry.get("code");
            BigDecimal mid = toBigDecimal(rateEntry.get("mid"));

            if (code == null || mid == null || mid.signum() <= 0) continue;

            ExchangeRate toPln = new ExchangeRate();
            toPln.setCurrencyFrom(code);
            toPln.setCurrencyTo(BASE_CURRENCY);
            toPln.setRate(mid);
            toPln.setRateDate(actualDate);
            toPln.setSource("NBP");
            toSave.add(toPln);

            ExchangeRate fromPln = new ExchangeRate();
            fromPln.setCurrencyFrom(BASE_CURRENCY);
            fromPln.setCurrencyTo(code);
            fromPln.setRate(BigDecimal.ONE.divide(mid, 8, RoundingMode.HALF_UP));
            fromPln.setRateDate(actualDate);
            fromPln.setSource("NBP");
            toSave.add(fromPln);
        }

        exchangeRateRepository.saveAll(toSave);
        log.info("Stored {} exchange rate pairs for {}", toSave.size(), actualDate);
    }

    /**
     * Gets the exchange rate for a currency pair on a given date.
     * If direct pair not found, triangulates through PLN.
     * Falls back to the latest available rate if the exact date is missing.
     */
    @Transactional(readOnly = true)
    public BigDecimal getRate(String from, String to, LocalDate date) {
        if (from.equalsIgnoreCase(to)) {
            return BigDecimal.ONE;
        }

        // Try direct pair
        Optional<BigDecimal> direct = findRate(from, to, date);
        if (direct.isPresent()) {
            return direct.get();
        }

        // Triangulate through PLN: from → PLN → to
        Optional<BigDecimal> fromToPln = findRate(from, BASE_CURRENCY, date);
        Optional<BigDecimal> plnToTo = findRate(BASE_CURRENCY, to, date);

        if (fromToPln.isPresent() && plnToTo.isPresent()) {
            return fromToPln.get().multiply(plnToTo.get(), MC)
                    .setScale(8, RoundingMode.HALF_UP);
        }

        log.warn("No exchange rate found for {}→{} on or before {}", from, to, date);
        throw new IllegalStateException(
                "Exchange rate not available for " + from + "→" + to + " on " + date +
                ". Please try fetching rates first.");
    }

    /**
     * Converts an amount from one currency to another using the historical rate.
     */
    public BigDecimal convert(BigDecimal amount, String from, String to, LocalDate date) {
        if (from.equalsIgnoreCase(to)) {
            return amount;
        }
        BigDecimal rate = getRate(from, to, date);
        return amount.multiply(rate, MC).setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Returns the list of supported currency codes (those with rates in the DB + PLN).
     */
    @Transactional(readOnly = true)
    public List<String> getSupportedCurrencies() {
        List<String> currencies = new ArrayList<>();
        currencies.add(BASE_CURRENCY);
        currencies.addAll(exchangeRateRepository.findDistinctCurrencies());
        return currencies;
    }

    private Optional<BigDecimal> findRate(String from, String to, LocalDate date) {
        // Try exact date first
        Optional<ExchangeRate> exact = exchangeRateRepository
                .findByCurrencyFromAndCurrencyToAndRateDate(from, to, date);
        if (exact.isPresent()) {
            return Optional.of(exact.get().getRate());
        }

        // Fallback to latest available rate on or before the date
        return exchangeRateRepository
                .findFirstByCurrencyFromAndCurrencyToAndRateDateLessThanEqualOrderByRateDateDesc(from, to, date)
                .map(ExchangeRate::getRate);
    }

    private BigDecimal toBigDecimal(Object value) {
        if (value == null) return null;
        if (value instanceof Number n) {
            return BigDecimal.valueOf(n.doubleValue());
        }
        try {
            return new BigDecimal(value.toString());
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
