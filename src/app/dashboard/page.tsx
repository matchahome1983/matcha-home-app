import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function SearchPage() {
  const supabase = await createClient()

  const { data: pros } = await supabase
    .from('profiles')
    .select(`
      id,
      full_name,
      city,
      hourly_rate,
      available_now,
      avatar_url,
      pro_services (
        services (name)
      )
    `)
    .eq('role', 'pro')
    .order('full_name')

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#2c2c2c]">Find Pros</h1>
        <p className="text-gray-500 mt-1">Browse available help in your area</p>
      </div>

      {pros && pros.length > 0 ? (
        <div className="space-y-4">
          {pros.map((pro: any) => {
            const services = pro.pro_services?.map((ps: any) => ps.services?.name).filter(Boolean) || []

            return (
              <Link key={pro.id} href={`/dashboard/pro/${pro.id}`} className="block">
                <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow border border-[#f0ebe3]">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-[#f0f7ed] flex items-center justify-center text-xl font-medium text-[#5c7d4e] flex-shrink-0 overflow-hidden">
                      {pro.avatar_url ? (
                        <img src={pro.avatar_url} alt={pro.full_name} className="w-full h-full object-cover" />
                      ) : (
                        pro.full_name?.[0] || 'P'
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-lg text-[#2c2c2c] truncate">{pro.full_name}</h3>
                        {pro.available_now && (
                          <span className="bg-green-100 text-green-800 text-xs px-2.5 py-0.5 rounded-full whitespace-nowrap">
                            Available Now
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">{pro.city || 'Location not set'}</p>
                      <div className="flex items-center gap-3 mt-2">
                        {pro.hourly_rate && (
                          <span className="font-medium text-[#2c2c2c]">${pro.hourly_rate}/hr</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {services.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {services.slice(0, 4).map((name: string) => (
                        <span
                          key={name}
                          className="bg-[#f0f7ed] text-[#5c7d4e] text-xs px-2.5 py-1 rounded-full"
                        >
                          {name}
                        </span>
                      ))}
                      {services.length > 4 && (
                        <span className="text-xs text-gray-400 px-1 py-1">+{services.length - 4} more</span>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#f0ebe3]">
          <p className="text-gray-500">No Pros found yet.</p>
        </div>
      )}
    </div>
  )
}