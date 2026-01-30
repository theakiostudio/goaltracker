'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Goal } from '@/lib/types'
import { format, differenceInDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns'

export default function Calendar() {
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [goals, setGoals] = useState<Goal[]>([])

  useEffect(() => {
    fetchGoals()
  }, [])

  const fetchGoals = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/auth')
      return
    }

    const { data: goalsData } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', session.user.id)

    if (goalsData) {
      setGoals(goalsData)
    }
  }

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Get first day of month to calculate offset
  const firstDayOfWeek = monthStart.getDay()
  const emptyDays = Array(firstDayOfWeek).fill(null)

  const getGoalsForDate = (date: Date) => {
    return goals.filter(goal => {
      const goalDate = new Date(goal.start_date)
      return isSameDay(goalDate, date)
    })
  }

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const selectedDateGoals = selectedDate ? getGoalsForDate(selectedDate) : []

  return (
    <div className="min-h-screen bg-pink-50 pb-20">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center">
        <button
          onClick={() => router.back()}
          className="mr-4 text-gray-600"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-gray-800">Calendar</h1>
      </div>

      <div className="px-4 pt-6">
        {/* Calendar Widget */}
        <div className="bg-white rounded-xl p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <button onClick={handlePreviousMonth} className="text-gray-400">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            </button>
            <h2 className="text-lg font-bold text-gray-800">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <button onClick={handleNextMonth} className="text-pink-dark">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>
          </div>

          {/* Days of week */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {emptyDays.map((_, index) => (
              <div key={`empty-${index}`} className="aspect-square" />
            ))}
            {daysInMonth.map(day => {
              const dayGoals = getGoalsForDate(day)
              const isSelected = selectedDate && isSameDay(day, selectedDate)
              const isToday = isSameDay(day, new Date())

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm ${
                    isSelected
                      ? 'bg-pink-dark text-white border-2 border-pink-dark'
                      : isToday
                      ? 'bg-pink-light text-gray-800'
                      : 'text-gray-600 hover:bg-pink-50'
                  }`}
                >
                  <span>{format(day, 'd')}</span>
                  {dayGoals.length > 0 && (
                    <div className="w-1.5 h-1.5 rounded-full bg-pink-dark mt-1" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Event Details */}
        {selectedDate && (
          <div className="bg-white rounded-xl p-5">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              {format(selectedDate, 'MMM d, yyyy')}
            </h3>
            {selectedDateGoals.length > 0 ? (
              <div className="space-y-3">
                {selectedDateGoals.map(goal => {
                  const daysUntilDue = differenceInDays(new Date(goal.due_date), new Date())
                  return (
                    <div
                      key={goal.id}
                      className="bg-pink-light rounded-xl p-4"
                      onClick={() => router.push(`/goals/${goal.id}`)}
                    >
                      <h4 className="font-bold text-gray-800 mb-1">{goal.title}</h4>
                      <p className="text-sm text-gray-600">
                        {daysUntilDue} days until due
                      </p>
                      {goal.accountability_partner && (
                        <p className="text-sm text-gray-600">
                          Accountability partner: {goal.accountability_partner}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No goals scheduled for this date.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
