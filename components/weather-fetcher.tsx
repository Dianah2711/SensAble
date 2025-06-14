"use client"

import { useState, useEffect } from "react"
import { Cloud, Sun, CloudRain, Thermometer, MapPin, RefreshCw } from "lucide-react"

interface WeatherData {
  temperature: number
  condition: string
  description: string
  location: string
  humidity: number
  windSpeed: number
}

interface WeatherFetcherProps {
  onWeatherUpdate: (weather: WeatherData) => void
  autoSpeak?: boolean
}

export default function WeatherFetcher({ onWeatherUpdate, autoSpeak = true }: WeatherFetcherProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>("")

  // Placeholder API key - in production, this would be in environment variables
  const API_KEY = "your_openweathermap_api_key"

  useEffect(() => {
    fetchWeather()
  }, [])

  const fetchWeather = async () => {
    setIsLoading(true)
    setError("")

    try {
      // Get user's location first
      const position = await getCurrentPosition()
      const { latitude, longitude } = position.coords

      // In production, this would call the actual OpenWeatherMap API
      // For now, we'll simulate the API response
      const mockWeatherData: WeatherData = {
        temperature: Math.round(15 + Math.random() * 20), // Random temp between 15-35°C
        condition: ["Sunny", "Cloudy", "Partly Cloudy", "Light Rain"][Math.floor(Math.random() * 4)],
        description: "Clear sky with gentle breeze",
        location: "Current Location",
        humidity: Math.round(40 + Math.random() * 40), // 40-80%
        windSpeed: Math.round(5 + Math.random() * 15), // 5-20 km/h
      }

      setWeather(mockWeatherData)
      onWeatherUpdate(mockWeatherData)

      if (autoSpeak) {
        speakWeather(mockWeatherData)
      }
    } catch (err) {
      const errorMessage = "Unable to fetch weather information. Please check your location settings."
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
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported"))
        return
      }

      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      })
    })
  }

  const speakWeather = (weatherData: WeatherData) => {
    const weatherText = `Current weather: ${weatherData.temperature} degrees Celsius, ${weatherData.condition}. ${weatherData.description}. Humidity ${weatherData.humidity} percent, wind speed ${weatherData.windSpeed} kilometers per hour.`
    speakText(weatherText)
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

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case "sunny":
      case "clear":
        return <Sun className="w-8 h-8 text-yellow-500" />
      case "cloudy":
      case "overcast":
        return <Cloud className="w-8 h-8 text-gray-500" />
      case "partly cloudy":
        return <Cloud className="w-8 h-8 text-blue-400" />
      case "light rain":
      case "rain":
        return <CloudRain className="w-8 h-8 text-blue-600" />
      default:
        return <Cloud className="w-8 h-8 text-gray-400" />
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
          <Thermometer className="w-6 h-6" />
          Weather Information
        </h2>
        <button
          onClick={fetchWeather}
          disabled={isLoading}
          className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
          aria-label="Refresh weather information"
        >
          <RefreshCw className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {isLoading && (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-blue-200 rounded-full mx-auto flex items-center justify-center mb-4">
            <div className="w-6 h-6 bg-blue-600 rounded-full animate-ping"></div>
          </div>
          <p className="text-slate-600">Fetching weather information...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <p className="text-red-600 font-medium">{error}</p>
          <button
            onClick={fetchWeather}
            className="mt-2 text-red-600 hover:text-red-700 underline focus:outline-none focus:ring-2 focus:ring-red-300 rounded"
          >
            Try Again
          </button>
        </div>
      )}

      {weather && !isLoading && (
        <div className="space-y-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-4 mb-4">
              {getWeatherIcon(weather.condition)}
              <div>
                <p className="text-3xl font-bold text-slate-800">{weather.temperature}°C</p>
                <p className="text-slate-600">{weather.condition}</p>
              </div>
            </div>
            <p className="text-slate-700 mb-2">{weather.description}</p>
            <div className="flex items-center justify-center gap-1 text-slate-500 text-sm">
              <MapPin className="w-4 h-4" />
              <span>{weather.location}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-lg p-3 text-center">
              <p className="text-sm text-slate-600">Humidity</p>
              <p className="text-lg font-semibold text-slate-800">{weather.humidity}%</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 text-center">
              <p className="text-sm text-slate-600">Wind Speed</p>
              <p className="text-lg font-semibold text-slate-800">{weather.windSpeed} km/h</p>
            </div>
          </div>

          <button
            onClick={() => speakWeather(weather)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2"
            aria-label="Read weather information aloud"
          >
            🔊 Read Weather Aloud
          </button>
        </div>
      )}
    </div>
  )
}
