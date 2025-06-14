"use client"

import { useState, useEffect } from "react"
import { Clock, Calendar, Volume2 } from "lucide-react"

interface TimeDisplayProps {
  autoSpeak?: boolean
}

export default function TimeDisplay({ autoSpeak = true }: TimeDisplayProps) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [hasSpoken, setHasSpoken] = useState(false)

  useEffect(() => {
    // Update time every second
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Speak time and date on component mount
    if (autoSpeak && !hasSpoken) {
      speakTimeAndDate()
      setHasSpoken(true)
    }
  }, [autoSpeak, hasSpoken])

  const speakTimeAndDate = () => {
    const timeText = formatTimeForSpeech(currentTime)
    const dateText = formatDateForSpeech(currentTime)
    const fullText = `Current time: ${timeText}. Today's date: ${dateText}.`
    speakText(fullText)
  }

  const speakText = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.8
      utterance.volume = 1
      window.speechSynthesis.speak(utterance)
    }
  }

  const formatTimeForSpeech = (date: Date) => {
    const hours = date.getHours()
    const minutes = date.getMinutes()
    const ampm = hours >= 12 ? "PM" : "AM"
    const displayHours = hours % 12 || 12

    if (minutes === 0) {
      return `${displayHours} ${ampm}`
    } else if (minutes < 10) {
      return `${displayHours} oh ${minutes} ${ampm}`
    } else {
      return `${displayHours} ${minutes} ${ampm}`
    }
  }

  const formatDateForSpeech = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }
    return date.toLocaleDateString("en-US", options)
  }

  const formatTimeForDisplay = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    })
  }

  const formatDateForDisplay = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
        <Clock className="w-6 h-6" />
        Current Date & Time
      </h2>

      <div className="space-y-6">
        {/* Time Display */}
        <div className="text-center">
          <div className="bg-slate-900 text-white rounded-xl p-6 mb-4">
            <p className="text-sm text-slate-300 mb-1">Current Time</p>
            <p className="text-4xl md:text-5xl font-mono font-bold" aria-live="polite">
              {formatTimeForDisplay(currentTime)}
            </p>
          </div>
        </div>

        {/* Date Display */}
        <div className="text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <p className="text-sm font-medium text-blue-800">Today's Date</p>
            </div>
            <p className="text-lg font-semibold text-slate-800" aria-live="polite">
              {formatDateForDisplay(currentTime)}
            </p>
          </div>
        </div>

        {/* Additional Time Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 rounded-lg p-3 text-center">
            <p className="text-sm text-slate-600">Time Zone</p>
            <p className="text-sm font-semibold text-slate-800">{Intl.DateTimeFormat().resolvedOptions().timeZone}</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 text-center">
            <p className="text-sm text-slate-600">Week Day</p>
            <p className="text-sm font-semibold text-slate-800">
              {currentTime.toLocaleDateString("en-US", { weekday: "long" })}
            </p>
          </div>
        </div>

        {/* Speak Button */}
        <button
          onClick={speakTimeAndDate}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 flex items-center justify-center gap-2"
          aria-label="Read current time and date aloud"
        >
          <Volume2 className="w-5 h-5" />
          Read Time & Date Aloud
        </button>
      </div>
    </div>
  )
}
