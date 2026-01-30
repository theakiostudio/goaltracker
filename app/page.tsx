'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Goal, Profile } from '@/lib/types'
import GoalCard from '@/components/GoalCard'
import Header from '@/components/Header'
import ActionButtons from '@/components/ActionButtons'
import GoalStats from '@/components/GoalStats'

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
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-pink-500 to-pink-600 animate-pulse"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  const activeGoals = goals.filter(g => g.status === 'active')
  const completedGoals = goals.filter(g => g.status === 'completed' || g.status === 'done')

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 pb-20">
      <Header onSignOut={handleSignOut} />
      
      <div className="px-6 pt-6 max-w-4xl mx-auto">
        {/* User Profile Section */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center shadow-medium">
            <span className="text-white font-bold text-xl">
              {profile?.initials || 'U'}
            </span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-1">
              Hello, {profile?.full_name || 'User'}
            </h1>
            <p className="text-gray-500 text-sm font-medium">
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

        {/* Goals List */}
        <div className="mt-6 space-y-4">
          {goals.length > 0 && (
            <h2 className="text-xl font-bold text-gray-900 mb-4">Your Goals</h2>
          )}
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
          {goals.length === 0 && (
            <div className="bg-white rounded-2xl p-12 text-center shadow-soft border border-gray-100">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No goals yet</h3>
              <p className="text-gray-500 mb-6">Add your first goal to get started on your journey!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
