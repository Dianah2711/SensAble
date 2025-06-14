"use client"

import { useState, useEffect } from "react"
import { MapPin, Navigation, RefreshCw, AlertCircle } from "lucide-react"

interface LocationData {
  latitude: number
  longitude: number
  address: string
  city: string
  country: string
  accuracy: number
}

interface LocationFetcherProps {
  onLocationUpdate: (location: LocationData) => void
  autoSpeak?: boolean
}

export default function LocationFetcher({ onLocationUpdate, autoSpeak = true }: LocationFetcherProps) {
  const [location, setLocation] = useState<LocationData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [permissionStatus, setPermissionStatus] = useState<"unknown" | "granted" | "denied">("unknown")

  useEffect(() => {
    requestLocation()
  }, [])

  const requestLocation = async () => {
    setIsLoading(true)
    setError("")

    try {
      // Check if geolocation is supported
      if (!navigator.geolocation) {
        throw new Error("Geolocation is not supported by this browser")
      }

      // Request location
      const position = await getCurrentPosition()
      const { latitude, longitude, accuracy } = position.coords

      setPermissionStatus("granted")

      // Reverse geocoding (mock implementation)
      const addressData = await reverseGeocode(latitude, longitude)

      const locationData: LocationData = {
        latitude,
        longitude,
        address: addressData.address,
        city: addressData.city,
        country: addressData.country,
        accuracy: accuracy || 0,
      }

      setLocation(locationData)
      onLocationUpdate(locationData)

      if (autoSpeak) {
        speakLocation(locationData)
      }
    } catch (err) {
      setPermissionStatus("denied")
      let errorMessage = "Unable to get your location."

      if (err instanceof GeolocationPositionError) {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = "Location access denied. Please allow location access and try again."
            break
          case err.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable."
            break
          case err.TIMEOUT:
            errorMessage = "Location request timed out. Please try again."
            break
        }
      }

      setError(errorMessage)
      if (autoSpeak) {
        speakText(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000, // 5 minutes
      })
    })
  }

  const reverseGeocode = async (lat: number, lng: number) => {
    // Mock reverse geocoding - in production, use OpenCage Geocoder or similar
    // const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${API_KEY}`)

    // Mock data for demonstration
    const mockAddresses = [
      {
        address: "123 Main Street, Downtown",
        city: "New York",
        country: "United States",
      },
      {
        address: "456 Oak Avenue, City Center",
        city: "Los Angeles",
        country: "United States",
      },
      {
        address: "789 Pine Road, Suburb",
        city: "Chicago",
        country: "United States",
      },
    ]

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return mockAddresses[Math.floor(Math.random() * mockAddresses.length)]
  }

  const speakLocation = (locationData: LocationData) => {
    const locationText = `Your current location is: ${locationData.address}, ${locationData.city}, ${locationData.country}. Coordinates: ${locationData.latitude.toFixed(4)} latitude, ${locationData.longitude.toFixed(4)} longitude.`
    speakText(locationText)
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

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
          <Navigation className="w-6 h-6" />
          Location Information
        </h2>
        <button
          onClick={requestLocation}
          disabled={isLoading}
          className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
          aria-label="Refresh location information"
        >
          <RefreshCw className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {isLoading && (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-blue-200 rounded-full mx-auto flex items-center justify-center mb-4">
            <div className="w-6 h-6 bg-blue-600 rounded-full animate-ping"></div>
          </div>
          <p className="text-slate-600">Getting your location...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-600 font-medium">{error}</p>
              <button
                onClick={requestLocation}
                className="mt-2 text-red-600 hover:text-red-700 underline focus:outline-none focus:ring-2 focus:ring-red-300 rounded"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {location && !isLoading && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-5 h-5 text-green-600" />
              <p className="font-medium text-green-800">Location Found</p>
            </div>
            <div className="space-y-2">
              <p className="text-slate-800 font-medium">{location.address}</p>
              <p className="text-slate-600">
                {location.city}, {location.country}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-sm text-slate-600">Latitude</p>
              <p className="text-sm font-mono font-semibold text-slate-800">{location.latitude.toFixed(6)}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-sm text-slate-600">Longitude</p>
              <p className="text-sm font-mono font-semibold text-slate-800">{location.longitude.toFixed(6)}</p>
            </div>
          </div>

          {location.accuracy > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
              <p className="text-sm text-blue-600">Accuracy: ±{Math.round(location.accuracy)} meters</p>
            </div>
          )}

          <button
            onClick={() => speakLocation(location)}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green-300 focus:ring-offset-2"
            aria-label="Read location information aloud"
          >
            🔊 Read Location Aloud
          </button>
        </div>
      )}
    </div>
  )
}
