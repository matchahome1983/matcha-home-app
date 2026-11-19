import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
// import AddToCircleButton from './add-to-circle-button'
// import BookingRequestForm from './booking-request-form'

export default async function ProProfilePage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const { data: pro } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', params.id)
    .eq('role', 'pro')
    .single()

  if (!pro) notFound()

  return (
    <div className="p-8">
      <h1 className="text-2xl">{pro.full_name}</h1>
      <p>ID: {params.id}</p>
    </div>
  )
}