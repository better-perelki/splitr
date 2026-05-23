import { useCallback, useEffect, useState } from 'react'
import { fetchWalletSummary, type WalletSummary } from '../api/wallet'

const EMPTY: WalletSummary = { totalOwed: 0, totalOwe: 0, debts: [], groupBalances: [] }

export function useWalletSummary() {
    const [summary, setSummary] = useState<WalletSummary>(EMPTY)
    const [loading, setLoading] = useState(true)

    const refresh = useCallback(async () => {
        setLoading(true)
        try {
            setSummary(await fetchWalletSummary())
        } catch {
            setSummary(EMPTY)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { refresh() }, [refresh])

    return { ...summary, loading, refresh }
}
