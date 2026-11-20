'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import PhotoUpload from './photo-upload'

const SERVICES = ['Childcare', 'House Refresh', 'Laundry & Dishes', 'Tutoring', 'Party Help', 'Meal Prep']
const CERTS = ['CPR / First Aid', 'Food Safety', 'Early Childhood Education']

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [services, setServices] = useState<string[]>([])
  const [certs, setCerts] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    setProfile(prof)

    const { data: svc } = await supabase.from('pro_services').select('service_name').eq('pro_id', user.id)
    setServices(svc?.map((s: any) => s.service_name) || [])

    const { data: c } = await supabase.from('pro_certifications').select('cert_name').eq('pro_id', user.id)
    setCerts(c?.map((x: any) => x.cert_name) || [])

    setLoading(false)
  }

  function toggle(list: string[], setList: any, item: string) {
    setList(list.includes(item) ? list.filter(i => i !== item) : [...list, item])
  }

  async function save() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('profiles').update({
      full_name: profile.full_name,
      bio: profile.bio,
      hourly_rate: profile.hourly_rate,
      city: profile.city,
      available_now: profile.available_now,
    }).eq('id', user.id)

    // Reset and re-insert services
    await supabase.from('pro_services').delete().eq('pro_id', user.id)
    if (services.length) {
      await supabase.from('pro_services').insert(services.map(name => ({ pro_id: user.id, service_name: name })))
    }

    // Reset and re-insert certifications
    await supabase.from('pro_certifications').delete().eq('pro_id', user.id)
    if (certs.length) {
      await supabase.from('pro_certifications').insert(certs.map(name => ({ pro_id: user.id, cert_name: name })))
    }

    setSaving(false)
    router.refresh()
  }

  if (loading) return <div className="p-8">Loading...</div>
  if (!profile) return null

  const isPro = profile.role === 'pro'

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold text-[#2c2c2c] mb-6">Profile</h1>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0ebe3] space-y-6">
        <PhotoUpload currentUrl={profile.avatar_url} userId={profile.id} />

        <div>
          <label className="text-sm text-gray-600">Full name</label>
          <input
            value={profile.full_name || ''}
            onChange={e => setProfile({ ...profile, full_name: e.target.value })}
            className="w-full border border-[#f0ebe3] rounded-xl px-3 py-2.5 text-sm mt-1"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">City</label>
          <input
            value={profile.city || ''}
            onChange={e => setProfile({ ...profile, city: e.target.value })}
            className="w-full border border-[#f0ebe3] rounded-xl px-3 py-2.5 text-sm mt-1"
          />
        </div>

        {isPro && (
          <>
            <div>
              <label className="text-sm text-gray-600">Hourly rate</label>
              <input
                type="number"
                value={profile.hourly_rate || ''}
                onChange={e => setProfile({ ...profile, hourly_rate: e.target.value })}
                className="w-full border border-[#f0ebe3] rounded-xl px-3 py-2.5 text-sm mt-1"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Bio</label>
              <textarea
                value={profile.bio || ''}
                onChange={e => setProfile({ ...profile, bio: e.target.value })}
                rows={3}
                className="w-full border border-[#f0ebe3] rounded-xl px-3 py-2.5 text-sm mt-1"
              />
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">Services</p>
              <div className="flex flex-wrap gap-2">
                {SERVICES.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggle(services, setServices, s)}
                    className={`px-3 py-1.5 rounded-full text-xs ${services.includes(s) ? 'bg-[#5c7d4e] text-white' : 'border border-[#f0ebe3]'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">Certifications</p>
              <div className="flex flex-wrap gap-2">
                {CERTS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggle(certs, setCerts, c)}
                    className={`px-3 py-1.5 rounded-full text-xs ${certs.includes(c) ? 'bg-[#5c7d4e] text-white' : 'border border-[#f0ebe3]'}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={profile.available_now || false}
                onChange={e => setProfile({ ...profile, available_now: e.target.checked })}
              />
              Available Now
            </label>
          </>
        )}

        <button
          onClick={save}
          disabled={saving}
          className="w-full bg-[#5c7d4e] text-white py-3 rounded-xl text-sm font-medium disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </div>
    </div>
  )
}