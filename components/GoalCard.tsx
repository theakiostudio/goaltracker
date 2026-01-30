'use client'

import { useRouter } from 'next/navigation'
import { Goal } from '@/lib/types'
import { format, differenceInDays } from 'date-fns'

interface GoalCardProps {
  goal: Goal
}

export default function GoalCard({ goal }: GoalCardProps) {
  const router = useRouter()
  
  const completedMilestones = goal.milestones?.filter(m => m.completed).length || 0
  const totalMilestones = goal.milestones?.length || 0
  const progress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0
  const daysLeft = differenceInDays(new Date(goal.due_date), new Date())
  
  const statusColors = {
    active: 'bg-pink-medium text-white',
    completed: 'bg-purple-light text-purple-medium',
    done: 'bg-purple-light text-purple-medium'
  }

  const statusLabels = {
    active: 'ACTIVE',
    completed: 'COMPLETED',
    done: 'DONE'
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100 hover:shadow-medium transition-all duration-200 cursor-pointer" onClick={() => router.push(`/goals/${goal.id}`)}>
      <div className="flex items-start justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{goal.title}</h2>
        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide ${statusColors[goal.status]}`}>
          {statusLabels[goal.status]}
        </span>
      </div>

      <div className="mb-4">
        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              goal.status === 'done' || goal.status === 'completed' 
                ? 'bg-gradient-to-r from-purple-500 to-purple-600' 
                : 'bg-gradient-to-r from-pink-500 to-pink-600'
            }`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <div className="flex justify-between items-center mt-3 text-sm">
          <span className="text-gray-600 font-medium">
            {totalMilestones > 0 ? `${completedMilestones}/${totalMilestones} milestones` : '0% complete'}
          </span>
          <span className="text-gray-500 font-medium">{daysLeft}d left</span>
        </div>
      </div>

      {goal.accountability_partner && (
        <div className="mb-3 flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-sm text-gray-600">
            Partner: <span className="font-semibold text-gray-900">{goal.accountability_partner}</span>
          </p>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="font-medium">Due {format(new Date(goal.due_date), 'MMM d, yyyy')}</span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            router.push(`/goals/${goal.id}`)
          }}
          className="text-pink-600 hover:text-pink-700 font-semibold text-sm flex items-center gap-1 transition-colors"
        >
          View Details
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}
