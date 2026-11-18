import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role, is_plus, trial_ends_at')
    .eq('id', user!.id)
    .single()

  const isPro = profile?.role === 'pro'

  let preview = null
  if (isPro) {
    const { data } = await supabase.rpc('my_bookings_as_pro')
    preview = data?.filter((b: any) => b.status === 'pending').slice(0, 3)
  } else {
    const { data } = await supabase.from('circle').select('*, pro:pro_id(full_name, city)').eq('client_id', user!.id).limit(3)
    preview = data
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold text-[#5c7d4e] mb-2">
        Welcome{profile?.full_name ? `, ${profile.full_name}` : ''}
      </h1>
      <p className="text-gray-600 mb-8">
        {isPro ? 'Pro Dashboard' : 'Client Dashboard'}
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-semibold mb-3">Plus Trial</h2>
          <p className="text-sm">Status: <span className="font-medium">{profile?.is_plus ? 'Active' : 'No'}</span></p>
          {profile?.trial_ends_at && (
            <p className="text-sm text-gray-500 mt-1">
              Ends: {new Date(profile.trial_ends_at).toLocaleDateString()}
            </p>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-semibold mb-3">{isPro ? 'Pending Requests' : 'Your Circle'}</h2>
          {!preview || preview.length === 0 ? (
            <p className="text-sm text-gray-500">Nothing here yet.</p>
          ) : isPro ? (
            <div className="space-y-2">
              {preview.map((b: any) => (
                <p key={b.id} className="text-sm">{b.client_name} · {b.requested_date}</p>
              ))}
              <Link href="/dashboard/requests" className="text-sm text-[#5c7d4e] font-medium">View all →</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {preview.map((c: any) => (
                <p key={c.id} className="text-sm">{c.pro?.full_name} · {c.pro?.city}</p>
              ))}
              <Link href="/dashboard/circle" className="text-sm text-[#5c7d4e] font-medium">View all →</Link>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8">
        <Link
          href={isPro ? '/dashboard/availability' : '/dashboard/search'}
          className="inline-block bg-[#7a9e6a] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#5c7d4e]"
        >
          {isPro ? 'Update Availability' : 'Find Pros'}
        </Link>
      </div>

      <p className="text-xs text-gray-500 mt-12 max-w-2xl">
        Matcha Home connects clients with independent Pros. No employment relationship is created. Clients and Pros arrange payment directly.
      </p>
    </div>
  )
}