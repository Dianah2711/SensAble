"use client"

import { useState, useEffect } from "react"
import { Wifi, WifiOff, AlertCircle } from "lucide-react"

interface ApiStatusProps {
  onStatusChange?: (status: "available" | "fallback" | "error") => void
}

export default function ApiStatus({ onStatusChange }: ApiStatusProps) {
  const [status, setStatus] = useState<"checking" | "available" | "fallback" | "error">("checking")
  const [lastChecked, setLastChecked] = useState<Date | null>(null)

  const checkApiStatus = async () => {
    try {
      setStatus("checking")

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "API status check",
          context: "System health check",
        }),
      })

      if (!response.ok) {
        throw new Error("API request failed")
      }

      const data = await response.json()
      const newStatus = data.source === "openai" ? "available" : "fallback"

      setStatus(newStatus)
      setLastChecked(new Date())
      onStatusChange?.(newStatus)
    } catch (error) {
      console.error("API status check failed:", error)
      setStatus("error")
      setLastChecked(new Date())
      onStatusChange?.("error")
    }
  }

  useEffect(() => {
    checkApiStatus()

    // Check status every 5 minutes
    const interval = setInterval(checkApiStatus, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const getStatusInfo = () => {
    switch (status) {
      case "checking":
        return {
          icon: <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />,
          text: "Checking...",
          color: "text-blue-600",
          bgColor: "bg-blue-50",
        }
      case "available":
        return {
          icon: <Wifi className="w-4 h-4" />,
          text: "AI Enhanced",
          color: "text-green-600",
          bgColor: "bg-green-50",
        }
      case "fallback":
        return {
          icon: <WifiOff className="w-4 h-4" />,
          text: "Basic Mode",
          color: "text-orange-600",
          bgColor: "bg-orange-50",
        }
      case "error":
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          text: "Offline",
          color: "text-red-600",
          bgColor: "bg-red-50",
        }
    }
  }

  const statusInfo = getStatusInfo()

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${statusInfo.bgColor} ${statusInfo.color}`}>
      {statusInfo.icon}
      <span className="text-sm font-medium">{statusInfo.text}</span>
      {lastChecked && status !== "checking" && (
        <span className="text-xs opacity-75">
          {lastChecked.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      )}
    </div>
  )
}
