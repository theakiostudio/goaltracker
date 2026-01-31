'use client'

import { useRouter } from 'next/navigation'

export default function ActionButtons() {
  const router = useRouter()

  return (
    <div className="mb-4 sm:mb-6 space-y-2.5 sm:space-y-3">
      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
        <button
          onClick={() => router.push('/goals/new')}
          className="flex-1 bg-gradient-to-r from-pink-600 to-pink-700 text-white py-3 sm:py-3.5 px-4 sm:px-5 rounded-xl font-semibold text-sm shadow-medium hover:shadow-strong active:scale-95 hover:from-pink-700 hover:to-pink-800 transition-all duration-200 flex items-center justify-center gap-2 touch-manipulation min-h-[44px]"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="whitespace-nowrap">Add a goal</span>
        </button>
        <button
          onClick={() => router.push('/calendar')}
          className="flex-1 bg-white text-gray-700 py-3 sm:py-3.5 px-4 sm:px-5 rounded-xl font-semibold text-sm shadow-soft hover:shadow-medium active:scale-95 border border-gray-200 hover:border-gray-300 transition-all duration-200 flex items-center justify-center gap-2 touch-manipulation min-h-[44px]"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="whitespace-nowrap">Calendar</span>
        </button>
      </div>
      <button
        onClick={() => router.push('/vision-board')}
        className="w-full bg-white text-gray-700 py-3 sm:py-3.5 px-4 sm:px-5 rounded-xl font-semibold text-sm shadow-soft hover:shadow-medium active:scale-95 border border-gray-200 hover:border-gray-300 transition-all duration-200 flex items-center justify-center gap-2 touch-manipulation min-h-[44px]"
      >
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="whitespace-nowrap">Vision board</span>
      </button>
    </div>
  )
}
