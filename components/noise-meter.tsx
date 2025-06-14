"use client"

import { useState, useEffect, useRef } from "react"
import { Volume2, VolumeX } from "lucide-react"

interface NoiseMeterProps {
  audioStream: MediaStream | null
  isMonitoring: boolean
  onNoiseLevel: (level: number) => void
  threshold?: number
}

export default function NoiseMeter({ audioStream, isMonitoring, onNoiseLevel, threshold = 70 }: NoiseMeterProps) {
  const [noiseLevel, setNoiseLevel] = useState(0)
  const [maxLevel, setMaxLevel] = useState(0)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number>()

  useEffect(() => {
    if (audioStream && isMonitoring) {
      startMonitoring()
    } else {
      stopMonitoring()
    }

    return () => stopMonitoring()
  }, [audioStream, isMonitoring])

  const startMonitoring = async () => {
    if (!audioStream) return

    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      const source = audioContextRef.current.createMediaStreamSource(audioStream)

      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 256
      analyserRef.current.smoothingTimeConstant = 0.8

      source.connect(analyserRef.current)

      measureNoise()
    } catch (error) {
      console.error("Error starting noise monitoring:", error)
    }
  }

  const stopMonitoring = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }

    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }

    analyserRef.current = null
    setNoiseLevel(0)
  }

  const measureNoise = () => {
    if (!analyserRef.current) return

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
    analyserRef.current.getByteFrequencyData(dataArray)

    // Calculate RMS (Root Mean Square) for more accurate volume measurement
    let sum = 0
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i] * dataArray[i]
    }
    const rms = Math.sqrt(sum / dataArray.length)

    // Convert to approximate decibel level (simplified calculation)
    const decibels = Math.max(0, Math.min(100, (rms / 255) * 100))

    setNoiseLevel(decibels)
    setMaxLevel((prev) => Math.max(prev, decibels))
    onNoiseLevel(decibels)

    animationFrameRef.current = requestAnimationFrame(measureNoise)
  }

  const resetMaxLevel = () => {
    setMaxLevel(0)
  }

  const getNoiseLevelColor = (level: number) => {
    if (level < 30) return "bg-green-500"
    if (level < 50) return "bg-yellow-500"
    if (level < threshold) return "bg-orange-500"
    return "bg-red-500"
  }

  const getNoiseLevelText = (level: number) => {
    if (level < 30) return "Quiet"
    if (level < 50) return "Moderate"
    if (level < threshold) return "Loud"
    return "Very Loud"
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
          <Volume2 className="w-6 h-6" />
          Noise Level Monitor
        </h2>
        <button
          onClick={resetMaxLevel}
          className="text-sm text-slate-600 hover:text-blue-600 underline focus:outline-none focus:ring-2 focus:ring-blue-300 rounded"
          aria-label="Reset maximum level"
        >
          Reset Max
        </button>
      </div>

      {/* Current Level Display */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-700">Current Level</span>
          <span className="text-lg font-bold text-slate-800">{Math.round(noiseLevel)} dB</span>
        </div>

        {/* Noise Level Bar */}
        <div className="relative w-full h-8 bg-slate-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-150 ${getNoiseLevelColor(noiseLevel)}`}
            style={{ width: `${noiseLevel}%` }}
            role="progressbar"
            aria-valuenow={noiseLevel}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Noise level: ${Math.round(noiseLevel)} decibels`}
          />

          {/* Threshold Marker */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-red-800 opacity-75"
            style={{ left: `${threshold}%` }}
            aria-label={`Threshold at ${threshold} decibels`}
          />
        </div>

        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>0 dB</span>
          <span className="text-red-600 font-medium">{threshold} dB (Threshold)</span>
          <span>100 dB</span>
        </div>
      </div>

      {/* Status and Max Level */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-slate-50 rounded-lg">
          <p className="text-sm text-slate-600">Status</p>
          <p className={`font-semibold ${noiseLevel >= threshold ? "text-red-600" : "text-green-600"}`}>
            {getNoiseLevelText(noiseLevel)}
          </p>
        </div>

        <div className="text-center p-3 bg-slate-50 rounded-lg">
          <p className="text-sm text-slate-600">Max Level</p>
          <p className="font-semibold text-slate-800">{Math.round(maxLevel)} dB</p>
        </div>
      </div>

      {/* Visual Indicators */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { range: "0-30", color: "bg-green-500", active: noiseLevel >= 0 },
          { range: "30-50", color: "bg-yellow-500", active: noiseLevel >= 30 },
          { range: "50-70", color: "bg-orange-500", active: noiseLevel >= 50 },
          { range: "70+", color: "bg-red-500", active: noiseLevel >= 70 },
        ].map((indicator, index) => (
          <div
            key={index}
            className={`h-3 rounded-full transition-opacity ${indicator.active ? indicator.color : "bg-slate-200"}`}
            aria-label={`${indicator.range} dB range ${indicator.active ? "active" : "inactive"}`}
          />
        ))}
      </div>

      {!isMonitoring && (
        <div className="mt-4 text-center text-slate-500">
          <VolumeX className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Monitoring stopped</p>
        </div>
      )}
    </div>
  )
}
