export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#fbf8f3] flex flex-col">
      <div className="max-w-md mx-auto w-full px-6 py-8 flex-1">
        {children}
      </div>
    </div>
  )
}