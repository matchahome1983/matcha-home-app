'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function SearchPage() {
  const [pros, setPros] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [selectedService, setSelectedService] = useState('')
  const [availableNow, setAvailableNow] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: svc } = await supabase.from('services').select('*').order('name')
      setServices(svc || [])
      fetchPros()
    }
    load()
  }, [])

  async function fetchPros() {
    setLoading(true)
    let query = supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        city,
        hourly_rate,
        available_now,
        avatar_url,
        updated_at,
        pro_services (
          services (name)
        )
      `)
      .eq('role', 'pro')
      .order('updated_at', { ascending: false })

    if (availableNow) {
      query = query.eq('available_now', true)
    }

    const { data } = await query
    let filtered = data || []

    if (selectedService) {
      filtered = filtered.filter((pro: any) =>
        pro.pro_services?.some((ps: any) => ps.services?.name === selectedService)
      )
    }

    setPros(filtered)
    setLoading(false)
  }

  useEffect(() => {
    fetchPros()
  }, [selectedService, availableNow])

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#2c2c2c]">Find Pros</h1>
        <p className="text-gray-500 mt-1">Browse available help in your area</p>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#f0ebe3] mb-6 flex flex-wrap gap-4 items-center">
        <select
          value={selectedService}
          onChange={(e) => setSelectedService(e.target.value)}
          className="border border-[#f0ebe3] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5c7d4e]/20"
        >
          <option value="">All services</option>
          {services.map((s) => (
            <option key={s.id} value={s.name}>{s.name}</option>
          ))}
        </select>

        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={availableNow}
            onChange={(e) => setAvailableNow(e.target.checked)}
            className="rounded"
          />
          Available Now
        </label>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading...</div>
      ) : pros.length > 0 ? (
        <div className="space-y-4">
          {pros.map((pro: any) => {
            const serviceNames = pro.pro_services?.map((ps: any) => ps.services?.name).filter(Boolean) || []

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
                      {pro.updated_at && (
                        <p className="text-xs text-gray-400 mt-1">
                          Active {new Date(pro.updated_at).toLocaleDateString()}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        {pro.hourly_rate && (
                          <span className="font-medium text-[#2c2c2c]">${pro.hourly_rate}/hr</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {serviceNames.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {serviceNames.slice(0, 4).map((name: string) => (
                        <span key={name} className="bg-[#f0f7ed] text-[#5c7d4e] text-xs px-2.5 py-1 rounded-full">
                          {name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#f0ebe3]">
          <p className="text-gray-500">No Pros match your filters.</p>
        </div>
      )}
    </div>
  )
}