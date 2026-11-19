import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import BookingActions from './booking-actions'
import ReviewForm from './review-form'

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
      client:profiles!bookings_client_id_fkey(full_name),
      pro:profiles!bookings_pro_id_fkey(full_name)
    `)
    .eq(isPro ? 'pro_id' : 'client_id', user.id)
    .order('start_time', { ascending: false })

  const statusStyles: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-700',
    cancelled: 'bg-red-100 text-red-800',
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#2c2c2c]">My Bookings</h1>
        <p className="text-gray-500 mt-1">
          {isPro ? 'Requests and upcoming work' : 'Your upcoming and past bookings'}
        </p>
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
                  <p className="text-sm text-gray-500 mt-0.5">
                    {new Date(booking.start_time).toLocaleDateString(undefined, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusStyles[booking.status] || 'bg-gray-100 text-gray-700'}`}>
                  {booking.status}
                </span>
              </div>

              {booking.notes && (
                <p className="text-sm text-gray-600 mt-3">{booking.notes}</p>
              )}

              <div className="mt-4">
                <BookingActions bookingId={booking.id} status={booking.status} />
              </div>

              {booking.status === 'completed' && !isPro && (
                <div className="mt-4 pt-4 border-t border-[#f0ebe3]">
                  <ReviewForm bookingId={booking.id} proId={booking.pro_id} />
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#f0ebe3]">
          <p className="text-gray-500">No bookings yet.</p>
        </div>
      )}
    </div>
  )
}