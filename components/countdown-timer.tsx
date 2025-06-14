"use client"

import { useState, useEffect, useRef } from "react"
import { Timer, Play, Pause, Square } from "lucide-react"

interface CountdownTimerProps {
  onTimerComplete: () => void
}

export default function CountdownTimer({ onTimerComplete }: CountdownTimerProps) {
  const [minutes, setMinutes] = useState(5)
  const [seconds, setSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false)
            onTimerComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, timeLeft, onTimerComplete])

  const startTimer = () => {
    const totalSeconds = minutes * 60 + seconds
    if (totalSeconds > 0) {
      setTimeLeft(totalSeconds)
      setIsRunning(true)
    }
  }

  const pauseTimer = () => {
    setIsRunning(false)
  }

  const stopTimer = () => {
    setIsRunning(false)
    setTimeLeft(0)
  }

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getProgress = () => {
    const totalTime = minutes * 60 + seconds
    if (totalTime === 0) return 0
    return ((totalTime - timeLeft) / totalTime) * 100
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
        <Timer className="w-6 h-6" />
        Countdown Timer
      </h2>

      {/* Timer Display */}
      <div className="text-center mb-6">
        <div className="bg-slate-900 text-white rounded-xl p-6 mb-4">
          <p className="text-sm text-slate-300 mb-1">{timeLeft > 0 ? "Time Remaining" : "Set Timer"}</p>
          <p className="text-4xl md:text-5xl font-mono font-bold">
            {timeLeft > 0 ? formatTime(timeLeft) : formatTime(minutes * 60 + seconds)}
          </p>
        </div>

        {/* Progress Bar */}
        {timeLeft > 0 && (
          <div className="w-full bg-slate-200 rounded-full h-3 mb-4">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-1000"
              style={{ width: `${getProgress()}%` }}
              role="progressbar"
              aria-valuenow={getProgress()}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Timer progress: ${Math.round(getProgress())}%`}
            />
          </div>
        )}
      </div>

      {/* Timer Input */}
      {timeLeft === 0 && (
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="timer-minutes" className="block text-sm font-medium text-slate-700 mb-2">
                Minutes
              </label>
              <input
                type="number"
                id="timer-minutes"
                min="0"
                max="60"
                value={minutes}
                onChange={(e) => setMinutes(Math.max(0, Number.parseInt(e.target.value) || 0))}
                className="w-full p-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent text-center text-lg"
                aria-label="Timer minutes"
              />
            </div>
            <div>
              <label htmlFor="timer-seconds" className="block text-sm font-medium text-slate-700 mb-2">
                Seconds
              </label>
              <input
                type="number"
                id="timer-seconds"
                min="0"
                max="59"
                value={seconds}
                onChange={(e) => setSeconds(Math.max(0, Math.min(59, Number.parseInt(e.target.value) || 0)))}
                className="w-full p-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent text-center text-lg"
                aria-label="Timer seconds"
              />
            </div>
          </div>

          {/* Quick Set Buttons */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "1m", time: [1, 0] },
              { label: "5m", time: [5, 0] },
              { label: "10m", time: [10, 0] },
              { label: "15m", time: [15, 0] },
            ].map((preset) => (
              <button
                key={preset.label}
                onClick={() => {
                  setMinutes(preset.time[0])
                  setSeconds(preset.time[1])
                }}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
                aria-label={`Set timer to ${preset.label}`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex gap-3">
        {timeLeft === 0 ? (
          <button
            onClick={startTimer}
            disabled={minutes === 0 && seconds === 0}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white py-3 px-6 rounded-xl font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 flex items-center justify-center gap-2"
            aria-label="Start countdown timer"
          >
            <Play className="w-5 h-5" />
            Start Timer
          </button>
        ) : (
          <>
            <button
              onClick={isRunning ? pauseTimer : () => setIsRunning(true)}
              className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-3 px-6 rounded-xl font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-offset-2 flex items-center justify-center gap-2"
              aria-label={isRunning ? "Pause timer" : "Resume timer"}
            >
              {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              {isRunning ? "Pause" : "Resume"}
            </button>
            <button
              onClick={stopTimer}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-xl font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-2 flex items-center justify-center gap-2"
              aria-label="Stop timer"
            >
              <Square className="w-5 h-5" />
              Stop
            </button>
          </>
        )}
      </div>

      {/* Status */}
      {timeLeft > 0 && (
        <div
          className={`mt-4 p-3 rounded-lg text-center ${
            isRunning ? "bg-blue-50 text-blue-800" : "bg-yellow-50 text-yellow-800"
          }`}
        >
          <p className="font-medium">{isRunning ? "Timer Running" : "Timer Paused"}</p>
        </div>
      )}
    </div>
  )
}
