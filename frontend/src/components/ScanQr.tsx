import { useRef } from 'react'
import { Scanner } from '@yudiel/react-qr-scanner'
import type { IDetectedBarcode } from '@yudiel/react-qr-scanner'

type Props = {
    onResult: (text: string) => void
}

export function ScanQr({ onResult }: Props) {
    const handled = useRef(false)

    const handleScan = (results: IDetectedBarcode[]) => {
        const text = results[0]?.rawValue
        if (text && !handled.current) {
            handled.current = true
            onResult(text)
        }
    }

    return (
        <div className="space-y-4">
            <p className="text-sm text-on-surface-variant">
                Point your camera at a friend's QR code to add them instantly.
            </p>

            <div className="relative rounded-2xl overflow-hidden bg-black aspect-square border-2 border-primary/20">
                <Scanner
                    onScan={handleScan}
                    constraints={{ facingMode: 'environment' }}
                    styles={{ container: { width: '100%', height: '100%' }, video: { objectFit: 'cover' } }}
                />

                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="relative w-56 h-56 border-2 border-primary rounded-2xl shadow-[0_0_0_1000px_rgba(0,0,0,0.4)]">
                        <div className="absolute top-0 left-0 w-full h-0.5 bg-primary/60 shadow-[0_0_15px_rgba(var(--primary-rgb),0.8)] animate-scan" />
                        <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                        <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                        <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-lg" />
                    </div>
                </div>
            </div>
        </div>
    )
}
