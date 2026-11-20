import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ApplyButton from './apply-button'

export default async function JobsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isPro = profile?.role === 'pro'

  const { data: jobs } = await supabase
    .from('job_posts')
    .select('*, client:profiles!job_posts_client_id_fkey(full_name)')
    .eq('status', 'open')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-[#2c2c2c]">Open Jobs</h1>
        <div className="flex gap-2">
          {!isPro && (
            <>
              <Link href="/dashboard/jobs/new" className="text-sm bg-[#5c7d4e] text-white px-4 py-2.5 rounded-xl font-medium">
                Post a job
              </Link>
              <Link href="/dashboard/jobs/applications" className="text-sm border border-[#f0ebe3] text-gray-700 px-4 py-2.5 rounded-xl font-medium hover:bg-gray-50">
                View applications
              </Link>
            </>
          )}
        </div>
      </div>

      {jobs && jobs.length > 0 ? (
        <div className="space-y-3">
          {jobs.map((job: any) => (
            <div key={job.id} className="bg-white rounded-xl p-5 shadow-sm border border-[#f0ebe3]">
              <p className="font-medium text-[#2c2c2c]">{job.title}</p>
              <p className="text-sm text-gray-600 mt-1">{job.description}</p>
              <p className="text-sm text-gray-500 mt-2">
                {job.preferred_date} at {job.preferred_time} · {job.duration_hours} hrs
              </p>
              <p className="text-xs text-gray-400 mt-1">Posted by {job.client?.full_name}</p>
              {isPro && (
                <div className="mt-3 flex gap-2">
                  <ApplyButton jobId={job.id} />
                  <Link
                    href={`/dashboard/messages/${job.client_id}`}
                    className="text-sm border border-[#f0ebe3] text-gray-700 px-4 py-2 rounded-xl font-medium hover:bg-gray-50"
                  >
                    Message
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No open jobs right now.</p>
      )}
    </div>
  )
}