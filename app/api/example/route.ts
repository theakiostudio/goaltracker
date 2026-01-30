// Example API route for Render backend (if needed)
// This is optional - most functionality is handled by Supabase client-side

import { NextResponse } from 'next/server'

export async function GET() {
  // Example: You can add custom backend logic here
  // For example, webhooks, third-party integrations, etc.
  
  return NextResponse.json({ 
    message: 'API route example',
    timestamp: new Date().toISOString()
  })
}

export async function POST(request: Request) {
  const body = await request.json()
  
  // Example: Process data server-side
  // This could be useful for sensitive operations
  
  return NextResponse.json({ 
    success: true,
    data: body
  })
}
