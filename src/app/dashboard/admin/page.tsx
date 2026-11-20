import { requireAdmin } from '@/lib/admin'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminPage() {
  await requireAdmin()
  const supabase = await createClient()

  const { data: users } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, city')
    .order('full_name')

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-6">Admin – Users</h1>
      <div className="space-y-2">
        {users?.map((u) => (
          <Link
            key={u.id}
            href={`/dashboard/admin/user/${u.id}`}
            className="block bg-white border border-gray-200 rounded-xl p-4 hover:bg-gray-50"
          >
            <div className="font-medium">{u.full_name || 'No name'}</div>
            <div className="text-sm text-gray-500">
              {u.email} · {u.role} · {u.city || 'No city'}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}