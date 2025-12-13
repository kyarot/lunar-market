import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceDot,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";

interface StockDataPoint {
  date: Date;
  price: number;
}

interface MiniChartProps {
  data: StockDataPoint[];
  selectedIndex: number;
}

export const MiniChart = ({ data, selectedIndex }: MiniChartProps) => {
  const chartData = useMemo(() => {
    return data.map((point, index) => ({
      name: point.date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      price: point.price,
      index,
    }));
  }, [data]);

  const selectedPoint = chartData[selectedIndex];
  const minPrice = Math.min(...data.map((d) => d.price));
  const maxPrice = Math.max(...data.map((d) => d.price));
  const priceRange = maxPrice - minPrice;
  const yMin = minPrice - priceRange * 0.15;
  const yMax = maxPrice + priceRange * 0.15;

  const priceChange = selectedIndex > 0 
    ? ((data[selectedIndex].price - data[selectedIndex - 1].price) / data[selectedIndex - 1].price) * 100
    : 0;

  return (
    <motion.div
      className="glass-card p-5 w-full max-w-md"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">
            S&P 500
          </p>
          <AnimatePresence mode="wait">
            <motion.p
              key={selectedIndex}
              className="text-foreground font-display text-2xl font-semibold"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
            >
              ${selectedPoint?.price.toFixed(2)}
            </motion.p>
          </AnimatePresence>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedIndex}
            className={`px-3 py-1.5 rounded-full text-sm font-medium ${
              priceChange >= 0 
                ? "bg-green-500/10 text-green-400" 
                : "bg-red-500/10 text-red-400"
            }`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            {priceChange >= 0 ? "+" : ""}{priceChange.toFixed(2)}%
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="h-[140px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="miniLineGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
                <stop offset="50%" stopColor="hsl(var(--primary))" />
                <stop offset="100%" stopColor="hsl(190, 90%, 50%)" stopOpacity={0.8} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="name" 
              hide 
            />
            <YAxis 
              domain={[yMin, yMax]} 
              hide 
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="url(#miniLineGradient)"
              strokeWidth={2}
              dot={false}
            />
            {selectedPoint && (
              <ReferenceDot
                x={selectedPoint.name}
                y={selectedPoint.price}
                r={6}
                fill="hsl(var(--primary))"
                stroke="hsl(var(--foreground))"
                strokeWidth={2}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};
