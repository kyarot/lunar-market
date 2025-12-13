import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DateItem {
  date: Date;
  phase: number;
  illumination: number;
}

interface DateSelectorProps {
  dates: DateItem[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

const MiniMoon = ({ phase, size = 24 }: { phase: number; size?: number }) => {
  const center = size / 2;
  const radius = size / 2 - 2;
  const curveOffset = Math.cos(phase * 2 * Math.PI) * radius;

  let shadowPath = "";
  
  if (phase < 0.01 || phase > 0.99) {
    shadowPath = `M ${center},${center - radius} A ${radius},${radius} 0 1,1 ${center},${center + radius} A ${radius},${radius} 0 1,1 ${center},${center - radius}`;
  } else if (!(phase > 0.49 && phase < 0.51)) {
    const isWaxing = phase < 0.5;
    if (isWaxing) {
      shadowPath = `M ${center},${center - radius} A ${radius},${radius} 0 1,0 ${center},${center + radius} A ${Math.abs(curveOffset)},${radius} 0 0,${curveOffset > 0 ? 1 : 0} ${center},${center - radius}`;
    } else {
      shadowPath = `M ${center},${center - radius} A ${radius},${radius} 0 1,1 ${center},${center + radius} A ${Math.abs(curveOffset)},${radius} 0 0,${curveOffset > 0 ? 0 : 1} ${center},${center - radius}`;
    }
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={center} cy={center} r={radius} fill="#D4D4D4" />
      {shadowPath && <path d={shadowPath} fill="#1a1a2e" />}
    </svg>
  );
};

export const DateSelector = ({
  dates,
  selectedIndex,
  onSelect,
}: DateSelectorProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      const selectedElement = scrollRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [selectedIndex]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg font-medium text-foreground">
          Select Date
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => scroll("left")}
            className="p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {dates.map((item, index) => {
          const isSelected = index === selectedIndex;
          const dayName = item.date.toLocaleDateString("en-US", { weekday: "short" });
          const dayNum = item.date.getDate();
          const month = item.date.toLocaleDateString("en-US", { month: "short" });

          return (
            <motion.button
              key={index}
              onClick={() => onSelect(index)}
              className={`flex-shrink-0 flex flex-col items-center p-4 rounded-xl transition-all duration-300 min-w-[80px] ${
                isSelected
                  ? "bg-primary/20 selection-glow"
                  : "bg-muted/30 hover:bg-muted/50"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-muted-foreground text-xs uppercase tracking-wide mb-2">
                {dayName}
              </span>
              <span className={`font-display text-xl font-semibold mb-1 ${
                isSelected ? "text-primary" : "text-foreground"
              }`}>
                {dayNum}
              </span>
              <span className="text-muted-foreground text-xs mb-3">{month}</span>
              
              <div className="mb-2">
                <MiniMoon phase={item.phase} size={28} />
              </div>
              
              <span className={`text-xs font-medium ${
                isSelected ? "text-primary" : "text-muted-foreground"
              }`}>
                {item.illumination.toFixed(0)}%
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
