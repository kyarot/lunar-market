import { useMemo } from "react";
import { motion } from "framer-motion";

interface MoonPhaseProps {
  phase: number; // 0-1 where 0 = new moon, 0.5 = full moon, 1 = new moon
  illumination: number;
  phaseName: string;
  date: Date;
  distance?: number;
  age?: number;
  zodiac?: string;
}

export const MoonPhase = ({
  phase,
  illumination,
  phaseName,
  date,
  distance = 384400,
  age = 14.5,
  zodiac = "Pisces",
}: MoonPhaseProps) => {
  const moonPath = useMemo(() => {
    const size = 200;
    const center = size / 2;
    const radius = size / 2 - 10;

    // Calculate the shadow based on phase
    // phase: 0 = new moon, 0.25 = first quarter, 0.5 = full moon, 0.75 = last quarter
    const shadowPhase = phase * 2 * Math.PI;
    const curveOffset = Math.cos(shadowPhase) * radius;

    if (phase < 0.01 || phase > 0.99) {
      // New moon - fully dark
      return `M ${center},${center - radius} A ${radius},${radius} 0 1,1 ${center},${center + radius} A ${radius},${radius} 0 1,1 ${center},${center - radius}`;
    }

    if (phase > 0.49 && phase < 0.51) {
      // Full moon - fully lit (return empty path for shadow)
      return "";
    }

    // Waxing (0 to 0.5) or Waning (0.5 to 1)
    const isWaxing = phase < 0.5;
    
    if (isWaxing) {
      // Shadow on the left side, moving right
      return `M ${center},${center - radius} 
              A ${radius},${radius} 0 1,0 ${center},${center + radius} 
              A ${Math.abs(curveOffset)},${radius} 0 0,${curveOffset > 0 ? 1 : 0} ${center},${center - radius}`;
    } else {
      // Shadow on the right side, moving left
      return `M ${center},${center - radius} 
              A ${radius},${radius} 0 1,1 ${center},${center + radius} 
              A ${Math.abs(curveOffset)},${radius} 0 0,${curveOffset > 0 ? 0 : 1} ${center},${center - radius}`;
    }
  }, [phase]);

  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="glass-card p-8 flex flex-col items-center">
      {/* Moon Visualization */}
      <motion.div
        className="relative mb-8"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="absolute inset-0 bg-moon-glow/20 rounded-full blur-3xl animate-glow-pulse" />
        <svg
          width="200"
          height="200"
          viewBox="0 0 200 200"
          className="moon-glow relative z-10"
        >
          {/* Moon base (lit part) */}
          <defs>
            <radialGradient id="moonGradient" cx="30%" cy="30%">
              <stop offset="0%" stopColor="#E8E8E8" />
              <stop offset="50%" stopColor="#D4D4D4" />
              <stop offset="100%" stopColor="#A8A8A8" />
            </radialGradient>
            <filter id="moonTexture">
              <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="3" result="noise"/>
              <feDiffuseLighting in="noise" lightingColor="#fff" surfaceScale="1" result="diffLight">
                <feDistantLight azimuth="45" elevation="60"/>
              </feDiffuseLighting>
              <feBlend in="SourceGraphic" in2="diffLight" mode="multiply"/>
            </filter>
          </defs>
          
          {/* Glow ring */}
          <circle
            cx="100"
            cy="100"
            r="95"
            fill="none"
            stroke="hsl(var(--moon-glow))"
            strokeWidth="0.5"
            opacity="0.3"
          />
          
          {/* Moon surface */}
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="url(#moonGradient)"
            className="transition-all duration-700"
          />
          
          {/* Crater details */}
          <circle cx="70" cy="60" r="12" fill="#C0C0C0" opacity="0.3" />
          <circle cx="120" cy="80" r="8" fill="#B8B8B8" opacity="0.25" />
          <circle cx="85" cy="120" r="15" fill="#C8C8C8" opacity="0.2" />
          <circle cx="130" cy="130" r="6" fill="#BABABA" opacity="0.3" />
          
          {/* Shadow overlay */}
          {moonPath && (
            <motion.path
              d={moonPath}
              fill="hsl(var(--background))"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.95 }}
              transition={{ duration: 0.5 }}
            />
          )}
        </svg>
      </motion.div>

      {/* Phase Name */}
      <motion.h2
        className="font-display text-3xl font-semibold text-foreground mb-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        key={phaseName}
      >
        {phaseName}
      </motion.h2>

      {/* Date */}
      <motion.p
        className="text-muted-foreground text-sm mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        {formattedDate}
      </motion.p>

      {/* Illumination */}
      <motion.div
        className="flex items-center gap-3 mb-8"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-blue-400 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${illumination}%` }}
            transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
          />
        </div>
        <span className="text-foreground font-medium text-sm">
          {illumination.toFixed(0)}%
        </span>
      </motion.div>

      {/* Metadata Grid */}
      <motion.div
        className="grid grid-cols-3 gap-6 w-full"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        <div className="text-center">
          <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">
            Distance
          </p>
          <p className="text-foreground font-medium text-sm">
            {(distance / 1000).toFixed(0)}k km
          </p>
        </div>
        <div className="text-center">
          <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">
            Age
          </p>
          <p className="text-foreground font-medium text-sm">
            {age.toFixed(1)} days
          </p>
        </div>
        <div className="text-center">
          <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">
            Zodiac
          </p>
          <p className="text-foreground font-medium text-sm">{zodiac}</p>
        </div>
      </motion.div>
    </div>
  );
};
