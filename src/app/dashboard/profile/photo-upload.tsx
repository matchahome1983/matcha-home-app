'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function PhotoUpload({ currentUrl, userId }: { currentUrl?: string; userId: string }) {
  const [uploading, setUploading] = useState(false)
  const [url, setUrl] = useState(currentUrl)
  const supabase = createClient()

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)

    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}-${Date.now()}.${fileExt}`
    const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file, { upsert: true })

    if (!uploadError) {
      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName)
      await supabase.from('profiles').update({ avatar_url: data.publicUrl }).eq('id', userId)
      setUrl(data.publicUrl)
    }
    setUploading(false)
  }

  return (
    <div className="flex items-center gap-4">
      <div className="w-20 h-20 rounded-full bg-[#f0f7ed] overflow-hidden flex items-center justify-center">
        {url ? <img src={url} alt="" className="w-full h-full object-cover" /> : <span className="text-2xl text-[#5c7d4e]">+</span>}
      </div>
      <label className="bg-white border border-[#f0ebe3] px-4 py-2 rounded-xl text-sm cursor-pointer hover:bg-gray-50">
        {uploading ? 'Uploading...' : 'Upload photo'}
        <input type="file" accept="image/*" onChange={upload} className="hidden" />
      </label>
    </div>
  )
}