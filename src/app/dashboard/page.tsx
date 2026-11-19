import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const isPro = profile?.role === 'pro'
  const isNewUser = profile?.created_at && (Date.now() - new Date(profile.created_at).getTime()) < 24 * 60 * 60 * 1000

  let suggestedPros: any[] = []
  if (!isPro && profile?.preferred_timing && profile.preferred_timing.length > 0) {
    const { data: pros } = await supabase
      .from('profiles')
      .select('id, full_name, city, hourly_rate, available_now, avatar_url')
      .eq('role', 'pro')
      .limit(4)
    suggestedPros = pros || []
  }

  return (
    <div className="max-w-4xl mx-auto">
      {isNewUser && (
        <div className="bg-[#f0f7ed] border border-[#e0eed8] rounded-2xl p-5 mb-6">
          <p className="font-medium text-[#5c7d4e]">Welcome to Matcha Home</p>
          <p className="text-sm text-[#5c7d4e]/80 mt-1">
            {isPro 
              ? 'Set your availability and start receiving requests.' 
              : 'Find trusted Pros for flexible, part-time help.'}
          </p>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#2c2c2c]">
          Welcome{profile?.full_name ? `, ${profile.full_name}` : ''}
        </h1>
        <p className="text-gray-500 mt-1">
          {isPro ? 'Manage your availability and requests' : 'Find help when you need it'}
        </p>
      </div>

      {isPro ? (
        <div className="grid sm:grid-cols-2 gap-4">
          <Link href="/dashboard/requests" className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0ebe3] hover:shadow-md">
            <h2 className="font-semibold text-[#2c2c2c]">Requests</h2>
            <p className="text-sm text-gray-500 mt-1">View booking requests</p>
          </Link>
          <Link href="/dashboard/availability" className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0ebe3] hover:shadow-md">
            <h2 className="font-semibold text-[#2c2c2c]">Availability</h2>
            <p className="text-sm text-gray-500 mt-1">Set your hours</p>
          </Link>
          <Link href="/dashboard/earnings" className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0ebe3] hover:shadow-md">
            <h2 className="font-semibold text-[#2c2c2c]">Earnings</h2>
            <p className="text-sm text-gray-500 mt-1">See your completed work</p>
          </Link>
          <Link href="/dashboard/profile" className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0ebe3] hover:shadow-md">
            <h2 className="font-semibold text-[#2c2c2c]">Profile</h2>
            <p className="text-sm text-gray-500 mt-1">Edit your info</p>
          </Link>
        </div>
      ) : (
        <>
          {suggestedPros.length > 0 && (
            <div className="mb-8">
              <h2 className="font-semibold text-[#2c2c2c] mb-3">Pros available when you need help</h2>
              <p className="text-sm text-gray-500 mb-4">Based on your preferences</p>
              <div className="grid sm:grid-cols-2 gap-4">
                {suggestedPros.map((pro) => (
                  <Link key={pro.id} href={`/dashboard/pro/${pro.id}`} className="bg-white rounded-2xl p-5 shadow-sm border border-[#f0ebe3] hover:shadow-md flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#f0f7ed] flex items-center justify-center text-[#5c7d4e] font-medium flex-shrink-0 overflow-hidden">
                      {pro.avatar_url ? (
                        <img src={pro.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        pro.full_name?.[0] || 'P'
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-[#2c2c2c] truncate">{pro.full_name}</p>
                      <p className="text-sm text-gray-500">{pro.city || 'Location not set'}</p>
                      {pro.hourly_rate && <p className="text-sm font-medium">${pro.hourly_rate}/hr</p>}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <Link href="/dashboard/search" className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0ebe3] hover:shadow-md">
              <h2 className="font-semibold text-[#2c2c2c]">Find Pros</h2>
              <p className="text-sm text-gray-500 mt-1">Search for help</p>
            </Link>
            <Link href="/dashboard/circle" className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0ebe3] hover:shadow-md">
              <h2 className="font-semibold text-[#2c2c2c]">Your Circle</h2>
              <p className="text-sm text-gray-500 mt-1">Saved Pros</p>
            </Link>
            <Link href="/dashboard/bookings" className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0ebe3] hover:shadow-md">
              <h2 className="font-semibold text-[#2c2c2c]">My Bookings</h2>
              <p className="text-sm text-gray-500 mt-1">Upcoming and past</p>
            </Link>
            <Link href="/dashboard/messages" className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0ebe3] hover:shadow-md">
              <h2 className="font-semibold text-[#2c2c2c]">Messages</h2>
              <p className="text-sm text-gray-500 mt-1">Chat with Pros</p>
            </Link>
          </div>
        </>
      )}
    </div>
  )
}