import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceDot,
} from "recharts";
import { motion } from "framer-motion";

interface StockDataPoint {
  date: Date;
  price: number;
}

interface StockChartProps {
  data: StockDataPoint[];
  selectedIndex: number;
}

export const StockChart = ({ data, selectedIndex }: StockChartProps) => {
  const chartData = useMemo(() => {
    return data.map((point, index) => ({
      name: point.date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      price: point.price,
      isSelected: index === selectedIndex,
      index,
    }));
  }, [data, selectedIndex]);

  const selectedPoint = chartData[selectedIndex];
  const minPrice = Math.min(...data.map((d) => d.price));
  const maxPrice = Math.max(...data.map((d) => d.price));
  const priceRange = maxPrice - minPrice;
  const yMin = minPrice - priceRange * 0.1;
  const yMax = maxPrice + priceRange * 0.1;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card px-4 py-3 border border-border/50">
          <p className="text-muted-foreground text-xs mb-1">{payload[0].payload.name}</p>
          <p className="text-foreground font-display font-semibold text-lg">
            ${payload[0].value.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      className="glass-card p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display text-lg font-medium text-foreground mb-1">
            S&P 500 Performance
          </h3>
          <p className="text-muted-foreground text-sm">
            Closing prices vs moon phases
          </p>
        </div>
        {selectedPoint && (
          <motion.div
            className="text-right"
            key={selectedIndex}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-muted-foreground text-xs mb-1">Selected Date</p>
            <p className="text-foreground font-display text-2xl font-semibold">
              ${selectedPoint.price.toFixed(2)}
            </p>
          </motion.div>
        )}
      </div>

      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="hsl(226, 70%, 55%)" />
                <stop offset="100%" stopColor="hsl(210, 100%, 60%)" />
              </linearGradient>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(226, 70%, 55%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(226, 70%, 55%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(217, 19%, 15%)"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }}
              dy={10}
            />
            <YAxis
              domain={[yMin, yMax]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }}
              tickFormatter={(value) => `$${value.toFixed(0)}`}
              dx={-10}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Selected date reference line */}
            {selectedPoint && (
              <ReferenceLine
                x={selectedPoint.name}
                stroke="hsl(226, 70%, 55%)"
                strokeDasharray="4 4"
                strokeOpacity={0.5}
              />
            )}
            
            <Line
              type="monotone"
              dataKey="price"
              stroke="url(#lineGradient)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{
                r: 6,
                fill: "hsl(226, 70%, 55%)",
                stroke: "hsl(var(--background))",
                strokeWidth: 3,
              }}
            />
            
            {/* Selected point highlight */}
            {selectedPoint && (
              <ReferenceDot
                x={selectedPoint.name}
                y={selectedPoint.price}
                r={8}
                fill="hsl(226, 70%, 55%)"
                stroke="hsl(var(--foreground))"
                strokeWidth={2}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Insight text */}
      <motion.div
        className="mt-6 p-4 bg-muted/30 rounded-xl"
        key={selectedIndex}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <p className="text-muted-foreground text-sm leading-relaxed">
          {selectedPoint && selectedPoint.price > (maxPrice + minPrice) / 2
            ? "Stock prices trending above average during this lunar phase. Historical correlation suggests higher market activity near full moons."
            : "Stock prices at moderate levels during this moon phase. Market sentiment appears neutral with typical trading patterns."}
        </p>
      </motion.div>
    </motion.div>
  );
};
