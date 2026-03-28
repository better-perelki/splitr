import { useQuery } from '@tanstack/react-query'
import { DefaultService } from '../api'

export default function HomePage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['health'],
    queryFn: () => DefaultService.getHealth(),
  })

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900">Splitr is running</h2>
      <p className="mt-4 text-sm text-gray-500">
        {isLoading && 'Checking backend...'}
        {isError && 'Backend unreachable'}
        {data && `Backend status: ${data.status}`}
      </p>
    </div>
  )
}
