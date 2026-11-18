'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState('client')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role }
      }
    })

    if (error) {
      setMessage(error.message)
    } else {
      // Update profile role if needed
      if (data.user) {
        await supabase.from('profiles').update({ role, full_name: fullName }).eq('id', data.user.id)
      }
      setMessage('Check your email to confirm, then log in.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fbf8f3]">
      <div className="bg-white p-8 rounded-xl shadow-sm w-full max-w-md">
        <h1 className="text-2xl font-semibold text-center mb-6 text-[#5c7d4e]">Create Account</h1>
        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="text"
            placeholder="Full name"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            className="w-full border rounded-lg px-4 py-3"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full border rounded-lg px-4 py-3"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full border rounded-lg px-4 py-3"
            required
          />
          <select
            value={role}
            onChange={e => setRole(e.target.value)}
            className="w-full border rounded-lg px-4 py-3"
          >
            <option value="client">I’m looking for help</option>
            <option value="pro">I’m a Pro offering help</option>
          </select>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#7a9e6a] text-white py-3 rounded-lg font-medium hover:bg-[#5c7d4e] disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>
        {message && <p className="mt-4 text-sm text-center text-gray-700">{message}</p>}
        <p className="mt-6 text-center text-sm">
          Already have an account? <Link href="/login" className="text-[#5c7d4e] font-medium">Log in</Link>
        </p>
      </div>
    </div>
  )
}