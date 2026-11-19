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
  const [timing, setTiming] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const subjectOptions = ['Math', 'Reading', 'Science', 'Writing', 'Other']
  const taskOptions = ['Laundry', 'Dishes', 'Vacuuming', 'Party help', 'Home refresh']
  const timingOptions = ['Weekday mornings', 'Weekday afternoons', 'Weekday evenings', 'Weekends', 'Flexible']

  function toggleSubject(s: string) {
    setSubjects(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  }

  function toggleTask(t: string) {
    setTasks(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])
  }

  function toggleTiming(t: string) {
    setTiming(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])
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
      preferred_timing: timing.length > 0 ? timing : null,
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
                          <button key={s} type="button" onClick={() => toggleSubject(s)} className={`px-3 py-1.5 rounded-full text-xs ${subjects.includes(s) ? 'bg-[#5c7d4e] text-white' : 'border border-[#f0ebe3]'}`}>
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
                  <button key={t} type="button" onClick={() => toggleTask(t)} className={`px-3 py-1.5 rounded-full text-xs ${tasks.includes(t) ? 'bg-[#5c7d4e] text-white' : 'border border-[#f0ebe3]'}`}>
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Timing */}
          <div>
            <label className="font-medium block mb-2">When do you usually need help?</label>
            <div className="flex flex-wrap gap-2">
              {timingOptions.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleTiming(t)}
                  className={`px-3 py-1.5 rounded-full text-xs ${timing.includes(t) ? 'bg-[#5c7d4e] text-white' : 'border border-[#f0ebe3]'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button onClick={handleSave} disabled={loading} className="w-full bg-[#5c7d4e] text-white py-3 rounded-xl text-sm font-medium mt-8 disabled:opacity-50">
          {loading ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </div>
  )
}