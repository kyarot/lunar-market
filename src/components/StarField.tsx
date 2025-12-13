import { memo, useMemo, useState, useCallback } from "react";
import { motion } from "framer-motion";

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  color: string;
}

// Memoized star component for performance
const Star = memo(({ star, isClicked, onClick }: { 
  star: Star; 
  isClicked: boolean;
  onClick: () => void;
}) => (
  <motion.div
    className="absolute rounded-full cursor-pointer"
    style={{
      left: `${star.x}%`,
      top: `${star.y}%`,
      width: star.size,
      height: star.size,
      backgroundColor: star.color,
      boxShadow: isClicked
        ? `0 0 ${star.size * 6}px ${star.size * 2}px ${star.color}`
        : `0 0 ${star.size}px ${star.color}`,
    }}
    animate={{
      opacity: isClicked ? [1, 0.7, 1] : [star.opacity, star.opacity * 0.4, star.opacity],
      scale: isClicked ? [1.3, 1.6, 1.3] : 1,
    }}
    transition={{
      duration: isClicked ? 1.5 : 3 + Math.random() * 2,
      repeat: Infinity,
      ease: "easeInOut",
    }}
    onClick={onClick}
    whileHover={{ scale: 1.5 }}
  />
));

Star.displayName = "Star";

// Floating particle component
const Particle = memo(({ x, y, size, delay }: { x: number; y: number; size: number; delay: number }) => (
  <motion.div
    className="absolute rounded-full pointer-events-none"
    style={{
      left: `${x}%`,
      top: `${y}%`,
      width: size,
      height: size,
      background: `radial-gradient(circle, rgba(200, 220, 255, 0.3) 0%, transparent 70%)`,
    }}
    animate={{
      x: [0, 15, 0, -15, 0],
      y: [0, 10, 20, 10, 0],
      opacity: [0.2, 0.4, 0.2],
    }}
    transition={{
      duration: 20 + Math.random() * 10,
      delay,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />
));

Particle.displayName = "Particle";

export const StarField = memo(() => {
  const [clickedStars, setClickedStars] = useState<Set<number>>(new Set());

  // Generate stars once
  const stars = useMemo<Star[]>(() => {
    const colors = [
      "rgba(255, 255, 255, 1)",
      "rgba(200, 220, 255, 1)",
      "rgba(255, 240, 220, 1)",
    ];
    return Array.from({ length: 150 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.5 + 0.2,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
  }, []);

  // Generate particles once
  const particles = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: 30 + Math.random() * 40,
      y: 20 + Math.random() * 40,
      size: Math.random() * 4 + 2,
      delay: Math.random() * 5,
    }));
  }, []);

  const handleStarClick = useCallback((id: number) => {
    setClickedStars((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Stars layer */}
      <div className="absolute inset-0 pointer-events-auto">
        {stars.map((star) => (
          <Star
            key={star.id}
            star={star}
            isClicked={clickedStars.has(star.id)}
            onClick={() => handleStarClick(star.id)}
          />
        ))}
      </div>

      {/* Particles layer */}
      <div className="absolute inset-0">
        {particles.map((p) => (
          <Particle key={p.id} x={p.x} y={p.y} size={p.size} delay={p.delay} />
        ))}
      </div>

      {/* Nebula glow */}
      <motion.div
        className="absolute w-96 h-96 rounded-full opacity-[0.03]"
        style={{
          left: "10%",
          top: "20%",
          background: "radial-gradient(circle, rgba(100, 150, 255, 0.5) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.03, 0.05, 0.03] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
});

StarField.displayName = "StarField";
