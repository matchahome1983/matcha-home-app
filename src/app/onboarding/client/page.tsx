'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function ClientOnboarding() {
  const [needsChildcare, setNeedsChildcare] = useState(false)
  const [numKids, setNumKids] = useState('')
  const [kidsAges, setKidsAges] = useState('')
  const [needsHomework, setNeedsHomework] = useState(false)
  const [subjects, setSubjects] = useState<string[]>([])
  const [grade, setGrade] = useState('')
  const [needsHouse, setNeedsHouse] = useState(false)
  const [tasks, setTasks] = useState<string[]>([])
  const [times, setTimes] = useState<string[]>([])
  const [days, setDays] = useState<string[]>([])
  const [frequency, setFrequency] = useState('')
  const [oneTimeDuration, setOneTimeDuration] = useState('')
  const [oneTimeStart, setOneTimeStart] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const subjectOptions = ['Math', 'Reading', 'Science', 'Writing', 'Other']
  const taskOptions = ['Laundry', 'Dishes', 'Vacuuming', 'Party help', 'Home refresh']
  const timeOptions = ['Morning', 'Midday', 'Afternoon', 'Evening']
  const dayOptions = ['Weekdays', 'Weekends']
  const frequencyOptions = ['Just once', 'A few times', 'Ongoing']
  const startTimes = ['9:00 AM','10:00 AM','11:00 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM','6:00 PM','7:00 PM']

  function toggle(arr: string[], setArr: any, val: string) {
    setArr(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val])
  }

  async function handleSave() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('profiles').update({
      needs_childcare: needsChildcare,
      num_kids: numKids ? parseInt(numKids) : null,
      kids_ages: kidsAges || null,
      needs_homework_help: needsHomework,
      homework_subjects: subjects.length > 0 ? subjects : null,
      homework_grade: grade || null,
      needs_house_help: needsHouse,
      house_tasks: tasks.length > 0 ? tasks : null,
      preferred_times: times.length > 0 ? times : null,
      preferred_days: days.length > 0 ? days : null,
      preferred_frequency: frequency || null,
      one_time_duration: oneTimeDuration || null,
      one_time_start: oneTimeStart || null,
    }).eq('id', user.id)

    router.push('/dashboard')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#fbf8f3] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#f0ebe3] w-full max-w-lg">
        <h1 className="text-xl font-semibold text-[#2c2c2c] mb-6">What do you need help with?</h1>

        <div className="space-y-6">
          {/* Childcare */}
          <div>
            <label className="flex items-center gap-2 font-medium">
              <input type="checkbox" checked={needsChildcare} onChange={e => setNeedsChildcare(e.target.checked)} />
              Childcare
            </label>
            {needsChildcare && (
              <div className="ml-6 mt-3 space-y-3">
                <div>
                  <label className="text-sm text-gray-600">Number of kids</label>
                  <select value={numKids} onChange={e => setNumKids(e.target.value)} className="w-full border border-[#f0ebe3] rounded-xl px-3 py-2 text-sm mt-1">
                    <option value="">Select</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4+</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Ages (e.g. 3, 6, 9)</label>
                  <input value={kidsAges} onChange={e => setKidsAges(e.target.value)} placeholder="3, 6, 9" className="w-full border border-[#f0ebe3] rounded-xl px-3 py-2 text-sm mt-1" />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={needsHomework} onChange={e => setNeedsHomework(e.target.checked)} />
                  Homework help / tutoring
                </label>
                {needsHomework && (
                  <div className="ml-6 space-y-3">
                    <div>
                      <label className="text-sm text-gray-600">Subjects</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {subjectOptions.map(s => (
                          <button key={s} type="button" onClick={() => toggle(subjects, setSubjects, s)} className={`px-3 py-1.5 rounded-full text-xs ${subjects.includes(s) ? 'bg-[#5c7d4e] text-white' : 'border border-[#f0ebe3]'}`}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Grade</label>
                      <input value={grade} onChange={e => setGrade(e.target.value)} placeholder="e.g. 3rd grade" className="w-full border border-[#f0ebe3] rounded-xl px-3 py-2 text-sm mt-1" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* House help */}
          <div>
            <label className="flex items-center gap-2 font-medium">
              <input type="checkbox" checked={needsHouse} onChange={e => setNeedsHouse(e.target.checked)} />
              House help
            </label>
            {needsHouse && (
              <div className="ml-6 mt-3 flex flex-wrap gap-2">
                {taskOptions.map(t => (
                  <button key={t} type="button" onClick={() => toggle(tasks, setTasks, t)} className={`px-3 py-1.5 rounded-full text-xs ${tasks.includes(t) ? 'bg-[#5c7d4e] text-white' : 'border border-[#f0ebe3]'}`}>
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Timing */}
          <div>
            <p className="font-medium mb-2">When do you need help?</p>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 mb-1">Time of day</p>
                <div className="flex flex-wrap gap-2">
                  {timeOptions.map(t => (
                    <button key={t} type="button" onClick={() => toggle(times, setTimes, t)} className={`px-3 py-1.5 rounded-full text-xs ${times.includes(t) ? 'bg-[#5c7d4e] text-white' : 'border border-[#f0ebe3]'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Days</p>
                <div className="flex flex-wrap gap-2">
                  {dayOptions.map(d => (
                    <button key={d} type="button" onClick={() => toggle(days, setDays, d)} className={`px-3 py-1.5 rounded-full text-xs ${days.includes(d) ? 'bg-[#5c7d4e] text-white' : 'border border-[#f0ebe3]'}`}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Frequency */}
          <div>
            <p className="font-medium mb-2">How often?</p>
            <div className="flex flex-wrap gap-2">
              {frequencyOptions.map(f => (
                <button key={f} type="button" onClick={() => setFrequency(f)} className={`px-4 py-2 rounded-full text-sm ${frequency === f ? 'bg-[#5c7d4e] text-white' : 'border border-[#f0ebe3]'}`}>
                  {f}
                </button>
              ))}
            </div>

            {frequency === 'Just once' && (
              <div className="mt-4 space-y-3">
                <div>
                  <label className="text-sm text-gray-600">Duration</label>
                  <select value={oneTimeDuration} onChange={e => setOneTimeDuration(e.target.value)} className="w-full border border-[#f0ebe3] rounded-xl px-3 py-2 text-sm mt-1">
                    <option value="">Select</option>
                    <option value="1 hour">1 hour</option>
                    <option value="2 hours">2 hours</option>
                    <option value="3 hours">3 hours</option>
                    <option value="4 hours">4 hours</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Start time</label>
                  <select value={oneTimeStart} onChange={e => setOneTimeStart(e.target.value)} className="w-full border border-[#f0ebe3] rounded-xl px-3 py-2 text-sm mt-1">
                    <option value="">Select</option>
                    {startTimes.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        <button onClick={handleSave} disabled={loading} className="w-full bg-[#5c7d4e] text-white py-3 rounded-xl text-sm font-medium mt-8 disabled:opacity-50">
          {loading ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </div>
  )
}