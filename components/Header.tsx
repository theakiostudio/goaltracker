'use client'

import Image from 'next/image'

interface HeaderProps {
  onSignOut: () => void
}

export default function Header({ onSignOut }: HeaderProps) {
  return (
    <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between shadow-soft">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-lg overflow-hidden flex-shrink-0">
          <Image
            src="/logo-bg.png"
            alt="Goal Tracker Logo"
            width={48}
            height={48}
            className="object-contain w-full h-full"
            priority
            unoptimized
          />
        </div>
        <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight truncate">Goal Tracker</h1>
      </div>
      <button
        onClick={onSignOut}
        className="text-gray-600 hover:text-gray-900 text-xs sm:text-sm font-medium transition-colors duration-200 px-2 sm:px-3 py-1.5 rounded-lg hover:bg-gray-50 flex-shrink-0 touch-manipulation"
      >
        Sign out
      </button>
    </div>
  )
}
