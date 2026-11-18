import { createClient } from '@/lib/supabase/server'
import BookingActions from './booking-actions'
import ReviewForm from './review-form'

export const dynamic = 'force-dynamic'

export default async function MyBookingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: bookings } = await supabase.rpc('my_bookings_as_client')

  return (
    <div>
      <h1 className="text-3xl font-semibold text-[#5c7d4e] mb-6">My Bookings</h1>

      {!bookings || bookings.length === 0 ? (
        <p className="text-gray-500">No bookings yet.</p>
      ) : (
        <div className="space-y-4">
          {bookings.map((b: any) => (
            <div key={b.id} className="bg-white rounded-xl p-5 shadow-sm border border-[#e8e0d5]">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{b.pro_name || 'Pro'}</p>
                  <p className="text-sm text-gray-600">{b.pro_city}</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  b.status === 'accepted' ? 'bg-green-100 text-green-800' :
                  b.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  b.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                  b.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {b.status}
                </span>
              </div>
              <p className="mt-3 text-sm">
                {b.requested_date} · {b.start_time} – {b.end_time}
              </p>
              {b.cancellation_fee > 0 && (
                <p className="text-sm text-red-600 mt-1">Cancellation fee: ${b.cancellation_fee}</p>
              )}

              {(b.status === 'pending' || b.status === 'accepted') && (
                <BookingActions bookingId={b.id} status={b.status} />
              )}

              {b.status === 'completed' && (
                <ReviewForm bookingId={b.id} proId={b.pro_id} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}