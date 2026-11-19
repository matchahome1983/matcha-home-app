import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function CirclePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: circle } = await supabase
    .from('circles')
    .select(`
      pro:profiles!circles_pro_id_fkey (
        id,
        full_name,
        city,
        hourly_rate,
        available_now,
        avatar_url
      )
    `)
    .eq('client_id', user.id)

  const pros = circle?.map((c: any) => c.pro).filter(Boolean) || []

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#2c2c2c]">Your Circle</h1>
        <p className="text-gray-500 mt-1">Pros you’ve saved for quick access</p>
      </div>

      {pros.length > 0 ? (
        <div className="space-y-4">
          {pros.map((pro: any) => (
            <Link key={pro.id} href={`/dashboard/pro/${pro.id}`} className="block">
              <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow border border-[#f0ebe3] flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[#f0f7ed] flex items-center justify-center text-lg font-medium text-[#5c7d4e] flex-shrink-0 overflow-hidden">
                  {pro.avatar_url ? (
                    <img src={pro.avatar_url} alt={pro.full_name} className="w-full h-full object-cover" />
                  ) : (
                    pro.full_name?.[0] || 'P'
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-[#2c2c2c] truncate">{pro.full_name}</h3>
                    {pro.available_now && (
                      <span className="bg-green-100 text-green-800 text-xs px-2.5 py-0.5 rounded-full">
                        Available Now
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{pro.city || 'Location not set'}</p>
                  {pro.hourly_rate && (
                    <p className="text-sm font-medium mt-1">${pro.hourly_rate}/hr</p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#f0ebe3]">
          <p className="text-gray-500">Your Circle is empty.</p>
          <p className="text-sm text-gray-400 mt-1">Save Pros from their profile to see them here.</p>
          <Link href="/dashboard/search" className="inline-block mt-4 text-sm text-[#5c7d4e] hover:underline">
            Find Pros
          </Link>
        </div>
      )}
    </div>
  )
}