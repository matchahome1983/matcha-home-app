'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [services, setServices] = useState<any[]>([])
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [certs, setCerts] = useState<any[]>([])
  const [selectedCerts, setSelectedCerts] = useState<string[]>([])
  const [times, setTimes] = useState<string[]>([])
  const [days, setDays] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const timeOptions = ['Morning', 'Midday', 'Afternoon', 'Evening']
  const dayOptions = ['Weekdays', 'Weekends']

  useEffect(() => {
    async function load() {
      const { data: svc } = await supabase.from('services').select('*').order('name')
      const { data: c } = await supabase.from('certifications').select('*').order('name')
      setServices(svc || [])
      setCerts(c || [])
    }
    load()
  }, [])

  function toggleTime(t: string) {
    setTimes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])
  }

  function toggleDay(d: string) {
    setDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d])
  }

  async function handleFinish() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (selectedServices.length > 0) {
      await supabase.from('pro_services').insert(
        selectedServices.map(id => ({ pro_id: user.id, service_id: id }))
      )
    }

    if (selectedCerts.length > 0) {
      await supabase.from('pro_certifications').insert(
        selectedCerts.map(id => ({ pro_id: user.id, certification_id: id }))
      )
    }

    await supabase.from('profiles').update({
      availability_times: times.length > 0 ? times : null,
      availability_days: days.length > 0 ? days : null,
    }).eq('id', user.id)

    router.push('/dashboard')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#fbf8f3] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#f0ebe3] w-full max-w-lg">
        <div className="mb-6">
          <div className="flex gap-2 mb-4">
            {[1, 2, 3].map(s => (
              <div key={s} className={`h-1 flex-1 rounded-full ${s <= step ? 'bg-[#5c7d4e]' : 'bg-gray-200'}`} />
            ))}
          </div>
          <h1 className="text-xl font-semibold text-[#2c2c2c]">
            {step === 1 && 'What can you help with?'}
            {step === 2 && 'Any certifications?'}
            {step === 3 && 'When are you available?'}
          </h1>
        </div>

        {step === 1 && (
          <div className="space-y-2">
            {services.map(s => (
              <label key={s.id} className="flex items-center gap-3 p-3 border border-[#f0ebe3] rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedServices.includes(s.id)}
                  onChange={(e) => {
                    if (e.target.checked) setSelectedServices([...selectedServices, s.id])
                    else setSelectedServices(selectedServices.filter(id => id !== s.id))
                  }}
                />
                <span className="text-sm">{s.name}</span>
              </label>
            ))}
            <button onClick={() => setStep(2)} className="w-full bg-[#5c7d4e] text-white py-3 rounded-xl mt-4 text-sm font-medium">
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-2">
            {certs.map(c => (
              <label key={c.id} className="flex items-center gap-3 p-3 border border-[#f0ebe3] rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedCerts.includes(c.id)}
                  onChange={(e) => {
                    if (e.target.checked) setSelectedCerts([...selectedCerts, c.id])
                    else setSelectedCerts(selectedCerts.filter(id => id !== c.id))
                  }}
                />
                <span className="text-sm">{c.name}</span>
              </label>
            ))}
            <div className="flex gap-3 mt-4">
              <button onClick={() => setStep(1)} className="flex-1 border border-[#f0ebe3] py-3 rounded-xl text-sm">Back</button>
              <button onClick={() => setStep(3)} className="flex-1 bg-[#5c7d4e] text-white py-3 rounded-xl text-sm font-medium">Continue</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium text-[#2c2c2c] mb-2">Time of day</p>
              <div className="flex flex-wrap gap-2">
                {timeOptions.map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleTime(t)}
                    className={`px-4 py-2 rounded-full text-sm ${times.includes(t) ? 'bg-[#5c7d4e] text-white' : 'border border-[#f0ebe3]'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-[#2c2c2c] mb-2">Days</p>
              <div className="flex flex-wrap gap-2">
                {dayOptions.map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDay(d)}
                    className={`px-4 py-2 rounded-full text-sm ${days.includes(d) ? 'bg-[#5c7d4e] text-white' : 'border border-[#f0ebe3]'}`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setStep(2)} className="flex-1 border border-[#f0ebe3] py-3 rounded-xl text-sm">Back</button>
              <button onClick={handleFinish} disabled={loading} className="flex-1 bg-[#5c7d4e] text-white py-3 rounded-xl text-sm font-medium disabled:opacity-50">
                {loading ? 'Saving...' : 'Finish'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}