import { useMemo, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface HeroMoonProps {
  phase: number;
  phaseName: string;
  illumination: number;
  date: Date;
}

// Realistic moon component with proper phase rendering (defined first)
const RealisticMoon = memo(({ phase, illumination }: { phase: number; illumination: number }) => {
  const size = 400;
  const cx = 200;
  const cy = 200;
  const r = 175;

  const shadowPath = useMemo(() => {
    const p = ((phase % 1) + 1) % 1;
    
    if (p > 0.47 && p < 0.53) return null;
    if (p < 0.03 || p > 0.97) {
      return `M ${cx - r} ${cy} A ${r} ${r} 0 1 1 ${cx + r} ${cy} A ${r} ${r} 0 1 1 ${cx - r} ${cy}`;
    }

    const cosPhase = Math.cos(p * 2 * Math.PI);
    const points: string[] = [];
    const numPoints = 50;

    if (p < 0.5) {
      for (let i = 0; i <= numPoints; i++) {
        const angle = -Math.PI / 2 + (Math.PI * i) / numPoints;
        const x = cx - r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        points.push(i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`);
      }
      for (let i = numPoints; i >= 0; i--) {
        const angle = -Math.PI / 2 + (Math.PI * i) / numPoints;
        const terminatorX = cx + r * Math.cos(angle) * cosPhase;
        const y = cy + r * Math.sin(angle);
        points.push(`L ${terminatorX} ${y}`);
      }
    } else {
      for (let i = 0; i <= numPoints; i++) {
        const angle = -Math.PI / 2 + (Math.PI * i) / numPoints;
        const terminatorX = cx + r * Math.cos(angle) * cosPhase;
        const y = cy + r * Math.sin(angle);
        points.push(i === 0 ? `M ${terminatorX} ${y}` : `L ${terminatorX} ${y}`);
      }
      for (let i = numPoints; i >= 0; i--) {
        const angle = -Math.PI / 2 + (Math.PI * i) / numPoints;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        points.push(`L ${x} ${y}`);
      }
    }
    points.push("Z");
    return points.join(" ");
  }, [phase]);

  const glowIntensity = illumination / 100;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="relative z-10"
      style={{ filter: `drop-shadow(0 0 ${20 + glowIntensity * 40}px rgba(220, 230, 255, ${0.2 + glowIntensity * 0.3}))` }}>
      <defs>
        <radialGradient id="litSurface" cx="35%" cy="35%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="30%" stopColor="#F0F0F0" />
          <stop offset="60%" stopColor="#E0E0E0" />
          <stop offset="100%" stopColor="#C0C0C0" />
        </radialGradient>
        <radialGradient id="darkSurface" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#1e1e2e" />
          <stop offset="100%" stopColor="#0a0a14" />
        </radialGradient>
        <clipPath id="moonCircle">
          <circle cx={cx} cy={cy} r={r} />
        </clipPath>
      </defs>
      <circle cx={cx} cy={cy} r={r + 5} fill="none" stroke={`rgba(200, 220, 255, ${0.15 + glowIntensity * 0.1})`} strokeWidth="1" />
      <circle cx={cx} cy={cy} r={r} fill="url(#litSurface)" />
      <g opacity="0.2" clipPath="url(#moonCircle)">
        <circle cx={cx - 50} cy={cy - 60} r="22" fill="#B0B0B0" />
        <circle cx={cx + 40} cy={cy - 30} r="15" fill="#A8A8A8" />
        <circle cx={cx - 20} cy={cy + 50} r="28" fill="#B8B8B8" />
        <circle cx={cx + 60} cy={cy + 40} r="12" fill="#A0A0A0" />
        <circle cx={cx - 70} cy={cy + 10} r="14" fill="#B4B4B4" />
        <circle cx={cx + 70} cy={cy - 60} r="10" fill="#ACACAC" />
      </g>
      {shadowPath && (
        <g clipPath="url(#moonCircle)">
          <path d={shadowPath} fill="url(#darkSurface)" opacity="0.98" />
        </g>
      )}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={`rgba(255, 255, 255, ${0.1 * glowIntensity})`} strokeWidth="1.5" />
    </svg>
  );
});

RealisticMoon.displayName = "RealisticMoon";

export const HeroMoon = memo(({ phase, phaseName, illumination, date }: HeroMoonProps) => {
  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const glowIntensity = illumination / 100;

  return (
    <div className="flex flex-col items-center justify-center">
      <motion.div
        className="relative"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Glow effects */}
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            scale: 1.8,
            background: `radial-gradient(circle, rgba(220, 230, 255, ${0.1 * glowIntensity}) 0%, transparent 70%)`,
            filter: "blur(50px)",
          }}
          animate={{ scale: [1.8, 2, 1.8], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />

        <RealisticMoon phase={phase} illumination={illumination} />

        {/* Sparkles */}
        {[...Array(6)].map((_, i) => {
          const angle = (i / 6) * Math.PI * 2;
          const sparkleR = 210;
          return (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full pointer-events-none"
              style={{
                left: 200 + Math.cos(angle) * sparkleR - 200,
                top: 200 + Math.sin(angle) * sparkleR - 200,
                boxShadow: "0 0 4px 2px rgba(255,255,255,0.5)",
              }}
              animate={{ opacity: [0, 0.7 * glowIntensity, 0], scale: [0.5, 1.2, 0.5] }}
              transition={{ duration: 2, delay: i * 0.4, repeat: Infinity, ease: "easeInOut" }}
            />
          );
        })}
      </motion.div>

      {/* Moon Info */}
      <motion.div
        className="mt-10 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <AnimatePresence mode="wait">
          <motion.h1
            key={phaseName}
            className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {phaseName}
          </motion.h1>
        </AnimatePresence>

        <motion.p
          key={date.getTime()}
          className="text-muted-foreground text-base mb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {formattedDate}
        </motion.p>

        <div className="flex items-center justify-center gap-2">
          <div className="w-20 h-1.5 bg-muted/50 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary/80 to-cyan-400/60 rounded-full"
              animate={{ width: `${illumination}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          <span className="text-muted-foreground text-sm">
            {illumination.toFixed(0)}%
          </span>
        </div>
      </motion.div>
    </div>
  );
});

HeroMoon.displayName = "HeroMoon";
