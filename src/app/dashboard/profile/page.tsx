'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [bio, setBio] = useState('')
  const [rate, setRate] = useState('')
  const [city, setCity] = useState('')
  const [message, setMessage] = useState('')
  const [uploading, setUploading] = useState(false)
  const [allServices, setAllServices] = useState<any[]>([])
  const [allCerts, setAllCerts] = useState<any[]>([])
  const [myServices, setMyServices] = useState<string[]>([])
  const [myCerts, setMyCerts] = useState<string[]>([])
  const supabase = createClient()

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (p) {
      setProfile(p)
      setBio(p.bio || '')
      setRate(p.hourly_rate?.toString() || '')
      setCity(p.city || '')
    }

    const { data: services } = await supabase.from('services').select('id, name')
    setAllServices(services || [])

    const { data: certs } = await supabase.from('certifications').select('id, name')
    setAllCerts(certs || [])

    const { data: ps } = await supabase.from('pro_services').select('service_id').eq('pro_id', user.id)
    setMyServices(ps?.map(x => x.service_id) || [])

    const { data: pc } = await supabase.from('pro_certifications').select('certification_id').eq('pro_id', user.id)
    setMyCerts(pc?.map(x => x.certification_id) || [])
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('profiles').update({
      bio: bio || null,
      hourly_rate: rate ? parseFloat(rate) : null,
      city: city || null,
      updated_at: new Date().toISOString()
    }).eq('id', user.id)

    setMessage(error ? error.message : 'Saved')
  }

  async function uploadPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const filePath = `${user.id}/avatar.jpg`
    const { error } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true })
    if (!error) {
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath)
      await supabase.from('profiles').update({ avatar_url: urlData.publicUrl }).eq('id', user.id)
      setMessage('Photo updated')
      load()
    }
    setUploading(false)
  }

  async function toggleService(serviceId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (myServices.includes(serviceId)) {
      await supabase.from('pro_services').delete().eq('pro_id', user.id).eq('service_id', serviceId)
      setMyServices(myServices.filter(id => id !== serviceId))
    } else {
      await supabase.from('pro_services').insert({ pro_id: user.id, service_id: serviceId })
      setMyServices([...myServices, serviceId])
    }
  }

  async function toggleCert(certId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (myCerts.includes(certId)) {
      await supabase.from('pro_certifications').delete().eq('pro_id', user.id).eq('certification_id', certId)
      setMyCerts(myCerts.filter(id => id !== certId))
    } else {
      await supabase.from('pro_certifications').insert({ pro_id: user.id, certification_id: certId })
      setMyCerts([...myCerts, certId])
    }
  }

  if (!profile) return <p>Loading...</p>

  return (
    <div className="max-w-xl">
      <h1 className="text-3xl font-semibold text-[#5c7d4e] mb-6">My Profile</h1>

      <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
        {profile.avatar_url && (
          <img src={profile.avatar_url} alt="Profile" className="w-24 h-24 rounded-full object-cover mb-4" />
        )}
        <label className="block text-sm font-medium mb-2">Profile Photo</label>
        <input type="file" accept="image/*" onChange={uploadPhoto} disabled={uploading} />
        {uploading && <p className="text-sm text-gray-500 mt-1">Uploading...</p>}
      </div>

      <form onSubmit={save} className="bg-white rounded-xl p-6 shadow-sm space-y-4 mb-6">
        <div>
          <label className="text-sm font-medium">City</label>
          <input value={city} onChange={e => setCity(e.target.value)} className="w-full border rounded-lg px-3 py-2 mt-1" />
        </div>
        <div>
          <label className="text-sm font-medium">Hourly Rate</label>
          <input type="number" step="0.01" value={rate} onChange={e => setRate(e.target.value)} className="w-full border rounded-lg px-3 py-2 mt-1" />
        </div>
        <div>
          <label className="text-sm font-medium">Bio</label>
          <textarea value={bio} onChange={e => setBio(e.target.value)} rows={4} className="w-full border rounded-lg px-3 py-2 mt-1" />
        </div>
        <button type="submit" className="bg-[#7a9e6a] text-white px-5 py-2.5 rounded-lg text-sm hover:bg-[#5c7d4e]">
          Save Changes
        </button>
        {message && <p className="text-sm text-gray-600">{message}</p>}
      </form>

      <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
        <h2 className="font-semibold mb-3">My Services</h2>
        <div className="flex flex-wrap gap-2">
          {allServices.map(s => (
            <button
              key={s.id}
              onClick={() => toggleService(s.id)}
              className={`px-3 py-1.5 rounded-full text-sm border ${myServices.includes(s.id) ? 'bg-[#7a9e6a] text-white' : 'bg-white'}`}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="font-semibold mb-3">My Certifications</h2>
        <div className="flex flex-wrap gap-2">
          {allCerts.map(c => (
            <button
              key={c.id}
              onClick={() => toggleCert(c.id)}
              className={`px-3 py-1.5 rounded-full text-sm border ${myCerts.includes(c.id) ? 'bg-blue-600 text-white' : 'bg-white'}`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
Test
Replace the file.
Log in as a Pro and go to Profile.
You should be able to toggle services and certifications on and off.
Check a Pro’s public profile to confirm they appear.
Let me know when it works.

