'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function Auth() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSignInPrompt, setShowSignInPrompt] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)

  const validateEmail = (emailValue: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(emailValue)
  }

  const passwordRules = {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  }

  const isPasswordValid = Object.values(passwordRules).every(rule => rule === true)

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      router.push('/')
    }
  }

  const getErrorMessage = (error: any): string => {
    const errorMessage = error?.message || ''
    
    // Sign up errors
    if (errorMessage.includes('already registered') || errorMessage.includes('already exists')) {
      return 'This email is already registered. Please sign in instead.'
    }
    if (errorMessage.includes('password')) {
      return 'Password must meet all requirements: at least 8 characters, uppercase, lowercase, number, and special character.'
    }
    if (errorMessage.includes('email')) {
      return 'Please enter a valid email address.'
    }
    
    // Sign in errors
    if (errorMessage.includes('Invalid login credentials') || errorMessage.includes('invalid')) {
      return 'The email or password you entered is incorrect. Please try again.'
    }
    if (errorMessage.includes('Email not confirmed')) {
      return 'Please check your email and click the confirmation link before signing in.'
    }
    if (errorMessage.includes('too many requests')) {
      return 'Too many login attempts. Please wait a moment and try again.'
    }
    
    // Network errors
    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      return 'Network error. Please check your internet connection and try again.'
    }
    
    // Default
    return errorMessage || 'An error occurred. Please try again.'
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!validateEmail(email)) {
      setEmailError('Please use a valid email format (e.g., name@example.com)')
      setLoading(false)
      return
    }

    if (!isPasswordValid) {
      setError('Please ensure your password meets all requirements.')
      setLoading(false)
      return
    }

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
      setError(getErrorMessage(error))
      setLoading(false)
    } else if (data.user) {
      // Update profile with full name
      await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          initials: fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        })
        .eq('id', data.user.id)
      
      // If session exists, user is already signed in
      if (data.session) {
        router.push('/')
        return
      }
      
      // Switch to sign in form with success message
      setPassword('')
      setIsSignUp(false)
      setShowSignInPrompt(true)
      setError(null)
      setLoading(false)
    } else {
      setLoading(false)
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!validateEmail(email)) {
      setEmailError('Please use a valid email format (e.g., name@example.com)')
      setLoading(false)
      return
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(getErrorMessage(error))
    } else {
      router.push('/')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 sm:mb-10">
          <div className="w-32 h-32 sm:w-40 sm:h-40 mx-auto mb-6 sm:mb-8 flex items-center justify-center rounded-2xl sm:rounded-3xl overflow-hidden shadow-medium">
            <Image
              src="/logo-bg.png"
              alt="Goal Tracker Logo"
              width={160}
              height={160}
              className="object-contain w-full h-full"
              priority
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 tracking-tight">Goal Tracker</h1>
          <p className="text-sm sm:text-base text-gray-500 font-medium">
            {isSignUp ? 'Create your account' : 'Sign in to your account'}
          </p>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-medium border border-gray-100">
          {showSignInPrompt && !isSignUp && (
            <div className="mb-4 sm:mb-5 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
              <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-semibold text-green-900 mb-1">Account Created!</p>
                <p className="text-sm text-green-700">Please sign in to continue.</p>
              </div>
              <button
                onClick={() => setShowSignInPrompt(false)}
                className="text-green-600 hover:text-green-800 flex-shrink-0"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
          {error && (
            <div className="mb-4 sm:mb-5 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-900 mb-1">Error</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-600 hover:text-red-800 flex-shrink-0"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
          <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4 sm:space-y-5">
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
                  className="w-full px-4 py-3 text-base sm:text-sm rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all touch-manipulation"
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
                onChange={(e) => {
                  const emailValue = e.target.value
                  setEmail(emailValue)
                  setError(null)
                  if (emailValue.length === 0) {
                    setEmailError(null)
                  } else if (!validateEmail(emailValue)) {
                    setEmailError('Please use a valid email format (e.g., name@example.com)')
                  } else {
                    setEmailError(null)
                  }
                }}
                onBlur={(e) => {
                  if (e.target.value.length === 0) {
                    setEmailError(null)
                  } else if (!validateEmail(e.target.value)) {
                    setEmailError('Please use a valid email format (e.g., name@example.com)')
                  } else {
                    setEmailError(null)
                  }
                }}
                className={`w-full px-4 py-3 text-base sm:text-sm rounded-xl border transition-all touch-manipulation focus:outline-none focus:ring-2 focus:border-transparent ${
                  emailError
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-pink-500'
                }`}
                placeholder="you@example.com"
              />
              {emailError && (
                <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {emailError}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError(null)
                }}
                className={`w-full px-4 py-3 text-base sm:text-sm rounded-xl border transition-all touch-manipulation focus:outline-none focus:ring-2 focus:border-transparent ${
                  isSignUp && password.length > 0
                    ? isPasswordValid
                      ? 'border-green-300 focus:ring-green-500'
                      : 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-pink-500'
                }`}
                placeholder="••••••••"
              />
              {isSignUp && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs font-semibold text-gray-700 mb-2">Password Requirements:</p>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                        passwordRules.minLength ? 'bg-green-500' : 'bg-gray-300'
                      }`}>
                        {passwordRules.minLength && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className={`text-xs ${passwordRules.minLength ? 'text-green-700 font-semibold' : 'text-gray-600'}`}>
                        At least 8 characters
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                        passwordRules.hasUpperCase ? 'bg-green-500' : 'bg-gray-300'
                      }`}>
                        {passwordRules.hasUpperCase && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className={`text-xs ${passwordRules.hasUpperCase ? 'text-green-700 font-semibold' : 'text-gray-600'}`}>
                        One uppercase letter
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                        passwordRules.hasLowerCase ? 'bg-green-500' : 'bg-gray-300'
                      }`}>
                        {passwordRules.hasLowerCase && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className={`text-xs ${passwordRules.hasLowerCase ? 'text-green-700 font-semibold' : 'text-gray-600'}`}>
                        One lowercase letter
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                        passwordRules.hasNumber ? 'bg-green-500' : 'bg-gray-300'
                      }`}>
                        {passwordRules.hasNumber && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className={`text-xs ${passwordRules.hasNumber ? 'text-green-700 font-semibold' : 'text-gray-600'}`}>
                        One number
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                        passwordRules.hasSpecialChar ? 'bg-green-500' : 'bg-gray-300'
                      }`}>
                        {passwordRules.hasSpecialChar && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className={`text-xs ${passwordRules.hasSpecialChar ? 'text-green-700 font-semibold' : 'text-gray-600'}`}>
                        One special character (!@#$%^&*...)
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-600 to-pink-700 text-white py-3.5 sm:py-4 px-4 rounded-xl font-semibold text-sm sm:text-base shadow-medium hover:shadow-strong active:scale-95 hover:from-pink-700 hover:to-pink-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 touch-manipulation min-h-[48px]"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <LoadingSpinner size="sm" color="white" />
                  <span>Loading...</span>
                </span>
              ) : (
                isSignUp ? 'Sign Up' : 'Sign In'
              )}
            </button>
          </form>

          <div className="mt-5 sm:mt-6 text-center">
            <p className="text-gray-600 text-xs sm:text-sm mb-2">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            </p>
            <button
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError(null)
                setEmailError(null)
                setShowSignInPrompt(false)
              }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-medium hover:shadow-strong active:scale-95 transition-all duration-200 touch-manipulation"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
