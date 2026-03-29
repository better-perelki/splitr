import Icon from '../components/Icon'

const friends = [
  { name: 'Aleksandra Kowalska', email: 'aleksandra.k@domain.com', status: 'owes you', amount: '$34', online: true },
  { name: 'Marek Wiśniewski', email: 'm.wisniewski@provider.net', status: 'settled up', amount: null, online: false },
  { name: 'Elena Rossi', email: 'elena.rossi@work.it', status: 'you owe', amount: '$12', online: false },
]

const invitations = [
  { name: 'Karol Nowicki' },
  { name: 'Zofia Lewandowska' },
]

export default function FriendsPage() {
  return (
    <div className="p-12 min-h-screen relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] emerald-glow pointer-events-none opacity-50" />

      <section className="max-w-6xl mx-auto space-y-12 relative z-10">
        {/* Search */}
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="relative w-full md:w-[480px] group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-on-surface-variant group-focus-within:text-primary transition-colors">
              <Icon name="search" />
            </div>
            <input
              type="text"
              placeholder="Search by email or phone number"
              className="w-full bg-surface-container-low border-none rounded-xl py-4 pl-12 pr-4 text-on-surface placeholder:text-on-surface-variant/40 focus:ring-1 focus:ring-primary/30 focus:bg-surface-container-high transition-all font-body"
            />
          </div>
          <button className="px-6 py-4 bg-surface-container-highest border border-primary/10 rounded-xl font-headline font-medium text-primary hover:bg-primary/5 transition-all flex items-center gap-2">
            <Icon name="qr_code_2" />
            Scan Code
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Friends List */}
          <div className="lg:col-span-8 space-y-8">
            <header className="flex items-end justify-between">
              <div>
                <h3 className="font-headline text-3xl font-bold tracking-tight">
                  Your Friends
                </h3>
                <p className="text-on-surface-variant text-sm mt-1">
                  You are currently sharing expenses with 24 people.
                </p>
              </div>
              <span className="text-xs font-headline uppercase tracking-widest text-primary font-bold">
                Sort by Balance
              </span>
            </header>

            <div className="space-y-4">
              {friends.map((friend) => (
                <div
                  key={friend.email}
                  className="glass-panel p-5 rounded-2xl flex items-center justify-between hover:bg-surface-container-highest/80 transition-all border border-transparent hover:border-primary/5 group"
                >
                  <div className="flex items-center gap-5">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-full bg-surface-variant border-2 border-primary/20 group-hover:border-primary/40 transition-all" />
                      {friend.online && (
                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-primary border-2 border-surface rounded-full" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-headline text-lg font-bold leading-none">
                        {friend.name}
                      </h4>
                      <p className="text-on-surface-variant text-xs mt-1 lowercase">
                        {friend.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-12">
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">
                        Status
                      </p>
                      {friend.status === 'settled up' ? (
                        <p className="font-headline text-on-surface/40 font-medium">
                          settled up
                        </p>
                      ) : (
                        <p
                          className={`font-headline font-medium ${
                            friend.status === 'owes you'
                              ? 'text-primary'
                              : 'text-error'
                          }`}
                        >
                          {friend.status}{' '}
                          <span className="text-xl">{friend.amount}</span>
                        </p>
                      )}
                    </div>
                    <button className="h-12 w-12 rounded-xl bg-surface-container-low text-on-surface-variant hover:bg-primary-container hover:text-on-primary-container transition-all flex items-center justify-center">
                      <Icon name="chevron_right" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-4 space-y-8">
            {/* Pending Invitations */}
            <section className="glass-panel rounded-3xl p-6 border border-primary/5">
              <h3 className="font-headline text-xl font-bold tracking-tight mb-6">
                Pending Invitations
              </h3>
              <div className="flex p-1 bg-surface-container-low rounded-xl mb-6">
                <button className="flex-1 py-2 text-xs font-headline font-bold uppercase tracking-wider bg-surface-container-highest text-primary rounded-lg">
                  Received (2)
                </button>
                <button className="flex-1 py-2 text-xs font-headline font-bold uppercase tracking-wider text-on-surface-variant hover:text-on-surface transition-colors">
                  Sent
                </button>
              </div>
              <div className="space-y-6">
                {invitations.map((inv, i) => (
                  <div key={inv.name}>
                    {i > 0 && <div className="h-px bg-outline-variant/10 mb-6" />}
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-surface-variant flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {inv.name}
                          </p>
                          <p className="text-[10px] text-on-surface-variant">
                            Invited you to connect
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="flex-1 py-2 bg-primary-container text-on-primary-container text-xs font-bold rounded-lg hover:opacity-90 active:scale-95 transition-all">
                          Accept
                        </button>
                        <button className="flex-1 py-2 bg-surface-container-high text-on-surface-variant text-xs font-bold rounded-lg hover:bg-error/10 hover:text-error transition-all">
                          Decline
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Contact Sync */}
            <div className="bg-gradient-to-br from-primary/10 to-transparent p-6 rounded-3xl border border-primary/20 relative overflow-hidden group">
              <div className="relative z-10">
                <Icon name="contact_page" className="text-primary mb-4" />
                <h4 className="font-headline text-lg font-bold mb-2">
                  Sync Contacts
                </h4>
                <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
                  Find your friends automatically by syncing your phone contacts.
                </p>
                <button className="w-full py-3 bg-surface text-primary border border-primary/30 rounded-xl text-xs font-bold hover:bg-primary hover:text-on-primary transition-all">
                  Enable Sync
                </button>
              </div>
              <div className="absolute -bottom-4 -right-4 text-primary opacity-5 rotate-12 group-hover:rotate-0 transition-transform duration-700">
                <Icon name="share" className="!text-9xl" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
