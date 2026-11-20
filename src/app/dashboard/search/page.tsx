'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

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

export default function SearchPage() {
  const [pros, setPros] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [selectedService, setSelectedService] = useState('')
  const [availableNow, setAvailableNow] = useState(false)
  const [minReliability, setMinReliability] = useState('')
  const [minYears, setMinYears] = useState('')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => { loadServices() }, [])
  useEffect(() => { search() }, [selectedService, availableNow, minReliability, minYears])

  async function loadServices() {
    const { data } = await supabase.from('services').select('*').order('name')
    setServices(data || [])
  }

  async function search() {
    setLoading(true)
    let proIds: string[] | null = null

    if (selectedService) {
      const { data: matching } = await supabase.from('pro_services').select('pro_id').eq('service_id', selectedService)
      proIds = matching?.map(m => m.pro_id) || []
      if (proIds.length === 0) { setPros([]); setLoading(false); return }
    }

    let query = supabase
      .from('profiles')
      .select('id, full_name, city, hourly_rate, available_now, avatar_url, avg_response_minutes, reliability_score, years_experience, updated_at')
      .eq('role', 'pro')

    if (proIds) query = query.in('id', proIds)
    if (availableNow) query = query.eq('available_now', true)
    if (minReliability) query = query.gte('reliability_score', parseInt(minReliability))
    if (minYears) query = query.gte('years_experience', parseInt(minYears))

    const { data: proData } = await query.limit(20)
    if (!proData || proData.length === 0) { setPros([]); setLoading(false); return }

    const ids = proData.map(p => p.id)

    const { data: availData } = await supabase.from('availability').select('pro_id, day_of_week, start_time, end_time').in('pro_id', ids)
    const availMap: Record<string, any[]> = {}
    availData?.forEach(a => { if (!availMap[a.pro_id]) availMap[a.pro_id] = []; availMap[a.pro_id].push(a) })

    const { data: reviewData } = await supabase.from('reviews').select('pro_id, rating').in('pro_id', ids)
    const reviewMap: Record<string, { sum: number; count: number }> = {}
    reviewData?.forEach(r => {
      if (!reviewMap[r.pro_id]) reviewMap[r.pro_id] = { sum: 0, count: 0 }
      reviewMap[r.pro_id].sum += r.rating
      reviewMap[r.pro_id].count += 1
    })

    const { data: circleData } = await supabase.from('circles').select('pro_id').in('pro_id', ids)
    const circleMap: Record<string, number> = {}
    circleData?.forEach(c => { circleMap[c.pro_id] = (circleMap[c.pro_id] || 0) + 1 })

    const enriched = proData.map(p => ({
      ...p,
      availabilitySummary: summarizeAvailability(availMap[p.id] || []),
      avgRating: reviewMap[p.id] ? (reviewMap[p.id].sum / reviewMap[p.id].count).toFixed(1) : null,
      reviewCount: reviewMap[p.id]?.count || 0,
      circleCount: circleMap[p.id] || 0,
    }))

    setPros(enriched)
    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold text-[#2c2c2c] mb-6">Find Pros</h1>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#f0ebe3] mb-6">
        <div className="flex flex-wrap gap-3 items-center">
          <select value={selectedService} onChange={e => setSelectedService(e.target.value)} className="border border-[#f0ebe3] rounded-xl px-3 py-2.5 text-sm min-h-[44px]">
            <option value="">All services</option>
            {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select value={minReliability} onChange={e => setMinReliability(e.target.value)} className="border border-[#f0ebe3] rounded-xl px-3 py-2.5 text-sm min-h-[44px]">
            <option value="">Any reliability</option>
            <option value="90">90%+ completed</option>
            <option value="80">80%+ completed</option>
            <option value="70">70%+ completed</option>
          </select>
          <select value={minYears} onChange={e => setMinYears(e.target.value)} className="border border-[#f0ebe3] rounded-xl px-3 py-2.5 text-sm min-h-[44px]">
            <option value="">Any experience</option>
            <option value="1">1+ years</option>
            <option value="3">3+ years</option>
            <option value="5">5+ years</option>
          </select>
          <label className="flex items-center gap-2 text-sm min-h-[44px]">
            <input type="checkbox" checked={availableNow} onChange={e => setAvailableNow(e.target.checked)} className="w-4 h-4" />
            Available Now
          </label>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : pros.length > 0 ? (
        <div className="space-y-3">
          {pros.map(pro => {
            const lastActive = pro.updated_at ? new Date(pro.updated_at) : null
            const isRecent = lastActive && (Date.now() - lastActive.getTime()) < 1000 * 60 * 60 * 24 * 2
            return (
              <Link key={pro.id} href={`/dashboard/pro/${pro.id}`} className="block">
                <div className="bg-white rounded-xl p-5 shadow-sm border border-[#f0ebe3] hover:shadow-md flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-[#f0f7ed] flex items-center justify-center text-[#5c7d4e] font-medium flex-shrink-0 overflow-hidden">
                    {pro.avatar_url ? <img src={pro.avatar_url} alt="" className="w-full h-full object-cover" /> : pro.full_name?.[0] || 'P'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-[#2c2c2c] truncate">{pro.full_name}</p>
                      {pro.available_now && <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full flex-shrink-0">Available Now</span>}
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{pro.city || 'Location not set'}</p>
                    {pro.hourly_rate && <p className="text-sm font-medium mt-1">${pro.hourly_rate}/hr</p>}
                    {pro.avgRating && <p className="text-sm text-gray-700 mt-0.5">{pro.avgRating} ★ · {pro.reviewCount} review{pro.reviewCount !== 1 ? 's' : ''}</p>}
                    {pro.circleCount > 0 && <p className="text-xs text-gray-500 mt-0.5">Saved by {pro.circleCount} famil{pro.circleCount === 1 ? 'y' : 'ies'}</p>}
                    {pro.availabilitySummary && <p className="text-xs text-gray-500 mt-1">{pro.availabilitySummary}</p>}
                    {pro.avg_response_minutes && <p className="text-xs text-gray-400 mt-0.5">Usually responds in {pro.avg_response_minutes < 60 ? `${pro.avg_response_minutes} min` : `${Math.round(pro.avg_response_minutes / 60)} hr`}</p>}
                    {pro.reliability_score && <p className="text-xs text-gray-500 mt-0.5">Completed {pro.reliability_score}% of bookings</p>}
                    {pro.years_experience && <p className="text-xs text-gray-500 mt-0.5">{pro.years_experience} years experience</p>}
                    {isRecent && <p className="text-xs text-green-600 mt-0.5">Active recently</p>}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#f0ebe3]">
          <p className="text-gray-500">No Pros found.</p>
          <p className="text-sm text-gray-400 mt-1">Try removing a filter or checking back later.</p>
          <button onClick={() => { setSelectedService(''); setMinReliability(''); setMinYears(''); setAvailableNow(false) }} className="mt-4 text-sm text-[#5c7d4e] hover:underline">
            Clear filters
          </button>
        </div>
      )}
    </div>
  )
}