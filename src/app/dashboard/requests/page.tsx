import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import BookingActions from '../bookings/booking-actions'

export default async function RequestsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'pro') redirect('/dashboard')

  const { data: requests } = await supabase
    .from('bookings')
    .select(`
      *,
      client:profiles!bookings_client_id_fkey(full_name)
    `)
    .eq('pro_id', user.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#2c2c2c]">Requests</h1>
        <p className="text-gray-500 mt-1">Pending booking requests from clients</p>
      </div>

      {requests && requests.length > 0 ? (
        <div className="space-y-4">
          {requests.map((req: any) => (
            <div key={req.id} className="bg-white rounded-2xl p-5 shadow-sm border border-[#f0ebe3]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-[#2c2c2c]">{req.client?.full_name}</p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {new Date(req.start_time).toLocaleDateString(undefined, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <span className="bg-yellow-100 text-yellow-800 text-xs px-2.5 py-1 rounded-full font-medium">
                  Pending
                </span>
              </div>

              {req.notes && (
                <p className="text-sm text-gray-600 mt-3">{req.notes}</p>
              )}

              <div className="mt-4">
                <BookingActions bookingId={req.id} status={req.status} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#f0ebe3]">
          <p className="text-gray-500">No pending requests.</p>
        </div>
      )}
    </div>
  )
}