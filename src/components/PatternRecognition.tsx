import { useState, useEffect, memo } from "react";
import { motion } from "framer-motion";
import { Search, TrendingUp, TrendingDown, Minus, RefreshCw, Loader2, BarChart3 } from "lucide-react";
import { analyzePatterns, PatternAnalysis } from "@/lib/mistralAI";

interface PatternRecognitionProps {
  historicalData: Array<{ date: Date; price: number; phaseName: string; illumination: number }>;
}

export const PatternRecognition = memo(({ historicalData }: PatternRecognitionProps) => {
  const [analysis, setAnalysis] = useState<PatternAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAnalysis = async () => {
    if (historicalData.length < 10) return;
    
    setIsLoading(true);
    try {
      const result = await analyzePatterns(historicalData);
      setAnalysis(result);
    } catch (error) {
      console.error("Pattern analysis error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, [historicalData.length]);

  const getCorrelationIcon = (correlation: string) => {
    switch (correlation) {
      case "positive": return <TrendingUp className="w-4 h-4 text-green-400" />;
      case "negative": return <TrendingDown className="w-4 h-4 text-red-400" />;
      default: return <Minus className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getCorrelationBg = (correlation: string) => {
    switch (correlation) {
      case "positive": return "bg-green-500/10 border-green-500/30";
      case "negative": return "bg-red-500/10 border-red-500/30";
      default: return "bg-yellow-500/10 border-yellow-500/30";
    }
  };

  const getConfidenceWidth = (confidence: number) => {
    return `${Math.min(100, Math.max(0, confidence))}%`;
  };

  return (
    <motion.div
      className="glass-card p-5 w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-medium text-foreground">Pattern Recognition</h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400">
            AI Analysis
          </span>
        </div>
        <button
          onClick={fetchAnalysis}
          disabled={isLoading}
          className="p-1.5 rounded-lg hover:bg-muted/30 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 text-muted-foreground ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {isLoading && !analysis ? (
        <div className="flex flex-col items-center justify-center py-8 gap-3">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
          <p className="text-xs text-muted-foreground">Analyzing {historicalData.length} data points...</p>
        </div>
      ) : analysis ? (
        <>
          {/* Patterns List */}
          <div className="space-y-3 mb-4">
            {analysis.patterns.map((pattern, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-3 rounded-xl border ${getCorrelationBg(pattern.correlation)}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getCorrelationIcon(pattern.correlation)}
                    <span className="text-sm font-medium text-foreground">{pattern.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{pattern.confidence}%</span>
                </div>
                
                <p className="text-xs text-foreground/70 mb-2">{pattern.description}</p>
                
                {/* Confidence Bar */}
                <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${
                      pattern.correlation === "positive" ? "bg-green-500" :
                      pattern.correlation === "negative" ? "bg-red-500" : "bg-yellow-500"
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: getConfidenceWidth(pattern.confidence) }}
                    transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Summary */}
          <div className="pt-3 border-t border-border/30">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs text-muted-foreground">Analysis Summary</span>
            </div>
            <p className="text-xs text-foreground/80">
              {analysis.summary}
            </p>
          </div>

          {/* Data Points Info */}
          <div className="mt-3 flex items-center gap-2 text-[10px] text-muted-foreground/50">
            <span>Based on {historicalData.length} data points</span>
            <span>•</span>
            <span>{historicalData.filter(d => d.phaseName === "Full Moon").length} full moons analyzed</span>
          </div>
        </>
      ) : (
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground">Not enough data for pattern analysis</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Need at least 10 data points</p>
        </div>
      )}
    </motion.div>
  );
});

PatternRecognition.displayName = "PatternRecognition";
