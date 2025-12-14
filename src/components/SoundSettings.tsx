import { useState, useEffect, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, Music } from "lucide-react";
import { cosmicSounds } from "@/lib/sounds";

export const SoundSettings = memo(() => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);
  const [volume, setVolume] = useState(0.3);
  const [bgmVolume, setBgmVolume] = useState(0.3);
  const [isBgmPlaying, setIsBgmPlaying] = useState(true); // BGM on by default

  useEffect(() => {
    // Load saved preferences
    const savedEnabled = localStorage.getItem('cosmicSoundsEnabled');
    const savedVolume = localStorage.getItem('cosmicSoundsVolume');
    const savedBgmVolume = localStorage.getItem('cosmicBgmVolume');
    const savedBgmPlaying = localStorage.getItem('cosmicBgmPlaying');
    
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

    if (savedBgmVolume !== null) {
      const vol = parseFloat(savedBgmVolume);
      setBgmVolume(vol);
      cosmicSounds.setBgmVolume(vol);
    }

    // BGM is ON by default unless user explicitly turned it off
    const shouldPlayBgm = savedBgmPlaying !== 'false' && savedEnabled !== 'false';
    
    if (shouldPlayBgm) {
      // Start BGM on first user interaction (browser autoplay policy)
      const startBgmOnInteraction = () => {
        cosmicSounds.startBgm();
        setIsBgmPlaying(true);
        document.removeEventListener('click', startBgmOnInteraction);
        document.removeEventListener('keydown', startBgmOnInteraction);
      };
      document.addEventListener('click', startBgmOnInteraction, { once: true });
      document.addEventListener('keydown', startBgmOnInteraction, { once: true });
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
      setIsBgmPlaying(false);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    cosmicSounds.setVolume(newVolume);
    localStorage.setItem('cosmicSoundsVolume', String(newVolume));
    cosmicSounds.playClick();
  };

  const handleBgmVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setBgmVolume(newVolume);
    cosmicSounds.setBgmVolume(newVolume);
    localStorage.setItem('cosmicBgmVolume', String(newVolume));
  };

  const handleToggleBgm = () => {
    if (!isEnabled) return;
    
    const newState = !isBgmPlaying;
    if (newState) {
      cosmicSounds.startBgm();
    } else {
      cosmicSounds.stopBgm();
    }
    setIsBgmPlaying(newState);
    localStorage.setItem('cosmicBgmPlaying', String(newState));
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

            {/* Background Music Section */}
            <div className="flex items-center gap-2 mb-3">
              <Music className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-medium text-foreground">Background Music</span>
            </div>

            {/* BGM Toggle */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground">Space Chords</span>
              <button
                onClick={handleToggleBgm}
                disabled={!isEnabled}
                className={`w-10 h-5 rounded-full transition-colors relative disabled:opacity-50 ${
                  isBgmPlaying ? 'bg-purple-500' : 'bg-muted/50'
                }`}
              >
                <motion.div
                  className="absolute top-0.5 w-4 h-4 rounded-full bg-white"
                  animate={{ left: isBgmPlaying ? '22px' : '2px' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
            </div>

            {/* BGM Volume Slider */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Music Volume</span>
                <span className="text-xs text-foreground">{Math.round(bgmVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={bgmVolume}
                onChange={handleBgmVolumeChange}
                disabled={!isEnabled}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer disabled:opacity-50"
                style={{
                  background: `linear-gradient(to right, hsl(270, 70%, 55%) ${bgmVolume * 100}%, hsl(217, 19%, 20%) ${bgmVolume * 100}%)`,
                }}
              />
            </div>

            {/* BGM Status */}
            {isBgmPlaying && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-xs text-purple-400"
              >
                <motion.div
                  className="w-2 h-2 rounded-full bg-purple-400"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <span>Playing space chords...</span>
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
