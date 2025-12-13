import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const ScrollHint = () => {
  return (
    <motion.div
      className="flex items-center gap-4 text-muted-foreground/60"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.5, duration: 1 }}
    >
      <motion.div
        animate={{ x: [-3, 0, -3] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <ChevronLeft className="w-5 h-5" />
      </motion.div>
      <p className="text-xs uppercase tracking-widest">
        Scroll to explore lunar time
      </p>
      <motion.div
        animate={{ x: [3, 0, 3] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <ChevronRight className="w-5 h-5" />
      </motion.div>
    </motion.div>
  );
};
