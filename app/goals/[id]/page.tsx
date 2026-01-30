'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Goal, Milestone } from '@/lib/types'
import { format, differenceInDays } from 'date-fns'

export default function GoalDetails() {
  const router = useRouter()
  const params = useParams()
  const goalId = params.id as string
  
  const [goal, setGoal] = useState<Goal | null>(null)
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGoal()
  }, [goalId])

  const fetchGoal = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/auth')
      return
    }

    const { data: goalData, error: goalError } = await supabase
      .from('goals')
      .select('*')
      .eq('id', goalId)
      .single()

    if (goalError) {
      console.error('Error fetching goal:', goalError)
      return
    }

    setGoal(goalData)

    const { data: milestonesData, error: milestonesError } = await supabase
      .from('milestones')
      .select('*')
      .eq('goal_id', goalId)
      .order('order_index', { ascending: true })

    if (milestonesError) {
      console.error('Error fetching milestones:', milestonesError)
    } else {
      setMilestones(milestonesData || [])
    }

    setLoading(false)
  }

  const toggleMilestone = async (milestoneId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('milestones')
      .update({ completed: !currentStatus })
      .eq('id', milestoneId)

    if (error) {
      console.error('Error updating milestone:', error)
    } else {
      setMilestones(milestones.map(m => 
        m.id === milestoneId ? { ...m, completed: !currentStatus } : m
      ))
      
      // Check if all milestones are completed, update goal status
      const updatedMilestones = milestones.map(m => 
        m.id === milestoneId ? { ...m, completed: !currentStatus } : m
      )
      const allCompleted = updatedMilestones.every(m => m.completed)
      
      if (allCompleted && goal) {
        await supabase
          .from('goals')
          .update({ status: 'completed' })
          .eq('id', goalId)
        setGoal({ ...goal, status: 'completed' })
      }
    }
  }

  const deleteMilestone = async (milestoneId: string) => {
    const { error } = await supabase
      .from('milestones')
      .delete()
      .eq('id', milestoneId)

    if (error) {
      console.error('Error deleting milestone:', error)
    } else {
      setMilestones(milestones.filter(m => m.id !== milestoneId))
    }
  }

  const addMilestone = async () => {
    if (!goal) return

    const title = prompt('Enter step name:')
    if (!title || !title.trim()) return

    const newMilestone = {
      goal_id: goal.id,
      title: title.trim(),
      completed: false,
      order_index: milestones.length
    }

    const { data, error } = await supabase
      .from('milestones')
      .insert([newMilestone])
      .select()
      .single()

    if (error) {
      console.error('Error adding milestone:', error)
      alert('Error adding step. Please try again.')
    } else {
      setMilestones([...milestones, data])
    }
  }

  if (loading || !goal) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center">
        <div className="text-pink-dark">Loading...</div>
      </div>
    )
  }

  const completedCount = milestones.filter(m => m.completed).length
  const progress = milestones.length > 0 ? (completedCount / milestones.length) * 100 : 0
  const daysRemaining = differenceInDays(new Date(goal.due_date), new Date())

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
        <h1 className="text-lg font-semibold text-gray-800">Goal Details</h1>
      </div>

      <div className="px-4 pt-4">
        <div className="bg-white rounded-xl p-5">
          {/* Title and Status */}
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">{goal.title}</h2>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[goal.status]}`}>
              {statusLabels[goal.status]}
            </span>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">Description</h3>
            <p className="text-gray-600">{goal.description || 'No description provided.'}</p>
          </div>

          {/* Steps/Milestones */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">Steps (milestones)</h3>
            <p className="text-xs text-gray-500 mb-3">
              Break your goal into small steps. Tap a step to mark it done. Tap the x to remove it.
            </p>
            <div className="space-y-2">
              {milestones.map((milestone) => (
                <div
                  key={milestone.id}
                  className="bg-pink-light rounded-xl p-3 flex items-center justify-between"
                >
                  <button
                    onClick={() => toggleMilestone(milestone.id, milestone.completed)}
                    className="flex items-center gap-3 flex-1"
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      milestone.completed 
                        ? 'bg-pink-dark border-pink-dark' 
                        : 'border-pink-dark'
                    }`}>
                      {milestone.completed && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      )}
                    </div>
                    <span className={`flex-1 text-left ${milestone.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                      {milestone.title}
                    </span>
                  </button>
                  <button
                    onClick={() => deleteMilestone(milestone.id)}
                    className="text-pink-dark ml-2"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={addMilestone}
              className="text-red-500 text-sm mt-3 font-medium"
            >
              + Add another step
            </button>
          </div>

          {/* Progress */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">Progress</h3>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div
                className={`h-2 rounded-full ${goal.status === 'done' || goal.status === 'completed' ? 'bg-purple-medium' : 'bg-pink-dark'}`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <p className="text-sm text-gray-600">
              {completedCount} of {milestones.length} steps done ({Math.round(progress)}%).
            </p>
          </div>

          {/* Accountability Partner */}
          {goal.accountability_partner && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">Accountability Partner</h3>
              <p className="text-gray-600">
                <span className="font-semibold">{goal.accountability_partner}</span>
                <span className="text-sm text-gray-500 block mt-1">
                  Doing it together or cheering you on.
                </span>
              </p>
            </div>
          )}

          {/* Start Date */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">Start Date</h3>
            <p className="text-gray-800 font-semibold">
              {format(new Date(goal.start_date), 'MMMM d, yyyy')}
            </p>
          </div>

          {/* Due Date */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">Due Date</h3>
            <p className="text-gray-800 font-semibold">
              {format(new Date(goal.due_date), 'MMMM d, yyyy')}
            </p>
          </div>

          {/* Days Remaining */}
          <div>
            <p className="text-sm text-gray-600">
              {daysRemaining} days remaining
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
