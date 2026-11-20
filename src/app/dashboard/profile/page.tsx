'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const bundleOptions = ['After-School Reset', 'Date Night Plus', 'Sunday Reset', 'Party Helper']

export default function ProfilePage() {
  const [fullName, setFullName] = useState('')
  const [bio, setBio] = useState('')
  const [hourlyRate, setHourlyRate] = useState('')
  const [city, setCity] = useState('')
  const [phone, setPhone] = useState('')
  const [isStudent, setIsStudent] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState('')
  const [services, setServices] = useState<any[]>([])
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [certs, setCerts] = useState<any[]>([])
  const [selectedCerts, setSelectedCerts] = useState<string[]>([])
  const [bundles, setBundles] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile) {
        setFullName(profile.full_name || '')
        setBio(profile.bio || '')
        setHourlyRate(profile.hourly_rate?.toString() || '')
        setCity(profile.city || '')
        setPhone(profile.phone || '')
        setIsStudent(profile.is_student || false)
        setAvatarUrl(profile.avatar_url || '')
      }

      const { data: allServices } = await supabase.from('services').select('*').order('name')
      setServices(allServices || [])

      const { data: proServices } = await supabase
        .from('pro_services')
        .select('service_id')
        .eq('pro_id', user.id)
      setSelectedServices(proServices?.map(s => s.service_id) || [])

      const { data: allCerts } = await supabase.from('certifications').select('*').order('name')
      setCerts(allCerts || [])

      const { data: proCerts } = await supabase
        .from('pro_certifications')
        .select('certification_id')
        .eq('pro_id', user.id)
      setSelectedCerts(proCerts?.map(c => c.certification_id) || [])

      const { data: proBundles } = await supabase
        .from('pro_bundles')
        .select('bundle_name')
        .eq('pro_id', user.id)
      setBundles(proBundles?.map(b => b.bundle_name) || [])
    }
    load()
  }, [])

  function toggleService(id: string) {
    setSelectedServices(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  function toggleCert(id: string) {
    setSelectedCerts(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  function toggleBundle(name: string) {
    setBundles(prev =>
      prev.includes(name) ? prev.filter(x => x !== name) : [...prev, name]
    )
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        bio,
        hourly_rate: hourlyRate ? parseFloat(hourlyRate) : null,
        city,
        phone,
        is_student: isStudent,
      })
      .eq('id', user.id)

    await supabase.from('pro_services').delete().eq('pro_id', user.id)
    if (selectedServices.length > 0) {
      await supabase.from('pro_services').insert(
        selectedServices.map(id => ({ pro_id: user.id, service_id: id }))
      )
    }

    await supabase.from('pro_certifications').delete().eq('pro_id', user.id)
    if (selectedCerts.length > 0) {
      await supabase.from('pro_certifications').insert(
        selectedCerts.map(id => ({ pro_id: user.id, certification_id: id }))
      )
    }

    await supabase.from('pro_bundles').delete().eq('pro_id', user.id)
    if (bundles.length > 0) {
      await supabase.from('pro_bundles').insert(
        bundles.map(name => ({ pro_id: user.id, bundle_name: name }))
      )
    }

    setMessage('Profile saved')
    router.refresh()
    setLoading(false)
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    setMessage('Uploading photo...')
    const path = `${user.id}/avatar.jpg`
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true })

    if (uploadError) {
      setMessage('Error uploading photo')
      return
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    await supabase.from('profiles').update({ avatar_url: data.publicUrl }).eq('id', user.id)
    setAvatarUrl(data.publicUrl)
    setMessage('Photo updated')
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold text-[#2c2c2c] mb-6">Edit Profile</h1>

      <form onSubmit={handleSave} className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0ebe3] space-y-5">
        <div>
          <label className="text-sm font-medium text-[#2c2c2c] block mb-2">Profile photo</label>
          {avatarUrl && (
            <img src={avatarUrl} alt="Profile" className="w-20 h-20 rounded-full object-cover mb-3" />
          )}
          <label className="inline-block bg-[#5c7d4e] text-white px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer hover:bg-[#4a6b3e]">
            Upload photo
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </label>
        </div>

        <div>
          <label className="text-sm font-medium text-[#2c2c2c] block mb-1">Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full border border-[#f0ebe3] rounded-xl px-4 py-2.5 text-sm"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-[#2c2c2c] block mb-1">City</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full border border-[#f0ebe3] rounded-xl px-4 py-2.5 text-sm"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-[#2c2c2c] block mb-1">Phone</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border border-[#f0ebe3] rounded-xl px-4 py-2.5 text-sm"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-[#2c2c2c] block mb-1">Hourly rate</label>
          <input
            type="number"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(e.target.value)}
            className="w-full border border-[#f0ebe3] rounded-xl px-4 py-2.5 text-sm"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-[#2c2c2c] block mb-1">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="w-full border border-[#f0ebe3] rounded-xl px-4 py-2.5 text-sm"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-[#2c2c2c] block mb-2">Services I can help with</label>
          <div className="flex flex-wrap gap-2">
            {services.map(s => (
              <button
                key={s.id}
                type="button"
                onClick={() => toggleService(s.id)}
                className={`px-3 py-1.5 rounded-full text-sm ${
                  selectedServices.includes(s.id)
                    ? 'bg-[#5c7d4e] text-white'
                    : 'border border-[#f0ebe3]'
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-[#2c2c2c] block mb-2">Certifications</label>
          <div className="flex flex-wrap gap-2">
            {certs.map(c => (
              <button
                key={c.id}
                type="button"
                onClick={() => toggleCert(c.id)}
                className={`px-3 py-1.5 rounded-full text-sm ${
                  selectedCerts.includes(c.id)
                    ? 'bg-[#5c7d4e] text-white'
                    : 'border border-[#f0ebe3]'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-[#2c2c2c] block mb-2">Bundles I offer</label>
          <div className="flex flex-wrap gap-2">
            {bundleOptions.map(name => (
              <button
                key={name}
                type="button"
                onClick={() => toggleBundle(name)}
                className={`px-3 py-1.5 rounded-full text-sm ${
                  bundles.includes(name)
                    ? 'bg-[#5c7d4e] text-white'
                    : 'border border-[#f0ebe3]'
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isStudent}
            onChange={(e) => setIsStudent(e.target.checked)}
          />
          I’m a student
        </label>

        <button
          type="submit"
          disabled={loading}
          className="bg-[#5c7d4e] text-white px-5 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Profile'}
        </button>

        {message && (
          <p className="text-sm text-gray-600">{message}</p>
        )}
      </form>
    </div>
  )
}