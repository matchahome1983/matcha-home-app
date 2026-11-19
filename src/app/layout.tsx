import './globals.css'

export const metadata = {
  title: 'Matcha Home',
  description: 'Flexible part-time home help',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}