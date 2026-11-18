import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function CirclePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: circle } = await supabase
    .from('circle')
    .select('*, pro:pro_id(id, full_name, city, hourly_rate, avatar_url, available_now)')
    .eq('client_id', user!.id)

  return (
    <div>
      <h1 className="text-3xl font-semibold text-[#5c7d4e] mb-6">Your Circle</h1>

      {!circle || circle.length === 0 ? (
        <p className="text-gray-500">You haven’t added any Pros yet. Search and add some to your Circle.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {circle.map((item: any) => (
            <div key={item.id} className="bg-white rounded-xl p-5 shadow-sm border border-[#e8e0d5]">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{item.pro?.full_name || 'Pro'}</h3>
                  <p className="text-sm text-gray-600">{item.pro?.city}</p>
                  {item.pro?.hourly_rate && (
                    <p className="text-sm mt-1">${item.pro.hourly_rate}/hr</p>
                  )}
                </div>
                {item.pro?.available_now && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Available Now</span>
                )}
              </div>
              <Link
                href={`/dashboard/pro/${item.pro?.id}`}
                className="inline-block mt-4 text-sm text-[#5c7d4e] font-medium hover:underline"
              >
                View profile →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}