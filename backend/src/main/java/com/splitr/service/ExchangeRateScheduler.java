package com.splitr.service;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class ExchangeRateScheduler {

    private static final Logger log = LoggerFactory.getLogger(ExchangeRateScheduler.class);

    private final ExchangeRateService exchangeRateService;

    public ExchangeRateScheduler(ExchangeRateService exchangeRateService) {
        this.exchangeRateService = exchangeRateService;
    }

    /**
     * Fetches exchange rates every weekday at 9:00 AM.
     * NBP publishes Table A rates around 8:00–8:15 CET on business days.
     */
    @Scheduled(cron = "${app.exchange-rates.fetch-cron:0 0 9 * * MON-FRI}")
    public void fetchDailyRates() {
        log.info("Scheduled exchange rate fetch triggered");
        exchangeRateService.fetchAndStoreRates(LocalDate.now());
    }

    /**
     * On application startup, fetch today's rates if not already present.
     * Also fetches yesterday's rates as a safety net for weekend deployments.
     */
    @PostConstruct
    public void fetchOnStartup() {
        log.info("Fetching exchange rates on startup");
        try {
            exchangeRateService.fetchLatestRates();
        } catch (Exception e) {
            log.warn("Failed to fetch exchange rates on startup: {}", e.getMessage());
        }
    }
}
