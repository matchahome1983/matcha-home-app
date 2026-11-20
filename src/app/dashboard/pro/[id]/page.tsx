import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import AddToCircleButton from './add-to-circle-button'
import AvailabilityCalendar from './availability-calendar'

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

  const { data: reviews } = await supabase.rpc('get_pro_reviews', { pro: pro.id })
  const { data: avgRating } = await supabase.rpc('get_average_rating', { pro_id: pro.id })

  const { data: availability } = await supabase.rpc('get_pro_availability', {
    p_pro_id: pro.id,
  })

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0ebe3] mb-6">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 rounded-full bg-[#f0f7ed] flex items-center justify-center text-2xl font-medium text-[#5c7d4e] overflow-hidden flex-shrink-0">
            {pro.avatar_url ? (
              <Image src={pro.avatar_url} alt={pro.full_name} width={80} height={80} className="object-cover w-full h-full" />
            ) : (
              pro.full_name?.[0] || 'P'
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-start justify-between gap-2">
              <h1 className="text-2xl font-semibold text-[#2c2c2c]">{pro.full_name}</h1>
              {pro.available_now && (
                <span className="bg-green-100 text-green-800 text-xs px-2.5 py-1 rounded-full">Available Now</span>
              )}
            </div>
            <p className="text-gray-500 mt-1">{pro.city}</p>
            {avgRating > 0 && (
              <p className="text-sm font-medium mt-1">★ {avgRating}</p>
            )}
            {pro.hourly_rate && (
              <p className="font-medium mt-1">${pro.hourly_rate}/hr</p>
            )}
            {pro.bio && <p className="text-sm text-gray-600 mt-3">{pro.bio}</p>}
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-5">
          <AddToCircleButton proId={pro.id} />
          <Link href={`/dashboard/messages/${pro.id}`} className="border border-[#f0ebe3] px-4 py-2 rounded-xl text-sm">
            Message
          </Link>
          <Link href={`/dashboard/pro/${pro.id}`} className="border border-[#f0ebe3] px-4 py-2 rounded-xl text-sm">
            Share this Pro
          </Link>
        </div>
      </div>

      <AvailabilityCalendar proId={pro.id} availability={availability || []} />

      {services && services.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#f0ebe3] mb-6">
          <h2 className="font-semibold mb-3">Services</h2>
          <div className="flex flex-wrap gap-2">
            {services.map((s: any) => (
              <span key={s.services.name} className="bg-[#f0f7ed] text-[#5c7d4e] text-sm px-3 py-1 rounded-full">
                {s.services.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {certs && certs.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#f0ebe3] mb-6">
          <h2 className="font-semibold mb-3">Certifications</h2>
          <div className="flex flex-wrap gap-2">
            {certs.map((c: any) => (
              <span key={c.certifications.name} className="bg-blue-50 text-blue-800 text-sm px-3 py-1 rounded-full">
                {c.certifications.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {reviews && reviews.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#f0ebe3]">
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