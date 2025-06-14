"use client"

interface LoadingSpinnerProps {
  message?: string
  size?: "sm" | "md" | "lg"
}

export default function LoadingSpinner({ message = "Loading...", size = "md" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  }

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  }

  return (
    <div className="flex flex-col items-center justify-center py-12" role="status" aria-live="polite">
      <div className="relative">
        <div
          className={`${sizeClasses[size]} bg-blue-200 rounded-full flex items-center justify-center mb-4 animate-pulse`}
        >
          <div className={`${sizeClasses[size]} bg-blue-600 rounded-full animate-ping opacity-75`}></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-2xl">🤟</div>
        </div>
      </div>
      <p className={`text-slate-600 font-medium ${textSizeClasses[size]}`}>{message}</p>
      <p className="text-slate-500 text-sm mt-1">Converting text to sign language...</p>
    </div>
  )
}
