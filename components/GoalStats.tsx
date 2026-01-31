'use client'

interface GoalStatsProps {
  total: number
  active: number
  done: number
}

export default function GoalStats({ total, active, done }: GoalStatsProps) {
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 shadow-soft border border-gray-100">
      <div className="flex justify-around">
        <div className="text-center flex-1 min-w-0">
          <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">{total}</div>
          <div className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">Total</div>
        </div>
        <div className="w-px bg-gray-200 mx-1 sm:mx-2"></div>
        <div className="text-center flex-1 min-w-0">
          <div className="text-3xl sm:text-4xl font-bold text-pink-600 mb-1">{active}</div>
          <div className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">Active</div>
        </div>
        <div className="w-px bg-gray-200 mx-1 sm:mx-2"></div>
        <div className="text-center flex-1 min-w-0">
          <div className="text-3xl sm:text-4xl font-bold text-purple-600 mb-1">{done}</div>
          <div className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">Done</div>
        </div>
      </div>
    </div>
  )
}
