import { useState, useMemo, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { StarField } from "./StarField";
import { HeroMoon } from "./HeroMoon";
import { MiniChart } from "./MiniChart";
import { InsightPanel } from "./InsightPanel";
import { ScrollHint } from "./ScrollHint";

// Generate mock data for 60 days
const generateMockData = () => {
  const today = new Date();
  const data = [];
  
  const getPhaseNameAndZodiac = (phase: number) => {
    const zodiacs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
    const zodiac = zodiacs[Math.floor(phase * 12) % 12];
    
    if (phase < 0.03 || phase > 0.97) return { name: "New Moon", zodiac };
    if (phase < 0.22) return { name: "Waxing Crescent", zodiac };
    if (phase < 0.28) return { name: "First Quarter", zodiac };
    if (phase < 0.47) return { name: "Waxing Gibbous", zodiac };
    if (phase < 0.53) return { name: "Full Moon", zodiac };
    if (phase < 0.72) return { name: "Waning Gibbous", zodiac };
    if (phase < 0.78) return { name: "Last Quarter", zodiac };
    return { name: "Waning Crescent", zodiac };
  };

  for (let i = -30; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    
    const phase = ((i + 30) % 29.5) / 29.5;
    const illumination = Math.abs(Math.sin(phase * Math.PI)) * 100;
    
    const basePrice = 4500;
    const moonEffect = Math.sin(phase * Math.PI * 2) * 50;
    const randomVariation = (Math.random() - 0.5) * 100;
    const trend = i * 2;
    const price = basePrice + moonEffect + randomVariation + trend;
    
    const { name, zodiac } = getPhaseNameAndZodiac(phase);
    
    data.push({
      date,
      phase,
      illumination,
      phaseName: name,
      zodiac,
      price,
      distance: 384400 + Math.random() * 20000 - 10000,
      age: (phase * 29.5) % 29.5,
    });
  }
  
  return data;
};

export const ImmersiveDashboard = () => {
  const data = useMemo(() => generateMockData(), []);
  const [selectedIndex, setSelectedIndex] = useState(30); // Start at today
  const [isScrolling, setIsScrolling] = useState(false);

  const selectedData = data[selectedIndex];
  const avgPrice = useMemo(() => {
    return data.reduce((sum, d) => sum + d.price, 0) / data.length;
  }, [data]);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    
    const delta = e.deltaX !== 0 ? e.deltaX : e.deltaY;
    const direction = delta > 0 ? 1 : -1;
    
    setSelectedIndex((prev) => {
      const next = prev + direction;
      return Math.max(0, Math.min(data.length - 1, next));
    });

    setIsScrolling(true);
    setTimeout(() => setIsScrolling(false), 150);
  }, [data.length]);

  useEffect(() => {
    const container = document.getElementById("immersive-container");
    if (container) {
      container.addEventListener("wheel", handleWheel, { passive: false });
      return () => container.removeEventListener("wheel", handleWheel);
    }
  }, [handleWheel]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        setSelectedIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        setSelectedIndex((prev) => Math.min(data.length - 1, prev + 1));
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [data.length]);

  return (
    <div 
      id="immersive-container"
      className="min-h-screen bg-background relative overflow-hidden cursor-grab active:cursor-grabbing"
    >
      {/* Deep gradient background */}
      <div className="fixed inset-0 bg-gradient-to-b from-[hsl(222,47%,8%)] via-[hsl(222,47%,5%)] to-[hsl(222,47%,3%)]" />
      
      {/* Radial glow from moon */}
      <div className="fixed inset-0 bg-radial-glow" />
      
      {/* Star field */}
      <StarField />
      
      {/* Subtle noise texture */}
      <div className="fixed inset-0 bg-noise pointer-events-none" />

      {/* Main Content */}
      <main className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-12">
        {/* Hero Moon - Center Stage */}
        <motion.div
          className="mb-8"
          animate={{
            scale: isScrolling ? 0.98 : 1,
          }}
          transition={{ duration: 0.2 }}
        >
          <HeroMoon
            phase={selectedData.phase}
            phaseName={selectedData.phaseName}
            illumination={selectedData.illumination}
            date={selectedData.date}
          />
        </motion.div>

        {/* Scroll Hint */}
        <div className="mb-12">
          <ScrollHint />
        </div>

        {/* Bottom Panels */}
        <div className="flex flex-col md:flex-row gap-4 w-full max-w-4xl justify-center">
          <MiniChart
            data={data.map((d) => ({ date: d.date, price: d.price }))}
            selectedIndex={selectedIndex}
          />
          <InsightPanel
            phaseName={selectedData.phaseName}
            price={selectedData.price}
            avgPrice={avgPrice}
          />
        </div>

        {/* Timeline indicator */}
        <motion.div 
          className="mt-8 flex items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <div className="h-1 w-48 bg-muted/30 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary/50 to-primary rounded-full"
              style={{ width: `${(selectedIndex / (data.length - 1)) * 100}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>
          <span className="text-muted-foreground/60 text-xs">
            Day {selectedIndex + 1} of {data.length}
          </span>
        </motion.div>
      </main>

      {/* Minimal Header */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-20 p-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <h1 className="font-display text-lg font-medium text-foreground/80">
            Lunar Markets
          </h1>
          <p className="text-muted-foreground/60 text-sm">
            Moon Phases × Stock Trends
          </p>
        </div>
      </motion.header>
    </div>
  );
};
