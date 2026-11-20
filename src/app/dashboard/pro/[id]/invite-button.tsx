'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function InviteButton({ proId, proName }: { proId: string; proName: string }) {
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function handleInvite() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()

    const inviteUrl = `${window.location.origin}/dashboard/pro/${proId}?invited_by=${user.id}&inviter=${encodeURIComponent(profile?.full_name || 'A neighbor')}`

    try {
      await navigator.clipboard.writeText(inviteUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      const textArea = document.createElement('textarea')
      textArea.value = inviteUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
    setLoading(false)
  }

  return (
    <button
      onClick={handleInvite}
      disabled={loading}
      className="text-sm border border-[#f0ebe3] text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-50 font-medium disabled:opacity-50"
    >
      {copied ? 'Invite link copied!' : 'Invite to this Pro'}
    </button>
  )
}