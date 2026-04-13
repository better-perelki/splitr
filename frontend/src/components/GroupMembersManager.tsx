import { useState } from 'react'
import Icon from './Icon'
import type { GroupMemberResponse } from '../api/groups'

interface GroupMembersManagerProps {
    groupId: string
    members: GroupMemberResponse[]
    currentUserId: string
    currentUserRole: 'ADMIN' | 'MEMBER'
    onMemberRemoved: () => void
    onGroupLeft: () => void
    onGroupDeleted: () => void
}

export default function GroupMembersManager({
                                                groupId,
                                                members,
                                                currentUserId,
                                                currentUserRole,
                                                onMemberRemoved,
                                                onGroupLeft,
                                                onGroupDeleted // <-- ODBIERAMY PROP
                                            }: GroupMembersManagerProps) {
    const [loadingId, setLoadingId] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    const handleRemoveMember = async (targetUserId: string) => {
        if (!window.confirm('Are you sure you want to remove this member?')) return
        setLoadingId(targetUserId)
        setError(null)
        try {
            const response = await fetch(`/api/groups/${groupId}/members/${targetUserId}`, { method: 'DELETE' })
            if (!response.ok) {
                const errorData = await response.json().catch(() => null)
                throw new Error(errorData?.message || 'Cannot remove member. Ensure all debts are settled.')
            }
            onMemberRemoved()
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message)
            } else {
                setError('An unexpected error occurred')
            }
        } finally {
            setLoadingId(null)
        }
    }

    const handleTransferAdmin = async (newAdminId: string) => {
        if (!window.confirm('Are you sure? You will lose admin privileges.')) return
        setLoadingId(newAdminId)
        setError(null)
        try {
            const response = await fetch(`/api/groups/${groupId}/transfer-admin/${newAdminId}`, { method: 'POST' })
            if (!response.ok) throw new Error('Failed to transfer admin role.')
            onMemberRemoved()
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message)
            } else {
                setError('An unexpected error occurred')
            }
        } finally {
            setLoadingId(null)
        }
    }

    const handleLeaveGroup = async () => {
        if (!window.confirm('Are you sure you want to leave this group?')) return
        setLoadingId(currentUserId)
        setError(null)
        try {
            const response = await fetch(`/api/groups/${groupId}/leave`, { method: 'POST' })
            if (!response.ok) {
                const errorData = await response.json().catch(() => null)
                throw new Error(errorData?.message || 'Cannot leave group. Ensure your debts are settled or transfer admin role first.')
            }
            onGroupLeft()
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message)
            } else {
                setError('An unexpected error occurred')
            }
        } finally {
            setLoadingId(null)
        }
    }

    const handleDeleteGroup = async () => {
        if (!window.confirm('Are you ABSOLUTELY sure you want to delete this group? This action cannot be undone.')) return
        setLoadingId('delete-group')
        setError(null)
        try {
            const response = await fetch(`/api/groups/${groupId}`, { method: 'DELETE' })
            if (!response.ok) {
                const errorData = await response.json().catch(() => null)
                throw new Error(errorData?.message || 'Cannot delete group. Ensure all debts within it are settled.')
            }
            onGroupDeleted()
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message)
            } else {
                setError('An unexpected error occurred')
            }
        } finally {
            setLoadingId(null)
        }
    }

    return (
        <div className="bg-surface-container rounded-3xl p-6 border border-outline-variant/20 shadow-sm">
            <h3 className="font-headline text-xl font-bold tracking-tight text-on-surface mb-6">
                Group Members & Settings
            </h3>

            {error && (
                <div className="mb-4 p-4 bg-error/10 text-error rounded-xl border border-error/20 flex items-center gap-2 text-sm font-medium">
                    <Icon name="error" />
                    {error}
                </div>
            )}

            <div className="space-y-3">
                {members.map((member) => {
                    const isMe = member.user.id === currentUserId
                    const isTargetAdmin = member.role === 'ADMIN'

                    return (
                        <div
                            key={member.user.id}
                            className="flex items-center justify-between p-4 bg-surface-container-highest/40 rounded-2xl border border-outline-variant/10"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-lg">
                                    {member.user.avatarUrl ? (
                                        <img src={member.user.avatarUrl} alt="avatar" className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        member.user.username.charAt(0).toUpperCase()
                                    )}
                                </div>

                                <div>
                                    <div className="font-bold text-on-surface flex items-center gap-2">
                                        {member.user.username}
                                        {isMe && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-md uppercase tracking-wider">You</span>}
                                        {isTargetAdmin && <span className="text-[10px] bg-tertiary/10 text-tertiary px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1"><Icon name="shield" className="text-[10px]" /> Admin</span>}
                                    </div>
                                    <div className="text-xs text-on-surface-variant">{member.user.email}</div>
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
                <p className="text-xs text-on-surface-variant mt-2 max-w-sm">
                    You can only leave the group if all your debts are settled. If you are the only admin, you must transfer your role first.
                </p>
            </div>

            {/*USUWANIE GRUPY (TYLKO DLA ADMINA) */}
            {currentUserRole === 'ADMIN' && (
                <div className="mt-6 pt-6 border-t border-error/20 bg-error/5 -mx-6 -mb-6 p-6 rounded-b-3xl">
                    <h4 className="text-sm font-bold text-error mb-4 flex items-center gap-2">
                        <Icon name="warning" />
                        Danger Zone
                    </h4>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <p className="text-xs text-on-surface-variant max-w-sm">
                            Permanently delete this group and all its data. This action cannot be undone. All debts must be settled before deletion.
                        </p>
                        <button
                            onClick={handleDeleteGroup}
                            disabled={loadingId === 'delete-group'}
                            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-error text-on-primary font-bold hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 shrink-0"
                        >
                            {loadingId === 'delete-group' ? (
                                <span className="w-5 h-5 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
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