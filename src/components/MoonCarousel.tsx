import { memo, useMemo } from "react";
import { motion } from "framer-motion";

interface MoonCarouselProps {
  phases: Array<{ phase: number; date: Date }>;
  selectedIndex: number;
  onSelect: (index: number) => void;
}

// Moon thumbnail for the background arc
const ArcMoon = memo(({ phase, size = 80 }: { phase: number; size?: number }) => {
  const r = size / 2 - 4;
  const cx = size / 2;
  const cy = size / 2;

  const shadowPath = useMemo(() => {
    const p = ((phase % 1) + 1) % 1;
    
    if (p > 0.47 && p < 0.53) return null;
    if (p < 0.03 || p > 0.97) {
      return `M ${cx - r} ${cy} A ${r} ${r} 0 1 1 ${cx + r} ${cy} A ${r} ${r} 0 1 1 ${cx - r} ${cy}`;
    }

    const cosPhase = Math.cos(p * 2 * Math.PI);
    const points: string[] = [];
    const numPoints = 24;

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
  }, [phase, cx, cy, r]);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <radialGradient id={`moonGrad-${size}`} cx="35%" cy="35%">
          <stop offset="0%" stopColor="#F0F0F0" />
          <stop offset="100%" stopColor="#A0A0A0" />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={r} fill={`url(#moonGrad-${size})`} />
      {shadowPath && <path d={shadowPath} fill="#0a0a14" opacity="0.95" />}
    </svg>
  );
});

ArcMoon.displayName = "ArcMoon";

export const MoonCarousel = memo(({ phases, selectedIndex, onSelect }: MoonCarouselProps) => {
  // Show 5 moons in the arc (2 before, current hidden, 2 after)
  const visibleMoons = useMemo(() => {
    const moons = [];
    // Left side moons (before selected)
    for (let i = -3; i <= -1; i++) {
      const index = selectedIndex + i;
      if (index >= 0 && index < phases.length) {
        moons.push({
          index,
          offset: i,
          phase: phases[index].phase,
          date: phases[index].date,
          side: "left" as const,
        });
      }
    }
    // Right side moons (after selected)
    for (let i = 1; i <= 3; i++) {
      const index = selectedIndex + i;
      if (index >= 0 && index < phases.length) {
        moons.push({
          index,
          offset: i,
          phase: phases[index].phase,
          date: phases[index].date,
          side: "right" as const,
        });
      }
    }
    return moons;
  }, [phases, selectedIndex]);

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      {/* Arc of moons behind the main moon */}
      {visibleMoons.map(({ index, offset, phase, side }) => {
        const absOffset = Math.abs(offset);
        
        // Position moons in an arc behind the main moon
        // Closer moons are larger and more visible
        const size = 120 - absOffset * 25; // 95, 70, 45
        const opacity = 0.7 - absOffset * 0.2; // 0.5, 0.3, 0.1
        
        // Arc positioning - moons curve behind the main moon
        const arcRadius = 280 + absOffset * 40; // Distance from center
        const angleSpread = 0.35; // How spread out the arc is
        const baseAngle = side === "left" ? Math.PI - angleSpread * absOffset : angleSpread * absOffset;
        
        const x = Math.cos(baseAngle) * arcRadius;
        const y = Math.sin(baseAngle) * (arcRadius * 0.3) - 20; // Flatter arc, slightly up
        
        // Z-index simulation through scale
        const scale = 1 - absOffset * 0.15;
        const blur = absOffset * 0.5;

        return (
          <motion.button
            key={index}
            className="absolute cursor-pointer pointer-events-auto focus:outline-none"
            style={{
              filter: `blur(${blur}px)`,
              zIndex: 10 - absOffset,
            }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              x,
              y,
              opacity,
              scale,
            }}
            transition={{ 
              duration: 0.4, 
              ease: "easeOut",
            }}
            onClick={() => onSelect(index)}
            whileHover={{ 
              opacity: Math.min(opacity + 0.3, 1), 
              scale: scale * 1.1,
              filter: "blur(0px)",
            }}
          >
            <ArcMoon phase={phase} size={size} />
          </motion.button>
        );
      })}
    </div>
  );
});

MoonCarousel.displayName = "MoonCarousel";
