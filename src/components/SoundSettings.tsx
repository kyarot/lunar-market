import { useState, useEffect, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, Music, Music2 } from "lucide-react";
import { cosmicSounds } from "@/lib/sounds";

export const SoundSettings = memo(() => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);
  const [volume, setVolume] = useState(0.3);
  const [ambientVolume, setAmbientVolume] = useState(0.15);
  const [isAmbientPlaying, setIsAmbientPlaying] = useState(false);

  useEffect(() => {
    // Load saved preferences
    const savedEnabled = localStorage.getItem('cosmicSoundsEnabled');
    const savedVolume = localStorage.getItem('cosmicSoundsVolume');
    const savedAmbientVolume = localStorage.getItem('cosmicAmbientVolume');
    
    if (savedEnabled !== null) {
      const enabled = savedEnabled === 'true';
      setIsEnabled(enabled);
      cosmicSounds.setEnabled(enabled);
    }
    
    if (savedVolume !== null) {
      const vol = parseFloat(savedVolume);
      setVolume(vol);
      cosmicSounds.setVolume(vol);
    }

    if (savedAmbientVolume !== null) {
      const vol = parseFloat(savedAmbientVolume);
      setAmbientVolume(vol);
      cosmicSounds.setAmbientVolume(vol);
    }
  }, []);

  const handleToggleSound = () => {
    const newEnabled = !isEnabled;
    setIsEnabled(newEnabled);
    cosmicSounds.setEnabled(newEnabled);
    localStorage.setItem('cosmicSoundsEnabled', String(newEnabled));
    
    if (newEnabled) {
      cosmicSounds.playChime();
    } else {
      setIsAmbientPlaying(false);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    cosmicSounds.setVolume(newVolume);
    localStorage.setItem('cosmicSoundsVolume', String(newVolume));
    cosmicSounds.playClick();
  };

  const handleAmbientVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setAmbientVolume(newVolume);
    cosmicSounds.setAmbientVolume(newVolume);
    localStorage.setItem('cosmicAmbientVolume', String(newVolume));
  };

  const handleToggleAmbient = () => {
    if (!isEnabled) return;
    
    const newState = cosmicSounds.toggleAmbient();
    setIsAmbientPlaying(newState);
  };

  return (
    <div className="fixed bottom-6 left-6 z-50">
      {/* Settings Button */}
      <motion.button
        onClick={() => {
          setIsOpen(!isOpen);
          cosmicSounds.playClick();
        }}
        className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
        style={{
          background: "linear-gradient(135deg, hsl(222, 47%, 12%) 0%, hsl(222, 47%, 8%) 100%)",
          border: "1px solid rgba(99, 102, 241, 0.3)",
          boxShadow: "0 0 20px rgba(99, 102, 241, 0.2)",
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {isEnabled ? (
          <Volume2 className="w-4 h-4 text-primary" />
        ) : (
          <VolumeX className="w-4 h-4 text-muted-foreground" />
        )}
      </motion.button>

      {/* Settings Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-14 left-0 p-4 rounded-xl w-64"
            style={{
              background: "linear-gradient(135deg, hsl(222, 47%, 12%) 0%, hsl(222, 47%, 8%) 100%)",
              border: "1px solid rgba(99, 102, 241, 0.3)",
              boxShadow: "0 0 30px rgba(99, 102, 241, 0.2)",
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Volume2 className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Sound Settings</span>
            </div>

            {/* Enable/Disable Toggle */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-muted-foreground">Sound Effects</span>
              <button
                onClick={handleToggleSound}
                className={`w-10 h-5 rounded-full transition-colors relative ${
                  isEnabled ? 'bg-primary' : 'bg-muted/50'
                }`}
              >
                <motion.div
                  className="absolute top-0.5 w-4 h-4 rounded-full bg-white"
                  animate={{ left: isEnabled ? '22px' : '2px' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
            </div>

            {/* Effects Volume Slider */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Effects Volume</span>
                <span className="text-xs text-foreground">{Math.round(volume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                disabled={!isEnabled}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer disabled:opacity-50"
                style={{
                  background: `linear-gradient(to right, hsl(226, 70%, 55%) ${volume * 100}%, hsl(217, 19%, 20%) ${volume * 100}%)`,
                }}
              />
            </div>

            {/* Divider */}
            <div className="border-t border-border/30 my-4" />

            {/* Ambient Space Sound Section */}
            <div className="flex items-center gap-2 mb-3">
              <Music2 className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-medium text-foreground">Interstellar Ambience</span>
            </div>

            {/* Ambient Toggle */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground">Space Soundscape</span>
              <button
                onClick={handleToggleAmbient}
                disabled={!isEnabled}
                className={`w-10 h-5 rounded-full transition-colors relative disabled:opacity-50 ${
                  isAmbientPlaying ? 'bg-cyan-500' : 'bg-muted/50'
                }`}
              >
                <motion.div
                  className="absolute top-0.5 w-4 h-4 rounded-full bg-white"
                  animate={{ left: isAmbientPlaying ? '22px' : '2px' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
            </div>

            {/* Ambient Volume Slider */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Ambient Volume</span>
                <span className="text-xs text-foreground">{Math.round(ambientVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.5"
                step="0.05"
                value={ambientVolume}
                onChange={handleAmbientVolumeChange}
                disabled={!isEnabled}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer disabled:opacity-50"
                style={{
                  background: `linear-gradient(to right, hsl(190, 70%, 50%) ${ambientVolume * 200}%, hsl(217, 19%, 20%) ${ambientVolume * 200}%)`,
                }}
              />
            </div>

            {/* Ambient Status */}
            {isAmbientPlaying && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-xs text-cyan-400"
              >
                <motion.div
                  className="w-2 h-2 rounded-full bg-cyan-400"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span>Playing cosmic ambience...</span>
              </motion.div>
            )}

            {/* Test Sound Button */}
            <button
              onClick={() => cosmicSounds.playChime()}
              disabled={!isEnabled}
              className="mt-3 w-full py-2 text-xs rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Test Sound
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

SoundSettings.displayName = "SoundSettings";
