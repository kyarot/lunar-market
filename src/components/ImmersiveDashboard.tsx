import { useState, useMemo, useCallback, useEffect, useRef, memo } from "react";
import { motion } from "framer-motion";
import { StarField } from "./StarField";
import { HeroMoon } from "./HeroMoon";
import { MiniChart } from "./MiniChart";
import { InsightPanel } from "./InsightPanel";
import { ScrollHint } from "./ScrollHint";
import { MoonCarousel } from "./MoonCarousel";
import {
  Moon,
  TrendingUp,
  Calendar,
  Compass,
  Activity,
  Gauge,
  RefreshCw,
  Sun,
  CalendarDays,
} from "lucide-react";
import {
  fetchDailyStockData,
  StockDataPoint,
  STOCK_SYMBOLS,
} from "@/lib/alphaVantage";
import {
  calculateMoonPhase,
  isSupermoon,
  isMicromoon,
} from "@/lib/moonPhases";

interface DayData {
  date: Date;
  phase: number;
  illumination: number;
  phaseName: string;
  zodiac: string;
  price: number;
  distance: number;
  age: number;
  volume?: number;
  high?: number;
  low?: number;
  moonName?: string[];
  isSupermoon?: boolean;
  isMicromoon?: boolean;
}

// Merge stock data with calculated moon phase data
const mergeData = (stockData: StockDataPoint[]): DayData[] => {
  return stockData.map((stock) => {
    const moon = calculateMoonPhase(stock.date);
    
    return {
      date: stock.date,
      phase: moon.phase,
      illumination: moon.illumination,
      phaseName: moon.phaseName,
      zodiac: moon.zodiac,
      price: stock.close,
      high: stock.high,
      low: stock.low,
      volume: stock.volume,
      distance: moon.distance,
      age: moon.age,
      moonName: moon.moonName ? [moon.moonName] : undefined,
      isSupermoon: isSupermoon(moon),
      isMicromoon: isMicromoon(moon),
    };
  });
};

// Generate fallback mock data with calculated moon phases (up to today only)
const generateMockData = (): DayData[] => {
  const today = new Date();
  today.setHours(12, 0, 0, 0); // Normalize to noon
  const data: DayData[] = [];

  // Generate 60 days of historical data ending at today
  for (let i = -59; i <= 0; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);

    const moon = calculateMoonPhase(date);
    const basePrice = 450;
    const price = basePrice + Math.sin(moon.phase * Math.PI * 2) * 5 + (Math.random() - 0.5) * 10 + i * 0.2;

    data.push({
      date,
      phase: moon.phase,
      illumination: moon.illumination,
      phaseName: moon.phaseName,
      zodiac: moon.zodiac,
      price,
      distance: moon.distance,
      age: moon.age,
      moonName: moon.moonName ? [moon.moonName] : undefined,
      isSupermoon: isSupermoon(moon),
      isMicromoon: isMicromoon(moon),
    });
  }

  return data;
};

