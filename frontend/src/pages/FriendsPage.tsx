import {useEffect, useState} from 'react'
import Icon from '../components/Icon'
import AddFriendModal from '../components/AddFriend'
import {useFriends} from '../hooks/useFriends'
import {ScanQr} from '../components/ScanQr'
import {MyQrCode} from '../components/MyQrCode'
import {parseQr} from '../utils/qrUtils'
import api from "../api/client.ts";

export default function FriendsPage() {
    const {
        friends,
        pending,
        sent,
        loading,
        fetchFriends,
        sendFriendRequestById,
        acceptRequest,
        declineRequest,
        removeFriend,
        cancelRequest,
    } = useFriends()

    const [searchTerm, setSearchTerm] = useState('')
    const [modalOpen, setModalOpen] = useState(false)
    const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received')
    const [scanOpen, setScanOpen] = useState(false)
    const [showQr, setShowQr] = useState(false)
    const [userId, setUserId] = useState<string | null>(null)

    useEffect(() => {
        api.get('/users/me').then(res => {
            setUserId(res.data.id)
        })
    }, [])

    if (loading) return <p>Loading...</p>

    const filteredFriends = friends.filter((f) =>
        f.user &&
        (f.user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            f.user.email?.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    const handleQrScan = async (text: string) => {
        const userId = parseQr(text)

        if (userId) {
            await sendFriendRequestById(userId)
        } else {
            alert('Invalid QR code')
        }
    }

    return (
        <div className="p-12 min-h-screen relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] emerald-glow pointer-events-none opacity-50"/>

            <section className="max-w-6xl mx-auto space-y-12 relative z-10">
                {/* Search + Add Friend */}
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between relative">
                    <div className="relative w-full md:w-[480px] group">
                        <div
                            className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-on-surface-variant group-focus-within:text-primary transition-colors">
                            <Icon name="search"/>
                        </div>
                        <input
                            type="text"
                            placeholder="Search by email or username"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-surface-container-low border-none rounded-xl py-4 pl-12 pr-4 text-on-surface placeholder:text-on-surface-variant/40 focus:ring-1 focus:ring-primary/30 focus:bg-surface-container-high transition-all font-body"
                        />
                    </div>

                    <div className="flex gap-4 mt-4 md:mt-0">
                        <button
                            onClick={() => setModalOpen(true)}
                            className="px-6 py-4 bg-surface-container-highest border border-primary/10 rounded-xl font-headline font-medium text-primary hover:bg-primary/5 transition-all flex items-center gap-2"
                        >
                            <Icon name="person_add"/>
                            Add Friend
                        </button>

                        <button
                            onClick={() => setScanOpen(true)}
                            className="px-6 py-4 bg-surface-container-highest border border-primary/10 rounded-xl font-headline font-medium text-primary hover:bg-primary/5 transition-all flex items-center gap-2"
                        >
                            <Icon name="qr_code_2"/>
                            Scan Code
                        </button>

                        <button
                            onClick={() => setShowQr(true)}
                            className="px-6 py-4 bg-surface-container-highest border border-primary/10 rounded-xl font-headline font-medium text-primary hover:bg-primary/5 transition-all flex items-center gap-2"
                        >
                            <Icon name="qr_code"/>
                            My Code
                        </button>
                    </div>

                </div>


                {/* Friends + Invitations */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Friends list */}
                    <div className="lg:col-span-8 space-y-8">
                        <header className="flex items-end justify-between">
                            <div><h3 className="font-headline text-3xl font-bold tracking-tight"> Your Friends </h3> <p
                                className="text-on-surface-variant text-sm mt-1"> You are currently sharing expenses
                                with {filteredFriends.length} people. </p></div>
                            <span className="text-xs font-headline uppercase tracking-widest text-primary font-bold"> Sort by Balance </span>
                        </header>

                        <div className="space-y-4">
                            {filteredFriends.length === 0 ? (
                                <p className="text-sm text-on-surface-variant py-4 text-center">
                                    No friends found
                                </p>
                            ) : (
                                filteredFriends.map((friend) => (
                                    <div
                                        key={friend.id}
                                        className="glass-panel p-5 rounded-2xl flex items-center justify-between hover:bg-surface-container-highest/80 transition-all border border-transparent hover:border-primary/5 group"
                                    >
                                        <div className="flex items-center gap-5">
                                            <div
                                                className="w-14 h-14 rounded-full bg-surface-variant border-2 border-primary/20 overflow-hidden">
                                                {friend.user?.avatarUrl ? (
                                                    <img
                                                        src={friend.user.avatarUrl}
                                                        alt={friend.user.username}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div
                                                        className="w-full h-full flex items-center justify-center text-on-surface-variant">
                                                        {friend.user?.username?.[0] ?? '?'}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="font-headline text-lg font-bold leading-none">
                                                    {friend.user?.username ?? 'Unknown'}
                                                </h4>
                                                <p className="text-on-surface-variant text-xs mt-1 lowercase">
                                                    {friend.user?.email ?? ''}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-12">
                                            <div className="flex items-center gap-12">
                                                <button
                                                    onClick={() => removeFriend(friend.id!)}
                                                    className="h-10 w-10 rounded-full bg-surface-container-low text-error hover:bg-error/10 hover:text-error/80 transition-all flex items-center justify-center"
                                                    title="Remove Friend"
                                                >
                                                    <Icon name="delete" className="text-base"/>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Right Column: Pending Invitations */}
                    <div className="lg:col-span-4 space-y-8">
                        <section className="glass-panel rounded-3xl p-6 border border-primary/5">
                            <h3 className="font-headline text-xl font-bold tracking-tight mb-6">
                                Pending Invitations
                            </h3>
                            <div className="flex p-1 bg-surface-container-low rounded-xl mb-6">
                                <button
                                    onClick={() => setActiveTab('received')}
                                    className={`flex-1 py-2 text-xs font-headline font-bold uppercase tracking-wider rounded-lg transition-all ${
                                        activeTab === 'received'
                                            ? 'bg-surface-container-highest text-primary'
                                            : 'text-on-surface-variant hover:text-on-surface'
                                    }`}
                                >
                                    Received ({pending.length})
                                </button>
                                <button
                                    onClick={() => setActiveTab('sent')}
                                    className={`flex-1 py-2 text-xs font-headline font-bold uppercase tracking-wider rounded-lg transition-all ${
                                        activeTab === 'sent'
                                            ? 'bg-surface-container-highest text-primary'
                                            : 'text-on-surface-variant hover:text-on-surface'
                                    }`}
                                >
                                    Sent ({sent.length})
                                </button>
                            </div>

                            <div className="space-y-4">
                                {activeTab === 'received' &&
                                    pending.map(inv => (
                                        <div key={inv.id} className="space-y-2">
                                            <div className="flex gap-3">
                                                <div
                                                    className="w-10 h-10 rounded-full bg-surface-variant flex-shrink-0 overflow-hidden border border-primary/10 flex items-center justify-center">
                                                    {inv.sender?.avatarUrl ? (
                                                        <img
                                                            src={inv.sender.avatarUrl}
                                                            className="w-10 h-10 rounded-full object-cover"
                                                            alt={inv.sender.username}
                                                        />
                                                    ) : (
                                                        <span
                                                            className="text-xs font-bold text-on-surface-variant uppercase">
                                {inv.sender?.username?.[0] ?? '?'}
                            </span>
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">
                                                        {inv.sender?.username ?? 'Unknown'}
                                                    </p>
                                                    <p className="text-[10px] text-on-surface-variant">
                                                        Invited you to connect
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => acceptRequest(inv.id!)}
                                                    className="flex-1 py-2 bg-primary-container text-on-primary-container text-xs font-bold rounded-lg hover:opacity-90 active:scale-95 transition-all"
                                                >
                                                    Accept
                                                </button>
                                                <button
                                                    onClick={() => declineRequest(inv.id!)}
                                                    className="flex-1 py-2 bg-surface-container-high text-on-surface-variant text-xs font-bold rounded-lg hover:bg-error/10 hover:text-error transition-all"
                                                >
                                                    Decline
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                {activeTab === 'sent' &&
                                    sent.map(inv => (
                                        <div
                                            key={inv.id}
                                            className="glass-panel p-4 rounded-2xl flex items-center justify-between hover:bg-surface-container-highest/80 transition-all border border-transparent hover:border-primary/5"
                                        >
                                            {/* Info o użytkowniku */}
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-10 h-10 rounded-full bg-surface-variant flex-shrink-0 overflow-hidden border border-primary/10 flex items-center justify-center">
                                                    {inv.receiver?.avatarUrl ? (
                                                        <img
                                                            src={inv.receiver.avatarUrl}
                                                            className="w-10 h-10 rounded-full object-cover"
                                                            alt={inv.receiver.username}
                                                        />
                                                    ) : (
                                                        <span
                                                            className="text-xs font-bold text-on-surface-variant uppercase">
                                {inv.receiver?.username?.[0] ?? '?'}
                            </span>
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <p className="text-sm font-medium truncate">{inv.receiver?.username ?? 'Unknown'}</p>
                                                    <p className="text-[10px] text-on-surface-variant">Sent
                                                        invitation</p>
                                                </div>
                                            </div>

                                            {/* Przycisk Cancel po prawej */}
                                            <button
                                                onClick={() => cancelRequest(inv.id!)}
                                                className="h-10 px-4 bg-surface-container-high text-error text-xs font-bold rounded-lg border border-error/20 hover:bg-error/10 hover:text-error/90 transition-all flex items-center justify-center gap-1"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ))}
                            </div>
                        </section>
                    </div>
                </div>
            </section>

            {/* Modal */}
            <AddFriendModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                existingFriends={friends.map(f => f.user?.username ?? '')}
                onSuccess={fetchFriends} // <-- MUSISZ TO DODAĆ
            />

            {/* FriendsPage.tsx */}
            {scanOpen && (
                <ScanQr
                    onResult={(text) => {
                        handleQrScan(text);
                        setScanOpen(false);
                    }}
                    onClose={() => setScanOpen(false)}
                />
            )}

            {showQr && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="bg-surface p-6 rounded-xl text-center">
                        {userId && <MyQrCode userId={userId}/>}
                        <button onClick={() => setShowQr(false)}>Close</button>
                    </div>
                </div>
            )}
        </div>
    )
}