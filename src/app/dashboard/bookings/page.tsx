import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import BookingActions from './booking-actions'
import FeeButton from './fee-button'
import CompleteButton from './complete-button'
import ReviewForm from './review-form'

export default async function MyBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>
}) {
  const { sent } = await searchParams
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
      pro:profiles!bookings_pro_id_fkey(full_name, hourly_rate)
    `)
    .or(isPro ? `pro_id.eq.${user.id}` : `client_id.eq.${user.id}`)
    .order('start_time', { ascending: false })

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold text-[#2c2c2c] mb-6">
        {isPro ? 'Requests' : 'My Bookings'}
      </h1>

      {sent === 'true' && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl p-4 mb-6 text-sm">
          Request sent. The Pro will see it and can accept or decline.
        </div>
      )}

      {bookings && bookings.length > 0 ? (
        <div className="space-y-3">
          {bookings.map((b: any) => {
            const start = new Date(b.start_time)
            const end = new Date(b.end_time)
            const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
            const rate = b.pro?.hourly_rate || 0
            const subtotal = hours * rate
            const fee = subtotal * 0.12
            const hoursUntil = (start.getTime() - Date.now()) / (1000 * 60 * 60)
            const lateCancel = hoursUntil < 24 && b.status !== 'cancelled' && b.status !== 'completed'

            return (
              <div key={b.id} className="bg-white rounded-xl p-5 shadow-sm border border-[#f0ebe3]">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-[#2c2c2c]">
                      {isPro ? b.client?.full_name : b.pro?.full_name}
                      {b.is_recurring && <span className="ml-2 text-xs bg-blue-50 text-blue-800 px-2 py-0.5 rounded-full">Recurring</span>}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {start.toLocaleString()} – {end.toLocaleTimeString()}
                    </p>
                    {b.notes && <p className="text-sm text-gray-600 mt-2">{b.notes}</p>}
                    <p className="text-xs text-gray-500 mt-2">
                      Est. total: ${(subtotal + fee).toFixed(2)} (includes 12% fee)
                    </p>
                    {isPro && b.status === 'completed' && (
                      <div className="mt-1">
                        <p className="text-xs text-gray-500">Fee {b.fee_collected ? 'collected' : 'pending'}</p>
                        <FeeButton bookingId={b.id} collected={b.fee_collected} />
                      </div>
                    )}
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full ${
                    b.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    b.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    b.status === 'completed' ? 'bg-gray-100 text-gray-700' :
                    'bg-red-50 text-red-700'
                  }`}>
                    {b.status}
                  </span>
                </div>

                {isPro && b.status === 'pending' && <BookingActions bookingId={b.id} />}
                {isPro && b.status === 'confirmed' && <CompleteButton bookingId={b.id} />}

                {!isPro && b.status === 'completed' && (
                  <>
                    <ReviewForm bookingId={b.id} proId={b.pro_id} />
                    <Link
                      href={`/dashboard/pro/${b.pro_id}`}
                      className="inline-block mt-3 text-sm bg-[#5c7d4e] text-white px-4 py-1.5 rounded-xl font-medium"
                    >
                      Book again
                    </Link>
                  </>
                )}

                {lateCancel && (
                  <p className="text-xs text-amber-700 mt-3 bg-amber-50 rounded-lg px-3 py-2">
                    Cancelling within 24 hours may incur a $25 fee.
                  </p>
                )}
                {!lateCancel && (
                  <p className="text-xs text-gray-400 mt-3">
                    Cancellations within 24 hours may incur a $25 fee.
                  </p>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#f0ebe3]">
          <p className="text-gray-500">No bookings yet.</p>
          {!isPro && (
            <Link href="/dashboard/search" className="inline-block mt-3 text-sm text-[#5c7d4e] hover:underline">
              Find a Pro
            </Link>
          )}
        </div>
      )}
    </div>
  )
}