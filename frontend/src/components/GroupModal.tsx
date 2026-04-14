import { useState, useEffect, useRef } from 'react'
import Icon from './Icon'
import type { GroupType, GroupCreateRequest, GroupUpdateRequest, GroupResponse } from '../api/groups'

const GROUP_TYPES: { value: GroupType; label: string; icon: string }[] = [
  { value: 'TRIP', label: 'Trip', icon: 'flight' },
  { value: 'APARTMENT', label: 'Apartment', icon: 'home' },
  { value: 'EVENT', label: 'Event', icon: 'celebration' },
  { value: 'OTHER', label: 'Other', icon: 'category' },
]

const CURRENCIES = ['PLN', 'USD', 'EUR', 'GBP', 'CZK', 'NOK', 'SEK', 'CHF']

const ICON_EMOJIS = ['🏔️', '🏠', '🎉', '✈️', '🍕', '🎮', '🏖️', '💼', '🎓', '🛒', '🚗', '🎵', '⚽', '🏥', '🐾', '📸']

interface GroupModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: GroupCreateRequest | GroupUpdateRequest) => Promise<void>
  editGroup?: GroupResponse | null
}

export default function GroupModal({ isOpen, onClose, onSubmit, editGroup }: GroupModalProps) {
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('🏔️')
  const [currency, setCurrency] = useState('PLN')
  const [type, setType] = useState<GroupType>('TRIP')
  const [submitting, setSubmitting] = useState(false)

  const [showIconPicker, setShowIconPicker] = useState(false)
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false)

  const backdropRef = useRef<HTMLDivElement>(null)
  const currencyDropdownRef = useRef<HTMLDivElement>(null)
  const iconDropdownRef = useRef<HTMLDivElement>(null)

  // Inicjalizacja danych po otwarciu
  useEffect(() => {
    if (editGroup) {
      setName(editGroup.name)
      setIcon(editGroup.icon ?? '🏔️')
      setCurrency(editGroup.currency)
      setType(editGroup.type)
    } else {
      setName('')
      setIcon('🏔️')
      setCurrency('PLN')
      setType('TRIP')
    }
  }, [editGroup, isOpen])

  // Obsługa zamykania dropdownów po kliknięciu poza nimi
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (currencyDropdownRef.current && !currencyDropdownRef.current.contains(event.target as Node)) {
        setShowCurrencyPicker(false)
      }
      if (iconDropdownRef.current && !iconDropdownRef.current.contains(event.target as Node)) {
        setShowIconPicker(false)
      }
    }

    if (showCurrencyPicker || showIconPicker) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showCurrencyPicker, showIconPicker])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await onSubmit({ name, icon, currency, type })
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) onClose()
  }

  return (
      <div
          ref={backdropRef}
          onClick={handleBackdropClick}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn"
      >
        {/* Usunięto overflow-hidden, aby dropdown waluty mógł naturalnie wychodzić za krawędź modala */}
        <div className="relative w-full max-w-lg mx-4 bg-surface-container rounded-3xl border border-outline-variant/20 shadow-2xl animate-slideUp">

          {/* Dekoracyjne światła z osobnym overflow-hidden, żeby nie wychodziły poza obrys, ale nie ucinały listy walut */}
          <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary/10 rounded-full blur-[120px]" />
            <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-tertiary/10 rounded-full blur-[120px]" />
          </div>

          {/* Header */}
          <div className="relative px-8 pt-8 pb-4 flex items-center justify-between">
            <h2 className="font-headline text-2xl font-bold tracking-tight text-on-surface">
              {editGroup ? 'Edit Group' : 'New Group'}
            </h2>
            <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-surface-container-highest/60 hover:bg-surface-container-highest transition-colors flex items-center justify-center text-on-surface-variant z-10"
            >
              <Icon name="close" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="relative px-8 pb-8 space-y-6">
            {/* Icon + Name */}
            <div className="flex items-start gap-4">
              <div className="relative" ref={iconDropdownRef}>
                <button
                    type="button"
                    onClick={() => setShowIconPicker(!showIconPicker)}
                    className="w-16 h-16 rounded-2xl bg-surface-container-highest border-2 border-dashed border-outline-variant/30 hover:border-primary/50 transition-all flex items-center justify-center text-3xl hover:scale-105 active:scale-95"
                >
                  {icon}
                </button>
                {showIconPicker && (
                    <div className="absolute top-full mt-2 left-0 z-[60] p-3 bg-surface-container-highest rounded-2xl border border-outline-variant/20 shadow-2xl grid grid-cols-4 gap-2 min-w-[180px]">
                      {ICON_EMOJIS.map(emoji => (
                          <button
                              key={emoji}
                              type="button"
                              onClick={() => { setIcon(emoji); setShowIconPicker(false) }}
                              className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl hover:bg-primary/10 transition-colors ${
                                  icon === emoji ? 'bg-primary/20 ring-2 ring-primary/40' : ''
                              }`}
                          >
                            {emoji}
                          </button>
                      ))}
                    </div>
                )}
              </div>
              <div className="flex-1">
                <label className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold mb-1 block">
                  Group Name
                </label>
                <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Tatra Mountains Trip"
                    required
                    className="w-full bg-surface-container-highest/60 border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all font-medium"
                />
              </div>
            </div>

            {/* Type */}
            <div>
              <label className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold mb-3 block">
                Group Type
              </label>
              <div className="grid grid-cols-4 gap-3">
                {GROUP_TYPES.map(t => (
                    <button
                        key={t.value}
                        type="button"
                        onClick={() => setType(t.value)}
                        className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-2 ${
                            type === t.value
                                ? 'bg-primary/10 border-primary/30 text-primary'
                                : 'bg-surface-container-highest/40 border-outline-variant/10 text-on-surface-variant hover:border-outline-variant/30'
                        }`}
                    >
                      <Icon name={t.icon} className="text-xl" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">{t.label}</span>
                    </button>
                ))}
              </div>
            </div>

            {/* Currency */}
            <div>
              <label className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold mb-1 block">
                Currency
              </label>
              <div className="relative" ref={currencyDropdownRef}>
                <button
                    type="button"
                    onClick={() => setShowCurrencyPicker(!showCurrencyPicker)}
                    className="w-full bg-surface-container-highest/60 border border-outline-variant/20 rounded-xl px-4 py-3 text-left text-on-surface font-medium flex items-center justify-between hover:border-outline-variant/40 transition-all"
                >
                  <span>{currency}</span>
                  <Icon name="expand_more" className={`text-on-surface-variant transition-transform ${showCurrencyPicker ? 'rotate-180' : ''}`} />
                </button>
                {showCurrencyPicker && (
                    <div className="absolute top-full mt-2 left-0 right-0 z-[60] bg-surface-container-highest rounded-xl border border-outline-variant/20 shadow-2xl overflow-hidden max-h-48 overflow-y-auto">
                      {CURRENCIES.map(c => (
                          <button
                              key={c}
                              type="button"
                              onClick={() => { setCurrency(c); setShowCurrencyPicker(false) }}
                              className={`w-full px-4 py-2.5 text-left hover:bg-primary/10 transition-colors text-sm font-medium ${
                                  currency === c ? 'text-primary bg-primary/5' : 'text-on-surface'
                              }`}
                          >
                            {c}
                          </button>
                      ))}
                    </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3.5 rounded-xl border border-outline-variant/20 text-on-surface-variant font-bold hover:bg-surface-container-highest/60 transition-all"
              >
                Cancel
              </button>
              <button
                  type="submit"
                  disabled={submitting || !name.trim()}
                  className="flex-1 py-3.5 rounded-xl bg-primary text-on-primary font-bold hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40 disabled:pointer-events-none emerald-shadow flex items-center justify-center gap-2"
              >
                {submitting ? (
                    <span className="w-5 h-5 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                ) : (
                    <>
                      <Icon name={editGroup ? 'save' : 'add'} />
                      {editGroup ? 'Save Changes' : 'Create Group'}
                    </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
  )
}