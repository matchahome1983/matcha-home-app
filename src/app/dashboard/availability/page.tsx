const timePresets = [
  { label: 'Morning', start: '08:00', end: '12:00' },
  { label: 'Afternoon', start: '12:00', end: '17:00' },
  { label: 'Evening', start: '17:00', end: '21:00' },
  { label: 'All day', start: '08:00', end: '21:00' },
]

function formatTime(t: string) {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`
}

export default function AvailabilityPage() {
  const [slots, setSlots] = useState<any[]>([])
  const [selectedDays, setSelectedDays] = useState<string[]>([])
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('17:00')
  const [availableNow, setAvailableNow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const supabase = createClient()

  useEffect(() => {
    loadAvailability()
  }, [])

  async function loadAvailability() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('availability')
      .select('*')
      .eq('pro_id', user.id)
      .order('day_of_week')

    setSlots(data || [])

    const { data: profile } = await supabase
      .from('profiles')
      .select('available_now')
      .eq('id', user.id)
      .single()
    setAvailableNow(profile?.available_now || false)
  }

  function toggleDay(day: string) {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    )
  }

  function selectWeekdays() {
    setSelectedDays(weekdays)
  }

  function selectWeekends() {
    setSelectedDays(weekends)
  }

  function applyPreset(preset: { start: string; end: string }) {
    setStartTime(preset.start)
    setEndTime(preset.end)
  }

  async function toggleAvailableNow() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const newVal = !availableNow
    setAvailableNow(newVal)
    await supabase.from('profiles').update({ available_now: newVal }).eq('id', user.id)
  }

  async function addSlots() {
    if (selectedDays.length === 0) {
      setMessage('Select at least one day')
      return
    }

    setLoading(true)
    setMessage('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const newSlots = selectedDays.map(day => ({
      pro_id: user.id,
      day_of_week: day,
      start_time: startTime,
      end_time: endTime,
    }))

    const { error } = await supabase.from('availability').insert(newSlots)

    if (error) {
      setMessage('Error adding availability: ' + error.message)
    } else {
      setMessage('Availability added')
      setSelectedDays([])
      loadAvailability()
    }
    setLoading(false)
  }

  async function deleteSlot(id: string) {
    await supabase.from('availability').delete().eq('id', id)
    loadAvailability()
  }

  async function clearAll() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('availability').delete().eq('pro_id', user.id)
    setSlots([])
    setMessage('All availability cleared')
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold text-[#2c2c2c] mb-6">Availability</h1>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0ebe3] mb-6">
        <button
          onClick={toggleAvailableNow}
          className={`mb-4 px-5 py-2.5 rounded-xl text-sm font-medium ${
            availableNow
              ? 'bg-green-100 text-green-800'
              : 'border border-[#f0ebe3] text-gray-600'
          }`}
        >
          {availableNow ? 'Available Now ✓' : 'Set Available Now'}
        </button>

        <h2 className="font-medium text-[#2c2c2c] mb-4">Add availability</h2>

        <div className="flex gap-2 mb-3">
          <button onClick={selectWeekdays} className="text-sm border border-[#f0ebe3] px-3 py-1.5 rounded-full">
            All weekdays
          </button>
          <button onClick={selectWeekends} className="text-sm border border-[#f0ebe3] px-3 py-1.5 rounded-full">
            Weekends
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {days.map(day => (
            <button
              key={day}
              type="button"
              onClick={() => toggleDay(day)}
              className={`px-4 py-2 rounded-full text-sm ${
                selectedDays.includes(day)
                  ? 'bg-[#5c7d4e] text-white'
                  : 'border border-[#f0ebe3]'
              }`}
            >
              {day.slice(0, 3)}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {timePresets.map(p => (
            <button
              key={p.label}
              type="button"
              onClick={() => applyPreset(p)}
              className="text-sm border border-[#f0ebe3] px-3 py-1.5 rounded-full"
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <label className="text-sm text-gray-600 block mb-1">Start</label>
            <input
              type="time"
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
              className="w-full border border-[#f0ebe3] rounded-xl px-3 py-2 text-sm"
            />
          </div>
          <div className="flex-1">
            <label className="text-sm text-gray-600 block mb-1">End</label>
            <input
              type="time"
              value={endTime}
              onChange={e => setEndTime(e.target.value)}
              className="w-full border border-[#f0ebe3] rounded-xl px-3 py-2 text-sm"
            />
          </div>
        </div>

        <button
          onClick={addSlots}
          disabled={loading}
          className="bg-[#5c7d4e] text-white px-5 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50"
        >
          {loading ? 'Adding...' : 'Add selected days'}
        </button>

        {message && <p className="text-sm text-gray-600 mt-3">{message}</p>}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0ebe3]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-medium text-[#2c2c2c]">Current availability</h2>
          {slots.length > 0 && (
            <button onClick={clearAll} className="text-sm text-red-600 hover:underline">
              Clear all
            </button>
          )}
        </div>

        {slots.length > 0 ? (
          <div className="space-y-2">
            {slots.map(slot => (
              <div key={slot.id} className="flex items-center justify-between py-2 border-b border-[#f0ebe3] last:border-0">
                <span className="text-sm">
                  {slot.day_of_week} · {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
                </span>
                <button
                  onClick={() => deleteSlot(slot.id)}
                  className="text-xs text-gray-400 hover:text-red-600"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No availability set yet.</p>
        )}
      </div>
    </div>
  )
}