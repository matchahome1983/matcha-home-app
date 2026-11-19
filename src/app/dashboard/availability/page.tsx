import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AvailabilityEditor from './availability-editor'

export default async function AvailabilityPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'pro') redirect('/dashboard')

  const { data: availability } = await supabase
    .from('availability')
    .select('*')
    .eq('pro_id', user.id)

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#2c2c2c]">Availability</h1>
        <p className="text-gray-500 mt-1">Set the hours you’re available each week</p>
      </div>

      <AvailabilityEditor existing={availability || []} proId={user.id} />
    </div>
  )
}