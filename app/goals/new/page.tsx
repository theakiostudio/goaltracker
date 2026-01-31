'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import DatePicker from '@/components/DatePicker'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function NewGoal() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: new Date().toISOString().split('T')[0],
    due_date: '',
    accountability_partner: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/auth')
      return
    }

    const { data: goalData, error: goalError } = await supabase
      .from('goals')
      .insert([{
        user_id: session.user.id,
        title: formData.title,
        description: formData.description,
        start_date: formData.start_date,
        due_date: formData.due_date,
        accountability_partner: formData.accountability_partner || null,
        status: 'active'
      }])
      .select()
      .single()

    if (goalError) {
      console.error('Error creating goal:', goalError)
      alert('Error creating goal. Please try again.')
      setLoading(false)
      return
    }

    // Create initial milestones if provided
    const milestoneTitles = formData.description.split('\n').filter(line => line.trim().startsWith('-'))
    if (milestoneTitles.length > 0) {
      const milestones = milestoneTitles.map((title, index) => ({
        goal_id: goalData.id,
        title: title.replace(/^-\s*/, '').trim(),
        completed: false,
        order_index: index
      }))

      await supabase.from('milestones').insert(milestones)
    }

    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-3 sm:py-4 flex items-center shadow-soft">
        <button
          onClick={() => router.back()}
          className="mr-3 sm:mr-4 text-gray-600 hover:text-gray-900 transition-colors touch-manipulation p-1"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        <h1 className="text-base sm:text-lg font-semibold text-gray-800">Add a Goal</h1>
      </div>

      <div className="px-4 sm:px-6 pt-4 sm:pt-6 max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Goal Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 text-base sm:text-sm rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all touch-manipulation"
              placeholder="e.g., GYM"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Description *
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 text-base sm:text-sm rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all min-h-[100px] touch-manipulation"
              placeholder="e.g., Go to the Gym 3 times a week."
            />
          </div>

          <DatePicker
            label="Start Date"
            value={formData.start_date}
            onChange={(date) => setFormData({ ...formData, start_date: date })}
            required
          />

          <DatePicker
            label="Due Date"
            value={formData.due_date}
            onChange={(date) => setFormData({ ...formData, due_date: date })}
            required
            minDate={formData.start_date}
          />

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Accountability Partner
            </label>
            <input
              type="text"
              value={formData.accountability_partner}
              onChange={(e) => setFormData({ ...formData, accountability_partner: e.target.value })}
              className="w-full px-4 py-3 text-base sm:text-sm rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all touch-manipulation"
              placeholder="e.g., Amy"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-pink-600 to-pink-700 text-white py-3.5 sm:py-4 px-4 rounded-xl font-semibold text-sm sm:text-base shadow-medium hover:shadow-strong active:scale-95 hover:from-pink-700 hover:to-pink-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 touch-manipulation min-h-[48px]"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <LoadingSpinner size="sm" color="white" />
                <span>Creating...</span>
              </span>
            ) : (
              'Create Goal'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
