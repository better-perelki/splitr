import QRCode from 'react-qr-code'
import Icon from './Icon'

export function MyQrCode({ userId }: { userId: string }) {
    const value = `${window.location.origin}/add-friend?userId=${userId}`

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(value)
        } catch {
            alert('Failed to copy')
        }
    }

    return (
        <div className="w-80 bg-surface rounded-2xl shadow-lg p-6 relative border border-primary/5">

            <div className="flex items-center justify-between mb-4">
                <h3 className="font-headline text-lg font-bold">
                    Your QR Code
                </h3>
                <Icon name="qr_code" className="text-primary" />
            </div>

            <p className="text-xs text-on-surface-variant mb-4">
                Let your friends scan this code to add you instantly.
            </p>

            <div className="bg-white p-4 rounded-xl flex justify-center mb-4">
                <QRCode value={value} size={180} />
            </div>

            <div className="flex gap-2">
                <button
                    onClick={handleCopy}
                    className="flex-1 py-2 bg-surface-container-high text-on-surface text-xs font-bold rounded-lg hover:bg-surface-container-highest transition-all flex items-center justify-center gap-2"
                >
                    <Icon name="content_copy" className="text-sm" />
                    Copy link
                </button>
            </div>

        </div>
    )
}