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
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  const isPro = profile?.role === 'pro'

  // Count unread messages (simple version: messages where user is receiver and not yet read)
  const { count: unreadCount } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('receiver_id', user.id)
    .is('read_at', null)

  return (
    <div className="min-h-screen bg-[#fbf8f3] flex flex-col">
      <header className="bg-white border-b border-[#f0ebe3] sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image 
              src="/logo.png" 
              alt="Matcha Home" 
              width={140} 
              height={36} 
              className="h-9 w-auto"
              priority
            />
          </Link>

          <nav className="flex items-center gap-6 text-sm text-[#2c2c2c]">
            {isPro ? (
              <>
                <Link href="/dashboard" className="hover:text-[#5c7d4e]">Dashboard</Link>
                <Link href="/dashboard/requests" className="hover:text-[#5c7d4e]">Requests</Link>
                <Link href="/dashboard/availability" className="hover:text-[#5c7d4e]">Availability</Link>
                <Link href="/dashboard/notifications" className="hover:text-[#5c7d4e]">Notifications</Link>
                <Link href="/dashboard/profile" className="hover:text-[#5c7d4e]">Profile</Link>
                <Link href="/dashboard/referrals" className="hover:text-[#5c7d4e]">Referrals</Link>
                <Link href="/dashboard/settings" className="hover:text-[#5c7d4e]">Settings</Link>
              </>
            ) : (
              <>
                <Link href="/dashboard" className="hover:text-[#5c7d4e]">Dashboard</Link>
                <Link href="/dashboard/search" className="hover:text-[#5c7d4e]">Find Pros</Link>
                <Link href="/dashboard/circle" className="hover:text-[#5c7d4e]">Your Circle</Link>
                <Link href="/dashboard/bookings" className="hover:text-[#5c7d4e]">My Bookings</Link>
                <Link href="/dashboard/messages" className="hover:text-[#5c7d4e] relative">
                  Messages
                  {unreadCount && unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-3 bg-[#5c7d4e] text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
                <Link href="/dashboard/notifications" className="hover:text-[#5c7d4e]">Notifications</Link>
                <Link href="/dashboard/referrals" className="hover:text-[#5c7d4e]">Referrals</Link>
                <Link href="/dashboard/settings" className="hover:text-[#5c7d4e]">Settings</Link>
              </>
            )}
            <LogoutButton />
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto px-6 py-8 w-full">
        {children}
      </main>

      <footer className="border-t border-[#f0ebe3] py-6 text-center text-xs text-[#6b6b6b]">
        <p>Matcha Home connects clients with independent Pros. No employment relationship is created.</p>
        <p className="mt-1">© {new Date().getFullYear()} Matcha Home</p>
      </footer>
    </div>
  )
}