import { useState, useEffect, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Brain, Loader2 } from "lucide-react";
import { getCachedInsight } from "@/lib/mistralAI";

interface InsightPanelProps {
  phaseName: string;
  price: number;
  avgPrice: number;
  stockSymbol: string;
  priceChange: number;
  zodiac: string;
  illumination: number;
  date: Date;
}

export const InsightPanel = memo(({
  phaseName,
  price,
  avgPrice,
  stockSymbol,
  priceChange,
  zodiac,
  illumination,
  date,
}: InsightPanelProps) => {
  const [insight, setInsight] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAI, setIsAI] = useState(false);
  const isAboveAvg = price > avgPrice;

  useEffect(() => {
    let cancelled = false;

    const fetchInsight = async () => {
      setIsLoading(true);
      try {
        const result = await getCachedInsight(
          phaseName,
          illumination,
          price,
          stockSymbol,
          priceChange,
          zodiac,
          date
        );
        if (!cancelled) {
          setInsight(result);
          setIsAI(true);
        }
      } catch {
        if (!cancelled) {
          setInsight(getFallbackInsight(phaseName));
          setIsAI(false);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchInsight();

    return () => {
      cancelled = true;
    };
  }, [phaseName, price, stockSymbol, priceChange, zodiac, illumination, date]);

  return (
    <motion.div
      className="glass-card p-5 w-full max-w-md"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isAI ? (
            <Brain className="w-4 h-4 text-purple-400" />
          ) : (
            <Sparkles className="w-4 h-4 text-primary/80" />
          )}
          <p className="text-muted-foreground text-xs uppercase tracking-wider">
            {isAI ? "AI Lunar Insight" : "Lunar Insight"}
          </p>
        </div>
        {isLoading && (
          <Loader2 className="w-3 h-3 text-primary animate-spin" />
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${phaseName}-${date.getTime()}`}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.4 }}
        >
          {isLoading ? (
            <div className="space-y-2">
              <div className="h-4 bg-muted/30 rounded animate-pulse w-full" />
              <div className="h-4 bg-muted/30 rounded animate-pulse w-3/4" />
            </div>
          ) : (
            <p className="text-foreground/90 text-sm leading-relaxed">
              {insight}
            </p>
          )}
        </motion.div>
      </AnimatePresence>

      <motion.div
        className="mt-4 pt-4 border-t border-border/30 flex items-center justify-between"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-2 h-2 rounded-full ${isAboveAvg ? "bg-green-400" : "bg-amber-400"}`}
          />
          <p className="text-muted-foreground text-xs">
            {isAboveAvg ? "Above" : "Below"} 30-day avg
          </p>
        </div>
        <p className="text-muted-foreground/60 text-xs">
          {stockSymbol} • {zodiac}
        </p>
      </motion.div>
    </motion.div>
  );
});

InsightPanel.displayName = "InsightPanel";

// Fallback insights
function getFallbackInsight(phaseName: string): string {
  const insights: Record<string, string> = {
    "New Moon":
      "The New Moon brings uncertainty to markets. Traders often pause during this dark phase, awaiting new signals.",
    "Waxing Crescent":
      "As light returns, optimism builds. Early movers position themselves for the growth cycle ahead.",
    "First Quarter":
      "A decision point in the lunar cycle. Markets mirror the half-lit sky with mixed sentiment.",
    "Waxing Gibbous":
      "Momentum builds toward fullness. Markets often ride waves of increasing confidence.",
    "Full Moon":
      "Lunar energy peaks. Expect heightened volatility as emotions run high in the markets.",
    "Waning Gibbous":
      "Post-peak reflection begins. Wise traders consider taking profits as light diminishes.",
    "Last Quarter":
      "Transition time. Markets reassess positions as the lunar cycle winds down.",
    "Waning Crescent":
      "In the moon's final whisper, patience is rewarded. Prepare for the next cycle.",
  };
  return insights[phaseName] || insights["Full Moon"];
}
