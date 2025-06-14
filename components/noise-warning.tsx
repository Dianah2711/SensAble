"use client"

import { useEffect, useState } from "react"
import { AlertTriangle } from "lucide-react"

interface NoiseWarningProps {
  isHighNoise: boolean
  noiseLevel: number
  threshold: number
}

export default function NoiseWarning({ isHighNoise, noiseLevel, threshold }: NoiseWarningProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [flashCount, setFlashCount] = useState(0)

  useEffect(() => {
    if (isHighNoise) {
      setIsVisible(true)
      setFlashCount(0)

      // Flash animation
      const flashInterval = setInterval(() => {
        setFlashCount((prev) => prev + 1)
      }, 500)

      return () => clearInterval(flashInterval)
    } else {
      setIsVisible(false)
      setFlashCount(0)
    }
  }, [isHighNoise])

  if (!isVisible) return null

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
        flashCount % 2 === 0 ? "bg-red-600" : "bg-red-700"
      }`}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl max-w-md mx-4 text-center animate-bounce">
        <div className="w-20 h-20 bg-red-100 rounded-full mx-auto flex items-center justify-center mb-6">
          <AlertTriangle className="w-12 h-12 text-red-600" />
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-red-600 mb-4">HIGH NOISE DETECTED</h1>

        <div className="space-y-3 mb-6">
          <p className="text-xl font-semibold text-slate-800">{Math.round(noiseLevel)} dB</p>
          <p className="text-slate-600">Noise level exceeds {threshold} dB threshold</p>
        </div>

        {/* Visual noise level indicator */}
        <div className="w-full bg-slate-200 rounded-full h-4 mb-4 overflow-hidden">
          <div
            className="h-full bg-red-500 transition-all duration-300 animate-pulse"
            style={{ width: `${Math.min(100, (noiseLevel / 100) * 100)}%` }}
            aria-label={`Noise level at ${Math.round(noiseLevel)} percent of maximum`}
          />
        </div>

        {/* Pulsing sound waves */}
        <div className="flex justify-center space-x-2 mb-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 bg-red-500 rounded-full animate-pulse"
              style={{
                height: `${20 + (noiseLevel / 100) * 30}px`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>

        <p className="text-sm text-slate-500">Warning will disappear when noise level drops below {threshold} dB</p>
      </div>
    </div>
  )
}
