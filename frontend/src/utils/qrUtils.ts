export function parseQr(text: string): string | null {
    try {
        const url = new URL(text)
        return url.searchParams.get('userId')
    } catch {
        return null
    }
}