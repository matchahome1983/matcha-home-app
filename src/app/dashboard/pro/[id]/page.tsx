import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import AddToCircleButton from './add-to-circle-button'
import ShareButton from './share-button'
import InstantBook from './instant-book'

export default async function ProProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: clientProfile } = user 
    ? await supabase.from('profiles').select('lat, lng').eq('id', user.id).single()
    : { data: null }

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

  return (
    <div className="max-w-3xl">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0ebe3] mb-6">
        {pro.avatar_url && (
          <img src={pro.avatar_url} alt={pro.full_name} className="w-20 h-20 rounded-full object-cover mb-4" />
        )}
        <h1 className="text-3xl font-semibold text-[#5c7d4e]">{pro.full_name}</h1>
        <p className="text-gray-600 mt-1">{pro.city}</p>
        {pro.hourly_rate && <p className="text-lg font-medium mt-2">${pro.hourly_rate}/hr</p>}
        {pro.bio && <p className="text-gray-700 mt-4">{pro.bio}</p>}

        <div className="flex flex-wrap gap-2 mt-4">
          <AddToCircleButton proId={pro.id} />
          <Link href={`/dashboard/messages/${pro.id}`} className="text-sm border border-[#f0ebe3] text-gray-700 px-4 py-2.5 rounded-xl font-medium hover:bg-gray-50">
            Message
          </Link>
          <ShareButton />
        </div>
      </div>

      <InstantBook 
  proId={pro.id} 
  initialAvailable={pro.available_now}
  proLat={pro.lat}
  proLng={pro.lng}
  clientLat={clientProfile?.lat}
  clientLng={clientProfile?.lng}
/>

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
    </div>
  )
}