import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import LogoutButton from './logout-button'
import Image from 'next/image'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role, is_plus, trial_ends_at')
    .eq('id', user.id)
    .single()

  const isPro = profile?.role === 'pro'
  const trialActive = profile?.is_plus && profile?.trial_ends_at && new Date(profile.trial_ends_at) > new Date()

  const { count: unreadCount } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('receiver_id', user.id)
    .is('read_at', null)

  return (
    <div className="min-h-screen bg-[#fbf8f3] flex flex-col">
      <header className="bg-white border-b border-[#f0ebe3] sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <Link href="/dashboard" className="flex items-center gap-2 flex-shrink-0">
            <Image 
              src="/logo.png" 
              alt="Matcha Home" 
              width={140} 
              height={36} 
              className="h-9 w-auto"
              priority
            />
          </Link>

          <nav className="flex items-center gap-4 sm:gap-6 text-sm text-[#2c2c2c] overflow-x-auto whitespace-nowrap py-1">
            {isPro ? (
              <>
                <Link href="/dashboard" className="hover:text-[#5c7d4e] py-2">Dashboard</Link>
                <Link href="/dashboard/requests" className="hover:text-[#5c7d4e] py-2">Requests</Link>
                <Link href="/dashboard/availability" className="hover:text-[#5c7d4e] py-2">Availability</Link>
                <Link href="/dashboard/earnings" className="hover:text-[#5c7d4e] py-2">Earnings</Link>
                <Link href="/dashboard/notifications" className="hover:text-[#5c7d4e] py-2">Notifications</Link>
                <Link href="/dashboard/profile" className="hover:text-[#5c7d4e] py-2">Profile</Link>
                <Link href="/dashboard/referrals" className="hover:text-[#5c7d4e] py-2">Referrals</Link>
                <Link href="/dashboard/settings" className="hover:text-[#5c7d4e] py-2">Settings</Link>
              </>
            ) : (
              <>
                <Link href="/dashboard" className="hover:text-[#5c7d4e] py-2">Dashboard</Link>
                <Link href="/dashboard/search" className="hover:text-[#5c7d4e] py-2">Find Pros</Link>
                <Link href="/dashboard/circle" className="hover:text-[#5c7d4e] py-2">Your Circle</Link>
                <Link href="/dashboard/bookings" className="hover:text-[#5c7d4e] py-2">My Bookings</Link>
                <Link href="/dashboard/messages" className="hover:text-[#5c7d4e] relative py-2">
                  Messages
                  {unreadCount && unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-3 bg-[#5c7d4e] text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
                <Link href="/dashboard/notifications" className="hover:text-[#5c7d4e] py-2">Notifications</Link>
                <Link href="/dashboard/referrals" className="hover:text-[#5c7d4e] py-2">Referrals</Link>
                <Link href="/dashboard/settings" className="hover:text-[#5c7d4e] py-2">Settings</Link>
              </>
            )}
            <LogoutButton />
          </nav>
        </div>
        {trialActive && (
          <div className="bg-[#f0f7ed] text-[#5c7d4e] text-xs text-center py-1.5">
            Plus trial active until {new Date(profile.trial_ends_at).toLocaleDateString()}
          </div>
        )}
      </header>

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full">
        {children}
      </main>

      <footer className="border-t border-[#f0ebe3] py-6 text-center text-xs text-[#6b6b6b]">
        <p>Matcha Home connects clients with independent Pros. No employment relationship is created.</p>
        <p className="mt-1">© {new Date().getFullYear()} Matcha Home</p>
      </footer>
    </div>
  )
}