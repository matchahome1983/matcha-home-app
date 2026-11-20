'use client'

import { useState } from 'react'

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function AvailabilityCalendar({ slots }: { slots: any[] }) {
  const [week, setWeek] = useState(0)

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#f0ebe3]">
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => setWeek(week - 1)} className="text-sm text-[#5c7d4e]">← Prev</button>
        <p className="font-medium">Week {week + 1}</p>
        <button onClick={() => setWeek(week + 1)} className="text-sm text-[#5c7d4e]">Next →</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {days.map(d => <div key={d} className="py-2 font-medium">{d}</div>)}
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-16 border border-[#f0ebe3] rounded-lg flex items-center justify-center text-gray-400">
            {slots.filter(s => s.day_of_week === days[i]).length || '—'}
          </div>
        ))}
      </div>
    </div>
  )
}