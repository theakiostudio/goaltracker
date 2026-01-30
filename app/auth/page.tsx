'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'

export default function Auth() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      router.push('/')
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    })

    if (error) {
      alert(error.message)
    } else if (data.user) {
      // Update profile with full name
      await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          initials: fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        })
        .eq('id', data.user.id)
      
      // Check if email confirmation is required
      if (data.user.email_confirmed_at || !data.session) {
        // If email is confirmed or confirmation is disabled, go to home
        router.push('/')
      } else {
        alert('Please check your email to confirm your account before signing in.')
      }
    }
    setLoading(false)
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      if (error.message.includes('Email not confirmed')) {
        alert('Email not confirmed. Please check your email for the confirmation link, or disable email confirmation in Supabase settings for development.')
      } else {
        alert(error.message)
      }
    } else {
      router.push('/')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-pink-600 p-3 shadow-medium">
            <Image
              src="/logo.png"
              alt="Goal Tracker Logo"
              width={56}
              height={56}
              className="object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Goal Tracker</h1>
          <p className="text-gray-500 font-medium">
            {isSignUp ? 'Create your account' : 'Sign in to your account'}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-medium border border-gray-100">
          <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-5">
            {isSignUp && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  required={isSignUp}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                  placeholder="John Doe"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-600 to-pink-700 text-white py-3.5 px-4 rounded-xl font-semibold text-sm shadow-medium hover:shadow-strong hover:from-pink-700 hover:to-pink-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
