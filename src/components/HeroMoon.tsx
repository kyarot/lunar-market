import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface HeroMoonProps {
  phase: number;
  phaseName: string;
  illumination: number;
  date: Date;
}

export const HeroMoon = ({ phase, phaseName, illumination, date }: HeroMoonProps) => {
  const moonPath = useMemo(() => {
    const size = 400;
    const center = size / 2;
    const radius = size / 2 - 20;

    const shadowPhase = phase * 2 * Math.PI;
    const curveOffset = Math.cos(shadowPhase) * radius;

    if (phase < 0.01 || phase > 0.99) {
      return `M ${center},${center - radius} A ${radius},${radius} 0 1,1 ${center},${center + radius} A ${radius},${radius} 0 1,1 ${center},${center - radius}`;
    }

    if (phase > 0.49 && phase < 0.51) {
      return "";
    }

    const isWaxing = phase < 0.5;
    
    if (isWaxing) {
      return `M ${center},${center - radius} 
              A ${radius},${radius} 0 1,0 ${center},${center + radius} 
              A ${Math.abs(curveOffset)},${radius} 0 0,${curveOffset > 0 ? 1 : 0} ${center},${center - radius}`;
    } else {
      return `M ${center},${center - radius} 
              A ${radius},${radius} 0 1,1 ${center},${center + radius} 
              A ${Math.abs(curveOffset)},${radius} 0 0,${curveOffset > 0 ? 0 : 1} ${center},${center - radius}`;
    }
  }, [phase]);

  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="flex flex-col items-center justify-center">
      {/* Massive Moon */}
      <motion.div
        className="relative"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Outer glow layers */}
        <div className="absolute inset-0 scale-150 bg-moon-glow/5 rounded-full blur-[100px]" />
        <div className="absolute inset-0 scale-125 bg-moon-glow/10 rounded-full blur-[60px]" />
        <div className="absolute inset-0 scale-110 bg-moon-glow/15 rounded-full blur-[30px]" />
        
        <svg
          width="400"
          height="400"
          viewBox="0 0 400 400"
          className="relative z-10 drop-shadow-[0_0_60px_hsl(var(--moon-glow)/0.4)]"
        >
          <defs>
            <radialGradient id="heroMoonGradient" cx="35%" cy="35%">
              <stop offset="0%" stopColor="#F5F5F5" />
              <stop offset="40%" stopColor="#E8E8E8" />
              <stop offset="70%" stopColor="#D0D0D0" />
              <stop offset="100%" stopColor="#A8A8A8" />
            </radialGradient>
            <filter id="moonGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          
          {/* Subtle outer ring */}
          <circle
            cx="200"
            cy="200"
            r="185"
            fill="none"
            stroke="hsl(var(--moon-glow))"
            strokeWidth="0.5"
            opacity="0.15"
          />
          
          {/* Moon surface */}
          <motion.circle
            cx="200"
            cy="200"
            r="180"
            fill="url(#heroMoonGradient)"
            filter="url(#moonGlow)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          />
          
          {/* Crater details - more realistic distribution */}
          <g opacity="0.25">
            <circle cx="140" cy="120" r="25" fill="#C0C0C0" />
            <circle cx="240" cy="160" r="18" fill="#B8B8B8" />
            <circle cx="170" cy="240" r="30" fill="#C8C8C8" />
            <circle cx="260" cy="260" r="12" fill="#BABABA" />
            <circle cx="120" cy="200" r="15" fill="#C4C4C4" />
            <circle cx="280" cy="120" r="10" fill="#BCBCBC" />
            <circle cx="200" cy="300" r="20" fill="#C2C2C2" />
            <circle cx="320" cy="200" r="8" fill="#BEBEBE" />
          </g>
          
          {/* Shadow overlay with smooth transition */}
          <AnimatePresence mode="wait">
            {moonPath && (
              <motion.path
                key={phase.toFixed(2)}
                d={moonPath}
                fill="hsl(var(--background))"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.97 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              />
            )}
          </AnimatePresence>
        </svg>
      </motion.div>

      {/* Moon Info - Below the moon */}
      <motion.div
        className="mt-12 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        <AnimatePresence mode="wait">
          <motion.h1
            key={phaseName}
            className="font-display text-4xl md:text-5xl font-semibold text-foreground mb-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            {phaseName}
          </motion.h1>
        </AnimatePresence>
        
        <AnimatePresence mode="wait">
          <motion.p
            key={formattedDate}
            className="text-muted-foreground text-lg mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {formattedDate}
          </motion.p>
        </AnimatePresence>

        <motion.div 
          className="flex items-center justify-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="w-24 h-1.5 bg-muted/50 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary/80 to-cyan-400/60 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${illumination}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
          <span className="text-muted-foreground text-sm font-medium">
            {illumination.toFixed(0)}% illuminated
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
};
