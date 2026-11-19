export default function ProTestPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-8">
      <h1 className="text-2xl">Pro Profile Test</h1>
      <p>ID: {params.id}</p>
    </div>
  )
}