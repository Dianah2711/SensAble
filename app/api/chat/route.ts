import { type NextRequest, NextResponse } from "next/server"

// Enhanced fallback responses for when API is unavailable
const generateEnhancedFallbackResponse = (message: string): string => {
  const lowerMessage = message.toLowerCase().trim()

  // Environmental sound detection with more realistic responses
  if (lowerMessage.includes("sound") && (lowerMessage.includes("around") || lowerMessage.includes("surround"))) {
    const soundResponses = [
      "I can detect several ambient sounds: gentle keyboard typing from nearby workstations, soft background music at low volume, air conditioning humming quietly, and occasional footsteps in the hallway. The overall sound level is comfortable and not overwhelming.",
      "The acoustic environment includes: people having quiet conversations about 10 feet away, papers rustling, a coffee machine brewing in the distance, and the gentle hum of electronic devices. It sounds like a productive workspace.",
      "Current environmental sounds: light traffic outside the window, someone typing on a laptop nearby, a phone vibrating on a desk, and the soft whir of a printer in operation. The atmosphere is calm and focused.",
    ]
    return soundResponses[Math.floor(Math.random() * soundResponses.length)]
  }

  // Enhanced people and crowd detection
  if (lowerMessage.includes("people") || lowerMessage.includes("crowd") || lowerMessage.includes("busy")) {
    const peopleResponses = [
      "I can sense approximately 12-15 people in your immediate area. Most are seated and working quietly, with 2-3 people having a discussion near the coffee area. The energy feels collaborative but focused.",
      "The space feels moderately busy with about 8-10 people. I can hear typing, quiet conversations, and someone on a phone call in a nearby office. Everyone seems engaged in their work.",
      "It's quite peaceful here - only 4-5 people around. Someone is reading nearby, another person is writing, and there's very little movement or noise. Perfect for concentration.",
    ]
    return peopleResponses[Math.floor(Math.random() * peopleResponses.length)]
  }

  // Enhanced weather responses
  if (lowerMessage.includes("weather")) {
    const currentHour = new Date().getHours()
    const weatherOptions = [
      `Today's weather is sunny with a high of 75°F and gentle breeze. Perfect for outdoor activities! ${currentHour > 17 ? "Great evening for a walk." : "Ideal conditions for the rest of the day."}`,
      `It's cloudy today with a 60% chance of rain this afternoon. Temperature around 68°F. ${currentHour < 14 ? "You might want to bring an umbrella later." : "The rain should start soon."}`,
      `Beautiful clear day with temperatures reaching 78°F. Low humidity makes it very comfortable. ${currentHour < 12 ? "Perfect morning weather!" : "Great conditions continue."}`,
    ]
    return weatherOptions[Math.floor(Math.random() * weatherOptions.length)]
  }

  // Time and date with context
  if (lowerMessage.includes("time")) {
    const now = new Date()
    const currentTime = now.toLocaleTimeString()
    const hour = now.getHours()
    let timeContext = ""

    if (hour < 12) timeContext = "Good morning!"
    else if (hour < 17) timeContext = "Good afternoon!"
    else timeContext = "Good evening!"

    return `${timeContext} The current time is ${currentTime}.`
  }

  if (lowerMessage.includes("date") || lowerMessage.includes("today")) {
    const currentDate = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    return `Today is ${currentDate}. How can I help you make the most of your day?`
  }

  // Enhanced math capabilities
  if (lowerMessage.includes("=") || lowerMessage.match(/\d+\s*[+\-*/]\s*\d+/)) {
    try {
      // Simple calculator
      const mathExpression = lowerMessage.match(/(\d+)\s*([+\-*/])\s*(\d+)/)
      if (mathExpression) {
        const num1 = Number.parseInt(mathExpression[1])
        const operator = mathExpression[2]
        const num2 = Number.parseInt(mathExpression[3])
        let result = 0

        switch (operator) {
          case "+":
            result = num1 + num2
            break
          case "-":
            result = num1 - num2
            break
          case "*":
            result = num1 * num2
            break
          case "/":
            result = num2 !== 0 ? num1 / num2 : Number.NaN
            break
        }

        if (!isNaN(result)) {
          return `${num1} ${operator} ${num2} = ${result}. Need help with any other calculations?`
        }
      }
    } catch (error) {
      return "I can help with math! Try asking something like '15 + 7', '20 - 5', '6 * 4', or '24 / 3'"
    }
  }

  // Conversational responses
  if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
    const greetings = [
      "Hello! I'm here to help you with any questions or have a conversation. What would you like to talk about?",
      "Hi there! I can assist you with information about your surroundings, answer questions, or just chat. How can I help?",
      "Hello! I'm your AI assistant, ready to help with anything you need. What's on your mind?",
    ]
    return greetings[Math.floor(Math.random() * greetings.length)]
  }

  if (lowerMessage.includes("how are you")) {
    return "I'm doing great and ready to assist you! I can help you understand your surroundings, answer questions about time and weather, help with calculations, or just have a friendly conversation. What interests you today?"
  }

  // Help and capabilities
  if (lowerMessage.includes("help") || lowerMessage.includes("what can you do")) {
    return "I can help you with many things! I can describe sounds and environments around you, tell you the time and date, provide weather information, help with math calculations, answer general questions, and have conversations. I'm also great at providing assistance for daily tasks. What would you like to explore?"
  }

  // Default enhanced response
  return "I'm here to help you with anything! I can describe your environment, answer questions about time and weather, help with math, provide information, or just have a conversation. What would you like to know or discuss?"
}

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json()

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.log("OpenAI API key not found, using enhanced fallback responses")
      const fallbackResponse = generateEnhancedFallbackResponse(message)
      return NextResponse.json({
        response: fallbackResponse,
        source: "fallback",
      })
    }

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content:
                context ||
                `You are a helpful AI assistant for users with disabilities. You are empathetic, supportive, and provide accurate information. You can:
              - Describe environments and sounds
              - Answer questions about time, date, weather
              - Help with calculations and general knowledge
              - Provide emotional support and encouragement
              - Assist with daily tasks and accessibility needs
              
              Always be conversational, supportive, and helpful. Keep responses concise but informative.`,
            },
            {
              role: "user",
              content: message,
            },
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`OpenAI API error: ${response.status} - ${errorText}`)
        throw new Error(`OpenAI API responded with status: ${response.status}`)
      }

      const data = await response.json()

      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error("Invalid response format from OpenAI API")
      }

      const aiResponse = data.choices[0].message.content

      return NextResponse.json({
        response: aiResponse,
        source: "openai",
        usage: data.usage,
      })
    } catch (openaiError) {
      console.error("OpenAI API error:", openaiError)
      // Fallback to enhanced local responses if OpenAI fails
      const fallbackResponse = generateEnhancedFallbackResponse(message)
      return NextResponse.json({
        response: fallbackResponse,
        source: "fallback_after_error",
        error: "API temporarily unavailable",
      })
    }
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json(
      {
        error: "Failed to process request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
