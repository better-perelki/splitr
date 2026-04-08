import { useEffect, useState } from 'react'
import { QrReader } from 'react-qr-reader'
import Icon from './Icon'

type Props = {
    onResult: (text: string) => void
    onClose: () => void
}

export function ScanQr({ onResult, onClose }: Props) {
    const [isScannerActive, setIsScannerActive] = useState(false)
    const [isClosing, setIsClosing] = useState(false)

    useEffect(() => {
        setIsScannerActive(true)
        return () => {
            setIsScannerActive(false)
        }
    }, [])

    const handleSafeAction = (callback: () => void) => {
        if (isClosing) return
        setIsClosing(true)
        setIsScannerActive(false)

        setTimeout(() => {
            callback()
        }, 150)
    }

    if (isClosing) return null

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md bg-surface rounded-2xl shadow-2xl p-6 relative border border-primary/10">

                <button
                    onClick={() => handleSafeAction(onClose)}
                    className="absolute top-4 right-4 text-on-surface-variant hover:text-error transition-all p-2 rounded-full hover:bg-error/10 z-20"
                >
                    <Icon name="close" />
                </button>

                <div className="mb-6">
                    <h3 className="font-headline text-xl font-bold">Scan QR Code</h3>
                    <p className="text-sm text-on-surface-variant mt-1">
                        Place the code inside the frame to add a friend.
                    </p>
                </div>

                <div className="relative rounded-2xl overflow-hidden bg-black aspect-square border-2 border-primary/20">
                    {isScannerActive && (
                        <QrReader
                            constraints={{ facingMode: 'environment' }}
                            onResult={(result) => {
                                if (!!result) {
                                    handleSafeAction(() => onResult(result.getText()))
                                }
                            }}
                            containerStyle={{ width: '100%', height: '100%' }}
                            videoStyle={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    )}

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

                <button
                    onClick={() => handleSafeAction(onClose)}
                    className="w-full mt-6 py-3 bg-surface-container-high text-on-surface font-bold rounded-xl hover:bg-surface-container-highest transition-colors"
                >
                    Cancel
                </button>
            </div>
        </div>
    )
}