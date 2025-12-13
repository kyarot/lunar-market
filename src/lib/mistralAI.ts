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

// ============ AI CHAT ASSISTANT ============
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function chatWithLunarAssistant(
  messages: ChatMessage[],
  context: {
    phaseName: string;
    illumination: number;
    stockSymbol: string;
    stockPrice: number;
    priceChange: number;
    zodiac: string;
    date: Date;
  }
): Promise<string> {
  const systemPrompt = `You are Luna, a mystical AI assistant who specializes in lunar astrology and financial markets. You combine celestial wisdom with market analysis.

Current Context:
- Date: ${context.date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
- Moon Phase: ${context.phaseName} (${context.illumination.toFixed(0)}% illuminated)
- Moon in: ${context.zodiac}
- Stock: ${context.stockSymbol} at $${context.stockPrice.toFixed(2)}
- Daily Change: ${context.priceChange >= 0 ? "+" : ""}${context.priceChange.toFixed(2)}%

Guidelines:
- Be mystical yet informative
- Keep responses concise (under 100 words)
- Reference lunar cycles when relevant
- Be helpful and engaging
- Use celestial metaphors`;

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
          { role: "system", content: systemPrompt },
          ...messages.map((m) => ({ role: m.role, content: m.content })),
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data: MistralResponse = await response.json();
    return data.choices[0]?.message?.content || "The stars are silent... Please try again.";
  } catch (error) {
    console.error("Chat error:", error);
    return "The cosmic connection is disrupted. Please try again later.";
  }
}

// ============ PREDICTIVE INSIGHTS ============
export interface PredictionData {
  prediction: string;
  confidence: number;
  direction: "bullish" | "bearish" | "neutral";
  reasoning: string;
}

export async function generatePrediction(
  historicalData: Array<{ date: Date; price: number; phaseName: string; illumination: number }>,
  stockSymbol: string
): Promise<PredictionData> {
  const recentData = historicalData.slice(-14);
  const priceChanges = recentData.map((d, i) => 
    i > 0 ? ((d.price - recentData[i-1].price) / recentData[i-1].price * 100).toFixed(2) : "0"
  );
  
  const prompt = `Analyze this lunar-market data and predict the next 3 days:

Stock: ${stockSymbol}
Recent 14 days data:
${recentData.map((d, i) => `${d.date.toLocaleDateString()}: ${d.phaseName}, $${d.price.toFixed(2)} (${priceChanges[i]}%)`).join("\n")}

Respond in this exact JSON format only:
{"prediction": "brief 1-2 sentence prediction", "confidence": 65, "direction": "bullish", "reasoning": "brief reasoning"}`;

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
          { role: "system", content: "You are a lunar-financial analyst. Respond only with valid JSON." },
          { role: "user", content: prompt },
        ],
        max_tokens: 200,
        temperature: 0.5,
      }),
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data: MistralResponse = await response.json();
    const content = data.choices[0]?.message?.content || "";
    
    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Invalid JSON response");
  } catch (error) {
    console.error("Prediction error:", error);
    return {
      prediction: "The lunar energies suggest a period of consolidation ahead.",
      confidence: 55,
      direction: "neutral",
      reasoning: "Market patterns align with the current lunar transition phase.",
    };
  }
}

// ============ DAILY HOROSCOPE ============
export interface FinancialHoroscope {
  overview: string;
  luckyHours: string;
  riskLevel: "low" | "medium" | "high";
  actionAdvice: string;
  luckyNumber: number;
  cosmicAlignment: string;
}

export async function generateFinancialHoroscope(
  phaseName: string,
  zodiac: string,
  stockSymbol: string,
  date: Date
): Promise<FinancialHoroscope> {
  const prompt = `Generate a financial horoscope for:
Date: ${date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
Moon Phase: ${phaseName}
Moon in: ${zodiac}
Focus Stock: ${stockSymbol}

Respond in this exact JSON format only:
{"overview": "2-3 sentence mystical overview", "luckyHours": "e.g. 10AM-2PM", "riskLevel": "medium", "actionAdvice": "brief action advice", "luckyNumber": 7, "cosmicAlignment": "brief cosmic alignment description"}`;

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
          { role: "system", content: "You are a mystical financial astrologer. Respond only with valid JSON." },
          { role: "user", content: prompt },
        ],
        max_tokens: 250,
        temperature: 0.7,
      }),
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data: MistralResponse = await response.json();
    const content = data.choices[0]?.message?.content || "";
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Invalid JSON response");
  } catch (error) {
    console.error("Horoscope error:", error);
    return {
      overview: `The ${phaseName} in ${zodiac} brings a time of reflection. Markets may move sideways as cosmic energies realign.`,
      luckyHours: "11AM-3PM",
      riskLevel: "medium",
      actionAdvice: "Observe the market's rhythm before making moves.",
      luckyNumber: Math.floor(Math.random() * 9) + 1,
      cosmicAlignment: "Venus and Mercury dance in harmony, favoring patience.",
    };
  }
}

// ============ PATTERN RECOGNITION ============
export interface PatternAnalysis {
  patterns: Array<{
    name: string;
    description: string;
    confidence: number;
    correlation: "positive" | "negative" | "neutral";
  }>;
  summary: string;
}

export async function analyzePatterns(
  historicalData: Array<{ date: Date; price: number; phaseName: string; illumination: number }>
): Promise<PatternAnalysis> {
  // Calculate basic statistics
  const fullMoonPrices = historicalData.filter(d => d.phaseName === "Full Moon").map(d => d.price);
  const newMoonPrices = historicalData.filter(d => d.phaseName === "New Moon").map(d => d.price);
  const avgFullMoon = fullMoonPrices.length ? fullMoonPrices.reduce((a, b) => a + b, 0) / fullMoonPrices.length : 0;
  const avgNewMoon = newMoonPrices.length ? newMoonPrices.reduce((a, b) => a + b, 0) / newMoonPrices.length : 0;
  
  const prompt = `Analyze lunar-market patterns from this data:

Data points: ${historicalData.length}
Avg price at Full Moon: $${avgFullMoon.toFixed(2)}
Avg price at New Moon: $${avgNewMoon.toFixed(2)}
Price range: $${Math.min(...historicalData.map(d => d.price)).toFixed(2)} - $${Math.max(...historicalData.map(d => d.price)).toFixed(2)}

Identify 3-4 patterns. Respond in this exact JSON format only:
{"patterns": [{"name": "pattern name", "description": "brief description", "confidence": 72, "correlation": "positive"}], "summary": "brief overall summary"}`;

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
          { role: "system", content: "You are a pattern recognition AI for lunar-market analysis. Respond only with valid JSON." },
          { role: "user", content: prompt },
        ],
        max_tokens: 400,
        temperature: 0.5,
      }),
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data: MistralResponse = await response.json();
    const content = data.choices[0]?.message?.content || "";
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Invalid JSON response");
  } catch (error) {
    console.error("Pattern analysis error:", error);
    return {
      patterns: [
        { name: "Full Moon Rally", description: "Prices tend to rise 2-3 days before full moon", confidence: 68, correlation: "positive" },
        { name: "New Moon Dip", description: "Brief pullbacks often occur during new moon phase", confidence: 62, correlation: "negative" },
        { name: "Waxing Momentum", description: "Upward trends align with waxing phases", confidence: 58, correlation: "positive" },
      ],
      summary: "Historical data suggests moderate correlation between lunar phases and market movements.",
    };
  }
}
