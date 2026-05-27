import api from './client'
import type { AxiosResponse } from 'axios'

export interface ExchangeRateResponse {
    currencyFrom: string
    currencyTo: string
    rate: number
    convertedAmount: number
    rateDate: string
}

export interface SupportedCurrenciesResponse {
    currencies: string[]
}

export const exchangeRatesApi = {
    convert: (from: string, to: string, amount: number, date: string) =>
        api
            .get<ExchangeRateResponse>('/exchange-rates/convert', {
                params: { from, to, amount, date },
            })
            .then((res: AxiosResponse<ExchangeRateResponse>) => res.data),

    supportedCurrencies: () =>
        api
            .get<SupportedCurrenciesResponse>('/exchange-rates/supported-currencies')
            .then((res: AxiosResponse<SupportedCurrenciesResponse>) => res.data),
}
