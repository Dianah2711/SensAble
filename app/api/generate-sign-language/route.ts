import { type NextRequest, NextResponse } from "next/server"

interface SignWord {
  word: string
  signImage: string
  gloss: string
  description: string
}

interface SignLanguageResult {
  words: SignWord[]
  fullGloss: string
  originalText: string
  language: string
}

// Enhanced sign language database
const signDatabase: Record<string, SignWord> = {
  hello: {
    word: "hello",
    signImage: "/placeholder-signs/hello.jpg",
    gloss: "HELLO",
    description: "Wave hand with open palm",
  },
  hi: {
    word: "hi",
    signImage: "/placeholder-signs/hello.jpg",
    gloss: "HELLO",
    description: "Wave hand with open palm",
  },
  how: {
    word: "how",
    signImage: "/placeholder-signs/how.jpg",
    gloss: "HOW",
    description: "Curved hands moving apart",
  },
  are: {
    word: "are",
    signImage: "/placeholder-signs/are.jpg",
    gloss: "ARE",
    description: "Point forward with R handshape",
  },
  you: {
    word: "you",
    signImage: "/placeholder-signs/you.jpg",
    gloss: "YOU",
    description: "Point to person",
  },
  thank: {
    word: "thank",
    signImage: "/placeholder-signs/thank.jpg",
    gloss: "THANK",
    description: "Hand moves from chin forward",
  },
  thanks: {
    word: "thanks",
    signImage: "/placeholder-signs/thank.jpg",
    gloss: "THANK",
    description: "Hand moves from chin forward",
  },
  very: {
    word: "very",
    signImage: "/placeholder-signs/very.jpg",
    gloss: "VERY",
    description: "V handshapes moving apart",
  },
  much: {
    word: "much",
    signImage: "/placeholder-signs/much.jpg",
    gloss: "MUCH",
    description: "Claw hands moving apart",
  },
  i: {
    word: "i",
    signImage: "/placeholder-signs/i.jpg",
    gloss: "I",
    description: "Point to self",
  },
  love: {
    word: "love",
    signImage: "/placeholder-signs/love.jpg",
    gloss: "LOVE",
    description: "Arms crossed over heart",
  },
  need: {
    word: "need",
    signImage: "/placeholder-signs/need.jpg",
    gloss: "NEED",
    description: "X handshape moving down",
  },
  help: {
    word: "help",
    signImage: "/placeholder-signs/help.jpg",
    gloss: "HELP",
    description: "Flat hand on fist, both move up",
  },
  please: {
    word: "please",
    signImage: "/placeholder-signs/please.jpg",
    gloss: "PLEASE",
    description: "Flat hand circles on chest",
  },
  what: {
    word: "what",
    signImage: "/placeholder-signs/what.jpg",
    gloss: "WHAT",
    description: "Index finger wiggling",
  },
  time: {
    word: "time",
    signImage: "/placeholder-signs/time.jpg",
    gloss: "TIME",
    description: "Tap wrist with index finger",
  },
  is: {
    word: "is",
    signImage: "/placeholder-signs/is.jpg",
    gloss: "IS",
    description: "I handshape moving forward",
  },
  it: {
    word: "it",
    signImage: "/placeholder-signs/it.jpg",
    gloss: "IT",
    description: "Point to object or space",
  },
  where: {
    word: "where",
    signImage: "/placeholder-signs/where.jpg",
    gloss: "WHERE",
    description: "Index finger shaking side to side",
  },
  bathroom: {
    word: "bathroom",
    signImage: "/placeholder-signs/bathroom.jpg",
    gloss: "BATHROOM",
    description: "T handshape shaking",
  },
  hungry: {
    word: "hungry",
    signImage: "/placeholder-signs/hungry.jpg",
    gloss: "HUNGRY",
    description: "C handshape down chest",
  },
  am: {
    word: "am",
    signImage: "/placeholder-signs/am.jpg",
    gloss: "AM",
    description: "A handshape moving forward",
  },
  good: {
    word: "good",
    signImage: "/placeholder-signs/good.jpg",
    gloss: "GOOD",
    description: "Flat hand from chin to other hand",
  },
  morning: {
    word: "morning",
    signImage: "/placeholder-signs/morning.jpg",
    gloss: "MORNING",
    description: "Flat hand rising like sun",
  },
}

export async function POST(request: NextRequest) {
  try {
    const { text, language = "en", format = "gloss" } = await request.json()

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Process text into words
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((word: string) => word.length > 0)

    // Generate sign words
    const signWords: SignWord[] = words.map((word: string) => {
      if (signDatabase[word]) {
        return signDatabase[word]
      }

      // Fallback for unknown words - fingerspelling
      return {
        word: word,
        signImage: `/placeholder-signs/fingerspell.jpg`,
        gloss: word.split("").join("-").toUpperCase(),
        description: `Fingerspell: ${word.toUpperCase()}`,
      }
    })

    const result: SignLanguageResult = {
      words: signWords,
      fullGloss: signWords.map((w) => w.gloss).join(" "),
      originalText: text,
      language: language,
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Sign language generation error:", error)
    return NextResponse.json(
      {
        error: "Failed to generate sign language",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
