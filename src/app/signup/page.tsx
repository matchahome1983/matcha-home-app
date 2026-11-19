'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('client')
  const [referralCode, setReferralCode] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const supabase = createClient()
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        setMessage(error.message)
      } else if (data.user) {
        await supabase
          .from('profiles')
          .update({ role })
          .eq('id', data.user.id)

        if (referralCode.trim()) {
          const { data: referrer } = await supabase
            .from('profiles')
            .select('id')
            .eq('referral_code', referralCode.trim().toUpperCase())
            .single()

          if (referrer) {
            await supabase
              .from('profiles')
              .update({ referred_by: referrer.id })
              .eq('id', data.user.id)
          }
        }

        if (role === 'pro') {
          router.push('/onboarding')
        } else {
          router.push('/onboarding/client')
        }
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setMessage(error.message)
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#fbf8f3] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#f0ebe3] w-full max-w-md">
        <h1 className="text-2xl font-semibold text-[#2c2c2c] mb-6 text-center">
          {isSignUp ? 'Create account' : 'Welcome back'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-[#f0ebe3] rounded-xl px-4 py-3 text-sm"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border border-[#f0ebe3] rounded-xl px-4 py-3 text-sm"
          />

          {isSignUp && (
            <>
              <div>
                <p className="text-sm font-medium text-[#2c2c2c] mb-2">I want to</p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('client')}
                    className={`flex-1 py-3 rounded-xl text-sm font-medium ${
                      role === 'client'
                        ? 'bg-[#5c7d4e] text-white'
                        : 'border border-[#f0ebe3] text-gray-600'
                    }`}
                  >
                    Find help
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('pro')}
                    className={`flex-1 py-3 rounded-xl text-sm font-medium ${
                      role === 'pro'
                        ? 'bg-[#5c7d4e] text-white'
                        : 'border border-[#f0ebe3] text-gray-600'
                    }`}
                  >
                    Offer help
                  </button>
                </div>
              </div>

              <input
                type="text"
                placeholder="Referral code (optional)"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                className="w-full border border-[#f0ebe3] rounded-xl px-4 py-3 text-sm"
              />
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#5c7d4e] text-white py-3 rounded-xl text-sm font-medium disabled:opacity-50"
          >
            {loading ? 'Please wait...' : isSignUp ? 'Sign up' : 'Log in'}
          </button>
        </form>

        {message && (
          <p className="text-sm text-center mt-4 text-gray-600">{message}</p>
        )}

        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="w-full text-sm text-[#5c7d4e] mt-4 hover:underline"
        >
          {isSignUp ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
        </button>
      </div>
    </div>
  )
}