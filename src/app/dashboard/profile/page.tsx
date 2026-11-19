'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const [fullName, setFullName] = useState('')
  const [bio, setBio] = useState('')
  const [hourlyRate, setHourlyRate] = useState('')
  const [city, setCity] = useState('')
  const [phone, setPhone] = useState('')
  const [isStudent, setIsStudent] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState('')
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
    }
    load()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
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

    if (error) {
      setMessage('Error saving profile')
    } else {
      setMessage('Profile saved')
      router.refresh()
    }
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

      <form onSubmit={handleSave} className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0ebe3] space-y-4">
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