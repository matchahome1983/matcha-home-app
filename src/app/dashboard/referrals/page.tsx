'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ReferralsPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [referrals, setReferrals] = useState<any[]>([])
  const supabase = createClient()

  async function loadReferrals() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('referrals')
      .select('*')
      .eq('referrer_id', user.id)
      .order('created_at', { ascending: false })
    setReferrals(data || [])
  }

  useEffect(() => {
    loadReferrals()
  }, [])

  async function handleRefer(e: React.FormEvent) {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('referrals').insert({
      referrer_id: user.id,
      referred_email: email.trim().toLowerCase()
    })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Referral sent!')
      setEmail('')
      loadReferrals()
    }
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-3xl font-semibold text-[#5c7d4e] mb-2">Referrals</h1>
      <p className="text-gray-600 mb-6">
        Invite friends or Pros. When they join and become active, you both benefit.
      </p>

      <form onSubmit={handleRefer} className="bg-white rounded-xl p-6 shadow-sm mb-8">
        <label className="text-sm font-medium">Email to refer</label>
        <div className="flex gap-2 mt-2">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="friend@email.com"
            required
            className="flex-1 border rounded-lg px-4 py-2"
          />
          <button
            type="submit"
            className="bg-[#7a9e6a] text-white px-5 py-2 rounded-lg text-sm hover:bg-[#5c7d4e]"
          >
            Refer
          </button>
        </div>
        {message && <p className="text-sm mt-3 text-gray-700">{message}</p>}
      </form>

      <div>
        <h2 className="font-semibold mb-3">Your Referrals</h2>
        {referrals.length === 0 ? (
          <p className="text-sm text-gray-500">No referrals yet.</p>
        ) : (
          <div className="space-y-2">
            {referrals.map(r => (
              <div key={r.id} className="bg-white rounded-lg p-4 shadow-sm border border-[#e8e0d5] text-sm">
                {r.referred_email}
                <span className="text-gray-400 ml-2">· {new Date(r.created_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}