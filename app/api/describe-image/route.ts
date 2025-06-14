import type { NextRequest } from "next/server"

// Enhanced fallback image descriptions
const generateFallbackDescription = (imageFile: File): string => {
  const fileName = imageFile.name.toLowerCase()
  const fileSize = imageFile.size

  // Generate description based on file characteristics
  let description = "I can see an image that appears to be "

  if (fileName.includes("photo") || fileName.includes("img") || fileName.includes("picture")) {
    description += "a photograph. "
  } else if (fileName.includes("screenshot") || fileName.includes("screen")) {
    description += "a screenshot. "
  } else if (fileName.includes("document") || fileName.includes("doc")) {
    description += "a document or text image. "
  } else {
    description += "a digital image. "
  }

  // Add size-based context
  if (fileSize > 5 * 1024 * 1024) {
    description += "This appears to be a high-resolution image with lots of detail. "
  } else if (fileSize > 1 * 1024 * 1024) {
    description += "This is a medium-sized image with good quality. "
  } else {
    description += "This is a smaller image file. "
  }

  // Add helpful context
  description +=
    "While I cannot analyze the specific contents without proper AI vision capabilities, I can confirm the image has been successfully uploaded and is ready for viewing. "
  description += "For detailed image analysis, please ensure the OpenAI API key is properly configured."

  return description
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const imageFile = formData.get("image") as File | null

    if (!imageFile) {
      return new Response(JSON.stringify({ error: "No image file provided." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Validate image file
    if (!imageFile.type.startsWith("image/")) {
      return new Response(JSON.stringify({ error: "Please upload a valid image file." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Check if OpenAI API key is properly configured
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.startsWith("AIza")) {
      console.log("OpenAI API key not properly configured, using fallback description")
      const fallbackDescription = generateFallbackDescription(imageFile)
      return new Response(
        JSON.stringify({
          description: fallbackDescription,
          source: "fallback",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    try {
      // Convert image file to base64
      const arrayBuffer = await imageFile.arrayBuffer()
      const base64Image = Buffer.from(arrayBuffer).toString("base64")
      const mimeType = imageFile.type

      const messages = [
        {
          role: "system",
          content:
            "You are an AI assistant for blind people. Please describe the content of the image clearly, with as much detail as possible including objects, people, colors, text, and spatial relationships.",
        },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
              },
            },
          ],
        },
      ]

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages,
          max_tokens: 800,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("OpenAI API error:", errorData)

        // Use fallback on API error
        const fallbackDescription = generateFallbackDescription(imageFile)
        return new Response(
          JSON.stringify({
            description: fallbackDescription + " (Note: AI vision service temporarily unavailable)",
            source: "fallback_after_error",
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        )
      }

      const data = await response.json()
      const description = data.choices[0].message.content

      return new Response(
        JSON.stringify({
          description,
          source: "openai",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      )
    } catch (apiError) {
      console.error("OpenAI API call failed:", apiError)

      // Use fallback on any API error
      const fallbackDescription = generateFallbackDescription(imageFile)
      return new Response(
        JSON.stringify({
          description: fallbackDescription + " (Note: AI vision service temporarily unavailable)",
          source: "fallback_after_error",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      )
    }
  } catch (error: any) {
    console.error("General API Error:", error)
    return new Response(
      JSON.stringify({
        error: "Failed to process image. Please try again.",
        details: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
