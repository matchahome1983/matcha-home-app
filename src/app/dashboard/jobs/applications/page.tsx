import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function ApplicationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: jobs } = await supabase
    .from('job_posts')
    .select('id, title')
    .eq('client_id', user.id)

  const jobIds = jobs?.map(j => j.id) || []

  const { data: applications } = await supabase
    .from('job_applications')
    .select('*, pro:profiles!job_applications_pro_id_fkey(full_name, city, hourly_rate), job:job_posts(title)')
    .in('job_id', jobIds)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold text-[#2c2c2c] mb-6">Applications</h1>

      {applications && applications.length > 0 ? (
        <div className="space-y-3">
          {applications.map((app: any) => (
            <div key={app.id} className="bg-white rounded-xl p-5 shadow-sm border border-[#f0ebe3]">
              <p className="font-medium text-[#2c2c2c]">{app.pro?.full_name}</p>
              <p className="text-sm text-gray-500 mt-1">{app.job?.title}</p>
              <p className="text-sm text-gray-600 mt-1">{app.pro?.city} · ${app.pro?.hourly_rate}/hr</p>
              {app.message && <p className="text-sm text-gray-600 mt-2">{app.message}</p>}
              <Link
                href={`/dashboard/messages/${app.pro_id}`}
                className="inline-block mt-3 text-sm bg-[#5c7d4e] text-white px-4 py-2 rounded-xl font-medium"
              >
                Message Pro
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No applications yet.</p>
      )}
    </div>
  )
}