import { useState, useEffect, memo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, Brain, RefreshCw, Sparkles } from "lucide-react";
import { generatePrediction, PredictionData } from "@/lib/mistralAI";

interface PredictiveInsightsProps {
  historicalData: Array<{ date: Date; price: number; phaseName: string; illumination: number }>;
  stockSymbol: string;
}

export const PredictiveInsights = memo(({ historicalData, stockSymbol }: PredictiveInsightsProps) => {
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchPrediction = async () => {
    if (historicalData.length < 7) return;
    
    setIsLoading(true);
    try {
      const result = await generatePrediction(historicalData, stockSymbol);
      setPrediction(result);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Prediction error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrediction();
  }, [stockSymbol]);

  const getDirectionIcon = () => {
    if (!prediction) return <Minus className="w-5 h-5" />;
    switch (prediction.direction) {
      case "bullish": return <TrendingUp className="w-5 h-5 text-green-400" />;
      case "bearish": return <TrendingDown className="w-5 h-5 text-red-400" />;
      default: return <Minus className="w-5 h-5 text-yellow-400" />;
    }
  };

  const getDirectionColor = () => {
    if (!prediction) return "text-muted-foreground";
    switch (prediction.direction) {
      case "bullish": return "text-green-400";
      case "bearish": return "text-red-400";
      default: return "text-yellow-400";
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 70) return "bg-green-500";
    if (confidence >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <motion.div
      className="glass-card p-5 w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-medium text-foreground">AI Prediction</h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
            3-Day Outlook
          </span>
        </div>
        <button
          onClick={fetchPrediction}
          disabled={isLoading}
          className="p-1.5 rounded-lg hover:bg-muted/30 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 text-muted-foreground ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {isLoading && !prediction ? (
        <div className="space-y-3">
          <div className="h-4 bg-muted/30 rounded animate-pulse w-full" />
          <div className="h-4 bg-muted/30 rounded animate-pulse w-3/4" />
          <div className="h-8 bg-muted/30 rounded animate-pulse w-1/2 mt-4" />
        </div>
      ) : prediction ? (
        <>
          {/* Direction Badge */}
          <div className="flex items-center gap-3 mb-4">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
              prediction.direction === "bullish" ? "bg-green-500/20" :
              prediction.direction === "bearish" ? "bg-red-500/20" : "bg-yellow-500/20"
            }`}>
              {getDirectionIcon()}
              <span className={`text-sm font-medium capitalize ${getDirectionColor()}`}>
                {prediction.direction}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-primary/60" />
              <span className="text-xs text-muted-foreground">{stockSymbol}</span>
            </div>
          </div>

          {/* Prediction Text */}
          <p className="text-foreground/90 text-sm leading-relaxed mb-4">
            {prediction.prediction}
          </p>

          {/* Confidence Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Confidence</span>
              <span className="text-xs font-medium text-foreground">{prediction.confidence}%</span>
            </div>
            <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${getConfidenceColor(prediction.confidence)}`}
                initial={{ width: 0 }}
                animate={{ width: `${prediction.confidence}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Reasoning */}
          <div className="pt-3 border-t border-border/30">
            <p className="text-xs text-muted-foreground italic">
              "{prediction.reasoning}"
            </p>
          </div>

          {lastUpdated && (
            <p className="text-[10px] text-muted-foreground/50 mt-3">
              Updated {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </>
      ) : (
        <p className="text-sm text-muted-foreground">Unable to generate prediction</p>
      )}
    </motion.div>
  );
});

PredictiveInsights.displayName = "PredictiveInsights";
