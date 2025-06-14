"use client"

import { useState } from "react"
import { Clock, Play, Square } from "lucide-react"

interface AlarmSetterProps {
  onAlarmSet: (time: string) => void
  onAlarmCancel: () => void
  isAlarmActive: boolean
}

export default function AlarmSetter({ onAlarmSet, onAlarmCancel, isAlarmActive }: AlarmSetterProps) {
  const [alarmTime, setAlarmTime] = useState("")
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString())

  // Update current time every second
  useState(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString())
    }, 1000)
    return () => clearInterval(interval)
  })

  const handleSetAlarm = () => {
    if (alarmTime) {
      onAlarmSet(alarmTime)
    }
  }

  const handleCancelAlarm = () => {
    onAlarmCancel()
    setAlarmTime("")
  }

  const getCurrentTimeForInput = () => {
    const now = new Date()
    const hours = now.getHours().toString().padStart(2, "0")
    const minutes = now.getMinutes().toString().padStart(2, "0")
    return `${hours}:${minutes}`
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
        <Clock className="w-6 h-6" />
        Visual Alarm Clock
      </h2>

      {/* Current Time Display */}
      <div className="text-center mb-6">
        <div className="bg-slate-900 text-white rounded-xl p-6">
          <p className="text-sm text-slate-300 mb-1">Current Time</p>
          <p className="text-3xl md:text-4xl font-mono font-bold">{currentTime}</p>
        </div>
      </div>

      {/* Alarm Setting */}
      <div className="space-y-4">
        <div>
          <label htmlFor="alarm-time" className="block text-sm font-medium text-slate-700 mb-2">
            Set Alarm Time
          </label>
          <input
            type="time"
            id="alarm-time"
            value={alarmTime}
            onChange={(e) => setAlarmTime(e.target.value)}
            className="w-full p-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent text-lg"
            aria-describedby="alarm-time-help"
          />
          <p id="alarm-time-help" className="text-sm text-slate-500 mt-1">
            Select the time when you want the alarm to trigger
          </p>
        </div>

        {/* Quick Set Buttons */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "5 min", minutes: 5 },
            { label: "15 min", minutes: 15 },
            { label: "30 min", minutes: 30 },
          ].map((preset) => (
            <button
              key={preset.minutes}
              onClick={() => {
                const now = new Date()
                now.setMinutes(now.getMinutes() + preset.minutes)
                const hours = now.getHours().toString().padStart(2, "0")
                const minutes = now.getMinutes().toString().padStart(2, "0")
                setAlarmTime(`${hours}:${minutes}`)
              }}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
              aria-label={`Set alarm for ${preset.minutes} minutes from now`}
            >
              +{preset.label}
            </button>
          ))}
        </div>

        {/* Control Buttons */}
        <div className="flex gap-3">
          {!isAlarmActive ? (
            <button
              onClick={handleSetAlarm}
              disabled={!alarmTime}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white py-3 px-6 rounded-xl font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-green-300 focus:ring-offset-2 flex items-center justify-center gap-2"
              aria-label="Set alarm"
            >
              <Play className="w-5 h-5" />
              Set Alarm
            </button>
          ) : (
            <button
              onClick={handleCancelAlarm}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-xl font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-2 flex items-center justify-center gap-2"
              aria-label="Cancel alarm"
            >
              <Square className="w-5 h-5" />
              Cancel Alarm
            </button>
          )}
        </div>

        {/* Alarm Status */}
        {isAlarmActive && alarmTime && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <p className="text-green-800 font-medium">Alarm set for {alarmTime}</p>
            <p className="text-green-600 text-sm mt-1">
              Visual and haptic alerts will activate when the time is reached
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
