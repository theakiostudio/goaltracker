'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Goal } from '@/lib/types'
import { format, differenceInDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isBefore, isAfter, startOfDay } from 'date-fns'

export default function Calendar() {
  const router = useRouter()
  const today = new Date()
  const currentMonthStart = startOfMonth(today)
  const [currentDate, setCurrentDate] = useState(currentMonthStart)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [goals, setGoals] = useState<Goal[]>([])

  const isPastDate = (date: Date) => {
    const dateStart = startOfDay(date)
    const todayStart = startOfDay(today)
    return isBefore(dateStart, todayStart)
  }

  useEffect(() => {
    fetchGoals()
    const currentMonth = startOfMonth(today)
    const initialDate = startOfMonth(currentDate)
    if (isBefore(initialDate, currentMonth)) {
      setCurrentDate(currentMonth)
    }
  }, [])

  useEffect(() => {
    if (selectedDate && isPastDate(selectedDate)) {
      setSelectedDate(null)
    }
  }, [selectedDate])

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

  const firstDayOfWeek = monthStart.getDay()
  const emptyDays = Array(firstDayOfWeek).fill(null)

  const getGoalsForDate = (date: Date) => {
    const dateStart = startOfDay(date)
    return goals.filter(goal => {
      const startDate = startOfDay(new Date(goal.start_date))
      const dueDate = startOfDay(new Date(goal.due_date))
      
      return isSameDay(startDate, dateStart) || isSameDay(dueDate, dateStart)
    })
  }
  
  const getGoalTypeForDate = (goal: Goal, date: Date) => {
    const dateStart = startOfDay(date)
    const startDate = startOfDay(new Date(goal.start_date))
    const dueDate = startOfDay(new Date(goal.due_date))
    
    if (isSameDay(startDate, dateStart) && isSameDay(dueDate, dateStart)) {
      return 'both'
    } else if (isSameDay(startDate, dateStart)) {
      return 'start'
    } else if (isSameDay(dueDate, dateStart)) {
      return 'due'
    }
    return null
  }

  const getInProgressGoalsForDate = (date: Date) => {
    const dateStart = startOfDay(date)
    return goals.filter(goal => {
      const startDate = startOfDay(new Date(goal.start_date))
      const dueDate = startOfDay(new Date(goal.due_date))
      
      return isAfter(dateStart, startDate) && isBefore(dateStart, dueDate)
    })
  }

  const handlePreviousMonth = () => {
    const previousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    const previousMonthStart = startOfMonth(previousMonth)
    if (!isBefore(previousMonthStart, currentMonthStart)) {
      setCurrentDate(previousMonthStart)
    }
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const canGoToPreviousMonth = () => {
    const previousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    const previousMonthStart = startOfMonth(previousMonth)
    return !isBefore(previousMonthStart, currentMonthStart)
  }

  const selectedDateGoals = selectedDate ? getGoalsForDate(selectedDate) : []

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 pb-20">
      <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-3 sm:py-4 flex items-center shadow-soft">
        <button
          onClick={() => router.back()}
          className="mr-3 sm:mr-4 text-gray-600 hover:text-gray-900 transition-colors touch-manipulation p-1"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        <h1 className="text-base sm:text-lg font-semibold text-gray-800">Calendar</h1>
      </div>

      <div className="px-4 sm:px-6 pt-4 sm:pt-6 max-w-5xl mx-auto">
        <div className="bg-white rounded-3xl p-6 sm:p-8 mb-6 shadow-strong border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <button 
              onClick={handlePreviousMonth}
              disabled={!canGoToPreviousMonth()}
              className={`w-11 h-11 rounded-2xl transition-all duration-200 touch-manipulation flex items-center justify-center shadow-soft border ${
                canGoToPreviousMonth()
                  ? 'bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 active:scale-95 text-gray-700 hover:text-gray-900 border-gray-200/50 cursor-pointer'
                  : 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed opacity-50'
              }`}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            </button>
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-1">
                {format(currentDate, 'MMMM')}
              </h2>
              <p className="text-sm sm:text-base text-gray-500 font-semibold">
                {format(currentDate, 'yyyy')}
              </p>
            </div>
            <button 
              onClick={handleNextMonth} 
              className="w-11 h-11 rounded-2xl bg-gradient-to-br from-pink-500 via-pink-600 to-pink-700 hover:from-pink-600 hover:via-pink-700 hover:to-pink-800 active:scale-95 text-white transition-all duration-200 touch-manipulation flex items-center justify-center shadow-medium"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
              <div key={index} className="text-center">
                <div className="text-xs sm:text-sm font-extrabold text-gray-500 uppercase tracking-widest py-2">
                  {day.substring(0, 1)}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2 sm:gap-2.5">
            {emptyDays.map((_, index) => (
              <div key={`empty-${index}`} className="aspect-square" />
            ))}
            {daysInMonth.map(day => {
              const dayGoals = getGoalsForDate(day)
              const isSelected = selectedDate && isSameDay(day, selectedDate)
              const isToday = isSameDay(day, new Date())
              const hasGoals = dayGoals.length > 0
              const isPast = isPastDate(day)
              
              const hasDueDates = dayGoals.some(goal => {
                const goalType = getGoalTypeForDate(goal, day)
                return goalType === 'due' || goalType === 'both'
              })

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => !isPast && setSelectedDate(day)}
                  disabled={isPast}
                  className={`aspect-square rounded-2xl flex flex-col items-center justify-center text-sm sm:text-base touch-manipulation transition-all duration-300 relative group ${
                    isPast
                      ? 'text-gray-300 cursor-not-allowed opacity-50'
                      : isSelected
                      ? 'bg-gradient-to-br from-pink-600 via-pink-600 to-pink-700 text-white shadow-xl scale-110 z-10'
                      : isToday
                      ? 'bg-gradient-to-br from-pink-100 via-pink-50 to-purple-50 text-pink-700 font-extrabold shadow-soft'
                      : hasDueDates
                      ? 'bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 text-gray-800 hover:scale-105 hover:shadow-soft border-2 border-purple-200'
                      : hasGoals
                      ? 'bg-gradient-to-br from-gray-50 to-gray-100/50 hover:from-pink-50 hover:to-purple-50 text-gray-800 hover:scale-105 hover:shadow-soft border border-gray-200/50'
                      : 'text-gray-600 hover:bg-gray-50 active:bg-gray-100 hover:scale-105'
                  }`}
                >
                  <span className={`text-base sm:text-lg ${
                    isSelected 
                      ? 'text-white font-extrabold' 
                      : isToday 
                      ? 'text-pink-700 font-extrabold' 
                      : hasGoals
                      ? 'text-gray-800 font-bold'
                      : 'text-gray-600 font-semibold'
                  }`}>
                    {format(day, 'd')}
                  </span>
                  {hasGoals && (
                    <div className="flex items-center justify-center gap-1 mt-1">
                      {dayGoals.slice(0, 2).map((goal, idx) => {
                        const goalType = getGoalTypeForDate(goal, day)
                        const tooltipText = goalType === 'due' 
                          ? 'Due date' 
                          : goalType === 'start' 
                          ? 'Start date' 
                          : 'Start & Due date'
                        return (
                          <div
                            key={idx}
                            className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                              isSelected
                                ? 'bg-white/90'
                                : 'bg-gradient-to-br from-pink-500 to-pink-600'
                            }`}
                            title={tooltipText}
                          />
                        )
                      })}
                      {dayGoals.length > 2 && (
                        <div className={`text-[9px] sm:text-[10px] font-extrabold leading-none ${
                          isSelected ? 'text-white/90' : 'text-pink-600'
                        }`}>
                          +{dayGoals.length - 2}
                        </div>
                      )}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {goals.length === 0 && !selectedDate && (
          <div className="bg-gradient-to-br from-pink-50 via-purple-50 to-pink-50 rounded-3xl p-8 sm:p-12 shadow-strong border-2 border-dashed border-pink-200 text-center">
            <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-pink-500 via-pink-600 to-purple-600 flex items-center justify-center shadow-medium">
              <svg className="w-12 h-12 sm:w-16 sm:h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 tracking-tight">Your calendar is ready!</h3>
            <p className="text-gray-600 text-sm sm:text-base mb-2 max-w-md mx-auto">
              Start tracking your goals by creating your first goal.
            </p>
            <p className="text-gray-500 text-xs sm:text-sm mb-8 max-w-md mx-auto">
              Once you add goals with start and due dates, they'll appear here on your calendar to help you stay on track.
            </p>
            <button
              onClick={() => router.push('/goals/new')}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-600 to-pink-700 text-white px-6 py-3.5 rounded-xl font-semibold text-sm sm:text-base shadow-medium hover:shadow-strong hover:from-pink-700 hover:to-pink-800 transition-all duration-200 active:scale-95 touch-manipulation"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Create Your First Goal
            </button>
          </div>
        )}

        {selectedDate && (
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-strong border border-gray-100 transition-all duration-300 animate-in">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 mb-0.5 tracking-tight">
                  {format(selectedDate, 'EEEE')}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 font-semibold">
                  {format(selectedDate, 'MMMM d, yyyy')}
                </p>
              </div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-pink-500 via-pink-600 to-pink-700 flex items-center justify-center shadow-medium ring-2 ring-pink-100">
                <span className="text-white font-extrabold text-lg sm:text-xl">
                  {format(selectedDate, 'd')}
                </span>
              </div>
            </div>
            
            {selectedDateGoals.length > 0 ? (
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-6 bg-gradient-to-b from-pink-500 via-pink-600 to-purple-600 rounded-full"></div>
                  <h4 className="text-[10px] sm:text-xs font-extrabold text-gray-500 uppercase tracking-widest">
                    {selectedDateGoals.length} Goal{selectedDateGoals.length !== 1 ? 's' : ''} Scheduled
                  </h4>
                </div>
                {selectedDateGoals.map(goal => {
                  const daysUntilDue = differenceInDays(new Date(goal.due_date), selectedDate || new Date())
                  const goalType = selectedDate ? getGoalTypeForDate(goal, selectedDate) : null
                  const isStartDate = goalType === 'start' || goalType === 'both'
                  const isDueDate = goalType === 'due' || goalType === 'both'
                  
                  return (
                    <div
                      key={goal.id}
                      className={`rounded-xl p-3 sm:p-4 border-2 cursor-pointer transition-all duration-300 hover:shadow-medium group active:scale-[0.98] ${
                        isDueDate
                          ? 'bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 border-purple-200 hover:border-purple-300'
                          : 'bg-gradient-to-br from-pink-50 via-purple-50 to-pink-50 border-pink-100 hover:border-pink-300'
                      }`}
                      onClick={() => router.push(`/goals/${goal.id}`)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <h4 className="text-base sm:text-lg font-extrabold text-gray-900 group-hover:text-pink-700 transition-colors">
                              {goal.title}
                            </h4>
                            {isDueDate && (
                              <span className="px-1.5 py-0.5 rounded-md bg-purple-600 text-white text-[9px] font-extrabold uppercase tracking-wide">
                                Due
                              </span>
                            )}
                            {isStartDate && !isDueDate && (
                              <span className="px-1.5 py-0.5 rounded-md bg-pink-600 text-white text-[9px] font-extrabold uppercase tracking-wide">
                                Start
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs">
                            {isStartDate && (
                              <div className="flex items-center gap-1.5 text-gray-700 bg-white/60 px-2 py-1 rounded-md">
                                <svg className="w-3.5 h-3.5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="font-bold">
                                  Started: {format(new Date(goal.start_date), 'MMM d, yyyy')}
                                </span>
                              </div>
                            )}
                            {isDueDate && (
                              <div className="flex items-center gap-1.5 text-gray-700 bg-white/60 px-2 py-1 rounded-md">
                                <svg className="w-3.5 h-3.5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="font-bold">
                                  {daysUntilDue > 0 ? `${daysUntilDue} days left` : daysUntilDue === 0 ? 'Due today' : `${Math.abs(daysUntilDue)} days overdue`}
                                </span>
                              </div>
                            )}
                            {goal.accountability_partner && (
                              <div className="flex items-center gap-1.5 text-gray-700 bg-white/60 px-2 py-1 rounded-md">
                                <svg className="w-3.5 h-3.5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <span className="font-bold">{goal.accountability_partner}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white/80 group-hover:bg-pink-100 flex items-center justify-center transition-colors flex-shrink-0">
                          <svg className="w-4 h-4 text-gray-400 group-hover:text-pink-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              (() => {
                const inProgressGoals = selectedDate ? getInProgressGoalsForDate(selectedDate) : []
                const hasInProgress = inProgressGoals.length > 0
                
                return (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-pink-100 via-purple-100 to-pink-100 flex items-center justify-center shadow-soft">
                      <svg className="w-8 h-8 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    {hasInProgress ? (
                      <>
                        <h4 className="text-sm sm:text-base font-bold text-gray-900 mb-1.5">
                          {inProgressGoals.length} task{inProgressGoals.length !== 1 ? 's' : ''} in progress
                        </h4>
                        <p className="text-gray-500 text-xs sm:text-sm font-medium mb-4">
                          You have {inProgressGoals.length} goal{inProgressGoals.length !== 1 ? 's' : ''} in progress on this date.
                        </p>
                      </>
                    ) : (
                      <>
                        <h4 className="text-sm sm:text-base font-bold text-gray-900 mb-1.5">No goals on this date</h4>
                        <p className="text-gray-500 text-xs sm:text-sm font-medium mb-4">
                          {goals.length > 0 
                            ? "This date doesn't have any goals starting or due."
                            : "This date is free. Create a goal to get started!"}
                        </p>
                        {goals.length === 0 && (
                          <button
                            onClick={() => router.push('/goals/new')}
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-600 to-pink-700 text-white px-5 py-2.5 rounded-lg font-semibold text-xs sm:text-sm shadow-medium hover:shadow-strong hover:from-pink-700 hover:to-pink-800 transition-all duration-200 active:scale-95"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                            </svg>
                            Create a goal
                          </button>
                        )}
                      </>
                    )}
                  </div>
                )
              })()
            )}
          </div>
        )}
      </div>
    </div>
  )
}
