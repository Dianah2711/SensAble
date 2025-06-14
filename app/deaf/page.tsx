"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Play, Square } from "lucide-react"
import MicAccess from "@/components/mic-access"
import NoiseMeter from "@/components/noise-meter"
import NoiseWarning from "@/components/noise-warning"
import AlarmSetter from "@/components/alarm-setter"
import CountdownTimer from "@/components/countdown-timer"
import VisualAlert from "@/components/visual-alert"

export default function DeafUserPage() {
  // Noise Detection State
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null)
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [noiseLevel, setNoiseLevel] = useState(0)
  const [noiseThreshold] = useState(70)
  const [isHighNoise, setIsHighNoise] = useState(false)

  // Alarm State
  const [alarmTime, setAlarmTime] = useState("")
  const [isAlarmActive, setIsAlarmActive] = useState(false)
  const [isAlarmTriggered, setIsAlarmTriggered] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")

  // Check alarm time every second
  useEffect(() => {
    if (isAlarmActive && alarmTime) {
      const interval = setInterval(() => {
        const now = new Date()
        const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`

        if (currentTime === alarmTime) {
          triggerAlarm("WAKE UP!")
          setIsAlarmActive(false)
        }
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [isAlarmActive, alarmTime])

  // Monitor noise level
  useEffect(() => {
    setIsHighNoise(noiseLevel >= noiseThreshold)
  }, [noiseLevel, noiseThreshold])

  const handleMicPermissionGranted = (stream: MediaStream) => {
    setAudioStream(stream)
  }

  const handleMicPermissionDenied = () => {
    setAudioStream(null)
    setIsMonitoring(false)
  }

  const handleStartMonitoring = () => {
    if (audioStream) {
      setIsMonitoring(true)
    }
  }

  const handleStopMonitoring = () => {
    setIsMonitoring(false)
  }

  const handleNoiseLevel = (level: number) => {
    setNoiseLevel(level)
  }

  const handleAlarmSet = (time: string) => {
    setAlarmTime(time)
    setIsAlarmActive(true)
  }

  const handleAlarmCancel = () => {
    setIsAlarmActive(false)
    setAlarmTime("")
  }

  const triggerAlarm = (message: string) => {
    setAlertMessage(message)
    setIsAlarmTriggered(true)
  }

  const handleTimerComplete = () => {
    triggerAlarm("TIME'S UP!")
  }

  const handleDismissAlert = () => {
    setIsAlarmTriggered(false)
    setAlertMessage("")
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 mb-4 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
            aria-label="Go back to home page"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-lg">Back to Home</span>
          </Link>

          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">Assistive Tools for Deaf Users</h1>
          <p className="text-lg text-slate-600">
            Noise level detection and visual alarm systems designed for accessibility
          </p>
        </header>

        {/* Noise Detection Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Noise Level Detector</h2>

          <div className="grid lg:grid-cols-3 gap-6 mb-6">
            <MicAccess
              onPermissionGranted={handleMicPermissionGranted}
              onPermissionDenied={handleMicPermissionDenied}
              isActive={isMonitoring}
            />

            <div className="lg:col-span-2">
              <NoiseMeter
                audioStream={audioStream}
                isMonitoring={isMonitoring}
                onNoiseLevel={handleNoiseLevel}
                threshold={noiseThreshold}
              />
            </div>
          </div>

          {/* Monitoring Controls */}
          <div className="text-center">
            {audioStream && (
              <div className="flex gap-4 justify-center">
                {!isMonitoring ? (
                  <button
                    onClick={handleStartMonitoring}
                    className="bg-green-600 hover:bg-green-700 text-white py-3 px-8 rounded-xl font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-green-300 focus:ring-offset-2 flex items-center gap-2"
                    aria-label="Start noise monitoring"
                  >
                    <Play className="w-5 h-5" />
                    Start Monitoring
                  </button>
                ) : (
                  <button
                    onClick={handleStopMonitoring}
                    className="bg-red-600 hover:bg-red-700 text-white py-3 px-8 rounded-xl font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-2 flex items-center gap-2"
                    aria-label="Stop noise monitoring"
                  >
                    <Square className="w-5 h-5" />
                    Stop Monitoring
                  </button>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Visual Alarm Section */}
        <section>
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Visual Alarm Clock</h2>

          <div className="grid lg:grid-cols-2 gap-6">
            <AlarmSetter onAlarmSet={handleAlarmSet} onAlarmCancel={handleAlarmCancel} isAlarmActive={isAlarmActive} />

            <CountdownTimer onTimerComplete={handleTimerComplete} />
          </div>
        </section>

        {/* Features Info */}
        <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-4">
              <span className="text-2xl">🔊</span>
            </div>
            <h3 className="font-semibold text-slate-800 mb-2">Noise Detection</h3>
            <p className="text-slate-600 text-sm">
              Real-time monitoring of environmental noise levels with visual alerts.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full mx-auto flex items-center justify-center mb-4">
              <span className="text-2xl">⏰</span>
            </div>
            <h3 className="font-semibold text-slate-800 mb-2">Visual Alarms</h3>
            <p className="text-slate-600 text-sm">
              Set alarms with screen flashing and haptic feedback instead of sound.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full mx-auto flex items-center justify-center mb-4">
              <span className="text-2xl">📱</span>
            </div>
            <h3 className="font-semibold text-slate-800 mb-2">Haptic Feedback</h3>
            <p className="text-slate-600 text-sm">Device vibration alerts for timers and alarms when supported.</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full mx-auto flex items-center justify-center mb-4">
              <span className="text-2xl">♿</span>
            </div>
            <h3 className="font-semibold text-slate-800 mb-2">Accessible Design</h3>
            <p className="text-slate-600 text-sm">
              Fully accessible interface with ARIA labels and keyboard navigation.
            </p>
          </div>
        </div>
      </div>

      {/* Noise Warning Overlay */}
      <NoiseWarning isHighNoise={isHighNoise} noiseLevel={noiseLevel} threshold={noiseThreshold} />

      {/* Visual Alert Overlay */}
      <VisualAlert isActive={isAlarmTriggered} message={alertMessage} onDismiss={handleDismissAlert} />
    </main>
  )
}
