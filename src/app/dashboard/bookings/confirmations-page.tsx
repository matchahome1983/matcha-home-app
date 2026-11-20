import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function BookingConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ booking?: string }>
}) {
  const { booking } = await searchParams
  if (!booking) redirect('/dashboard/bookings')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: b } = await supabase
    .from('bookings')
    .select(`
      *,
      pro:profiles!bookings_pro_id_fkey(full_name, hourly_rate)
    `)
    .eq('id', booking)
    .single()

  if (!b) redirect('/dashboard/bookings')

  const start = new Date(b.start_time)
  const end = new Date(b.end_time)
  const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
  const rate = b.pro?.hourly_rate || 0
  const subtotal = hours * rate
  const fee = subtotal * 0.12
  const total = subtotal + fee

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0ebe3]">
        <h1 className="text-2xl font-semibold text-[#2c2c2c] mb-2">Booking requested</h1>
        <p className="text-gray-600 text-sm mb-6">
          Your request has been sent to {b.pro?.full_name}.
        </p>

        <div className="space-y-3 text-sm border-t border-[#f0ebe3] pt-4">
          <div className="flex justify-between">
            <span className="text-gray-600">Date & time</span>
            <span>{start.toLocaleString()} – {end.toLocaleTimeString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Duration</span>
            <span>{hours} hours</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Rate</span>
            <span>${rate}/hr</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Matcha Home fee (12%)</span>
            <span>${fee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-medium text-base border-t border-[#f0ebe3] pt-3">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          You pay the Pro directly. The 12% service fee is collected by Matcha Home after the booking is completed.
        </p>

        <Link
          href="/dashboard/bookings"
          className="block mt-6 text-center bg-[#5c7d4e] text-white py-2.5 rounded-xl text-sm font-medium"
        >
          View my bookings
        </Link>
      </div>
    </div>
  )
}