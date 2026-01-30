'use client'

import Image from 'next/image'

interface HeaderProps {
  onSignOut: () => void
}

export default function Header({ onSignOut }: HeaderProps) {
  return (
    <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shadow-soft">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-gradient-to-br from-pink-400 to-pink-600 p-1.5 shadow-soft">
          <Image
            src="/logo.png"
            alt="Goal Tracker Logo"
            width={28}
            height={28}
            className="object-contain"
          />
        </div>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Goal Tracker</h1>
      </div>
      <button
        onClick={onSignOut}
        className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors duration-200 px-3 py-1.5 rounded-lg hover:bg-gray-50"
      >
        Sign out
      </button>
    </div>
  )
}
