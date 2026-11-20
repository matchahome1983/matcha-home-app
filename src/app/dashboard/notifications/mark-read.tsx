'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function MarkRead({ userId }: { userId: string }) {
  const supabase = createClient()

  useEffect(() => {
    if (!userId) return
    supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .is('read_at', null)
      .then()
  }, [userId])

  return null
}