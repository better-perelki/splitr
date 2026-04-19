import { useState, useEffect } from 'react'
import Icon from './Icon'
import type { GroupMemberResponse } from '../api/groups'
import { FriendsService } from '../api';
import type { Friendship } from '../api';
import api from '../api/client';



interface GroupMembersManagerProps {
    groupId: string
    members: GroupMemberResponse[]
    currentUserId: string
    currentUserRole: 'ADMIN' | 'MEMBER'
    onMemberAdded: () => void
    onMemberRemoved: () => void
    onGroupLeft: () => void
    onGroupDeleted: () => void
}

export default function GroupMembersManager({
    groupId,
    members,
    currentUserId,
    currentUserRole,
    onMemberAdded,
    onMemberRemoved,
    onGroupLeft,
    onGroupDeleted
}: GroupMembersManagerProps) {
    const [loadingId, setLoadingId] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    const [showAddFriend, setShowAddFriend] = useState(false)
    const [friends, setFriends] = useState<Friendship[]>([])
    const [loadingFriends, setLoadingFriends] = useState(false)

    useEffect(() => {
        if (showAddFriend) {
            const fetchFriends = async () => {
                setLoadingFriends(true)
                try {
                    const data = await FriendsService.getFriends();
                    setFriends(data);
                } catch (err) {
                    console.error("Błąd pobierania:", err);
                    setError('Could not load friends list.');
                } finally {
                    setLoadingFriends(false)
                }
            }
            fetchFriends()
        }
    }, [showAddFriend])

    const availableFriends = friends.filter(
        f => f.user?.id && !members.some(m => m.user.id === f.user!.id)
    )

    const handleAddMember = async (friendUserId: string) => {
        setLoadingId(`add-${friendUserId}`)
        setError(null)
        try {
            await api.post(`/groups/${groupId}/members`, { userId: friendUserId })
            onMemberAdded()
            setShowAddFriend(false)
        } catch (err: any) {
            const message = err?.response?.data?.message || err?.message || 'Cannot add member.'
            setError(message)
        } finally {
            setLoadingId(null)
        }
    }

    const handleRemoveMember = async (targetUserId: string) => {
        if (!window.confirm('Are you sure you want to remove this member?')) return
        setLoadingId(targetUserId)
        setError(null)
        try {
            await api.delete(`/groups/${groupId}/members/${targetUserId}`)
            onMemberRemoved()
        } catch (err: any) {
            const message = err?.response?.data?.message || err?.message || 'Cannot remove member. Ensure all debts are settled.'
            setError(message)
        } finally {
            setLoadingId(null)
        }
    }

    const handleTransferAdmin = async (newAdminId: string) => {
        if (!window.confirm('Are you sure? You will lose admin privileges.')) return
        setLoadingId(newAdminId)
        setError(null)
        try {
            await api.post(`/groups/${groupId}/transfer-admin/${newAdminId}`)
            onMemberRemoved()
        } catch (err: any) {
            const message = err?.response?.data?.message || err?.message || 'Failed to transfer admin role.'
            setError(message)
        } finally {
            setLoadingId(null)
        }
    }

    const handleLeaveGroup = async () => {
        if (!window.confirm('Are you sure you want to leave this group?')) return
        setLoadingId(currentUserId)
        setError(null)
        try {
            await api.post(`/groups/${groupId}/leave`)
            onGroupLeft()
        } catch (err: any) {
            const message = err?.response?.data?.message || err?.message || 'Cannot leave group. Ensure your debts are settled or transfer admin role first.'
            setError(message)
        } finally {
            setLoadingId(null)
        }
    }

    const handleDeleteGroup = async () => {
        if (!window.confirm('Are you ABSOLUTELY sure you want to delete this group? This action cannot be undone.')) return
        setLoadingId('delete-group')
        setError(null)
        try {
            await api.delete(`/groups/${groupId}`)
            onGroupDeleted()
        } catch (err: any) {
            const message = err?.response?.data?.message || err?.message || 'Cannot delete group. Ensure all debts within it are settled.'
            setError(message)
        } finally {
            setLoadingId(null)
        }
    }

    console.log("=== DEBUG GRUPY ===");
    console.log("Current User ID:", currentUserId);
    console.log("Current User Role:", currentUserRole);
    console.log("Czy pokazać guzik?:", currentUserRole === 'ADMIN');

    return (
        <div className="bg-surface-container rounded-3xl p-6 border border-outline-variant/20 shadow-sm relative">

            <div className="flex items-center justify-between mb-8">
                <h3 className="font-headline text-2xl font-bold tracking-tight text-on-surface">
                    Members & Settings
                </h3>

                {currentUserRole === 'ADMIN' && (
                    <button
                        onClick={() => setShowAddFriend(!showAddFriend)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all shadow-lg active:scale-95 ${showAddFriend
                            ? 'bg-surface-container-highest text-on-surface-variant'
                            : 'bg-primary text-on-primary hover:brightness-110 shadow-primary/20'
                            }`}
                    >
                        <Icon name={showAddFriend ? 'close' : 'group_add'} />
                        {showAddFriend ? 'Cancel' : 'Add'}
                    </button>
                )}
            </div>

            {error && (
                <div className="mb-4 p-4 bg-error/10 text-error rounded-xl border border-error/20 flex items-center gap-2 text-sm font-medium">
                    <Icon name="error" />
                    {error}
                </div>
            )}

            {/* Nowa sekcja: Lista znajomych */}
            {showAddFriend && (
                <div className="mb-8 p-6 bg-surface-container-low/40 rounded-3xl border border-primary/20 backdrop-blur-sm animate-fadeIn">
                    <h4 className="text-xs font-bold text-primary mb-4 uppercase tracking-widest">Select to invite</h4>

                    {loadingFriends ? (
                        <div className="flex justify-center p-8">
                            <span className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
                        </div>
                    ) : availableFriends.length === 0 ? (
                        <div className="text-center p-6 space-y-2">
                            <Icon name="person_off" className="text-3xl text-on-surface-variant/20" />
                            <p className="text-sm text-on-surface-variant">
                                No friends available to invite.
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
                            {availableFriends.map(f => (
                                <div key={f.user!.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-primary/5 border border-transparent hover:border-primary/10 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-surface-container-high border-2 border-primary/20 flex-shrink-0 flex items-center justify-center overflow-hidden">
                                            {f.user!.avatarUrl ? (
                                                <img src={f.user!.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-sm font-bold text-primary">
                                                    {f.user!.username?.charAt(0).toUpperCase() ?? '?'}
                                                </span>
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-bold text-on-surface text-sm group-hover:text-primary transition-colors">
                                                {f.user!.username ?? 'Unknown'}
                                            </div>
                                            {f.user!.email && (
                                                <div className="text-[10px] text-on-surface-variant">{f.user!.email}</div>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleAddMember(f.user!.id!)}
                                        disabled={loadingId !== null}
                                        className="text-xs px-4 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-on-primary font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        {loadingId === `add-${f.user!.id}` ? '...' : 'Invite'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Aktualni członkowie grupy */}
            <div className="space-y-3">
                {members.map((member) => {
                    const isMe = member.user.id === currentUserId
                    const isTargetAdmin = member.role === 'ADMIN'

                    return (
                        <div
                            key={member.user.id}
                            className="flex items-center justify-between p-4 bg-surface-container-low/40 rounded-3xl border border-outline-variant/10 hover:border-primary/5 transition-all"
                        >
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 rounded-full bg-surface-container-high border-2 border-primary/30 flex-shrink-0 flex items-center justify-center overflow-hidden">
                                    {member.user.avatarUrl ? (
                                        <img src={member.user.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-lg font-bold text-primary">
                                            {member.user.username.charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                </div>

                                <div>
                                    <div className="font-bold text-on-surface flex items-center gap-3">
                                        {member.user.username}
                                        <div className="flex items-center gap-1.5">
                                            {isMe && <span className="text-[9px] bg-primary/20 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">You</span>}
                                            {isTargetAdmin && <span className="text-[9px] bg-tertiary/10 text-tertiary border border-tertiary/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest flex items-center gap-1"><Icon name="verified" className="text-[10px]" /> Admin</span>}
                                        </div>
                                    </div>
                                    <div className="text-xs text-on-surface-variant/70">{member.user.email}</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {currentUserRole === 'ADMIN' && !isMe && !isTargetAdmin && (
                                    <>
                                        <button
                                            onClick={() => handleTransferAdmin(member.user.id)}
                                            disabled={loadingId !== null}
                                            title="Make Admin"
                                            className="p-2 rounded-xl text-on-surface-variant hover:bg-tertiary/10 hover:text-tertiary transition-colors disabled:opacity-50"
                                        >
                                            <Icon name="verified_user" />
                                        </button>
                                        <button
                                            onClick={() => handleRemoveMember(member.user.id)}
                                            disabled={loadingId !== null}
                                            title="Remove Member"
                                            className="p-2 rounded-xl text-on-surface-variant hover:bg-error/10 hover:text-error transition-colors disabled:opacity-50"
                                        >
                                            <Icon name="person_remove" />
                                        </button>
                                    </>
                                )}
                                {loadingId === member.user.id && (
                                    <span className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* SEKCJA: WYJŚCIE Z GRUPY */}
            <div className="mt-8 pt-6 border-t border-outline-variant/10">
                <button
                    onClick={handleLeaveGroup}
                    disabled={loadingId === currentUserId}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-surface-container-highest/60 text-on-surface-variant font-bold hover:bg-error/10 hover:text-error transition-colors disabled:opacity-50"
                >
                    {loadingId === currentUserId ? (
                        <span className="w-5 h-5 border-2 border-error/30 border-t-error rounded-full animate-spin" />
                    ) : (
                        <>
                            <Icon name="logout" />
                            Leave Group
                        </>
                    )}
                </button>
                <p className="text-xs text-on-surface-variant/60 mt-2 max-w-2xl leading-relaxed">
                    You can only leave the group if all your debts are settled. If you are the only admin, you must transfer your role first.
                </p>
            </div>

            {/* USUWANIE GRUPY (TYLKO DLA ADMINA) */}
            {currentUserRole === 'ADMIN' && (
                <div className="mt-8 pt-8 border-t border-error/10 bg-error/[0.02] -mx-6 -mb-6 p-6 rounded-b-3xl">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-error/10 flex items-center justify-center text-error">
                            <Icon name="warning" className="text-lg" />
                        </div>
                        <h4 className="text-sm font-bold text-error uppercase tracking-widest">
                            Danger Zone
                        </h4>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <p className="text-xs text-on-surface-variant/70 max-w-sm leading-relaxed">
                            Permanently delete this group and all its data. This action cannot be undone. All debts must be settled before deletion.
                        </p>
                        <button
                            onClick={handleDeleteGroup}
                            disabled={loadingId === 'delete-group'}
                            className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-error/10 text-error border border-error/20 font-bold hover:bg-error hover:text-on-error transition-all active:scale-95 disabled:opacity-50 shrink-0"
                        >
                            {loadingId === 'delete-group' ? (
                                <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Icon name="delete_forever" />
                                    Delete Group
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}