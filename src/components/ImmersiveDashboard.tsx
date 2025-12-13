import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { StarField } from "./StarField";
import { HeroMoon } from "./HeroMoon";
import { MiniChart } from "./MiniChart";
import { InsightPanel } from "./InsightPanel";
import { ScrollHint } from "./ScrollHint";
import { MoonCarousel } from "./MoonCarousel";
import { AIChatAssistant } from "./AIChatAssistant";
import { PredictiveInsights } from "./PredictiveInsights";
import { FinancialHoroscope } from "./FinancialHoroscope";
import { PatternRecognition } from "./PatternRecognition";
import { SoundSettings } from "./SoundSettings";
import { useSounds } from "@/lib/sounds";
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
  Brain,
  Sparkles,
  Star,
  Sunrise,
  Sunset,
  FastForward,
  BarChart3,
  ArrowUpCircle,
  ArrowDownCircle,
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
  const prevSelectedIndex = useRef(selectedIndex);
  
  // Sound effects
  const { playWhoosh, playChime, playSelect, playAmbientPulse } = useSounds();
  
  // Play ambient sound on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      playAmbientPulse();
    }, 1000);
    return () => clearTimeout(timer);
  }, [playAmbientPulse]);
  
  // Play chime when moon phase changes significantly
  useEffect(() => {
    if (prevSelectedIndex.current !== selectedIndex) {
      const prevPhase = data[prevSelectedIndex.current]?.phaseName;
      const currentPhase = data[selectedIndex]?.phaseName;
      if (prevPhase !== currentPhase) {
        playChime();
      } else {
        playWhoosh();
      }
      prevSelectedIndex.current = selectedIndex;
    }
  }, [selectedIndex, data, playChime, playWhoosh]);

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
        <header className="sticky top-0 z-20 p-4 md:p-6 lg:p-8 bg-gradient-to-b from-background/95 via-background/80 to-transparent backdrop-blur-md">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div>
                <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-foreground via-primary to-cyan-400 bg-clip-text text-transparent">
                  Lunar Markets
                </h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <Sparkles className="w-3 h-3 text-primary/60" />
                  <p className="text-muted-foreground text-xs md:text-sm tracking-wide">
                    Where Celestial Cycles Meet Market Rhythms
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {isLoading && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
                  <RefreshCw className="w-4 h-4 text-primary animate-spin" />
                  <span className="text-xs text-primary hidden md:inline">Syncing...</span>
                </div>
              )}
              <div className="relative">
                <Star className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/50 pointer-events-none" />
                <select
                  value={selectedSymbol}
                  onChange={(e) => {
                    setSelectedSymbol(e.target.value);
                    playSelect();
                  }}
                  className="bg-card/80 border border-border/50 rounded-xl pl-9 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 hover:border-primary/50 transition-colors cursor-pointer appearance-none min-w-[180px]"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236366f1'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 0.75rem center",
                    backgroundSize: "1rem",
                  }}
                >
                  {STOCK_SYMBOLS.map((stock) => (
                    <option key={stock.symbol} value={stock.symbol}>
                      {stock.symbol} - {stock.name}
                    </option>
                  ))}
                </select>
              </div>
            </motion.div>
          </div>
          {error && (
            <motion.p 
              className="text-amber-400/80 text-xs text-center mt-3 flex items-center justify-center gap-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
              {error}
            </motion.p>
          )}
        </header>

        {/* Main Content */}
        <main className="flex flex-col items-center px-4 md:px-6 py-4 pb-24">
          {/* Moon Section with Side Panels */}
          <div className="w-full max-w-6xl flex flex-col lg:flex-row items-center justify-center gap-6 mb-6">
            {/* Left Panel - Lunar Data */}
            <motion.div
              className="hidden lg:flex flex-col gap-3 w-52"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="glass-card p-5 text-center hover-lift group">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Moon className="w-4 h-4 text-primary/70 group-hover:text-primary transition-colors" />
                  <p className="text-muted-foreground text-xs uppercase tracking-widest font-medium">Lunar Cycle</p>
                </div>
                <p className="text-foreground font-display text-3xl font-bold bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text">
                  Day {Math.floor(selectedData.age) + 1}
                </p>
                <div className="mt-2 h-1 bg-muted/30 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-primary to-cyan-400 rounded-full"
                    style={{ width: `${((selectedData.age + 1) / 29.5) * 100}%` }}
                  />
                </div>
                <p className="text-muted-foreground/60 text-xs mt-1">of 29.5 days</p>
              </div>
              
              <div className="glass-card p-4 text-center hover-lift">
                <p className="text-muted-foreground text-xs uppercase tracking-widest font-medium mb-2 flex items-center gap-1.5"><Sunrise className="w-3.5 h-3.5 text-orange-400" /> Moon Rise</p>
                <p className="text-foreground font-display text-xl font-semibold">
                  {(() => {
                    const baseHour = 18 + Math.floor(selectedData.age * 0.8);
                    const hour = baseHour % 24;
                    const ampm = hour >= 12 ? 'PM' : 'AM';
                    const displayHour = hour % 12 || 12;
                    return `${displayHour}:${String(Math.floor(selectedData.age * 2) % 60).padStart(2, '0')} ${ampm}`;
                  })()}
                </p>
              </div>
              
              <div className="glass-card p-4 text-center hover-lift">
                <p className="text-muted-foreground text-xs uppercase tracking-widest font-medium mb-2 flex items-center gap-1.5"><Sunset className="w-3.5 h-3.5 text-purple-400" /> Moon Set</p>
                <p className="text-foreground font-display text-xl font-semibold">
                  {(() => {
                    const baseHour = 6 + Math.floor(selectedData.age * 0.8);
                    const hour = baseHour % 24;
                    const ampm = hour >= 12 ? 'PM' : 'AM';
                    const displayHour = hour % 12 || 12;
                    return `${displayHour}:${String(Math.floor(selectedData.age * 3) % 60).padStart(2, '0')} ${ampm}`;
                  })()}
                </p>
              </div>

              <div className="glass-card p-4 text-center hover-lift border border-primary/20">
                <p className="text-muted-foreground text-xs uppercase tracking-widest font-medium mb-2 flex items-center gap-1.5"><FastForward className="w-3.5 h-3.5 text-cyan-400" /> Next Phase</p>
                <p className="text-primary font-display text-base font-bold">
                  {(() => {
                    const p = selectedData.phase;
                    if (p < 0.25) return "First Quarter";
                    if (p < 0.5) return "Full Moon";
                    if (p < 0.75) return "Last Quarter";
                    return "New Moon";
                  })()}
                </p>
                <p className="text-cyan-400/80 text-sm font-medium mt-1">
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
              className="hidden lg:flex flex-col gap-3 w-52"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="glass-card p-5 text-center hover-lift group">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-primary/70 group-hover:text-primary transition-colors" />
                  <p className="text-muted-foreground text-xs uppercase tracking-widest font-medium">{selectedSymbol}</p>
                </div>
                <motion.p 
                  key={`side-price-${selectedData.price}`}
                  className="text-foreground font-display text-3xl font-bold"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  ${selectedData.price.toFixed(2)}
                </motion.p>
                {selectedIndex > 0 && (
                  <motion.div 
                    className={`mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${
                      data[selectedIndex].price >= data[selectedIndex - 1].price 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                  >
                    {data[selectedIndex].price >= data[selectedIndex - 1].price ? '▲' : '▼'} 
                    {Math.abs(((data[selectedIndex].price - data[selectedIndex - 1].price) / data[selectedIndex - 1].price) * 100).toFixed(2)}%
                  </motion.div>
                )}
              </div>
              
              <div className="glass-card p-4 text-center hover-lift border-l-2 border-green-500/50">
                <p className="text-muted-foreground text-xs uppercase tracking-widest font-medium mb-2 flex items-center gap-1.5"><ArrowUpCircle className="w-3.5 h-3.5 text-green-400" /> Day High</p>
                <p className="text-green-400 font-display text-xl font-bold">
                  ${selectedData.high?.toFixed(2) || selectedData.price.toFixed(2)}
                </p>
              </div>
              
              <div className="glass-card p-4 text-center hover-lift border-l-2 border-red-500/50">
                <p className="text-muted-foreground text-xs uppercase tracking-widest font-medium mb-2 flex items-center gap-1.5"><ArrowDownCircle className="w-3.5 h-3.5 text-red-400" /> Day Low</p>
                <p className="text-red-400 font-display text-xl font-bold">
                  ${selectedData.low?.toFixed(2) || selectedData.price.toFixed(2)}
                </p>
              </div>

              <div className="glass-card p-4 text-center hover-lift">
                <p className="text-muted-foreground text-xs uppercase tracking-widest font-medium mb-2 flex items-center gap-1.5"><BarChart3 className="w-3.5 h-3.5 text-blue-400" /> Volume</p>
                <p className="text-foreground font-display text-xl font-bold">
                  {selectedData.volume 
                    ? `${(selectedData.volume / 1000000).toFixed(1)}M`
                    : 'N/A'
                  }
                </p>
                {selectedData.volume && (
                  <p className="text-muted-foreground/50 text-xs mt-1">shares traded</p>
                )}
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
                  <Moon className="w-4 h-4 inline mr-1" /> {selectedData.moonName.join(", ")}
                </span>
              )}
              {selectedData.isSupermoon && (
                <span className="px-4 py-2 glass-card text-yellow-400 text-sm font-medium">
                  <Sparkles className="w-4 h-4 inline mr-1" /> Supermoon
                </span>
              )}
              {selectedData.isMicromoon && (
                <span className="px-4 py-2 glass-card text-blue-400 text-sm font-medium">
                  <Star className="w-4 h-4 inline mr-1" /> Micromoon
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
            className="glass-card p-6 md:p-8 w-full max-w-lg mb-8 text-center relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Decorative gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-cyan-500/5 pointer-events-none" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                  {selectedSymbol}
                </span>
                <span className="text-muted-foreground text-sm">
                  {currentSymbolName}
                </span>
              </div>
              
              <p className="text-muted-foreground/80 text-sm mb-2">
                {selectedData.date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
              </p>
              
              <motion.p 
                key={`price-${selectedIndex}-${selectedData.price.toFixed(2)}`}
                className="text-foreground font-display text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                ${selectedData.price.toFixed(2)}
              </motion.p>
              
              {selectedIndex > 0 && (
                <motion.div 
                  className={`mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
                    data[selectedIndex].price >= data[selectedIndex - 1].price 
                      ? 'bg-green-500/15 text-green-400 border border-green-500/30' 
                      : 'bg-red-500/15 text-red-400 border border-red-500/30'
                  }`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {data[selectedIndex].price >= data[selectedIndex - 1].price ? '↑' : '↓'} 
                  {Math.abs(((data[selectedIndex].price - data[selectedIndex - 1].price) / data[selectedIndex - 1].price) * 100).toFixed(2)}% from yesterday
                </motion.div>
              )}
              
              {selectedData.volume && (
                <motion.p 
                  key={`vol-${selectedIndex}`}
                  className="text-muted-foreground/60 text-sm mt-4 flex items-center justify-center gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2, delay: 0.1 }}
                >
                  <Activity className="w-4 h-4" />
                  Volume: {(selectedData.volume / 1000000).toFixed(1)}M shares
                </motion.p>
              )}
            </div>
          </motion.div>

          {/* Section Title */}
          <motion.div 
            className="w-full max-w-4xl mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h2 className="text-lg font-display font-semibold text-foreground/80 flex items-center gap-2">
              <Moon className="w-5 h-5 text-primary" />
              Lunar Statistics
            </h2>
            <p className="text-muted-foreground/60 text-sm">Current celestial measurements</p>
          </motion.div>

          {/* Moon Stats Row */}
          <motion.div
            key={`stats-${selectedIndex}`}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl mb-8"
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="glass-card p-5 hover-lift group">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Moon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-muted-foreground text-xs uppercase tracking-widest font-medium">
                  Lunar Age
                </span>
              </div>
              <motion.p 
                key={`age-${selectedData.age.toFixed(1)}`}
                className="text-foreground font-display text-2xl font-bold"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {selectedData.age.toFixed(1)}
                <span className="text-sm text-muted-foreground font-normal ml-1">days</span>
              </motion.p>
              <p className="text-muted-foreground/50 text-xs mt-1">since new moon</p>
            </div>

            <div className="glass-card p-5 hover-lift group">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-lg bg-cyan-500/10 group-hover:bg-cyan-500/20 transition-colors">
                  <Compass className="w-4 h-4 text-cyan-400" />
                </div>
                <span className="text-muted-foreground text-xs uppercase tracking-widest font-medium">
                  Zodiac
                </span>
              </div>
              <motion.p 
                key={`zodiac-${selectedData.zodiac}`}
                className="text-foreground font-display text-2xl font-bold"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {selectedData.zodiac}
              </motion.p>
              <p className="text-muted-foreground/50 text-xs mt-1">moon position</p>
            </div>

            <div className="glass-card p-5 hover-lift group">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-lg bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
                  <Activity className="w-4 h-4 text-green-400" />
                </div>
                <span className="text-muted-foreground text-xs uppercase tracking-widest font-medium">
                  Distance
                </span>
              </div>
              <motion.p 
                key={`distance-${selectedData.distance.toFixed(0)}`}
                className="text-foreground font-display text-2xl font-bold"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {(selectedData.distance / 1000).toFixed(0)}k
                <span className="text-sm text-muted-foreground font-normal ml-1">km</span>
              </motion.p>
              <p className="text-muted-foreground/50 text-xs mt-1">from Earth</p>
            </div>

            <div className="glass-card p-5 hover-lift group">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-lg bg-yellow-500/10 group-hover:bg-yellow-500/20 transition-colors">
                  <Sun className="w-4 h-4 text-yellow-400" />
                </div>
                <span className="text-muted-foreground text-xs uppercase tracking-widest font-medium">
                  Illumination
                </span>
              </div>
              <motion.p 
                key={`illum-${selectedData.illumination.toFixed(0)}`}
                className="text-foreground font-display text-2xl font-bold"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {selectedData.illumination.toFixed(0)}
                <span className="text-sm text-muted-foreground font-normal">%</span>
              </motion.p>
              <p className="text-muted-foreground/50 text-xs mt-1">visible surface</p>
            </div>
          </motion.div>

          {/* Charts Section Title */}
          <motion.div 
            className="w-full max-w-4xl mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h2 className="text-lg font-display font-semibold text-foreground/80 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Market Analysis
            </h2>
            <p className="text-muted-foreground/60 text-sm">Price trends and AI-powered insights</p>
          </motion.div>

          {/* Charts */}
          <div className="flex flex-col md:flex-row gap-4 w-full max-w-4xl justify-center mb-8">
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

          {/* Market Stats Section Title */}
          <motion.div 
            className="w-full max-w-4xl mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h2 className="text-lg font-display font-semibold text-foreground/80 flex items-center gap-2">
              <Gauge className="w-5 h-5 text-amber-400" />
              Period Performance
            </h2>
            <p className="text-muted-foreground/60 text-sm">60-day market statistics</p>
          </motion.div>

          {/* Market Stats Row */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="glass-card p-5 hover-lift group border-t-2 border-green-500/50">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-lg bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                </div>
                <span className="text-muted-foreground text-xs uppercase tracking-widest font-medium">
                  Period High
                </span>
              </div>
              <p className="text-green-400 font-display text-2xl font-bold">
                ${stats.high.toFixed(2)}
              </p>
              <p className="text-muted-foreground/50 text-xs mt-1">highest price</p>
            </div>

            <div className="glass-card p-5 hover-lift group border-t-2 border-red-500/50">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-lg bg-red-500/10 group-hover:bg-red-500/20 transition-colors">
                  <TrendingUp className="w-4 h-4 text-red-400 rotate-180" />
                </div>
                <span className="text-muted-foreground text-xs uppercase tracking-widest font-medium">
                  Period Low
                </span>
              </div>
              <p className="text-red-400 font-display text-2xl font-bold">
                ${stats.low.toFixed(2)}
              </p>
              <p className="text-muted-foreground/50 text-xs mt-1">lowest price</p>
            </div>

            <div className="glass-card p-5 hover-lift group border-t-2 border-amber-500/50">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-lg bg-amber-500/10 group-hover:bg-amber-500/20 transition-colors">
                  <Gauge className="w-4 h-4 text-amber-400" />
                </div>
                <span className="text-muted-foreground text-xs uppercase tracking-widest font-medium">
                  Volatility
                </span>
              </div>
              <p className="text-foreground font-display text-2xl font-bold">
                {stats.volatility.toFixed(1)}%
              </p>
              <p className="text-muted-foreground/50 text-xs mt-1">price range</p>
            </div>

            <div className="glass-card p-5 hover-lift group border-t-2 border-primary/50">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Calendar className="w-4 h-4 text-primary" />
                </div>
                <span className="text-muted-foreground text-xs uppercase tracking-widest font-medium">
                  Full Moons
                </span>
              </div>
              <p className="text-foreground font-display text-2xl font-bold">
                {stats.fullMoons}
              </p>
              <p className="text-muted-foreground/50 text-xs mt-1">in this period</p>
            </div>
          </motion.div>

          {/* AI Features Section */}
          <motion.div
            className="w-full max-w-4xl mt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-display font-bold text-foreground flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                    <Brain className="w-5 h-5 text-purple-400" />
                  </div>
                  AI-Powered Insights
                </h2>
                <p className="text-muted-foreground/60 text-sm mt-1">
                  Celestial pattern analysis and market predictions
                </p>
              </div>
              <span className="text-xs px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30 font-medium">
                <Sparkles className="w-3 h-3 inline mr-1" /> Powered by Mistral AI
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Predictive Insights */}
              <PredictiveInsights
                historicalData={data.map(d => ({
                  date: d.date,
                  price: d.price,
                  phaseName: d.phaseName,
                  illumination: d.illumination
                }))}
                stockSymbol={selectedSymbol}
              />

              {/* Financial Horoscope */}
              <FinancialHoroscope
                phaseName={selectedData.phaseName}
                zodiac={selectedData.zodiac}
                stockSymbol={selectedSymbol}
                date={selectedData.date}
              />

              {/* Pattern Recognition - Full Width */}
              <div className="md:col-span-2">
                <PatternRecognition
                  historicalData={data.map(d => ({
                    date: d.date,
                    price: d.price,
                    phaseName: d.phaseName,
                    illumination: d.illumination
                  }))}
                />
              </div>
            </div>
          </motion.div>
        </main>
      </div>

      {/* AI Chat Assistant - Fixed Position */}
      <AIChatAssistant
        context={{
          phaseName: selectedData.phaseName,
          illumination: selectedData.illumination,
          stockSymbol: selectedSymbol,
          stockPrice: selectedData.price,
          priceChange: selectedIndex > 0 
            ? ((selectedData.price - data[selectedIndex - 1].price) / data[selectedIndex - 1].price) * 100 
            : 0,
          zodiac: selectedData.zodiac,
          date: selectedData.date,
        }}
      />
      
      {/* Sound Settings - Fixed Position */}
      <SoundSettings />
    </div>
  );
};
