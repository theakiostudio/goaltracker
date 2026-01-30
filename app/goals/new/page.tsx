'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

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
        <h1 className="text-lg font-semibold text-gray-800">Add a Goal</h1>
      </div>

      <div className="px-4 pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Goal Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-dark"
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
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-dark min-h-[100px]"
              placeholder="e.g., Go to the Gym 3 times a week."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Start Date *
            </label>
            <input
              type="date"
              required
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-dark"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Due Date *
            </label>
            <input
              type="date"
              required
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-dark"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Accountability Partner
            </label>
            <input
              type="text"
              value={formData.accountability_partner}
              onChange={(e) => setFormData({ ...formData, accountability_partner: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-dark"
              placeholder="e.g., Amy"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-dark text-white py-3 px-4 rounded-xl font-medium text-sm disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Goal'}
          </button>
        </form>
      </div>
    </div>
  )
}
