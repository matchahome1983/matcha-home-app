'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ApplyButton({ jobId }: { jobId: string }) {
  const [applied, setApplied] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function apply() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('job_applications').insert({
      job_id: jobId,
      pro_id: user.id,
      message: 'Interested in this job',
    })

    if (!error) setApplied(true)
    setLoading(false)
  }

  return (
    <button
      onClick={apply}
      disabled={loading || applied}
      className="text-sm bg-[#5c7d4e] text-white px-4 py-2 rounded-xl font-medium disabled:opacity-50"
    >
      {applied ? 'Applied' : loading ? 'Applying...' : 'Apply'}
    </button>
  )
}