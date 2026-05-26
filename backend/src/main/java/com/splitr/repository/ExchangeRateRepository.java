package com.splitr.repository;

import com.splitr.entity.ExchangeRate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ExchangeRateRepository extends JpaRepository<ExchangeRate, UUID> {

    Optional<ExchangeRate> findByCurrencyFromAndCurrencyToAndRateDate(
            String currencyFrom, String currencyTo, LocalDate rateDate);

    Optional<ExchangeRate> findFirstByCurrencyFromAndCurrencyToAndRateDateLessThanEqualOrderByRateDateDesc(
            String currencyFrom, String currencyTo, LocalDate rateDate);

    Optional<ExchangeRate> findFirstByCurrencyFromAndCurrencyToOrderByRateDateAsc(
            String currencyFrom, String currencyTo);

    boolean existsByRateDate(LocalDate rateDate);

    @Query("SELECT DISTINCT e.currencyFrom FROM ExchangeRate e WHERE e.currencyTo = 'PLN' ORDER BY e.currencyFrom")
    List<String> findDistinctCurrencies();
}
