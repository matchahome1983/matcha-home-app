import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import MarkRead from './mark-read'

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isPro = profile?.role === 'pro'

  const { data: pendingBookings } = await supabase
    .from('bookings')
    .select('id, start_time, status')
    .eq(isPro ? 'pro_id' : 'client_id', user.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(30)

  return (
    <div className="max-w-3xl mx-auto">
      <MarkRead userId={user.id} />

      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#2c2c2c]">Notifications</h1>
        <p className="text-gray-500 mt-1">Updates on your bookings and requests</p>
      </div>

      {pendingBookings && pendingBookings.length > 0 && (
        <div className="mb-8">
          <h2 className="font-medium text-[#2c2c2c] mb-3">Needs your attention</h2>
          <div className="space-y-3">
            {pendingBookings.map((booking: any) => (
              <Link
                key={booking.id}
                href="/dashboard/bookings"
                className="block bg-white rounded-2xl p-5 shadow-sm border border-[#f0ebe3] hover:shadow-md transition-shadow"
              >
                <p className="font-medium text-[#2c2c2c]">
                  {isPro ? 'New booking request' : 'Booking pending'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(booking.start_time).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {notifications && notifications.length > 0 ? (
        <div>
          <h2 className="font-medium text-[#2c2c2c] mb-3">Recent updates</h2>
          <div className="space-y-2">
            {notifications.map((n: any) => (
              <Link
                key={n.id}
                href={n.link || '/dashboard'}
                className={`block bg-white rounded-xl p-4 shadow-sm border border-[#f0ebe3] ${!n.read_at ? 'border-l-4 border-l-[#5c7d4e]' : ''}`}
              >
                <p className="font-medium text-[#2c2c2c]">{n.title}</p>
                {n.body && <p className="text-sm text-gray-600 mt-1">{n.body}</p>}
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(n.created_at).toLocaleString()}
                </p>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        pendingBookings?.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-[#f0ebe3]">
            <p className="text-gray-500">No new notifications.</p>
          </div>
        )
      )}
    </div>
  )
}