export const ImmersiveDashboard = () => {
  const [data, setData] = useState<DayData[]>(() => generateMockData());
  const [selectedIndex, setSelectedIndex] = useState(30);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSymbol, setSelectedSymbol] = useState("SPY");
  const [error, setError] = useState<string | null>(null);
  const moonRef = useRef<HTMLDivElement>(null);

  // Fetch real stock data and calculate moon phases
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch stock data
        const stockData = await fetchDailyStockData(selectedSymbol);

        if (stockData.length > 0) {
          // Merge with calculated moon phases
          const mergedData = mergeData(stockData);
          setData(mergedData);
          setSelectedIndex(mergedData.length - 1);
        } else {
          // No stock data - use mock
          setError("Using demo data (API limit reached)");
          const mockData = generateMockData();
          setData(mockData);
          setSelectedIndex(Math.floor(mockData.length / 2));
        }
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Error loading data - using demo");
        const mockData = generateMockData();
        setData(mockData);
        setSelectedIndex(Math.floor(mockData.length / 2));
      }

      setIsLoading(false);
    };

    loadData();
  }, [selectedSymbol]);

  // Scroll accumulator for moon area only
  const scrollAccumulator = useRef(0);
  const scrollThreshold = 60;
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  const selectedData = data[selectedIndex] || data[0];
  const avgPrice = useMemo(() => {
    return data.reduce((sum, d) => sum + d.price, 0) / data.length;
  }, [data]);

  // Calculate additional stats
  const stats = useMemo(() => {
    const prices = data.map((d) => d.price);
    const high = Math.max(...prices);
    const low = Math.min(...prices);
    const volatility = ((high - low) / avgPrice) * 100;

    const fullMoons = data.filter((d) =>
      d.phaseName.toLowerCase().includes("full")
    ).length;
    const newMoons = data.filter((d) =>
      d.phaseName.toLowerCase().includes("new")
    ).length;

    return { high, low, volatility, fullMoons, newMoons };
  }, [data, avgPrice]);

  // Handle wheel ONLY on moon area
  const handleMoonWheel = useCallback(
    (e: React.WheelEvent) => {
      e.stopPropagation();

      const delta = e.deltaX !== 0 ? e.deltaX : e.deltaY;
      const dampening = Math.abs(delta) > 50 ? 0.3 : 0.5;
      scrollAccumulator.current += delta * dampening;

      if (Math.abs(scrollAccumulator.current) >= scrollThreshold) {
        const direction = scrollAccumulator.current > 0 ? 1 : -1;
        setSelectedIndex((prev) => {
          const next = prev + direction;
          return Math.max(0, Math.min(data.length - 1, next));
        });
        scrollAccumulator.current = scrollAccumulator.current * 0.2;
      }

      setIsScrolling(true);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(() => {
        setIsScrolling(false);
        scrollAccumulator.current = 0;
      }, 200);
    },
    [data.length]
  );

  useEffect(() => {
    return () => {
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setSelectedIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === "ArrowRight") {
        setSelectedIndex((prev) => Math.min(data.length - 1, prev + 1));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [data.length]);

  // Touch support
  const touchStart = useRef<{ x: number } | null>(null);
  const touchAccumulator = useRef(0);

  const handleMoonTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX };
    touchAccumulator.current = 0;
  }, []);

  const handleMoonTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStart.current) return;

      const currentX = e.touches[0].clientX;
      const diff = touchStart.current.x - currentX;
      touchAccumulator.current += diff;
      touchStart.current.x = currentX;

      if (Math.abs(touchAccumulator.current) >= 30) {
        const direction = touchAccumulator.current > 0 ? 1 : -1;
        setSelectedIndex((prev) => {
          const next = prev + direction;
          return Math.max(0, Math.min(data.length - 1, next));
        });
        touchAccumulator.current = 0;
        setIsScrolling(true);
      }
    },
    [data.length]
  );

  const handleMoonTouchEnd = useCallback(() => {
    touchStart.current = null;
    touchAccumulator.current = 0;
    setIsScrolling(false);
  }, []);

  const currentSymbolName =
    STOCK_SYMBOLS.find((s) => s.symbol === selectedSymbol)?.name || selectedSymbol;

  return (
    <div className="min-h-screen bg-background relative">
      {/* Fixed background */}
      <div className="fixed inset-0 bg-gradient-to-b from-[hsl(222,47%,8%)] via-[hsl(222,47%,5%)] to-[hsl(222,47%,3%)]" />
      <div className="fixed inset-0 bg-radial-glow" />
      <StarField />
      <div className="fixed inset-0 bg-noise pointer-events-none" />

      {/* Scrollable Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-20 p-4 md:p-6 bg-gradient-to-b from-background/90 to-transparent backdrop-blur-sm">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div>
              <h1 className="font-display text-lg font-medium text-foreground/80">
                Lunar Markets
              </h1>
              <p className="text-muted-foreground/60 text-xs">
                Real-time Moon Phases × Stock Trends
              </p>
            </div>

            <div className="flex items-center gap-2">
              {isLoading && (
                <RefreshCw className="w-4 h-4 text-primary animate-spin" />
              )}
              <select
                value={selectedSymbol}
                onChange={(e) => setSelectedSymbol(e.target.value)}
                className="bg-card/60 border border-border/50 rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {STOCK_SYMBOLS.map((stock) => (
                  <option key={stock.symbol} value={stock.symbol}>
                    {stock.symbol} - {stock.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {error && (
            <p className="text-amber-400/80 text-xs text-center mt-2">{error}</p>
          )}
        </header>

        {/* Main Content */}
        <main className="flex flex-col items-center px-4 md:px-6 py-4 pb-24">
          {/* Moon Section with Side Panels */}
          <div className="w-full max-w-6xl flex flex-col lg:flex-row items-center justify-center gap-6 mb-6">
            {/* Left Panel - Lunar Data */}
            <motion.div
              className="hidden lg:flex flex-col gap-3 w-48"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="glass-card p-4 text-center">
                <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Lunar Cycle</p>
                <p className="text-foreground font-display text-2xl font-bold">
                  Day {Math.floor(selectedData.age) + 1}
                </p>
                <p className="text-muted-foreground/60 text-xs">of 29.5 days</p>
              </div>
              
              <div className="glass-card p-4 text-center">
                <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Moon Rise</p>
                <p className="text-foreground font-display text-lg font-semibold">
                  {(() => {
                    const baseHour = 18 + Math.floor(selectedData.age * 0.8);
                    const hour = baseHour % 24;
                    const ampm = hour >= 12 ? 'PM' : 'AM';
                    const displayHour = hour % 12 || 12;
                    return `${displayHour}:${String(Math.floor(selectedData.age * 2) % 60).padStart(2, '0')} ${ampm}`;
                  })()}
                </p>
              </div>
              
              <div className="glass-card p-4 text-center">
                <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Moon Set</p>
                <p className="text-foreground font-display text-lg font-semibold">
                  {(() => {
                    const baseHour = 6 + Math.floor(selectedData.age * 0.8);
                    const hour = baseHour % 24;
                    const ampm = hour >= 12 ? 'PM' : 'AM';
                    const displayHour = hour % 12 || 12;
                    return `${displayHour}:${String(Math.floor(selectedData.age * 3) % 60).padStart(2, '0')} ${ampm}`;
                  })()}
                </p>
              </div>

              <div className="glass-card p-4 text-center">
                <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Next Phase</p>
                <p className="text-primary font-display text-sm font-semibold">
                  {(() => {
                    const p = selectedData.phase;
                    if (p < 0.25) return "First Quarter";
                    if (p < 0.5) return "Full Moon";
                    if (p < 0.75) return "Last Quarter";
                    return "New Moon";
                  })()}
                </p>
                <p className="text-muted-foreground/60 text-xs">
                  in {(() => {
                    const p = selectedData.phase;
                    const daysInCycle = 29.53;
                    if (p < 0.25) return Math.ceil((0.25 - p) * daysInCycle);
                    if (p < 0.5) return Math.ceil((0.5 - p) * daysInCycle);
                    if (p < 0.75) return Math.ceil((0.75 - p) * daysInCycle);
                    return Math.ceil((1 - p) * daysInCycle);
                  })()} days
                </p>
              </div>
            </motion.div>

            {/* Hero Moon with Background Arc */}
            <div className="relative">
              {/* Background Moon Arc */}
              <MoonCarousel
                phases={data.map((d) => ({ phase: d.phase, date: d.date }))}
                selectedIndex={selectedIndex}
                onSelect={setSelectedIndex}
              />
              
              {/* Main Moon */}
              <motion.div
                ref={moonRef}
                className="relative z-20 cursor-grab active:cursor-grabbing select-none"
                animate={{ scale: isScrolling ? 0.98 : 1 }}
                transition={{ duration: 0.2 }}
                onWheel={handleMoonWheel}
                onTouchStart={handleMoonTouchStart}
                onTouchMove={handleMoonTouchMove}
                onTouchEnd={handleMoonTouchEnd}
              >
                <HeroMoon
                  key={`moon-${selectedIndex}-${selectedData.date.getTime()}`}
                  phase={selectedData.phase}
                  phaseName={selectedData.phaseName}
                  illumination={selectedData.illumination}
                  date={selectedData.date}
                />
              </motion.div>
            </div>

            {/* Right Panel - Market Data */}
            <motion.div
              className="hidden lg:flex flex-col gap-3 w-48"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="glass-card p-4 text-center">
                <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">{selectedSymbol}</p>
                <motion.p 
                  key={`side-price-${selectedData.price}`}
                  className="text-foreground font-display text-2xl font-bold"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  ${selectedData.price.toFixed(2)}
                </motion.p>
                {selectedIndex > 0 && (
                  <p className={`text-xs ${data[selectedIndex].price >= data[selectedIndex - 1].price ? 'text-green-400' : 'text-red-400'}`}>
                    {data[selectedIndex].price >= data[selectedIndex - 1].price ? '▲' : '▼'} 
                    {Math.abs(((data[selectedIndex].price - data[selectedIndex - 1].price) / data[selectedIndex - 1].price) * 100).toFixed(2)}%
                  </p>
                )}
              </div>
              
              <div className="glass-card p-4 text-center">
                <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Day High</p>
                <p className="text-green-400 font-display text-lg font-semibold">
                  ${selectedData.high?.toFixed(2) || selectedData.price.toFixed(2)}
                </p>
              </div>
              
              <div className="glass-card p-4 text-center">
                <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Day Low</p>
                <p className="text-red-400 font-display text-lg font-semibold">
                  ${selectedData.low?.toFixed(2) || selectedData.price.toFixed(2)}
                </p>
              </div>

              <div className="glass-card p-4 text-center">
                <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Volume</p>
                <p className="text-foreground font-display text-lg font-semibold">
                  {selectedData.volume 
                    ? `${(selectedData.volume / 1000000).toFixed(1)}M`
                    : 'N/A'
                  }
                </p>
              </div>
            </motion.div>
          </div>

          {/* Mobile Side Data (visible on smaller screens) */}
          <div className="lg:hidden grid grid-cols-4 gap-2 w-full max-w-md mb-4">
            <div className="glass-card p-2 text-center">
              <p className="text-muted-foreground text-[10px] uppercase">Cycle Day</p>
              <p className="text-foreground font-display text-sm font-bold">{Math.floor(selectedData.age) + 1}</p>
            </div>
            <div className="glass-card p-2 text-center">
              <p className="text-muted-foreground text-[10px] uppercase">Price</p>
              <p className="text-foreground font-display text-sm font-bold">${selectedData.price.toFixed(0)}</p>
            </div>
            <div className="glass-card p-2 text-center">
              <p className="text-muted-foreground text-[10px] uppercase">High</p>
              <p className="text-green-400 font-display text-sm font-bold">${(selectedData.high || selectedData.price).toFixed(0)}</p>
            </div>
            <div className="glass-card p-2 text-center">
              <p className="text-muted-foreground text-[10px] uppercase">Low</p>
              <p className="text-red-400 font-display text-sm font-bold">${(selectedData.low || selectedData.price).toFixed(0)}</p>
            </div>
          </div>

          {/* Moon Name Badge */}
          {(selectedData.moonName?.length || selectedData.isSupermoon || selectedData.isMicromoon) && (
            <motion.div
              className="mb-4 flex flex-wrap gap-2 justify-center"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {selectedData.moonName && selectedData.moonName.length > 0 && (
                <span className="px-4 py-2 glass-card text-primary text-sm font-medium">
                  🌙 {selectedData.moonName.join(", ")}
                </span>
              )}
              {selectedData.isSupermoon && (
                <span className="px-4 py-2 glass-card text-yellow-400 text-sm font-medium">
                  ✨ Supermoon
                </span>
              )}
              {selectedData.isMicromoon && (
                <span className="px-4 py-2 glass-card text-blue-400 text-sm font-medium">
                  🔭 Micromoon
                </span>
              )}
            </motion.div>
          )}

          <div className="mb-4">
            <ScrollHint />
          </div>

          {/* Date Picker */}
          <motion.div
            className="mb-4 flex items-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <CalendarDays className="w-4 h-4 text-primary/70" />
            <input
              type="date"
              value={(() => {
                const d = selectedData.date;
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, "0");
                const day = String(d.getDate()).padStart(2, "0");
                return `${year}-${month}-${day}`;
              })()}
              onChange={(e) => {
                if (!e.target.value) return;
                // Parse the date string properly (YYYY-MM-DD)
                const [year, month, day] = e.target.value.split("-").map(Number);
                const targetDate = new Date(year, month - 1, day, 12, 0, 0);
                
                // Find the closest date in data
                let closestIndex = 0;
                let closestDiff = Infinity;
                
                data.forEach((d, index) => {
                  const diff = Math.abs(d.date.getTime() - targetDate.getTime());
                  if (diff < closestDiff) {
                    closestDiff = diff;
                    closestIndex = index;
                  }
                });
                
                setSelectedIndex(closestIndex);
              }}
              min={(() => {
                const d = data[0]?.date;
                if (!d) return "";
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, "0");
                const day = String(d.getDate()).padStart(2, "0");
                return `${year}-${month}-${day}`;
              })()}
              max={(() => {
                // Max date is today
                const today = new Date();
                const year = today.getFullYear();
                const month = String(today.getMonth() + 1).padStart(2, "0");
                const day = String(today.getDate()).padStart(2, "0");
                return `${year}-${month}-${day}`;
              })()}
              className="bg-card/60 border border-border/50 rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer [color-scheme:dark]"
            />
          </motion.div>

          {/* Timeline */}
          <motion.div
            className="mb-6 flex items-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <span className="text-muted-foreground/60 text-xs">
              {data[0]?.date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
            <div 
              className="h-1.5 w-48 md:w-64 bg-muted/30 rounded-full overflow-hidden cursor-pointer relative"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const percentage = x / rect.width;
                const newIndex = Math.round(percentage * (data.length - 1));
                setSelectedIndex(Math.max(0, Math.min(data.length - 1, newIndex)));
              }}
            >
              <motion.div
                className="h-full bg-gradient-to-r from-primary/50 via-primary to-cyan-400/60 rounded-full"
                style={{
                  width: `${(selectedIndex / Math.max(data.length - 1, 1)) * 100}%`,
                }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            </div>
            <span className="text-muted-foreground/60 text-xs">
              {data[data.length - 1]?.date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </motion.div>

          {/* Stock Price Card */}
          <motion.div
            className="glass-card p-4 md:p-6 w-full max-w-md mb-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">
              {currentSymbolName} • {selectedData.date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
            <motion.p 
              key={`price-${selectedIndex}-${selectedData.price.toFixed(2)}`}
              className="text-foreground font-display text-3xl md:text-4xl font-bold"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              ${selectedData.price.toFixed(2)}
            </motion.p>
            {selectedData.volume && (
              <motion.p 
                key={`vol-${selectedIndex}`}
                className="text-muted-foreground/60 text-xs mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, delay: 0.1 }}
              >
                Vol: {(selectedData.volume / 1000000).toFixed(1)}M
              </motion.p>
            )}
          </motion.div>

          {/* Moon Stats Row */}
          <motion.div
            key={`stats-${selectedIndex}`}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-4xl mb-6"
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="glass-card p-4 hover-lift">
              <div className="flex items-center gap-2 mb-2">
                <Moon className="w-4 h-4 text-primary/70" />
                <span className="text-muted-foreground text-xs uppercase tracking-wider">
                  Lunar Age
                </span>
              </div>
              <motion.p 
                key={`age-${selectedData.age.toFixed(1)}`}
                className="text-foreground font-display text-xl font-semibold"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {selectedData.age.toFixed(1)}{" "}
                <span className="text-sm text-muted-foreground">days</span>
              </motion.p>
            </div>

            <div className="glass-card p-4 hover-lift">
              <div className="flex items-center gap-2 mb-2">
                <Compass className="w-4 h-4 text-cyan-400/70" />
                <span className="text-muted-foreground text-xs uppercase tracking-wider">
                  Zodiac
                </span>
              </div>
              <motion.p 
                key={`zodiac-${selectedData.zodiac}`}
                className="text-foreground font-display text-xl font-semibold"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {selectedData.zodiac}
              </motion.p>
            </div>

            <div className="glass-card p-4 hover-lift">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-green-400/70" />
                <span className="text-muted-foreground text-xs uppercase tracking-wider">
                  Moon Distance
                </span>
              </div>
              <motion.p 
                key={`distance-${selectedData.distance.toFixed(0)}`}
                className="text-foreground font-display text-xl font-semibold"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {(selectedData.distance / 1000).toFixed(0)}k{" "}
                <span className="text-sm text-muted-foreground">km</span>
              </motion.p>
            </div>

            <div className="glass-card p-4 hover-lift">
              <div className="flex items-center gap-2 mb-2">
                <Sun className="w-4 h-4 text-yellow-400/70" />
                <span className="text-muted-foreground text-xs uppercase tracking-wider">
                  Illumination
                </span>
              </div>
              <motion.p 
                key={`illum-${selectedData.illumination.toFixed(0)}`}
                className="text-foreground font-display text-xl font-semibold"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {selectedData.illumination.toFixed(0)}
                <span className="text-sm text-muted-foreground">%</span>
              </motion.p>
            </div>
          </motion.div>

          {/* Charts */}
          <div className="flex flex-col md:flex-row gap-4 w-full max-w-4xl justify-center mb-6">
            <MiniChart
              data={data.map((d) => ({ date: d.date, price: d.price }))}
              selectedIndex={selectedIndex}
            />
            <InsightPanel
              phaseName={selectedData.phaseName}
              price={selectedData.price}
              avgPrice={avgPrice}
              stockSymbol={selectedSymbol}
              priceChange={selectedIndex > 0 
                ? ((selectedData.price - data[selectedIndex - 1].price) / data[selectedIndex - 1].price) * 100 
                : 0}
              zodiac={selectedData.zodiac}
              illumination={selectedData.illumination}
              date={selectedData.date}
            />
          </div>

          {/* Market Stats Row */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-4xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="glass-card p-4 hover-lift">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-400/70" />
                <span className="text-muted-foreground text-xs uppercase tracking-wider">
                  Period High
                </span>
              </div>
              <p className="text-green-400 font-display text-lg font-semibold">
                ${stats.high.toFixed(2)}
              </p>
            </div>

            <div className="glass-card p-4 hover-lift">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-red-400/70 rotate-180" />
                <span className="text-muted-foreground text-xs uppercase tracking-wider">
                  Period Low
                </span>
              </div>
              <p className="text-red-400 font-display text-lg font-semibold">
                ${stats.low.toFixed(2)}
              </p>
            </div>

            <div className="glass-card p-4 hover-lift">
              <div className="flex items-center gap-2 mb-2">
                <Gauge className="w-4 h-4 text-amber-400/70" />
                <span className="text-muted-foreground text-xs uppercase tracking-wider">
                  Volatility
                </span>
              </div>
              <p className="text-foreground font-display text-lg font-semibold">
                {stats.volatility.toFixed(1)}%
              </p>
            </div>

            <div className="glass-card p-4 hover-lift">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-primary/70" />
                <span className="text-muted-foreground text-xs uppercase tracking-wider">
                  Full Moons
                </span>
              </div>
              <p className="text-foreground font-display text-lg font-semibold">
                {stats.fullMoons}{" "}
                <span className="text-sm text-muted-foreground">in period</span>
              </p>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};
