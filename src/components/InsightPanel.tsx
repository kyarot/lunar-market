import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

interface InsightPanelProps {
  phaseName: string;
  price: number;
  avgPrice: number;
}

const insights: Record<string, string> = {
  "New Moon": "New Moon periods historically correlate with increased market uncertainty. Traders often exhibit more cautious behavior during this phase.",
  "Waxing Crescent": "As the moon waxes, market optimism tends to build. This phase often sees gradual accumulation patterns in major indices.",
  "First Quarter": "The First Quarter moon marks a transition period. Historical data suggests moderate volatility with mixed sentiment.",
  "Waxing Gibbous": "Leading up to the Full Moon, trading volumes typically increase. Markets often show stronger directional movements.",
  "Full Moon": "Full Moon days show statistically higher intraday volatility. Some studies suggest emotional trading peaks during this phase.",
  "Waning Gibbous": "Post-Full Moon phases often bring profit-taking behavior. Market movements may show consolidation patterns.",
  "Last Quarter": "The Last Quarter moon correlates with market reassessment. Institutional rebalancing activities tend to increase.",
  "Waning Crescent": "As the lunar cycle concludes, markets often enter a reflective phase. Traders may prepare for the new cycle ahead.",
};

export const InsightPanel = ({ phaseName, price, avgPrice }: InsightPanelProps) => {
  const insight = insights[phaseName] || insights["Full Moon"];
  const isAboveAvg = price > avgPrice;

  return (
    <motion.div
      className="glass-card p-5 w-full max-w-md"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-primary/80" />
        <p className="text-muted-foreground text-xs uppercase tracking-wider">
          Lunar Insight
        </p>
      </div>
      
      <AnimatePresence mode="wait">
        <motion.p
          key={phaseName}
          className="text-foreground/90 text-sm leading-relaxed"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.4 }}
        >
          {insight}
        </motion.p>
      </AnimatePresence>

      <motion.div 
        className="mt-4 pt-4 border-t border-border/30 flex items-center gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <div className={`w-2 h-2 rounded-full ${isAboveAvg ? "bg-green-400" : "bg-amber-400"}`} />
        <p className="text-muted-foreground text-xs">
          Market currently {isAboveAvg ? "above" : "below"} 30-day average
        </p>
      </motion.div>
    </motion.div>
  );
};
