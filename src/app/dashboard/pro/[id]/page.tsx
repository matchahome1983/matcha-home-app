import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import AddToCircleButton from './add-to-circle-button'
import BookingRequestForm from './booking-request-form'

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

  const { data: reviews } = await supabase.rpc('get_pro_reviews', { pro: pro.id })
  const { data: avgRating } = await supabase.rpc('get_average_rating', { pro_id: pro.id })

  return (
    <div className="max-w-3xl">
      <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
        {pro.avatar_url && (
          <img src={pro.avatar_url} alt={pro.full_name} className="w-20 h-20 rounded-full object-cover mb-4" />
        )}

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-semibold text-[#5c7d4e]">{pro.full_name}</h1>
            <p className="text-gray-600 mt-1">{pro.city}</p>
            <div className="flex items-center gap-3 mt-2">
              {pro.hourly_rate && <p className="text-xl font-medium">${pro.hourly_rate}/hr</p>}
              {avgRating && (
                <span className="text-yellow-600 font-medium">★ {Number(avgRating).toFixed(1)}</span>
              )}
            </div>
          </div>
          {pro.available_now && (
            <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">Available Now</span>
          )}
        </div>

        {pro.bio && <p className="mt-4 text-gray-700">{pro.bio}</p>}

        <div className="mt-6">
          <AddToCircleButton proId={pro.id} />
        </div>

        <div className="mt-6">
          <BookingRequestForm proId={pro.id} />
        </div>

        <p className="text-xs text-gray-500 mt-6">
          Pros on Matcha Home are independent contractors. You hire and pay them directly. Matcha Home facilitates the connection only.
        </p>
      </div>

      {services && services.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
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
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
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

      {reviews && reviews.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-semibold mb-4">Reviews</h2>
          {reviews.map((r: any, i: number) => (
            <div key={i} className="border-b last:border-0 py-3">
              <p className="font-medium">{r.rating}/5 — {r.reviewer_name}</p>
              {r.comment && <p className="text-sm text-gray-600 mt-1">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}