import { Suspense } from 'react'
import { PostSk } from '@/components/ui/index'
import FeedInner from './FeedInner'

function FeedSkeleton() {
  return (
    <div className="page-wrap py-6">
      <div className="flex gap-6">
        <div className="flex-1 space-y-3">
          {[...Array(4)].map((_, i) => <PostSk key={i} />)}
        </div>
        <aside className="hidden lg:block w-72" />
      </div>
    </div>
  )
}

export default function FeedPage() {
  return (
    <Suspense fallback={<FeedSkeleton />}>
      <FeedInner />
    </Suspense>
  )
}
