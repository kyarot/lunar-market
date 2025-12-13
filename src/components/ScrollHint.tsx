import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Hand } from "lucide-react";

export const ScrollHint = () => {
  return (
    <motion.div
      className="flex flex-col items-center gap-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.5, duration: 1 }}
    >
      <div className="flex items-center gap-4 text-muted-foreground/60">
        <motion.div
          animate={{ x: [-3, 0, -3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronLeft className="w-5 h-5" />
        </motion.div>
        <p className="text-xs uppercase tracking-widest">
          Interact with the moon to change phase
        </p>
        <motion.div
          animate={{ x: [3, 0, 3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronRight className="w-5 h-5" />
        </motion.div>
      </div>

      <div className="flex items-center gap-6 text-muted-foreground/40 text-xs">
        <div className="flex items-center gap-1.5">
          <Hand className="w-3.5 h-3.5" />
          <span>Swipe on moon</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] px-1.5 py-0.5 border border-muted-foreground/30 rounded">
            ←→
          </span>
          <span>Arrow keys</span>
        </div>
      </div>
    </motion.div>
  );
};
