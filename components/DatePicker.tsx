'use client'

import { useState, useRef, useEffect } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, getDay, startOfWeek, endOfWeek } from 'date-fns'

interface DatePickerProps {
  value: string
  onChange: (date: string) => void
  label: string
  required?: boolean
  minDate?: string
}

export default function DatePicker({ value, onChange, label, required = false, minDate }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(value ? new Date(value) : new Date())
  const pickerRef = useRef<HTMLDivElement>(null)

  const selectedDate = value ? new Date(value) : null
  const today = new Date()
  const minDateObj = minDate ? new Date(minDate) : null

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }) // Monday
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const daysInMonth = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  const handleDateSelect = (date: Date) => {
    if (minDateObj && date < minDateObj) {
      return // Don't allow dates before minDate
    }
    onChange(format(date, 'yyyy-MM-dd'))
    setIsOpen(false)
  }

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const handleToday = () => {
    const todayDate = new Date()
    if (!minDateObj || todayDate >= minDateObj) {
      handleDateSelect(todayDate)
    }
  }

  const handleClear = () => {
    onChange('')
    setIsOpen(false)
  }

  const isDateDisabled = (date: Date) => {
    return minDateObj ? date < minDateObj : false
  }

  const isDateInCurrentMonth = (date: Date) => {
    return isSameMonth(date, currentMonth)
  }

  return (
    <div className="relative" ref={pickerRef}>
      <label className="block text-sm font-semibold text-gray-800 mb-2">
        {label} {required && <span className="text-pink-600">*</span>}
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-3 text-base sm:text-sm rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all touch-manipulation text-left flex items-center justify-between hover:border-pink-300 hover:shadow-soft group"
        >
          <span className={value ? 'text-gray-900 font-medium' : 'text-gray-400'}>
            {value ? format(new Date(value), 'MMM d, yyyy') : 'Select a date'}
          </span>
          <svg
            className={`w-5 h-5 text-gray-400 group-hover:text-pink-600 transition-transform duration-200 ${isOpen ? 'rotate-180 text-pink-600' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute z-50 mt-2 w-full sm:w-auto bg-white rounded-2xl shadow-strong border border-gray-100 overflow-hidden transform transition-all duration-200 ease-out opacity-100 scale-100 translate-y-0">
            {/* Calendar Header */}
            <div className="bg-gradient-to-r from-pink-600 to-pink-700 text-white p-4">
              <div className="flex items-center justify-between mb-3">
                <button
                  type="button"
                  onClick={handlePreviousMonth}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors touch-manipulation active:scale-95"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h3 className="text-lg font-bold">
                  {format(currentMonth, 'MMMM yyyy')}
                </h3>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors touch-manipulation active:scale-95"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleToday}
                  className="flex-1 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold py-2 px-3 rounded-lg transition-colors touch-manipulation active:scale-95"
                >
                  Today
                </button>
                {value && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="flex-1 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold py-2 px-3 rounded-lg transition-colors touch-manipulation active:scale-95"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="p-4">
              {/* Week Days Header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="text-center text-xs font-semibold text-gray-500 py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {daysInMonth.map((date, index) => {
                  const isSelected = selectedDate && isSameDay(date, selectedDate)
                  const isToday = isSameDay(date, today)
                  const isDisabled = isDateDisabled(date)
                  const isOtherMonth = !isDateInCurrentMonth(date)

                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => !isDisabled && handleDateSelect(date)}
                      disabled={isDisabled}
                      className={`
                        aspect-square p-2 rounded-xl text-sm font-medium transition-all duration-200 touch-manipulation
                        ${isOtherMonth ? 'text-gray-300' : 'text-gray-700'}
                        ${isToday && !isSelected ? 'bg-pink-50 text-pink-700 font-bold border-2 border-pink-300' : ''}
                        ${isSelected ? 'bg-gradient-to-br from-pink-600 to-pink-700 text-white font-bold shadow-medium scale-105' : ''}
                        ${!isSelected && !isToday && !isOtherMonth && !isDisabled ? 'hover:bg-pink-50 hover:text-pink-700 hover:scale-105' : ''}
                        ${isDisabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer active:scale-95'}
                      `}
                    >
                      {format(date, 'd')}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
