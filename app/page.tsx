'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Goal, Profile } from '@/lib/types'
import GoalCard from '@/components/GoalCard'
import Header from '@/components/Header'
import ActionButtons from '@/components/ActionButtons'
import GoalStats from '@/components/GoalStats'
import { groupGoalsByQuarter, getAllQuarters, isCurrentQuarter, isPastQuarter } from '@/lib/quarterUtils'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function Home() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
    fetchGoals()
  }, [])

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/auth')
      return
    }

    // Fetch profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (profileData) {
      setProfile(profileData)
    }
  }

  const fetchGoals = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const { data: goalsData, error } = await supabase
      .from('goals')
      .select(`
        *,
        milestones (*)
      `)
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching goals:', error)
    } else {
      setGoals(goalsData || [])
    }
    setLoading(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  const activeGoals = goals.filter(g => g.status === 'active')
  const completedGoals = goals.filter(g => g.status === 'completed' || g.status === 'done')
  
  // Group goals by quarter
  const goalsByQuarter = groupGoalsByQuarter(goals)
  const allQuarters = getAllQuarters()
  
  // Filter quarters that have goals or are current/future
  const relevantQuarters = allQuarters.filter(q => {
    const key = `${q.year}-Q${q.quarter}`
    const hasGoals = goalsByQuarter.has(key)
    const isCurrentOrFuture = !isPastQuarter(q) || isCurrentQuarter(q)
    return hasGoals || isCurrentOrFuture
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 pb-20">
      <Header onSignOut={handleSignOut} />
      
      <div className="px-4 sm:px-6 pt-4 sm:pt-6 max-w-4xl mx-auto">
        {/* User Profile Section */}
        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center shadow-medium flex-shrink-0">
            <span className="text-white font-bold text-lg sm:text-xl">
              {profile?.initials || 'U'}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-0.5 sm:mb-1 truncate">
              Hello, {profile?.full_name || 'User'}
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm font-medium">
              {activeGoals.length} active goal{activeGoals.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <ActionButtons />

        {/* Goal Statistics */}
        <GoalStats 
          total={goals.length}
          active={activeGoals.length}
          done={completedGoals.length}
        />

        {/* Goals by Quarter */}
        {goals.length > 0 ? (
          <div className="mt-4 sm:mt-6 space-y-6 sm:space-y-8">
            {relevantQuarters.map((quarterInfo) => {
              const key = `${quarterInfo.year}-Q${quarterInfo.quarter}`
              const quarterGoals = goalsByQuarter.get(key) || []
              const isCurrent = isCurrentQuarter(quarterInfo)
              const isPast = isPastQuarter(quarterInfo)
              
              if (quarterGoals.length === 0 && !isCurrent) return null
              
              return (
                <div key={key} className="space-y-3 sm:space-y-4">
                  {/* Quarter Header */}
                  <div className={`flex items-center gap-3 ${isCurrent ? 'mb-2' : ''}`}>
                    <div className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl ${
                      isCurrent 
                        ? 'bg-gradient-to-r from-pink-600 to-pink-700 text-white shadow-medium' 
                        : isPast
                        ? 'bg-gray-100 text-gray-600'
                        : 'bg-gradient-to-r from-purple-100 to-pink-100 text-gray-700'
                    }`}>
                      <span className="text-sm sm:text-base font-bold">
                        {quarterInfo.label}
                      </span>
                      {isCurrent && (
                        <span className="text-xs font-semibold bg-white/20 px-2 py-0.5 rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent"></div>
                    <span className="text-xs sm:text-sm text-gray-500 font-medium">
                      {quarterInfo.months}
                    </span>
                  </div>
                  
                  {/* Quarter Goals */}
                  {quarterGoals.length > 0 ? (
                    <div className="space-y-3 sm:space-y-4">
                      {quarterGoals.map((goal) => (
                        <GoalCard key={goal.id} goal={goal} />
                      ))}
                    </div>
                  ) : isCurrent ? (
                    <div className="bg-white/50 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center border border-dashed border-gray-300">
                      <p className="text-sm sm:text-base text-gray-500">
                        No goals for this quarter yet. Add a goal to get started!
                      </p>
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="mt-4 sm:mt-6">
            <div className="bg-white rounded-xl sm:rounded-2xl p-8 sm:p-12 text-center shadow-soft border border-gray-100">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No goals yet</h3>
              <p className="text-sm sm:text-base text-gray-500 mb-6">Add your first goal to get started on your journey!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
