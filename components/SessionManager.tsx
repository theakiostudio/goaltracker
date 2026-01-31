'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function SessionManager() {
  useEffect(() => {
    // Set up auto-refresh to keep sessions active
    const refreshInterval = setInterval(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          // Refresh the session to keep it active
          await supabase.auth.refreshSession()
        }
      } catch (error) {
        console.error('Error refreshing session:', error)
      }
    }, 30 * 60 * 1000) // Refresh every 30 minutes

    // Refresh session when page becomes visible
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        try {
          const { data: { session } } = await supabase.auth.getSession()
          if (session) {
            await supabase.auth.refreshSession()
          }
        } catch (error) {
          console.error('Error refreshing session on visibility change:', error)
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Initial session check and refresh
    const initialRefresh = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          // Check if session is close to expiring (within 1 hour)
          const expiresAt = session.expires_at
          if (expiresAt) {
            const expiresIn = expiresAt - Math.floor(Date.now() / 1000)
            // If expires in less than 1 hour, refresh it
            if (expiresIn < 3600) {
              await supabase.auth.refreshSession()
            }
          }
        }
      } catch (error) {
        console.error('Error in initial session refresh:', error)
      }
    }

    initialRefresh()

    // Cleanup
    return () => {
      clearInterval(refreshInterval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  // This component doesn't render anything
  return null
}
