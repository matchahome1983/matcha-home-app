'use client'

export default function ShareButton() {
  function handleShare() {
    const url = window.location.href
    navigator.clipboard.writeText(url)
    alert('Profile link copied. Share it with a neighbor or friend.')
  }

  return (
    <button
      onClick={handleShare}
      className="text-sm border border-[#f0ebe3] px-4 py-2 rounded-xl hover:bg-gray-50"
    >
      Share this Pro
    </button>
  )
}