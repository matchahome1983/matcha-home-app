export default function AvailabilityCalendar({ availability }: { availability: any[] }) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0ebe3]">
      <h2 className="font-semibold text-[#2c2c2c] mb-4">Weekly Availability</h2>
      <div className="grid grid-cols-7 gap-2 text-center text-sm">
        {days.map((day) => {
          const slots = availability.filter((a) => a.day_of_week === day)
          const hasSlots = slots.length > 0

          return (
            <div key={day} className="flex flex-col">
              <div className="text-xs text-gray-500 mb-2">{day.slice(0, 3)}</div>
              <div
                className={`flex-1 rounded-xl p-2 min-h-[60px] flex flex-col items-center justify-center ${
                  hasSlots ? 'bg-[#f0f7ed]' : 'bg-gray-50'
                }`}
              >
                {hasSlots ? (
                  slots.map((s: any, i: number) => (
                    <div key={i} className="text-xs text-[#5c7d4e] font-medium leading-tight">
                      {s.start_time.slice(0, 5)}–{s.end_time.slice(0, 5)}
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-gray-300">—</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}