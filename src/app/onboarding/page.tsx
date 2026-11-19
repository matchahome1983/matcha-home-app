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
  const [availability, setAvailability] = useState<{[key: string]: boolean}>({})
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  useEffect(() => {
    async function load() {
      const { data: svc } = await supabase.from('services').select('*').order('name')
      const { data: c } = await supabase.from('certifications').select('*').order('name')
      setServices(svc || [])
      setCerts(c || [])
    }
    load()
  }, [])

  async function handleFinish() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Save services
    if (selectedServices.length > 0) {
      await supabase.from('pro_services').insert(
        selectedServices.map(id => ({ pro_id: user.id, service_id: id }))
      )
    }

    // Save certifications
    if (selectedCerts.length > 0) {
      await supabase.from('pro_certifications').insert(
        selectedCerts.map(id => ({ pro_id: user.id, certification_id: id }))
      )
    }

    // Save availability (simple all-day slots)
    const availRows = days
      .filter(day => availability[day])
      .map(day => ({
        pro_id: user.id,
        day_of_week: day,
        start_time: '09:00',
        end_time: '17:00',
      }))

    if (availRows.length > 0) {
      await supabase.from('availability').insert(availRows)
    }

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
          <div className="space-y-2">
            {days.map(day => (
              <label key={day} className="flex items-center gap-3 p-3 border border-[#f0ebe3] rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={availability[day] || false}
                  onChange={(e) => setAvailability({ ...availability, [day]: e.target.checked })}
                />
                <span className="text-sm">{day}</span>
              </label>
            ))}
            <p className="text-xs text-gray-400 mt-2">Selected days will be set to 9am–5pm. You can adjust times later.</p>
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