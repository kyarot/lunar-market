const MISTRAL_API_KEY = "WSa3eOifOrVXWd9hBuRnVocSqrwnNwmo";
const MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions";

interface MistralMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface MistralResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export async function generateLunarInsight(
  phaseName: string,
  illumination: number,
  stockPrice: number,
  stockSymbol: string,
  priceChange: number,
  zodiac: string,
  date: Date
): Promise<string> {
  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const prompt = `You are a mystical financial analyst who combines lunar astrology with market analysis. Generate a brief, insightful observation (2-3 sentences max) about the following:

Date: ${formattedDate}
Moon Phase: ${phaseName} (${illumination.toFixed(0)}% illuminated)
Moon in: ${zodiac}
Stock: ${stockSymbol} at $${stockPrice.toFixed(2)}
Daily Change: ${priceChange >= 0 ? "+" : ""}${priceChange.toFixed(2)}%

Provide a mystical yet data-informed insight connecting the lunar phase to market sentiment. Be concise and intriguing. Don't use bullet points.`;

  try {
    const response = await fetch(MISTRAL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MISTRAL_API_KEY}`,
      },
      body: JSON.stringify({
        model: "mistral-small-latest",
        messages: [
          {
            role: "system",
            content:
              "You are a mystical financial analyst who provides brief, poetic insights connecting lunar cycles to market behavior. Keep responses under 50 words.",
          },
          {
            role: "user",
            content: prompt,
          },
        ] as MistralMessage[],
        max_tokens: 100,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`Mistral API error: ${response.status}`);
    }

    const data: MistralResponse = await response.json();
    return data.choices[0]?.message?.content || getFallbackInsight(phaseName);
  } catch (error) {
    console.error("Mistral AI error:", error);
    return getFallbackInsight(phaseName);
  }
}

// Fallback insights when API fails
function getFallbackInsight(phaseName: string): string {
  const insights: Record<string, string> = {
    "New Moon":
      "The New Moon brings a veil of uncertainty. Markets often pause for reflection during this dark phase, as traders await new signals.",
    "Waxing Crescent":
      "As light returns to the lunar surface, optimism builds. Early movers position themselves for the growth cycle ahead.",
    "First Quarter":
      "The First Quarter marks a decision point. Half-lit skies mirror the market's indecision between bulls and bears.",
    "Waxing Gibbous":
      "Momentum builds as the moon approaches fullness. Markets often ride waves of increasing confidence during this phase.",
    "Full Moon":
      "Under the Full Moon's glow, emotions run high. Expect heightened volatility as lunar energy peaks in the markets.",
    "Waning Gibbous":
      "Post-peak reflection begins. Wise traders take profits as the moon's light slowly diminishes.",
    "Last Quarter":
      "The Last Quarter signals transition. Markets reassess positions as the lunar cycle winds down.",
    "Waning Crescent":
      "In the moon's final whisper, patience is rewarded. The wise prepare for the next cycle's opportunities.",
  };
  return insights[phaseName] || insights["Full Moon"];
}

// Cache for insights to avoid repeated API calls
const insightCache = new Map<string, { insight: string; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function getCachedInsight(
  phaseName: string,
  illumination: number,
  stockPrice: number,
  stockSymbol: string,
  priceChange: number,
  zodiac: string,
  date: Date
): Promise<string> {
  const cacheKey = `${phaseName}-${stockSymbol}-${date.toDateString()}`;
  const cached = insightCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.insight;
  }

  const insight = await generateLunarInsight(
    phaseName,
    illumination,
    stockPrice,
    stockSymbol,
    priceChange,
    zodiac,
    date
  );

  insightCache.set(cacheKey, { insight, timestamp: Date.now() });
  return insight;
}
