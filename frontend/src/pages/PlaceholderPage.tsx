export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
      <p className="mt-2 text-gray-500">Coming soon.</p>
    </div>
  )
}
