import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import AddToCircleButton from './add-to-circle-button'
import BookingRequestForm from './booking-request-form'
import ShareButton from './share-button'

export default async function ProProfilePage({ params }: { params: Promise<{ id: string }> }) {
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

  const { data: availability } = await supabase
    .from('availability')
    .select('day_of_week, start_time, end_time')
    .eq('pro_id', pro.id)

  const { data: reviews } = await supabase
    .from('reviews')
    .select('rating, comment, client:profiles!reviews_client_id_fkey(full_name)')
    .eq('pro_id', pro.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const { count: completedCount } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('pro_id', pro.id)
    .eq('status', 'completed')

  const nextAvailable = availability
    ?.reduce((acc: string[], slot) => {
      if (!acc.includes(slot.day_of_week)) acc.push(slot.day_of_week)
      return acc
    }, [])
    .slice(0, 3) || []

  return (
    <div className="max-w-3xl">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0ebe3] mb-6">
        {pro.avatar_url && (
          <img src={pro.avatar_url} alt={pro.full_name} className="w-20 h-20 rounded-full object-cover mb-4" />
        )}
        <h1 className="text-3xl font-semibold text-[#5c7d4e]">{pro.full_name}</h1>
        <p className="text-gray-600 mt-1">{pro.city}</p>
        {pro.hourly_rate && <p className="text-lg font-medium mt-2">${pro.hourly_rate}/hr</p>}
        {pro.years_experience && (
          <p className="text-sm text-gray-600 mt-1">{pro.years_experience} years of experience</p>
        )}
        {pro.reliability_score && (
          <p className="text-sm text-gray-600 mt-1">Completed {pro.reliability_score}% of bookings</p>
        )}
        {pro.avg_response_minutes && (
          <p className="text-sm text-gray-600 mt-1">
            Usually responds in {pro.avg_response_minutes < 60 ? `${pro.avg_response_minutes} min` : `${Math.round(pro.avg_response_minutes / 60)} hr`}
          </p>
        )}
        {completedCount && completedCount > 5 && (
          <span className="inline-block mt-2 bg-purple-50 text-purple-800 text-xs px-2.5 py-1 rounded-full">Repeat Pro</span>
        )}
        {pro.available_now && (
          <span className="inline-block mt-2 ml-2 bg-green-100 text-green-800 text-xs px-2.5 py-1 rounded-full">Available Now</span>
        )}
        {pro.bio && <p className="text-gray-700 mt-4">{pro.bio}</p>}

        {nextAvailable.length > 0 && (
          <p className="text-sm text-gray-500 mt-3">
            Next available: {nextAvailable.join(', ')}
          </p>
        )}

        <div className="flex flex-wrap gap-2 mt-4">
          <AddToCircleButton proId={pro.id} />
          <Link
            href={`/dashboard/messages/${pro.id}`}
            className="text-sm border border-[#f0ebe3] text-gray-700 px-4 py-2.5 rounded-xl font-medium hover:bg-gray-50"
          >
            Message
          </Link>
          <ShareButton />
        </div>
      </div>

      {services && services.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0ebe3] mb-6">
          <h2 className="font-semibold mb-3">Services</h2>
          <div className="flex flex-wrap gap-2">
            {services.map((s: any) => (
              <span key={s.services.name} className="bg-[#f0f7ed] text-[#5c7d4e] px-3 py-1 rounded-full text-sm">
                {s.services.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {certs && certs.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0ebe3] mb-6">
          <h2 className="font-semibold mb-3">Certifications</h2>
          <div className="flex flex-wrap gap-2">
            {certs.map((c: any) => (
              <span key={c.certifications.name} className="bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-sm">
                {c.certifications.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <BookingRequestForm proId={pro.id} availableNow={pro.available_now} availability={availability || []} />

      {reviews && reviews.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0ebe3] mt-6">
          <h2 className="font-semibold mb-4">Reviews</h2>
          {reviews.map((r: any, i: number) => (
            <div key={i} className="border-b last:border-0 py-3">
              <p className="font-medium">{r.rating}/5 — {r.client?.full_name}</p>
              {r.comment && <p className="text-sm text-gray-600 mt-1">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}