import { useState, useEffect, memo, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, TrendingUp, TrendingDown, Minus, RefreshCw, Loader2, BarChart3 } from "lucide-react";
import { analyzePatterns, PatternAnalysis } from "@/lib/mistralAI";

interface PatternRecognitionProps {
  historicalData: Array<{ date: Date; price: number; phaseName: string; illumination: number }>;
}

// Mini Line Chart Component
const MiniLineChart = memo(({ 
  data, 
  color = "#22c55e",
  height = 60 
}: { 
  data: number[]; 
  color?: string;
  height?: number;
}) => {
  const width = 120;
  const padding = 4;
  
  const points = useMemo(() => {
    if (data.length < 2) return "";
    
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    
    return data.map((value, index) => {
      const x = padding + (index / (data.length - 1)) * (width - padding * 2);
      const y = height - padding - ((value - min) / range) * (height - padding * 2);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  }, [data, height]);

  const areaPath = useMemo(() => {
    if (data.length < 2) return "";
    
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    
    const linePoints = data.map((value, index) => {
      const x = padding + (index / (data.length - 1)) * (width - padding * 2);
      const y = height - padding - ((value - min) / range) * (height - padding * 2);
      return { x, y };
    });
    
    return `M ${linePoints[0].x} ${height - padding} ` +
           linePoints.map(p => `L ${p.x} ${p.y}`).join(' ') +
           ` L ${linePoints[linePoints.length - 1].x} ${height - padding} Z`;
  }, [data, height]);

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Area fill */}
      <path
        d={areaPath}
        fill={`url(#gradient-${color.replace('#', '')})`}
      />
      {/* Line */}
      <path
        d={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* End dot */}
      {data.length > 0 && (
        <circle
          cx={width - padding}
          cy={height - padding - ((data[data.length - 1] - Math.min(...data)) / (Math.max(...data) - Math.min(...data) || 1)) * (height - padding * 2)}
          r="3"
          fill={color}
        />
      )}
    </svg>
  );
});

MiniLineChart.displayName = "MiniLineChart";

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

  // Generate chart data for each pattern based on correlation
  const getPatternChartData = (correlation: string, index: number) => {
    const baseData = historicalData.slice(-20).map(d => d.price);
    if (baseData.length < 5) return Array(10).fill(50);
    
    // Normalize and add some variation based on pattern type
    const min = Math.min(...baseData);
    const max = Math.max(...baseData);
    const range = max - min || 1;
    
    return baseData.map((price, i) => {
      const normalized = ((price - min) / range) * 100;
      const variation = Math.sin(i * 0.5 + index) * 10;
      if (correlation === "positive") return normalized + variation;
      if (correlation === "negative") return 100 - normalized + variation;
      return 50 + variation;
    });
  };

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

  const getCorrelationColor = (correlation: string) => {
    switch (correlation) {
      case "positive": return "#22c55e";
      case "negative": return "#ef4444";
      default: return "#eab308";
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
          {/* Patterns List with Charts */}
          <div className="space-y-3 mb-4">
            {analysis.patterns.map((pattern, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-xl border ${getCorrelationBg(pattern.correlation)}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getCorrelationIcon(pattern.correlation)}
                    <span className="text-sm font-medium text-foreground">{pattern.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{pattern.confidence}%</span>
                </div>
                
                <p className="text-xs text-foreground/70 mb-3">{pattern.description}</p>
                
                {/* Chart and Progress Bar Side by Side */}
                <div className="flex items-center gap-4">
                  {/* Mini Line Chart */}
                  <div className="flex-shrink-0">
                    <MiniLineChart 
                      data={getPatternChartData(pattern.correlation, index)} 
                      color={getCorrelationColor(pattern.correlation)}
                      height={50}
                    />
                  </div>
                  
                  {/* Confidence Bar */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-muted-foreground">Confidence</span>
                      <span className="text-[10px] font-medium text-foreground">{pattern.confidence}%</span>
                    </div>
                    <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
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
                    <div className="flex justify-between mt-1">
                      <span className="text-[9px] text-muted-foreground/50">0%</span>
                      <span className="text-[9px] text-muted-foreground/50">100%</span>
                    </div>
                  </div>
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
