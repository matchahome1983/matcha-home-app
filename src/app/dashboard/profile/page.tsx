'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [fullName, setFullName] = useState('')
  const [city, setCity] = useState('')
  const [bio, setBio] = useState('')
  const [hourlyRate, setHourlyRate] = useState('')
  const [availableNow, setAvailableNow] = useState(false)
  const [isStudent, setIsStudent] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (data) {
      setProfile(data)
      setFullName(data.full_name || '')
      setCity(data.city || '')
      setBio(data.bio || '')
      setHourlyRate(data.hourly_rate?.toString() || '')
      setAvailableNow(data.available_now || false)
      setIsStudent(data.is_student || false)
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !profile) return
    setUploading(true)

    const fileExt = file.name.split('.').pop()
    const fileName = `${profile.id}.${fileExt}`
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true })

    if (uploadError) {
      setMessage('Upload failed: ' + uploadError.message)
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName)
    await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', profile.id)
    setProfile({ ...profile, avatar_url: publicUrl })
    setUploading(false)
    setMessage('Photo updated')
  }

  async function handleSave() {
    if (!profile) return
    await supabase.from('profiles').update({
      full_name: fullName,
      city,
      bio,
      hourly_rate: hourlyRate ? parseFloat(hourlyRate) : null,
      available_now: availableNow,
      is_student: isStudent,
    }).eq('id', profile.id)
    setMessage('Saved')
    router.refresh()
  }

  if (!profile) return <p>Loading...</p>

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold text-[#2c2c2c] mb-6">Your Profile</h1>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0ebe3] space-y-4">
        <div>
          {profile.avatar_url && (
            <img src={profile.avatar_url} alt="" className="w-20 h-20 rounded-full object-cover mb-3" />
          )}
          <label className="inline-block text-sm bg-[#f0f7ed] text-[#5c7d4e] px-4 py-2 rounded-xl cursor-pointer">
            {uploading ? 'Uploading...' : 'Upload photo'}
            <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
          </label>
        </div>

        <input
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          placeholder="Full name"
          className="w-full border border-[#f0ebe3] rounded-xl px-3 py-2 text-sm"
        />
        <input
          value={city}
          onChange={e => setCity(e.target.value)}
          placeholder="City"
          className="w-full border border-[#f0ebe3] rounded-xl px-3 py-2 text-sm"
        />
        <textarea
          value={bio}
          onChange={e => setBio(e.target.value)}
          placeholder="Bio"
          rows={3}
          className="w-full border border-[#f0ebe3] rounded-xl px-3 py-2 text-sm"
        />
        <input
          type="number"
          value={hourlyRate}
          onChange={e => setHourlyRate(e.target.value)}
          placeholder="Hourly rate"
          className="w-full border border-[#f0ebe3] rounded-xl px-3 py-2 text-sm"
        />

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={availableNow} onChange={e => setAvailableNow(e.target.checked)} />
          Available Now
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isStudent} onChange={e => setIsStudent(e.target.checked)} />
          I’m a student
        </label>

        <button
          onClick={handleSave}
          className="w-full bg-[#5c7d4e] text-white py-2.5 rounded-xl text-sm font-medium"
        >
          Save
        </button>
        {message && <p className="text-sm text-gray-600">{message}</p>}
      </div>
    </div>
  )
}