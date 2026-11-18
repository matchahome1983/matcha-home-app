'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const SERVICES = ['Childcare', 'House Refresh', 'Laundry & Dishes', 'Meal Prep', 'Simple Errands']
const CERTS = ['CPR / First Aid', 'Food Safety', 'Childcare / ECE', 'Nutrition', 'Background Check']

export default function SearchPage() {
  const [city, setCity] = useState('')
  const [availableOnly, setAvailableOnly] = useState(false)
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [selectedCerts, setSelectedCerts] = useState<string[]>([])
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  function toggle(list: string[], setList: (v: string[]) => void, value: string) {
    setList(list.includes(value) ? list.filter(v => v !== value) : [...list, value])
  }

  async function handleSearch() {
    setLoading(true)
    const { data, error } = await supabase.rpc('search_pros', {
      service_names: selectedServices.length ? selectedServices : null,
      cert_names: selectedCerts.length ? selectedCerts : null,
      city_filter: city.trim() || null,
      available_now_only: availableOnly
    })

    if (!error && data) {
      // Fetch average ratings
      const withRatings = await Promise.all(
        data.map(async (pro: any) => {
          const { data: rating } = await supabase.rpc('get_average_rating', { pro_id: pro.id })
          return { ...pro, average_rating: rating }
        })
      )
      setResults(withRatings)
    }
    setLoading(false)
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold text-[#5c7d4e] mb-6">Find Pros</h1>

      <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            placeholder="City (optional)"
            value={city}
            onChange={e => setCity(e.target.value)}
            className="border rounded-lg px-4 py-3"
          />
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={availableOnly} onChange={e => setAvailableOnly(e.target.checked)} />
            Available Now only
          </label>
        </div>

        <div className="mb-4">
          <p className="text-sm font-medium mb-2">Services</p>
          <div className="flex flex-wrap gap-2">
            {SERVICES.map(s => (
              <button
                key={s}
                onClick={() => toggle(selectedServices, setSelectedServices, s)}
                className={`px-3 py-1.5 rounded-full text-sm border ${selectedServices.includes(s) ? 'bg-[#7a9e6a] text-white' : 'bg-white'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm font-medium mb-2">Certifications</p>
          <div className="flex flex-wrap gap-2">
            {CERTS.map(c => (
              <button
                key={c}
                onClick={() => toggle(selectedCerts, setSelectedCerts, c)}
                className={`px-3 py-1.5 rounded-full text-sm border ${selectedCerts.includes(c) ? 'bg-[#7a9e6a] text-white' : 'bg-white'}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSearch}
          disabled={loading}
          className="bg-[#7a9e6a] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#5c7d4e] disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {results.map(pro => (
          <div key={pro.id} className="bg-white rounded-xl p-5 shadow-sm border border-[#e8e0d5]">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{pro.full_name || 'Pro'}</h3>
                <p className="text-sm text-gray-600">{pro.city}</p>
              </div>
              {pro.available_now && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Available Now</span>
              )}
            </div>
            <div className="mt-2 flex items-center gap-3 text-sm">
              {pro.hourly_rate && <span className="font-medium">${pro.hourly_rate}/hr</span>}
              {pro.average_rating && (
                <span className="text-yellow-600">★ {Number(pro.average_rating).toFixed(1)}</span>
              )}
            </div>
            {pro.bio && <p className="text-sm text-gray-600 mt-2 line-clamp-2">{pro.bio}</p>}
            <Link
              href={`/dashboard/pro/${pro.id}`}
              className="inline-block mt-4 text-sm text-[#5c7d4e] font-medium hover:underline"
            >
              View profile →
            </Link>
          </div>
        ))}
      </div>

      {results.length === 0 && !loading && (
        <p className="text-gray-500 text-center mt-8">No Pros found. Try adjusting your filters.</p>
      )}
    </div>
  )
}