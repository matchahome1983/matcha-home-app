'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AddToCircleButton({ proId }: { proId: string }) {
  const [inCircle, setInCircle] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function check() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('circles')
        .select('id')
        .eq('client_id', user.id)
        .eq('pro_id', proId)
        .single()
      setInCircle(!!data)
    }
    check()
  }, [proId])

  async function handleToggle() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (inCircle) {
      await supabase.from('circles').delete().eq('client_id', user.id).eq('pro_id', proId)
      setInCircle(false)
    } else {
      await supabase.from('circles').insert({ client_id: user.id, pro_id: proId })
      setInCircle(true)
    }
    setLoading(false)
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className="text-sm border border-[#f0ebe3] text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-50 font-medium disabled:opacity-50"
    >
      {inCircle ? 'In Your Circle' : 'Add to Circle'}
    </button>
  )
}