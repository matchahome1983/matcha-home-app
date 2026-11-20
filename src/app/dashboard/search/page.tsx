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
    loadServices()
  }, [])

  useEffect(() => {
    search()
  }, [selectedService, availableNow])

  async function loadServices() {
    const { data } = await supabase.from('services').select('*').order('name')
    setServices(data || [])
  }

  async function search() {
    setLoading(true)
    let query = supabase
      .from('profiles')
      .select('id, full_name, city, hourly_rate, available_now, avatar_url')
      .eq('role', 'pro')

    if (availableNow) {
      query = query.eq('available_now', true)
    }

    const { data } = await query.limit(20)
    setPros(data || [])
    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold text-[#2c2c2c] mb-6">Find Pros</h1>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#f0ebe3] mb-6">
        <div className="flex flex-wrap gap-3 items-center">
          <select
            value={selectedService}
            onChange={e => setSelectedService(e.target.value)}
            className="border border-[#f0ebe3] rounded-xl px-3 py-2 text-sm"
          >
            <option value="">All services</option>
            {services.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={availableNow}
              onChange={e => setAvailableNow(e.target.checked)}
            />
            Available Now
          </label>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : pros.length > 0 ? (
        <div className="space-y-3">
          {pros.map(pro => (
            <Link key={pro.id} href={`/dashboard/pro/${pro.id}`} className="block">
              <div className="bg-white rounded-xl p-5 shadow-sm border border-[#f0ebe3] hover:shadow-md flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#f0f7ed] flex items-center justify-center text-[#5c7d4e] font-medium flex-shrink-0 overflow-hidden">
                  {pro.avatar_url ? (
                    <img src={pro.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    pro.full_name?.[0] || 'P'
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-[#2c2c2c] truncate">{pro.full_name}</p>
                    {pro.available_now && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">Available Now</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{pro.city || 'Location not set'}</p>
                  {pro.hourly_rate && <p className="text-sm font-medium mt-0.5">${pro.hourly_rate}/hr</p>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#f0ebe3]">
          <p className="text-gray-500">No Pros found.</p>
          <p className="text-sm text-gray-400 mt-1">Try adjusting your filters.</p>
        </div>
      )}
    </div>
  )
}