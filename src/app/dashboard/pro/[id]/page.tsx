import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import AddToCircleButton from './add-to-circle-button'
import BookingRequestForm from './booking-request-form'
import AvailabilityCalendar from './availability-calendar'

export default async function ProProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: pro } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .eq('role', 'pro')
    .single()

  if (!pro) notFound()

  const { data: services } = await supabase
    .from('pro_services')
    .select('services(name)')
    .eq('pro_id', pro.id)

  const { data: certs } = await supabase
    .from('pro_certifications')
    .select('certifications(name)')
    .eq('pro_id', pro.id)

  const { data: avgRating } = await supabase.rpc('get_average_rating', { pro_id: pro.id })

  const { data: availability } = await supabase
    .from('availability')
    .select('*')
    .eq('pro_id', pro.id)

  const { data: reviews } = await supabase
    .from('reviews')
    .select('rating, comment, created_at, client:profiles!reviews_client_id_fkey(full_name)')
    .eq('pro_id', pro.id)
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0ebe3] mb-6">
        <div className="flex items-start gap-5">
          <div className="w-20 h-20 rounded-full bg-[#f0f7ed] flex items-center justify-center text-2xl font-medium text-[#5c7d4e] flex-shrink-0 overflow-hidden">
            {pro.avatar_url ? (
              <img src={pro.avatar_url} alt={pro.full_name} className="w-full h-full object-cover" />
            ) : (
              pro.full_name?.[0] || 'P'
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-semibold text-[#2c2c2c]">{pro.full_name}</h1>
                <p className="text-gray-500 mt-0.5">{pro.city || 'Location not set'}</p>
                {pro.response_time && (
                  <p className="text-sm text-gray-500 mt-1">{pro.response_time}</p>
                )}
              </div>
              {pro.available_now && (
                <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full whitespace-nowrap">
                  Available Now
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 mt-3">
              {pro.hourly_rate && (
                <span className="text-lg font-medium text-[#2c2c2c]">${pro.hourly_rate}/hr</span>
              )}
              {avgRating > 0 && (
                <span className="text-yellow-600 font-medium">★ {Number(avgRating).toFixed(1)}</span>
              )}
            </div>
          </div>
        </div>

        {pro.bio && (
          <p className="mt-5 text-gray-700 leading-relaxed">{pro.bio}</p>
        )}

        <div className="mt-6 flex flex-col sm:flex-row gap-3 items-start">
          <AddToCircleButton proId={pro.id} />
          <Link
            href={`/dashboard/messages/${pro.id}`}
            className="inline-flex items-center justify-center border border-[#5c7d4e] text-[#5c7d4e] px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#f0f7ed]"
          >
            Message
          </Link>
          <BookingRequestForm proId={pro.id} />
        </div>

        <p className="text-xs text-gray-400 mt-6">
          Pros on Matcha Home are independent contractors. You hire and pay them directly. Matcha Home facilitates the connection only.
        </p>
      </div>

      {services && services.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0ebe3] mb-6">
          <h2 className="font-semibold text-[#2c2c2c] mb-3">Services</h2>
          <div className="flex flex-wrap gap-2">
            {services.map((s: any) => (
              <span key={s.services.name} className="bg-[#f0f7ed] text-[#5c7d4e] px-3 py-1.5 rounded-full text-sm">
                {s.services.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {certs && certs.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0ebe3] mb-6">
          <h2 className="font-semibold text-[#2c2c2c] mb-3">Certifications</h2>
          <div className="flex flex-wrap gap-2">
            {certs.map((c: any) => (
              <span key={c.certifications.name} className="bg-blue-50 text-blue-800 px-3 py-1.5 rounded-full text-sm">
                {c.certifications.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {availability && availability.length > 0 && (
        <div className="mb-6">
          <AvailabilityCalendar availability={availability} />
        </div>
      )}

      {reviews && reviews.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0ebe3]">
          <h2 className="font-semibold text-[#2c2c2c] mb-4">Reviews</h2>
          <div className="space-y-4">
            {reviews.map((r: any, i: number) => (
              <div key={i} className="border-b border-[#f0ebe3] last:border-0 pb-4 last:pb-0">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm text-[#2c2c2c]">{r.client?.full_name || 'Client'}</p>
                  <span className="text-yellow-500 text-sm">{'★'.repeat(r.rating)}</span>
                </div>
                {r.comment && (
                  <p className="text-sm text-gray-600 mt-1">{r.comment}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}