'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const SERVICES = ['Childcare', 'House Refresh', 'Laundry & Dishes', 'Tutoring', 'Party Help', 'Meal Prep']
const CERTS = ['CPR / First Aid', 'Food Safety', 'Early Childhood Education', 'None yet']

export default function ProOnboarding() {
  const [step, setStep] = useState(1)
  const [services, setServices] = useState<string[]>([])
  const [certs, setCerts] = useState<string[]>([])
  const [availableNow, setAvailableNow] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  function toggle(list: string[], setList: any, item: string) {
    setList(list.includes(item) ? list.filter(i => i !== item) : [...list, item])
  }

  async function finish() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Save services
    const serviceRows = services.map(name => ({ pro_id: user.id, service_name: name }))
    if (serviceRows.length) await supabase.from('pro_services').insert(serviceRows)

    // Save certifications
    const certRows = certs.filter(c => c !== 'None yet').map(name => ({ pro_id: user.id, cert_name: name }))
    if (certRows.length) await supabase.from('pro_certifications').insert(certRows)

    // Set available now
    await supabase.from('profiles').update({ available_now: availableNow }).eq('id', user.id)

    router.push('/dashboard')
    setLoading(false)
  }

  return (
    <div>
      <div className="flex gap-1 mb-8">
        {[1,2,3].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-[#5c7d4e]' : 'bg-[#e8e0d5]'}`} />
        ))}
      </div>

      {step === 1 && (
        <>
          <h1 className="text-2xl font-semibold text-[#2c2c2c] mb-2">What can you help with?</h1>
          <p className="text-gray-500 mb-6">Select all that apply. You can change this later.</p>
          <div className="flex flex-wrap gap-2 mb-8">
            {SERVICES.map(s => (
              <button
                key={s}
                onClick={() => toggle(services, setServices, s)}
                className={`px-4 py-2.5 rounded-full text-sm border min-h-[44px] ${
                  services.includes(s) ? 'bg-[#5c7d4e] text-white border-[#5c7d4e]' : 'border-[#f0ebe3] text-gray-700'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <button onClick={() => setStep(2)} className="w-full bg-[#5c7d4e] text-white py-3 rounded-xl font-medium">
            Continue
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <h1 className="text-2xl font-semibold text-[#2c2c2c] mb-2">Any certifications?</h1>
          <p className="text-gray-500 mb-6">Optional — adds trust badges to your profile.</p>
          <div className="flex flex-wrap gap-2 mb-8">
            {CERTS.map(c => (
              <button
                key={c}
                onClick={() => toggle(certs, setCerts, c)}
                className={`px-4 py-2.5 rounded-full text-sm border min-h-[44px] ${
                  certs.includes(c) ? 'bg-[#5c7d4e] text-white border-[#5c7d4e]' : 'border-[#f0ebe3] text-gray-700'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="flex-1 border border-[#f0ebe3] py-3 rounded-xl">Back</button>
            <button onClick={() => setStep(3)} className="flex-1 bg-[#5c7d4e] text-white py-3 rounded-xl font-medium">Continue</button>
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <h1 className="text-2xl font-semibold text-[#2c2c2c] mb-2">Available now?</h1>
          <p className="text-gray-500 mb-6">Clients can Instant Book you when this is on.</p>
          <label className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-[#f0ebe3] mb-8">
            <input
              type="checkbox"
              checked={availableNow}
              onChange={e => setAvailableNow(e.target.checked)}
              className="w-5 h-5"
            />
            <span className="font-medium">I’m available right now</span>
          </label>
          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="flex-1 border border-[#f0ebe3] py-3 rounded-xl">Back</button>
            <button onClick={finish} disabled={loading} className="flex-1 bg-[#5c7d4e] text-white py-3 rounded-xl font-medium disabled:opacity-50">
              {loading ? 'Saving...' : 'Finish'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}