import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role, reliability_score, available_now')
    .eq('id', user.id)
    .single()

  const isPro = profile?.role === 'pro'

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold text-[#2c2c2c] mb-2">Welcome, {profile?.full_name}</h1>
      <p className="text-gray-500 mb-6">{isPro ? 'Pro dashboard' : 'Client dashboard'}</p>

      {isPro && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0ebe3] mb-6">
          <p className="text-sm text-gray-500">Your reliability score</p>
          <p className="text-3xl font-semibold text-[#5c7d4e] mt-1">{profile?.reliability_score ?? '—'}%</p>
          <p className="text-xs text-gray-400 mt-1">Based on completed vs cancelled bookings</p>
          {profile?.available_now && (
            <p className="text-sm text-green-700 mt-2">You are marked Available Now</p>
          )}
          <div className="flex gap-4 mt-4">
            <Link href="/dashboard/earnings" className="text-sm text-[#5c7d4e] hover:underline">View earnings</Link>
            <Link href="/dashboard/availability" className="text-sm text-[#5c7d4e] hover:underline">Update availability</Link>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Link href={isPro ? '/dashboard/requests' : '/dashboard/search'} className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0ebe3] hover:shadow-md">
          <p className="font-medium">{isPro ? 'View requests' : 'Find Pros'}</p>
          <p className="text-sm text-gray-500 mt-1">{isPro ? 'Accept or decline new bookings' : 'Search for available help'}</p>
        </Link>
        <Link href="/dashboard/bookings" className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0ebe3] hover:shadow-md">
          <p className="font-medium">My bookings</p>
          <p className="text-sm text-gray-500 mt-1">See upcoming and past jobs</p>
        </Link>
        {isPro ? (
          <Link href="/dashboard/jobs" className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0ebe3] hover:shadow-md">
            <p className="font-medium">Open jobs</p>
            <p className="text-sm text-gray-500 mt-1">Apply to client requests</p>
          </Link>
        ) : (
          <Link href="/dashboard/circle" className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0ebe3] hover:shadow-md">
            <p className="font-medium">Your Circle</p>
            <p className="text-sm text-gray-500 mt-1">Pros you’ve saved</p>
          </Link>
        )}
        <Link href="/dashboard/messages" className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0ebe3] hover:shadow-md">
          <p className="font-medium">Messages</p>
          <p className="text-sm text-gray-500 mt-1">Chat with Pros or clients</p>
        </Link>
      </div>
    </div>
  )
}