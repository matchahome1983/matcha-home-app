import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import AddToCircleButton from './add-to-circle-button'
import BookingRequestForm from './booking-request-form'
import AvailabilityCalendar from './availability-calendar'
import ShareButton from './share-button'
import InviteButton from './invite-button'

function formatTime(t: string) {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`
}

function summarizeAvailability(slots: any[]) {
  if (!slots || slots.length === 0) return null
  const byDay: Record<string, string[]> = {}
  slots.forEach(s => {
    if (!byDay[s.day_of_week]) byDay[s.day_of_week] = []
    byDay[s.day_of_week].push(`${formatTime(s.start_time)}–${formatTime(s.end_time)}`)
  })
  const days = Object.keys(byDay)
  const preview = days.slice(0, 3).map(day => {
    const times = byDay[day].slice(0, 1).join(', ')
    return `${day.slice(0, 3)} ${times}`
  })
  return preview.join(' · ')
}

export default async function ProProfilePage({ 
  params,
  searchParams,
}: { 
  params: Promise<{ id: string }>
  searchParams: Promise<{ invited_by?: string; inviter?: string }>
}) {
  const { id } = await params
  const { invited_by, inviter } = await searchParams
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
    .select('*')
    .eq('pro_id', pro.id)

  const availabilitySummary = summarizeAvailability(availability || [])

  const { data: reviews } = await supabase.rpc('get_pro_reviews', { pro: pro.id })
  const { data: avgRating } = await supabase.rpc('get_average_rating', { pro_id: pro.id })

  return (
    <div className="max-w-3xl">
      {invited_by && inviter && (
        <div className="bg-[#f0f7ed] border border-[#e0eed8] rounded-xl p-4 mb-6 text-sm text-[#5c7d4e]">
          Recommended by {decodeURIComponent(inviter)}
        </div>
      )}

      <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
        {pro.avatar_url && (
          <img src={pro.avatar_url} alt={pro.full_name} className="w-20 h-20 rounded-full object-cover mb-4" />
        )}

        <div className="flex justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-[#5c7d4e]">{pro.full_name}</h1>
            <p className="text-gray-600 mt-1">{pro.city}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {avgRating > 0 && (
                <span className="text-sm font-medium">{avgRating}/5</span>
              )}
              {pro.available_now && (
                <span className="bg-green-100 text-green-800 text-xs px-2.5 py-0.5 rounded-full">Available Now</span>
              )}
              {pro.is_student && (
                <span className="bg-blue-50 text-blue-800 text-xs px-2.5 py-0.5 rounded-full">Student</span>
              )}
              {pro.id_verified && (
                <span className="bg-blue-50 text-blue-800 text-xs px-2.5 py-0.5 rounded-full">ID Verified</span>
              )}
              {pro.livescan_verified && (
                <span className="bg-green-50 text-green-800 text-xs px-2.5 py-0.5 rounded-full">LiveScan</span>
              )}
            </div>
            {pro.hourly_rate && (
              <p className="text-lg font-medium mt-3">${pro.hourly_rate}/hr</p>
            )}
          </div>
          <div className="flex flex-wrap gap-2 justify-end">
            <Link
              href={`/dashboard/messages/${pro.id}`}
              className="text-sm bg-[#5c7d4e] text-white px-4 py-2.5 rounded-xl hover:bg-[#4a6b3e] font-medium"
              title="Message this Pro"
            >
              Message
            </Link>
            <ShareButton />
            <InviteButton proId={pro.id} proName={pro.full_name} />
            <AddToCircleButton proId={pro.id} />
          </div>
        </div>

        {availabilitySummary && (
          <p className="text-sm text-gray-600 mt-4">{availabilitySummary}</p>
        )}

        {pro.bio && (
          <p className="text-gray-700 mt-4">{pro.bio}</p>
        )}
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

      {availability && availability.length > 0 && (
        <AvailabilityCalendar availability={availability} />
      )}

      <BookingRequestForm 
        proId={pro.id} 
        availableNow={pro.available_now} 
        availability={availability || []} 
      />

      {reviews && reviews.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm mt-6">
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