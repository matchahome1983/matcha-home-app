import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import BookingActions from './booking-actions'
import ReviewForm from './review-form'

const statusStyles: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  completed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800',
}

export default async function MyBookingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isPro = profile?.role === 'pro'

  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      *,
      client:profiles!bookings_client_id_fkey(full_name, avatar_url),
      pro:profiles!bookings_pro_id_fkey(full_name, avatar_url, hourly_rate)
    `)
    .eq(isPro ? 'pro_id' : 'client_id', user.id)
    .order('start_time', { ascending: false })

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#2c2c2c]">My Bookings</h1>
        <p className="text-gray-500 mt-1">View and manage your bookings</p>
      </div>

      {bookings && bookings.length > 0 ? (
        <div className="space-y-4">
          {bookings.map((booking: any) => (
            <div key={booking.id} className="bg-white rounded-2xl p-5 shadow-sm border border-[#f0ebe3]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-[#2c2c2c]">
                    {isPro ? booking.client?.full_name : booking.pro?.full_name}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(booking.start_time).toLocaleDateString(undefined, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                  {booking.notes && (
                    <p className="text-sm text-gray-600 mt-2">{booking.notes}</p>
                  )}
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap ${statusStyles[booking.status] || 'bg-gray-100 text-gray-700'}`}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <p className="text-xs text-gray-400">
                  Updated {new Date(booking.updated_at || booking.created_at).toLocaleDateString()}
                </p>
                <BookingActions bookingId={booking.id} status={booking.status} />
              </div>

              {!isPro && booking.status === 'completed' && (
                <ReviewForm bookingId={booking.id} proId={booking.pro_id} />
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#f0ebe3]">
          <p className="text-gray-500">No bookings yet.</p>
          <Link href="/dashboard/search" className="inline-block mt-3 text-sm text-[#5c7d4e] hover:underline">
            Find a Pro
          </Link>
        </div>
      )}
    </div>
  )
}