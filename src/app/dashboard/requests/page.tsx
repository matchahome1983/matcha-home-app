import { createClient } from '@/lib/supabase/server'
import RespondButtons from './respond-buttons'

export default async function RequestsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: bookings } = await supabase.rpc('my_bookings_as_pro')

  return (
    <div>
      <h1 className="text-3xl font-semibold text-[#5c7d4e] mb-6">Incoming Requests</h1>

      {!bookings || bookings.length === 0 ? (
        <p className="text-gray-500">No requests yet.</p>
      ) : (
        <div className="space-y-4">
          {bookings.map((b: any) => (
            <div key={b.id} className="bg-white rounded-xl p-5 shadow-sm border border-[#e8e0d5]">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{b.client_name || 'Client'}</p>
                  <p className="text-sm text-gray-600">{b.client_city}</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  b.status === 'accepted' ? 'bg-green-100 text-green-800' :
                  b.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  b.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {b.status}
                </span>
              </div>
              <p className="mt-3 text-sm">
                {b.requested_date} · {b.start_time} – {b.end_time}
              </p>
              {b.notes && <p className="text-sm text-gray-600 mt-2">Notes: {b.notes}</p>}

              {b.status === 'pending' && (
                <RespondButtons bookingId={b.id} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}