'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Goal, Milestone } from '@/lib/types'
import { format, differenceInDays } from 'date-fns'
import DatePicker from '@/components/DatePicker'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function GoalDetails() {
  const router = useRouter()
  const params = useParams()
  const goalId = params.id as string
  
  const [goal, setGoal] = useState<Goal | null>(null)
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    start_date: '',
    due_date: '',
    accountability_partner: '',
    status: 'active' as 'active' | 'completed' | 'done'
  })
  const [saving, setSaving] = useState(false)
  const [showAddMilestone, setShowAddMilestone] = useState(false)
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('')
  const [addingMilestone, setAddingMilestone] = useState(false)

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
    
    // Initialize edit form data
    setEditFormData({
      title: goalData.title,
      description: goalData.description || '',
      start_date: goalData.start_date,
      due_date: goalData.due_date,
      accountability_partner: goalData.accountability_partner || '',
      status: goalData.status
    })

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

  const handleAddMilestoneClick = () => {
    setShowAddMilestone(true)
    setNewMilestoneTitle('')
  }

  const handleCancelAddMilestone = () => {
    setShowAddMilestone(false)
    setNewMilestoneTitle('')
  }

  const addMilestone = async () => {
    if (!goal || !newMilestoneTitle.trim()) return

    setAddingMilestone(true)
    const newMilestone = {
      goal_id: goal.id,
      title: newMilestoneTitle.trim(),
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
      setAddingMilestone(false)
    } else {
      setMilestones([...milestones, data])
      setNewMilestoneTitle('')
      setShowAddMilestone(false)
      setAddingMilestone(false)
    }
  }

  const handleEdit = () => {
    if (!goal) return
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    if (!goal) return
    setEditFormData({
      title: goal.title,
      description: goal.description || '',
      start_date: goal.start_date,
      due_date: goal.due_date,
      accountability_partner: goal.accountability_partner || '',
      status: goal.status
    })
    setIsEditing(false)
  }

  const handleSaveEdit = async () => {
    if (!goal) return
    setSaving(true)

    const { error } = await supabase
      .from('goals')
      .update({
        title: editFormData.title,
        description: editFormData.description,
        start_date: editFormData.start_date,
        due_date: editFormData.due_date,
        accountability_partner: editFormData.accountability_partner || null,
        status: editFormData.status
      })
      .eq('id', goalId)

    if (error) {
      console.error('Error updating goal:', error)
      alert('Error updating goal. Please try again.')
      setSaving(false)
    } else {
      await fetchGoal() // Refresh the goal data
      setIsEditing(false)
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!goal) return

    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', goalId)

    if (error) {
      console.error('Error deleting goal:', error)
      alert('Error deleting goal. Please try again.')
      setShowDeleteConfirm(false)
    } else {
      router.push('/')
    }
  }

  if (loading || !goal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-3 sm:py-4 flex items-center shadow-soft">
        <button
          onClick={() => router.back()}
          className="mr-3 sm:mr-4 text-gray-600 hover:text-gray-900 transition-colors touch-manipulation p-1 flex-shrink-0"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        <h1 className="text-base sm:text-lg font-semibold text-gray-800">Goal Details</h1>
      </div>

      <div className="px-4 sm:px-6 pt-4 sm:pt-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-soft border border-gray-100">
          {isEditing ? (
            /* Edit Mode */
            <div className="space-y-5 sm:space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Goal Title *
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="w-full px-4 py-3 text-base sm:text-sm rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all touch-manipulation"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Description *
                </label>
                <textarea
                  required
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="w-full px-4 py-3 text-base sm:text-sm rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all min-h-[100px] touch-manipulation"
                />
              </div>

              <DatePicker
                label="Start Date"
                value={editFormData.start_date}
                onChange={(date) => setEditFormData({ ...editFormData, start_date: date })}
                required
              />

              <DatePicker
                label="Due Date"
                value={editFormData.due_date}
                onChange={(date) => setEditFormData({ ...editFormData, due_date: date })}
                required
                minDate={editFormData.start_date}
              />

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Accountability Partner
                </label>
                <input
                  type="text"
                  value={editFormData.accountability_partner}
                  onChange={(e) => setEditFormData({ ...editFormData, accountability_partner: e.target.value })}
                  className="w-full px-4 py-3 text-base sm:text-sm rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all touch-manipulation"
                  placeholder="e.g., Amy"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Status
                </label>
                <select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as 'active' | 'completed' | 'done' })}
                  className="w-full px-4 py-3 text-base sm:text-sm rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all touch-manipulation bg-white"
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="done">Done</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSaveEdit}
                  disabled={saving}
                  className="flex-1 bg-gradient-to-r from-pink-600 to-pink-700 text-white py-3.5 sm:py-4 px-4 rounded-xl font-semibold text-sm sm:text-base shadow-medium hover:shadow-strong active:scale-95 hover:from-pink-700 hover:to-pink-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 touch-manipulation min-h-[48px] flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <LoadingSpinner size="sm" color="white" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                      <span>Update</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={saving}
                  className="flex-1 bg-white text-gray-700 py-3.5 sm:py-4 px-4 rounded-xl font-semibold text-sm sm:text-base shadow-soft hover:shadow-medium active:scale-95 border border-gray-200 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 touch-manipulation min-h-[48px]"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            /* View Mode */
            <>
              {/* Title and Status */}
              <div className="flex items-start justify-between mb-4 gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex-1 break-words">{goal.title}</h2>
                <span className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold flex-shrink-0 ${statusColors[goal.status]}`}>
                  {statusLabels[goal.status]}
                </span>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-800 mb-2">Description</h3>
                <p className="text-gray-600">{goal.description || 'No description provided.'}</p>
              </div>
            </>
          )}

          {/* Steps/Milestones - Only show when not editing */}
          {!isEditing && (
            <>
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
                  className="bg-pink-light rounded-xl p-3 sm:p-4 flex items-center justify-between gap-2"
                >
                  <button
                    onClick={() => toggleMilestone(milestone.id, milestone.completed)}
                    className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 touch-manipulation"
                  >
                    <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      milestone.completed 
                        ? 'bg-pink-dark border-pink-dark' 
                        : 'border-pink-dark'
                    }`}>
                      {milestone.completed && (
                        <svg width="12" height="12" className="sm:w-3.5 sm:h-3.5" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      )}
                    </div>
                    <span className={`flex-1 text-left text-sm sm:text-base break-words ${milestone.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                      {milestone.title}
                    </span>
                  </button>
                  <button
                    onClick={() => deleteMilestone(milestone.id)}
                    className="text-pink-dark ml-2 flex-shrink-0 touch-manipulation p-1"
                  >
                    <svg width="18" height="18" className="sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            
            {/* Add Milestone Section */}
            {showAddMilestone ? (
              <div className="mt-4 p-4 bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl border-2 border-pink-200 border-dashed">
                <div className="mb-3">
                  <input
                    type="text"
                    value={newMilestoneTitle}
                    onChange={(e) => setNewMilestoneTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        addMilestone()
                      } else if (e.key === 'Escape') {
                        handleCancelAddMilestone()
                      }
                    }}
                    placeholder="Enter step name..."
                    autoFocus
                    className="w-full px-4 py-3 text-sm sm:text-base rounded-lg border border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white touch-manipulation"
                    disabled={addingMilestone}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={addMilestone}
                    disabled={addingMilestone || !newMilestoneTitle.trim()}
                    className="flex-1 bg-gradient-to-r from-pink-600 to-pink-700 text-white py-3.5 sm:py-4 px-4 rounded-xl font-semibold text-sm sm:text-base shadow-medium hover:shadow-strong active:scale-95 hover:from-pink-700 hover:to-pink-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 touch-manipulation min-h-[48px] flex items-center justify-center gap-2"
                  >
                    {addingMilestone ? (
                      <>
                        <LoadingSpinner size="sm" color="white" />
                        <span>Adding...</span>
                      </>
                    ) : (
                      <>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M5 13l4 4L19 7"/>
                        </svg>
                        <span>Add Step</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleCancelAddMilestone}
                    disabled={addingMilestone}
                    className="flex-1 bg-white text-gray-700 py-3.5 sm:py-4 px-4 rounded-xl font-semibold text-sm sm:text-base shadow-soft hover:shadow-medium active:scale-95 border border-gray-200 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 touch-manipulation min-h-[48px]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={handleAddMilestoneClick}
                className="mt-4 w-full bg-gradient-to-br from-pink-50 to-purple-50 hover:from-pink-100 hover:to-purple-100 border-2 border-dashed border-pink-300 hover:border-pink-400 rounded-xl py-4 px-4 text-pink-600 hover:text-pink-700 font-semibold text-sm sm:text-base transition-all duration-200 touch-manipulation active:scale-95 flex items-center justify-center gap-2 group"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover:scale-110 transition-transform">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
                <span>Add another step</span>
              </button>
            )}
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
              <div className="mb-6">
                <p className="text-sm text-gray-600">
                  {daysRemaining} days remaining
                </p>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={handleEdit}
                  className="flex-1 bg-white text-gray-700 py-3.5 sm:py-4 px-4 rounded-xl font-semibold text-sm sm:text-base shadow-soft hover:shadow-medium active:scale-95 border border-gray-200 hover:border-pink-300 hover:text-pink-600 transition-all duration-200 touch-manipulation min-h-[48px] flex items-center justify-center gap-2"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  <span>Update</span>
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex-1 bg-white text-gray-700 py-3.5 sm:py-4 px-4 rounded-xl font-semibold text-sm sm:text-base shadow-soft hover:shadow-medium active:scale-95 border border-gray-200 hover:border-red-300 hover:text-red-600 transition-all duration-200 touch-manipulation min-h-[48px] flex items-center justify-center gap-2"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                  <span>Delete Goal</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-strong">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Goal?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{goal?.title}"? This action cannot be undone and will also delete all associated milestones.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-white text-gray-700 py-3 px-4 rounded-xl font-semibold text-sm shadow-soft hover:shadow-medium active:scale-95 border border-gray-200 hover:border-gray-300 transition-all duration-200 touch-manipulation"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-4 rounded-xl font-semibold text-sm shadow-medium hover:shadow-strong active:scale-95 hover:from-red-700 hover:to-red-800 transition-all duration-200 touch-manipulation"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
