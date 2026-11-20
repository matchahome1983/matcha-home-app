'use client'

import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('theme') === 'dark'
    setDark(saved)
    document.documentElement.classList.toggle('dark', saved)
  }, [])

  function toggle() {
    const next = !dark
    setDark(next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
    document.documentElement.classList.toggle('dark', next)
  }

  return (
    <div className="flex items-center justify-between py-3 border-b border-[#f0ebe3]">
      <div>
        <p className="font-medium text-[#2c2c2c]">Dark mode</p>
        <p className="text-sm text-gray-500">Easier on the eyes in low light</p>
      </div>
      <button
        onClick={toggle}
        className={`w-12 h-6 rounded-full transition-colors ${dark ? 'bg-[#5c7d4e]' : 'bg-gray-300'}`}
      >
        <div className={`w-5 h-5 bg-white rounded-full transform transition-transform ${dark ? 'translate-x-6' : 'translate-x-0.5'}`} />
      </button>
    </div>
  )
}