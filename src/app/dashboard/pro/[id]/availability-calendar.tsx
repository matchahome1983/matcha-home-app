'use client'

const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const shortDays: Record<string, string> = {
  Monday: 'Mon',
  Tuesday: 'Tue',
  Wednesday: 'Wed',
  Thursday: 'Thu',
  Friday: 'Fri',
  Saturday: 'Sat',
  Sunday: 'Sun',
}

export default function AvailabilityCalendar({ availability }: { availability: any[] }) {
  const grouped: Record<string, any[]> = {}
  dayOrder.forEach(d => { grouped[d] = [] })
  availability.forEach(slot => {
    if (grouped[slot.day_of_week]) {
      grouped[slot.day_of_week].push(slot)
    }
  })

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#f0ebe3]">
      <h2 className="font-semibold text-[#2c2c2c] mb-4">Availability</h2>
      <div className="space-y-3">
        {dayOrder.map(day => {
          const slots = grouped[day]
          return (
            <div key={day} className="flex items-start gap-3">
              <div className="w-10 text-sm font-medium text-gray-500 pt-1.5">
                {shortDays[day]}
              </div>
              <div className="flex-1 flex flex-wrap gap-2">
                {slots.length > 0 ? (
                  slots.map((slot, i) => (
                    <span
                      key={i}
                      className="bg-[#f0f7ed] text-[#5c7d4e] text-sm px-3 py-1.5 rounded-lg"
                    >
                      {slot.start_time?.slice(0, 5)} – {slot.end_time?.slice(0, 5)}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-gray-400 py-1.5">Unavailable</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}