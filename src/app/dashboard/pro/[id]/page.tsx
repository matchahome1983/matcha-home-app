import { createClient } from '@/lib/supabase/server'

export default async function ProProfilePage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const { data: pro, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', params.id)
    .eq('role', 'pro')
    .single()

  return (
    <div className="p-8">
      <h1 className="text-2xl">Debug</h1>
      <pre>{JSON.stringify({ pro, error }, null, 2)}</pre>
    </div>
  )
}