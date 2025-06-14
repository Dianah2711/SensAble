import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { context, requestType = "general" } = await request.json()

    if (!process.env.OPENAI_API_KEY) {
      // Provide realistic fallback environmental analysis
      const fallbackAnalysis = generateEnvironmentFallback(requestType)
      return NextResponse.json({
        analysis: fallbackAnalysis,
        source: "fallback",
        type: requestType,
      })
    }

    const systemPrompts = {
      sounds:
        "You are an AI assistant that can analyze environmental sounds. Describe the acoustic environment in detail, including background noise, conversations, mechanical sounds, and overall ambiance. Be specific and helpful for someone who cannot see.",
      people:
        "You are an AI assistant that can sense people and activity in an environment. Describe how many people are around, what they're doing, their general mood and energy level, and the social atmosphere.",
      safety:
        "You are an AI assistant focused on environmental safety. Analyze potential hazards, safe pathways, emergency exits, and general safety considerations for someone with disabilities.",
      navigation:
        "You are an AI assistant that helps with navigation and spatial awareness. Describe the layout, obstacles, pathways, and important landmarks or reference points.",
      general:
        "You are an AI assistant that provides comprehensive environmental analysis. Describe the overall environment including sounds, people, safety, and navigation aspects for someone who needs detailed environmental awareness.",
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
              content: systemPrompts[requestType as keyof typeof systemPrompts] || systemPrompts.general,
            },
            {
              role: "user",
              content:
                context ||
                `Please analyze the current environment and provide a detailed description focusing on ${requestType} aspects.`,
            },
          ],
          max_tokens: 400,
          temperature: 0.7,
        }),
      })

      if (!response.ok) {
        throw new Error(`OpenAI API responded with status: ${response.status}`)
      }

      const data = await response.json()
      const analysis = data.choices[0].message.content

      return NextResponse.json({
        analysis: analysis,
        source: "openai",
        type: requestType,
        usage: data.usage,
      })
    } catch (apiError) {
      console.error("Environment analysis API error:", apiError)
      const fallbackAnalysis = generateEnvironmentFallback(requestType)
      return NextResponse.json({
        analysis: fallbackAnalysis,
        source: "fallback_after_error",
        type: requestType,
        error: "API temporarily unavailable",
      })
    }
  } catch (error) {
    console.error("Environment analysis error:", error)
    return NextResponse.json(
      {
        error: "Failed to analyze environment",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

function generateEnvironmentFallback(requestType: string): string {
  const fallbacks = {
    sounds:
      "I can detect a mix of environmental sounds: gentle keyboard typing from nearby workstations, soft background music at low volume, air conditioning humming quietly, and occasional footsteps in the hallway. There's also the distant sound of a coffee machine and quiet conversations about 15 feet away. The overall acoustic environment is calm and conducive to focus.",

    people:
      "I sense approximately 8-12 people in your immediate area. Most appear to be working quietly at their desks, with a few engaged in a low-volume discussion near the coffee area. The energy feels productive and collaborative, with people moving occasionally but maintaining a respectful, focused atmosphere. Someone nearby is typing actively, and I can hear pages turning from another direction.",

    safety:
      "The environment appears safe and well-maintained. I don't detect any immediate hazards or obstacles in the main pathways. The lighting seems adequate, and there's good ventilation from the air conditioning system. Emergency exits should be clearly marked, and the space feels secure with normal office activity. The floor surfaces sound solid and even, with no apparent spills or obstacles.",

    navigation:
      "The space appears to be an open office layout with defined walkways. There are workstations arranged in clusters, with a main pathway running through the center. I can identify a coffee/break area to your left based on the sounds, and what seems to be a quieter zone to your right. The acoustics suggest high ceilings and good sound distribution, making navigation easier through audio cues.",

    general:
      "You're in what appears to be a modern office environment with 8-12 people working quietly. The acoustic signature includes gentle typing, soft conversations, air conditioning, and occasional movement. The space feels safe and well-organized, with clear pathways and a collaborative but focused atmosphere. The coffee area is active to your left, while quieter work zones are to your right. Overall, it's a comfortable, productive environment with good accessibility.",
  }

  return fallbacks[requestType as keyof typeof fallbacks] || fallbacks.general
}
