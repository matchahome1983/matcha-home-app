'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const [fullName, setFullName] = useState('')
  const [city, setCity] = useState('')
  const [bio, setBio] = useState('')
  const [hourlyRate, setHourlyRate] = useState('')
  const [yearsExperience, setYearsExperience] = useState('')
  const [availableNow, setAvailableNow] = useState(false)
  const [isStudent, setIsStudent] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (data) {
      setFullName(data.full_name || '')
      setCity(data.city || '')
      setBio(data.bio || '')
      setHourlyRate(data.hourly_rate?.toString() || '')
      setYearsExperience(data.years_experience?.toString() || '')
      setAvailableNow(data.available_now || false)
      setIsStudent(data.is_student || false)
    }
    setLoading(false)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        city,
        bio,
        hourly_rate: hourlyRate ? parseFloat(hourlyRate) : null,
        years_experience: yearsExperience ? parseInt(yearsExperience) : null,
        available_now: availableNow,
        is_student: isStudent,
      })
      .eq('id', user.id)

    if (error) {
      setMessage('Error saving: ' + error.message)
    } else {
      setMessage('Saved')
      router.refresh()
    }
    setSaving(false)
  }

  if (loading) return <p className="text-gray-500">Loading...</p>

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold text-[#2c2c2c] mb-6">Edit Profile</h1>

      <form onSubmit={handleSave} className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0ebe3] space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
          <input
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            className="w-full border border-[#f0ebe3] rounded-xl px-3 py-2 text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
          <input
            value={city}
            onChange={e => setCity(e.target.value)}
            className="w-full border border-[#f0ebe3] rounded-xl px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            rows={3}
            className="w-full border border-[#f0ebe3] rounded-xl px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hourly rate ($)</label>
          <input
            type="number"
            step="0.01"
            value={hourlyRate}
            onChange={e => setHourlyRate(e.target.value)}
            className="w-full border border-[#f0ebe3] rounded-xl px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Years of experience</label>
          <input
            type="number"
            value={yearsExperience}
            onChange={e => setYearsExperience(e.target.value)}
            placeholder="e.g. 3"
            className="w-full border border-[#f0ebe3] rounded-xl px-3 py-2 text-sm"
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={availableNow}
            onChange={e => setAvailableNow(e.target.checked)}
          />
          Available Now
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isStudent}
            onChange={e => setIsStudent(e.target.checked)}
          />
          I’m a student
        </label>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-[#5c7d4e] text-white py-2.5 rounded-xl text-sm font-medium disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save profile'}
        </button>

        {message && <p className="text-sm text-gray-600">{message}</p>}
      </form>
    </div>
  )
}