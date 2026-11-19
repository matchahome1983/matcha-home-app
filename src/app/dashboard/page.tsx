import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  const isPro = profile?.role === 'pro'

  const { count: pendingCount } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq(isPro ? 'pro_id' : 'client_id', user.id)
    .eq('status', 'pending')

  const { count: upcomingCount } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq(isPro ? 'pro_id' : 'client_id', user.id)
    .eq('status', 'confirmed')

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#2c2c2c]">
          Welcome{profile?.full_name ? `, ${profile.full_name}` : ''}
        </h1>
        <p className="text-[#6b6b6b] mt-1">
          {isPro ? 'Here’s what’s happening with your requests' : 'Here’s what’s happening with your bookings'}
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Link href={isPro ? '/dashboard/requests' : '/dashboard/bookings'} className="block">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0ebe3] hover:shadow-md transition-shadow">
            <p className="text-sm text-[#6b6b6b]">Pending</p>
            <p className="text-3xl font-semibold text-[#2c2c2c] mt-1">{pendingCount || 0}</p>
            <p className="text-sm text-[#5c7d4e] mt-2 font-medium">
              {isPro ? 'View requests →' : 'View bookings →'}
            </p>
          </div>
        </Link>

        <Link href="/dashboard/bookings" className="block">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0ebe3] hover:shadow-md transition-shadow">
            <p className="text-sm text-[#6b6b6b]">Upcoming</p>
            <p className="text-3xl font-semibold text-[#2c2c2c] mt-1">{upcomingCount || 0}</p>
            <p className="text-sm text-[#5c7d4e] mt-2 font-medium">View schedule →</p>
          </div>
        </Link>
      </div>

      {!isPro && (
        <div className="mt-8">
          <Link
            href="/dashboard/search"
            className="inline-block bg-[#5c7d4e] hover:bg-[#4a6b3e] text-white px-6 py-3 rounded-xl text-sm font-medium transition-colors"
          >
            Find a Pro
          </Link>
        </div>
      )}
    </div>
  )
}