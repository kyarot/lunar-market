import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { MoonPhase } from "./MoonPhase";
import { DateSelector } from "./DateSelector";
import { StockChart } from "./StockChart";
import { Moon, TrendingUp } from "lucide-react";

// Generate mock data for 30 days
const generateMockData = () => {
  const today = new Date();
  const data = [];
  
  // Moon phase names based on phase value
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

  for (let i = -15; i < 15; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    
    // Simulate moon phase (29.5 day cycle)
    const phase = ((i + 15) % 29.5) / 29.5;
    const illumination = Math.abs(Math.sin(phase * Math.PI)) * 100;
    
    // Simulate stock price with some correlation to moon phase and random variation
    const basePrice = 4500;
    const moonEffect = Math.sin(phase * Math.PI * 2) * 50;
    const randomVariation = (Math.random() - 0.5) * 100;
    const trend = i * 2; // Slight upward trend
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

export const Dashboard = () => {
  const data = useMemo(() => generateMockData(), []);
  const [selectedIndex, setSelectedIndex] = useState(15); // Start at today

  const selectedData = data[selectedIndex];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent" />
      <div className="fixed inset-0 bg-noise pointer-events-none" />
      
      {/* Header */}
      <motion.header
        className="relative z-10 border-b border-border/50 backdrop-blur-xl"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Moon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-xl font-semibold text-foreground">
                Lunar Markets
              </h1>
              <p className="text-muted-foreground text-xs">
                Stock Prices vs Moon Phases
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-muted/30">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-sm text-foreground font-medium">S&P 500</span>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Moon Phase Card */}
          <motion.div
            className="lg:col-span-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <MoonPhase
              phase={selectedData.phase}
              illumination={selectedData.illumination}
              phaseName={selectedData.phaseName}
              date={selectedData.date}
              distance={selectedData.distance}
              age={selectedData.age}
              zodiac={selectedData.zodiac}
            />
          </motion.div>

          {/* Right Panel */}
          <div className="lg:col-span-8 space-y-6">
            {/* Date Selector */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <DateSelector
                dates={data.map((d) => ({
                  date: d.date,
                  phase: d.phase,
                  illumination: d.illumination,
                }))}
                selectedIndex={selectedIndex}
                onSelect={setSelectedIndex}
              />
            </motion.div>

            {/* Stock Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <StockChart
                data={data.map((d) => ({
                  date: d.date,
                  price: d.price,
                }))}
                selectedIndex={selectedIndex}
              />
            </motion.div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 mt-auto">
        <div className="container mx-auto px-6 py-4">
          <p className="text-center text-muted-foreground text-xs">
            Lunar Markets • Data visualization for research purposes only
          </p>
        </div>
      </footer>
    </div>
  );
};
