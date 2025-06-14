"use client"

import { useEffect, useState } from "react"
import { Bell, Smartphone } from "lucide-react"

interface VisualAlertProps {
  isActive: boolean
  message: string
  onDismiss: () => void
}

export default function VisualAlert({ isActive, message, onDismiss }: VisualAlertProps) {
  const [flashCount, setFlashCount] = useState(0)
  const [isVibrating, setIsVibrating] = useState(false)

  useEffect(() => {
    if (isActive) {
      setFlashCount(0)

      // Screen flashing animation
      const flashInterval = setInterval(() => {
        setFlashCount((prev) => prev + 1)
      }, 500)

      // Haptic feedback (vibration)
      if ("vibrate" in navigator) {
        setIsVibrating(true)
        // Vibrate pattern: vibrate for 1000ms, pause 500ms, repeat
        const vibratePattern = [1000, 500, 1000, 500, 1000, 500]
        navigator.vibrate(vibratePattern)

        // Stop vibration after 10 seconds
        setTimeout(() => {
          navigator.vibrate(0)
          setIsVibrating(false)
        }, 10000)
      }

      return () => {
        clearInterval(flashInterval)
        if ("vibrate" in navigator) {
          navigator.vibrate(0)
        }
        setIsVibrating(false)
      }
    }
  }, [isActive])

  if (!isActive) return null

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-500 ${
        flashCount % 2 === 0
          ? "bg-gradient-to-br from-blue-600 to-purple-600"
          : "bg-gradient-to-br from-purple-600 to-pink-600"
      }`}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      {/* Animated background patterns */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-4 h-4 bg-white rounded-full animate-ping"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${1 + Math.random()}s`,
            }}
          />
        ))}
      </div>

      <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl max-w-lg mx-4 text-center relative z-10 animate-bounce">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mx-auto flex items-center justify-center mb-6 animate-pulse">
          <Bell className="w-12 h-12 text-blue-600 animate-bounce" />
        </div>

        <h1
          className={`text-4xl md:text-5xl font-bold mb-6 animate-pulse ${
            flashCount % 2 === 0 ? "text-blue-600" : "text-purple-600"
          }`}
        >
          {message}
        </h1>

        <div className="space-y-4 mb-8">
          <p className="text-xl font-semibold text-slate-800">Time's Up!</p>
          <p className="text-slate-600">Your alarm or timer has finished</p>
        </div>

        {/* Visual indicators */}
        <div className="flex justify-center space-x-4 mb-6">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2 animate-pulse">
              <span className="text-2xl">👁️</span>
            </div>
            <span className="text-xs text-slate-600">Visual Alert</span>
          </div>

          {isVibrating && (
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-2 animate-bounce">
                <Smartphone className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-xs text-slate-600">Vibrating</span>
            </div>
          )}
        </div>

        {/* Pulsing rings */}
        <div className="relative mb-6">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="absolute inset-0 border-4 border-blue-400 rounded-full animate-ping opacity-30"
              style={{
                animationDelay: `${i * 0.5}s`,
                animationDuration: "2s",
              }}
            />
          ))}
          <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto" />
        </div>

        <button
          onClick={onDismiss}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 px-8 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-offset-2"
          aria-label="Dismiss alarm"
        >
          Dismiss Alarm
        </button>

        <p className="text-xs text-slate-500 mt-4">{isVibrating ? "Device is vibrating" : "Tap to stop the alert"}</p>
      </div>
    </div>
  )
}
