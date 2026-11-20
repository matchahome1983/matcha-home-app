import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import AddToCircleButton from './add-to-circle-button'
import BookingRequestForm from './booking-request-form'
import AvailabilityCalendar from './availability-calendar'
import ShareButton from './share-button'

export default async function ProProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: pro } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .eq('role', 'pro')
    .single()

  if (!pro) notFound()

  const { data: services } = await supabase
    .from('pro_services')
    .select('services(name)')
    .eq('pro_id', pro.id)

  const { data: certs } = await supabase
    .from('pro_certifications')
    .select('certifications(name)')
    .eq('pro_id', pro.id)

  const { data: availability } = await supabase
    .from('availability')
    .select('*')
    .eq('pro_id', pro.id)

  const { data: reviews } = await supabase.rpc('get_pro_reviews', { pro: pro.id })
  const { data: avgRating } = await supabase.rpc('get_average_rating', { pro_id: pro.id })

  return (
    <div className="max-w-3xl">
      <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
        {pro.avatar_url && (
          <img src={pro.avatar_url} alt={pro.full_name} className="w-20 h-20 rounded-full object-cover mb-4" />
        )}

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-semibold text-[#5c7d4e]">{pro.full_name}</h1>
            <p className="text-gray-600 mt-1">{pro.city}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {avgRating > 0 && (
                <span className="text-sm font-medium">{avgRating}/5</span>
              )}
              {pro.available_now && (
                <span className="bg-green-100 text-green-800 text-xs px-2.5 py-0.5 rounded-full">Available Now</span>
              )}
              {pro.is_student && (
                <span className="bg-blue-50 text-blue-800 text-xs px-2.5 py-0.5 rounded-full">Student</span>
              )}
              {pro.id_verified && (
                <span className="bg-blue-50 text-blue-800 text-xs px-2.5 py-0.5 rounded-full">ID Verified</span>
              )}
              {pro.livescan_verified && (
                <span className="bg-green-50 text-green-800 text-xs px-2.5 py-0.5 rounded-full">LiveScan</span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <ShareButton />
            <AddToCircleButton proId={pro.id} />
          </div>
        </div>

        {pro.hourly_rate && (
          <p className="text-lg font-medium mt-4">${pro.hourly_rate}/hr</p>
        )}

        {pro.bio && (
          <p className="text-gray-700 mt-4">{pro.bio}</p>
        )}
      </div>

      {services && services.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <h2 className="font-semibold mb-3">Services</h2>
          <div className="flex flex-wrap gap-2">
            {services.map((s: any) => (
              <span key={s.services.name} className="bg-[#f0f7ed] text-[#5c7d4e] px-3 py-1 rounded-full text-sm">
                {s.services.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {certs && certs.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <h2 className="font-semibold mb-3">Certifications</h2>
          <div className="flex flex-wrap gap-2">
            {certs.map((c: any) => (
              <span key={c.certifications.name} className="bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-sm">
                {c.certifications.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {availability && availability.length > 0 && (
        <AvailabilityCalendar availability={availability} />
      )}

      <BookingRequestForm proId={pro.id} />

      {reviews && reviews.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm mt-6">
          <h2 className="font-semibold mb-4">Reviews</h2>
          {reviews.map((r: any, i: number) => (
            <div key={i} className="border-b last:border-0 py-3">
              <p className="font-medium">{r.rating}/5 — {r.reviewer_name}</p>
              {r.comment && <p className="text-sm text-gray-600 mt-1">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
3. Dashboard layout (with unread count)
Replace src/app/dashboard/layout.tsx with this:

tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import LogoutButton from './logout-button'
import Image from 'next/image'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  const isPro = profile?.role === 'pro'

  const { count } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('receiver_id', user.id)
    .is('read_at', null)

  return (
    <div className="min-h-screen bg-[#fbf8f3] flex flex-col">
      <header className="bg-white border-b border-[#e8e0d5]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            <Image 
              src="/logo.png" 
              alt="Matcha Home" 
              width={160} 
              height={40} 
              className="h-10 w-auto"
              priority
            />
          </Link>

          <nav className="flex items-center gap-6 text-sm">
            {isPro ? (
              <>
                <Link href="/dashboard" className="hover:text-[#5c7d4e]">Dashboard</Link>
                <Link href="/dashboard/requests" className="hover:text-[#5c7d4e]">Requests</Link>
                <Link href="/dashboard/availability" className="hover:text-[#5c7d4e]">Availability</Link>
                <Link href="/dashboard/messages" className="hover:text-[#5c7d4e] relative">
                  Messages
                  {count > 0 && (
                    <span className="absolute -top-1 -right-3 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {count}
                    </span>
                  )}
                </Link>
                <Link href="/dashboard/profile" className="hover:text-[#5c7d4e]">Profile</Link>
                <Link href="/dashboard/referrals" className="hover:text-[#5c7d4e]">Referrals</Link>
                <Link href="/dashboard/settings" className="hover:text-[#5c7d4e]">Settings</Link>
              </>
            ) : (
              <>
                <Link href="/dashboard" className="hover:text-[#5c7d4e]">Dashboard</Link>
                <Link href="/dashboard/search" className="hover:text-[#5c7d4e]">Find Pros</Link>
                <Link href="/dashboard/circle" className="hover:text-[#5c7d4e]">Your Circle</Link>
                <Link href="/dashboard/bookings" className="hover:text-[#5c7d4e]">My Bookings</Link>
                <Link href="/dashboard/messages" className="hover:text-[#5c7d4e] relative">
                  Messages
                  {count > 0 && (
                    <span className="absolute -top-1 -right-3 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {count}
                    </span>
                  )}
                </Link>
                <Link href="/dashboard/referrals" className="hover:text-[#5c7d4e]">Referrals</Link>
                <Link href="/dashboard/settings" className="hover:text-[#5c7d4e]">Settings</Link>
              </>
            )}
            <LogoutButton />
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto px-6 py-8 w-full">
        {children}
      </main>

      <footer className="border-t border-[#e8e0d5] py-6 text-center text-xs text-gray-500">
        <p>Matcha Home connects clients with independent Pros. No employment relationship is created.</p>
        <p className="mt-1">© {new Date().getFullYear()} Matcha Home</p>
      </footer>
    </div>
  )
}
4. Conversation component (marks as read)
Replace src/app/dashboard/messages/[id]/conversation.tsx with this:

tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import MessageForm from './message-form'

export default function Conversation({
  initialMessages,
  otherId,
  otherName,
  currentUserId,
}: {
  initialMessages: any[]
  otherId: string
  otherName: string
  currentUserId: string
}) {
  const [messages, setMessages] = useState(initialMessages)
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    async function markRead() {
      await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('receiver_id', currentUserId)
        .eq('sender_id', otherId)
        .is('read_at', null)
    }
    markRead()

    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${currentUserId}`,
        },
        (payload) => {
          if (payload.new.sender_id === otherId) {
            setMessages((prev) => [...prev, payload.new])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [otherId, currentUserId])

  function addMessage(msg: any) {
    setMessages((prev) => [...prev, msg])
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold text-[#2c2c2c] mb-4">{otherName}</h1>
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#f0ebe3] min-h-[300px] max-h-[60vh] overflow-y-auto">
        {messages.length > 0 ? (
          messages.map((m: any) => (
            <div key={m.id} className={`mb-3 ${m.sender_id === currentUserId ? 'text-right' : 'text-left'}`}>
              <span className={`inline-block px-3 py-2 rounded-xl text-sm ${
                m.sender_id === currentUserId ? 'bg-[#5c7d4e] text-white' : 'bg-gray-100'
              }`}>
                {m.content}
              </span>
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-sm">No messages yet. Start the conversation.</p>
        )}
        <div ref={bottomRef} />
      </div>
      <MessageForm receiverId={otherId} onSent={addMessage} />
    </div>
  )
}
Directions
Run the SQL to add the read_at column
Replace the three files above
Commit and push
Verified badges will show on Pro profiles, unread messages will show a red count in the nav, and opening a conversation will mark those messages as read.

17:20:23.824 Running build in Washington, D.C., USA (East) – iad1
17:20:23.826 Build machine configuration: 2 cores, 8 GB
17:20:23.959 Cloning github.com/matchahome1983/matcha-home-app (Branch: main, Commit: 4a6acb5)
17:20:24.454 Cloning completed: 495.000ms
17:20:25.096 Restored build cache from previous deployment (9crmGQLT9nAAVmBDf3WCjjbrxqX7)
17:20:25.667 Running "vercel build"
17:20:25.681 Vercel CLI 66.2.0
17:20:26.045 Installing dependencies...
17:20:26.713 npm warn Unknown env config "cache-dir". This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.
17:20:27.374 
17:20:27.374 up to date in 1s
17:20:27.375 
17:20:27.375 151 packages are looking for funding
17:20:27.375   run `npm fund` for details
17:20:27.421 Detected Next.js version: 16.4.6
17:20:27.445 Running "npm run build"
17:20:27.597 npm warn Unknown env config "cache-dir". This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.
17:20:27.631 
17:20:27.631 > matcha-home-app@0.1.0 build
17:20:27.633 > next build
17:20:27.633 
17:20:28.475 ▲ Next.js 16.4.6 (Turbopack)
17:20:28.773   Applying modifyConfig from Vercel
17:20:28.782 ✓ Running next.config.ts took 306ms
17:20:28.810 
17:20:28.814 ⚠ The "middleware" file convention is deprecated. Please use "proxy" instead.
17:20:28.814 
17:20:28.814   To migrate automatically, run:
17:20:28.814   npx @next/codemod@canary middleware-to-proxy .
17:20:28.814 
17:20:28.814   Learn more: https://nextjs.org/docs/messages/middleware-to-proxy
17:20:28.856   Creating an optimized production build ...
17:20:32.042 ✓ Compiled successfully in 3.2s
17:20:32.049   Running TypeScript ...
17:20:35.570 src/app/dashboard/messages/page.tsx(2,26): error TS2304: Cannot find name 'createClient'.
17:20:35.571 src/app/dashboard/messages/page.tsx(4,14): error TS2304: Cannot find name 'redirect'.
17:20:35.572 src/app/dashboard/messages/page.tsx(37,14): error TS2304: Cannot find name 'Link'.
17:20:35.573 src/app/dashboard/messages/page.tsx(43,15): error TS2304: Cannot find name 'Link'.
17:20:35.599 Failed to type check.
17:20:35.599 
17:20:35.683 Error: [BUILD_UTILS_SPAWN_1] Command "npm run build" exited with 1
The messages list page is missing imports. Here’s the corrected full file.

Replace src/app/dashboard/messages/page.tsx with this:

tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function MessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: messages } = await supabase
    .from('messages')
    .select(`
      id,
      content,
      created_at,
      sender_id,
      receiver_id,
      sender:profiles!messages_sender_id_fkey(full_name),
      receiver:profiles!messages_receiver_id_fkey(full_name)
    `)
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order('created_at', { ascending: false })

  const conversations: Record<string, any> = {}
  messages?.forEach((m: any) => {
    const otherId = m.sender_id === user.id ? m.receiver_id : m.sender_id
    const otherName = m.sender_id === user.id ? m.receiver?.full_name : m.sender?.full_name
    if (!conversations[otherId]) {
      conversations[otherId] = { id: otherId, name: otherName, lastMessage: m.content, lastAt: m.created_at }
    }
  })

  const list = Object.values(conversations)

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold text-[#2c2c2c] mb-6">Messages</h1>
      {list.length > 0 ? (
        <div className="space-y-2">
          {list.map((c: any) => (
            <Link key={c.id} href={`/dashboard/messages/${c.id}`} className="block bg-white rounded-xl p-4 shadow-sm border border-[#f0ebe3] hover:shadow-md">
              <div className="flex justify-between">
                <span className="font-medium">{c.name || 'Unknown'}</span>
                <span className="text-xs text-gray-400">{new Date(c.lastAt).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1 truncate">{c.lastMessage}</p>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No messages yet.</p>
      )}
    </div>
  )
}

