'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

import ThemeToggle from './theme-toggle'

// Inside the return, after the heading:
<ThemeToggle />


export default function SettingsPage() {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  async function deactivate() {
    if (!confirm('Deactivate your account? Your profile will be hidden. You can contact support to reactivate later.')) return
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('profiles').update({ deactivated: true }).eq('id', user.id)
      await supabase.auth.signOut()
      router.push('/')
    }
    setLoading(false)
  }

  async function deleteAccount() {
    if (!confirm('This will permanently delete your account and data. This cannot be undone.')) return
    const confirmText = prompt('Type DELETE to confirm permanent deletion')
    if (confirmText !== 'DELETE') return

    setLoading(true)
    const { error } = await supabase.functions.invoke('delete-account')
    
    if (error) {
      alert('Error: ' + error.message)
    } else {
      await supabase.auth.signOut()
      router.push('/')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold mb-2">Account settings</h1>
      <p className="text-gray-600 mb-8">Manage your account preferences.</p>

      <div className="space-y-6">
        <div className="border border-gray-200 rounded-xl p-6">
          <h2 className="font-medium mb-1">Deactivate account</h2>
          <p className="text-sm text-gray-600 mb-4">
            Your profile will be hidden from other users. You can contact support later if you want to reactivate.
          </p>
          <button
            onClick={deactivate}
            disabled={loading}
            className="bg-gray-200 hover:bg-gray-300 px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
          >
            Deactivate account
          </button>
        </div>

        <div className="border border-red-200 rounded-xl p-6 bg-red-50/40">
          <h2 className="font-medium text-red-700 mb-1">Delete account</h2>
          <p className="text-sm text-gray-600 mb-4">
            Permanently delete your account and associated data. This action cannot be undone.
          </p>
          <button
            onClick={deleteAccount}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
          >
            Delete account permanently
          </button>
        </div>
      </div>
    </div>
  )
}