import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!')
  console.error('Please create a .env.local file with:')
  console.error('NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url')
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key')
  throw new Error('Missing Supabase environment variables. See console for details.')
}

// Validate URL format
if (!supabaseUrl.startsWith('http://') && !supabaseUrl.startsWith('https://')) {
  console.error('❌ Invalid Supabase URL format!')
  console.error('URL must start with http:// or https://')
  console.error('Current value:', supabaseUrl)
  throw new Error('Invalid Supabase URL format. Must be a valid HTTP or HTTPS URL.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
