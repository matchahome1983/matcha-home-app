import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function EarningsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, hourly_rate')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'pro') redirect('/dashboard')

  const { data: completed } = await supabase
    .from('bookings')
    .select('id, start_time, notes')
    .eq('pro_id', user.id)
    .eq('status', 'completed')
    .order('start_time', { ascending: false })

  const hourlyRate = profile?.hourly_rate || 0
  const totalJobs = completed?.length || 0
  const estimatedEarnings = totalJobs * hourlyRate * 2 // rough estimate assuming 2hr average

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#2c2c2c]">Earnings</h1>
        <p className="text-gray-500 mt-1">Overview of your completed work</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0ebe3]">
          <p className="text-sm text-gray-500">Completed jobs</p>
          <p className="text-3xl font-semibold text-[#2c2c2c] mt-1">{totalJobs}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0ebe3]">
          <p className="text-sm text-gray-500">Estimated earnings</p>
          <p className="text-3xl font-semibold text-[#2c2c2c] mt-1">${estimatedEarnings}</p>
          <p className="text-xs text-gray-400 mt-1">Based on your hourly rate</p>
        </div>
      </div>

      {completed && completed.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-[#f0ebe3]">
          <div className="p-5 border-b border-[#f0ebe3]">
            <h2 className="font-semibold text-[#2c2c2c]">Recent completed jobs</h2>
          </div>
          <div className="divide-y divide-[#f0ebe3]">
            {completed.slice(0, 10).map((job: any) => (
              <div key={job.id} className="p-5">
                <p className="text-sm text-gray-500">
                  {new Date(job.start_time).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
                {job.notes && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{job.notes}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#f0ebe3]">
          <p className="text-gray-500">No completed jobs yet.</p>
        </div>
      )}
    </div>
  )
}