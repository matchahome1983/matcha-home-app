import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
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

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold text-[#2c2c2c] mb-6">My Bookings</h1>

      {bookings && bookings.length > 0 ? (
        <div className="space-y-4">
          {bookings.map((booking: any) => (
            <div key={booking.id} className="bg-white rounded-2xl p-5 shadow-sm border border-[#f0ebe3]">
              <div className="flex justify-between items-start">
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
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full ${
                  booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                  booking.status === 'completed' ? 'bg-gray-100 text-gray-600' :
                  booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {booking.status}
                </span>
              </div>
              {booking.notes && (
                <p className="text-sm text-gray-600 mt-3">{booking.notes}</p>
              )}
              <BookingActions bookingId={booking.id} status={booking.status} />
              {booking.status === 'completed' && !isPro && (
                <div className="mt-4 pt-4 border-t border-[#f0ebe3] space-y-3">
                  <Link href={`/dashboard/pro/${booking.pro_id}`} className="inline-block bg-[#5c7d4e] text-white text-sm px-4 py-2.5 rounded-xl hover:bg-[#4a6b3e]">
                    Book Again
                  </Link>
                  <ReviewForm bookingId={booking.id} proId={booking.pro_id} />
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#f0ebe3]">
          <p className="text-gray-500">No bookings yet.</p>
          <Link href="/dashboard/search" className="inline-block mt-4 bg-[#5c7d4e] text-white text-sm px-5 py-2.5 rounded-xl">
            Find Pros
          </Link>
        </div>
      )}
    </div>
  )
}