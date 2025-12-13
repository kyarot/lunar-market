import { useState, useEffect, memo } from "react";
import { motion } from "framer-motion";
import { Star, Clock, AlertTriangle, Zap, Hash, Orbit, RefreshCw, Loader2 } from "lucide-react";
import { generateFinancialHoroscope, FinancialHoroscope as HoroscopeData } from "@/lib/mistralAI";

interface FinancialHoroscopeProps {
  phaseName: string;
  zodiac: string;
  stockSymbol: string;
  date: Date;
}

export const FinancialHoroscope = memo(({ phaseName, zodiac, stockSymbol, date }: FinancialHoroscopeProps) => {
  const [horoscope, setHoroscope] = useState<HoroscopeData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchHoroscope = async () => {
    setIsLoading(true);
    try {
      const result = await generateFinancialHoroscope(phaseName, zodiac, stockSymbol, date);
      setHoroscope(result);
    } catch (error) {
      console.error("Horoscope error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHoroscope();
  }, [phaseName, zodiac, stockSymbol, date.toDateString()]);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low": return "text-green-400 bg-green-500/20";
      case "high": return "text-red-400 bg-red-500/20";
      default: return "text-yellow-400 bg-yellow-500/20";
    }
  };

  return (
    <motion.div
      className="glass-card p-5 w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-400" />
          <h3 className="text-sm font-medium text-foreground">Daily Financial Horoscope</h3>
        </div>
        <button
          onClick={fetchHoroscope}
          disabled={isLoading}
          className="p-1.5 rounded-lg hover:bg-muted/30 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 text-muted-foreground ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {isLoading && !horoscope ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      ) : horoscope ? (
        <>
          {/* Date & Phase Header */}
          <div className="flex items-center gap-2 mb-4 text-xs text-muted-foreground">
            <span>{date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}</span>
            <span>•</span>
            <span>{phaseName}</span>
            <span>•</span>
            <span>Moon in {zodiac}</span>
          </div>

          {/* Overview */}
          <p className="text-foreground/90 text-sm leading-relaxed mb-5">
            {horoscope.overview}
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Lucky Hours */}
            <div className="bg-muted/20 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-xs text-muted-foreground">Lucky Hours</span>
              </div>
              <p className="text-sm font-medium text-foreground">{horoscope.luckyHours}</p>
            </div>

            {/* Risk Level */}
            <div className="bg-muted/20 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-xs text-muted-foreground">Risk Level</span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${getRiskColor(horoscope.riskLevel)}`}>
                {horoscope.riskLevel}
              </span>
            </div>

            {/* Lucky Number */}
            <div className="bg-muted/20 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <Hash className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-xs text-muted-foreground">Lucky Number</span>
              </div>
              <p className="text-sm font-medium text-foreground">{horoscope.luckyNumber}</p>
            </div>

            {/* Action */}
            <div className="bg-muted/20 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-3.5 h-3.5 text-yellow-400" />
                <span className="text-xs text-muted-foreground">Action</span>
              </div>
              <p className="text-xs text-foreground/80 line-clamp-2">{horoscope.actionAdvice}</p>
            </div>
          </div>

          {/* Cosmic Alignment */}
          <div className="pt-3 border-t border-border/30">
            <div className="flex items-center gap-2 mb-2">
              <Orbit className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs text-muted-foreground">Cosmic Alignment</span>
            </div>
            <p className="text-xs text-foreground/70 italic">
              {horoscope.cosmicAlignment}
            </p>
          </div>
        </>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4">
          The stars are aligning... Please wait.
        </p>
      )}
    </motion.div>
  );
});

FinancialHoroscope.displayName = "FinancialHoroscope";
