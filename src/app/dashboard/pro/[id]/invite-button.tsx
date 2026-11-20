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
