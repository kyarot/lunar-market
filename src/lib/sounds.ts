// Cosmic Sound Effects System using Web Audio API
// No external files needed - all sounds generated programmatically

class CosmicSoundEngine {
  private audioContext: AudioContext | null = null;
  private isEnabled: boolean = true;
  private volume: number = 0.3;
  private ambientVolume: number = 0.15;
  private bgmVolume: number = 0.3;
  private isAmbientPlaying: boolean = false;
  private isBgmPlaying: boolean = false;
  private bgmAudio: HTMLAudioElement | null = null;
  private ambientNodes: {
    oscillators: OscillatorNode[];
    gains: GainNode[];
    masterGain: GainNode | null;
  } = { oscillators: [], gains: [], masterGain: null };

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    // Resume context if suspended (browser autoplay policy)
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    return this.audioContext;
  }

  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (!enabled) {
      this.stopAmbient();
      this.stopBgm();
    }
  }

  setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  setAmbientVolume(vol: number) {
    this.ambientVolume = Math.max(0, Math.min(1, vol));
    if (this.ambientNodes.masterGain) {
      this.ambientNodes.masterGain.gain.setValueAtTime(this.ambientVolume, this.getContext().currentTime);
    }
  }

  getEnabled() {
    return this.isEnabled;
  }

  getVolume() {
    return this.volume;
  }

  getAmbientVolume() {
    return this.ambientVolume;
  }

  isAmbientActive() {
    return this.isAmbientPlaying;
  }

  // Interstellar ambient space soundscape
  startAmbient() {
    if (!this.isEnabled || this.isAmbientPlaying) return;
    
    try {
      const ctx = this.getContext();
      
      // Master gain for ambient sounds
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0, ctx.currentTime);
      masterGain.gain.linearRampToValueAtTime(this.ambientVolume, ctx.currentTime + 2);
      masterGain.connect(ctx.destination);
      this.ambientNodes.masterGain = masterGain;

      // Deep space drone - very low frequency
      const drone1 = ctx.createOscillator();
      const droneGain1 = ctx.createGain();
      const droneFilter1 = ctx.createBiquadFilter();
      drone1.type = 'sine';
      drone1.frequency.setValueAtTime(55, ctx.currentTime); // A1
      droneFilter1.type = 'lowpass';
      droneFilter1.frequency.setValueAtTime(100, ctx.currentTime);
      droneGain1.gain.setValueAtTime(0.4, ctx.currentTime);
      drone1.connect(droneFilter1);
      droneFilter1.connect(droneGain1);
      droneGain1.connect(masterGain);
      drone1.start();
      this.ambientNodes.oscillators.push(drone1);
      this.ambientNodes.gains.push(droneGain1);

      // Second harmonic drone
      const drone2 = ctx.createOscillator();
      const droneGain2 = ctx.createGain();
      drone2.type = 'sine';
      drone2.frequency.setValueAtTime(82.5, ctx.currentTime); // E2
      droneGain2.gain.setValueAtTime(0.2, ctx.currentTime);
      drone2.connect(droneGain2);
      droneGain2.connect(masterGain);
      drone2.start();
      this.ambientNodes.oscillators.push(drone2);
      this.ambientNodes.gains.push(droneGain2);

      // Ethereal pad - slow modulation
      const pad = ctx.createOscillator();
      const padGain = ctx.createGain();
      const padFilter = ctx.createBiquadFilter();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      
      pad.type = 'triangle';
      pad.frequency.setValueAtTime(220, ctx.currentTime); // A3
      padFilter.type = 'lowpass';
      padFilter.frequency.setValueAtTime(400, ctx.currentTime);
      padFilter.Q.setValueAtTime(2, ctx.currentTime);
      padGain.gain.setValueAtTime(0.15, ctx.currentTime);
      
      // LFO for subtle movement
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(0.1, ctx.currentTime); // Very slow
      lfoGain.gain.setValueAtTime(20, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(pad.frequency);
      
      pad.connect(padFilter);
      padFilter.connect(padGain);
      padGain.connect(masterGain);
      pad.start();
      lfo.start();
      this.ambientNodes.oscillators.push(pad, lfo);
      this.ambientNodes.gains.push(padGain);

      // High frequency shimmer
      const shimmer = ctx.createOscillator();
      const shimmerGain = ctx.createGain();
      const shimmerFilter = ctx.createBiquadFilter();
      const shimmerLfo = ctx.createOscillator();
      const shimmerLfoGain = ctx.createGain();
      
      shimmer.type = 'sine';
      shimmer.frequency.setValueAtTime(880, ctx.currentTime); // A5
      shimmerFilter.type = 'bandpass';
      shimmerFilter.frequency.setValueAtTime(1000, ctx.currentTime);
      shimmerFilter.Q.setValueAtTime(5, ctx.currentTime);
      shimmerGain.gain.setValueAtTime(0.05, ctx.currentTime);
      
      shimmerLfo.type = 'sine';
      shimmerLfo.frequency.setValueAtTime(0.05, ctx.currentTime);
      shimmerLfoGain.gain.setValueAtTime(100, ctx.currentTime);
      shimmerLfo.connect(shimmerLfoGain);
      shimmerLfoGain.connect(shimmer.frequency);
      
      shimmer.connect(shimmerFilter);
      shimmerFilter.connect(shimmerGain);
      shimmerGain.connect(masterGain);
      shimmer.start();
      shimmerLfo.start();
      this.ambientNodes.oscillators.push(shimmer, shimmerLfo);
      this.ambientNodes.gains.push(shimmerGain);

      // Cosmic wind noise
      const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const noiseData = noiseBuffer.getChannelData(0);
      for (let i = 0; i < noiseData.length; i++) {
        noiseData[i] = (Math.random() * 2 - 1) * 0.5;
      }
      
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      noise.loop = true;
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.setValueAtTime(200, ctx.currentTime);
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.08, ctx.currentTime);
      
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(masterGain);
      noise.start();
      
      this.isAmbientPlaying = true;
    } catch (e) {
      console.warn('Ambient sound failed:', e);
    }
  }

  stopAmbient() {
    if (!this.isAmbientPlaying) return;
    
    try {
      const ctx = this.getContext();
      
      // Fade out
      if (this.ambientNodes.masterGain) {
        this.ambientNodes.masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1);
      }
      
      // Stop all oscillators after fade
      setTimeout(() => {
        this.ambientNodes.oscillators.forEach(osc => {
          try { osc.stop(); } catch {}
        });
        this.ambientNodes.oscillators = [];
        this.ambientNodes.gains = [];
        this.ambientNodes.masterGain = null;
        this.isAmbientPlaying = false;
      }, 1100);
    } catch (e) {
      console.warn('Stop ambient failed:', e);
    }
  }

  toggleAmbient() {
    if (this.isAmbientPlaying) {
      this.stopAmbient();
    } else {
      this.startAmbient();
    }
    return !this.isAmbientPlaying;
  }

  // Background Music (BGM) - plays the audio file in loop
  startBgm() {
    if (!this.isEnabled || this.isBgmPlaying) return;
    
    try {
      if (!this.bgmAudio) {
        this.bgmAudio = new Audio('/bgm.mp3');
        this.bgmAudio.loop = true;
        this.bgmAudio.volume = this.bgmVolume;
      }
      
      this.bgmAudio.play().then(() => {
        this.isBgmPlaying = true;
      }).catch(e => {
        console.warn('BGM autoplay blocked, will play on user interaction:', e);
      });
    } catch (e) {
      console.warn('BGM failed to start:', e);
    }
  }

  stopBgm() {
    if (!this.bgmAudio || !this.isBgmPlaying) return;
    
    try {
      this.bgmAudio.pause();
      this.bgmAudio.currentTime = 0;
      this.isBgmPlaying = false;
    } catch (e) {
      console.warn('BGM failed to stop:', e);
    }
  }

  toggleBgm() {
    if (this.isBgmPlaying) {
      this.stopBgm();
    } else {
      this.startBgm();
    }
    return this.isBgmPlaying;
  }

  setBgmVolume(vol: number) {
    this.bgmVolume = Math.max(0, Math.min(1, vol));
    if (this.bgmAudio) {
      this.bgmAudio.volume = this.bgmVolume;
    }
  }

  getBgmVolume() {
    return this.bgmVolume;
  }

  isBgmActive() {
    return this.isBgmPlaying;
  }

  // Soft click sound - for buttons
  playClick() {
    if (!this.isEnabled) return;
    try {
      const ctx = this.getContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.setValueAtTime(800, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.05);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(this.volume * 0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.05);
    } catch (e) {
      console.warn('Sound playback failed:', e);
    }
  }

  // Whoosh sound - for scrolling/navigation
  playWhoosh() {
    if (!this.isEnabled) return;
    try {
      const ctx = this.getContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      oscillator.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      // White noise-like effect
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(100, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.15);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2000, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.15);

      gainNode.gain.setValueAtTime(this.volume * 0.15, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.15);
    } catch (e) {
      console.warn('Sound playback failed:', e);
    }
  }

  // Cosmic chime - for moon phase changes
  playChime() {
    if (!this.isEnabled) return;
    try {
      const ctx = this.getContext();
      const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5 chord

      frequencies.forEach((freq, i) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.frequency.setValueAtTime(freq, ctx.currentTime);
        oscillator.type = 'sine';

        const startTime = ctx.currentTime + i * 0.05;
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(this.volume * 0.2, startTime + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);

        oscillator.start(startTime);
        oscillator.stop(startTime + 0.5);
      });
    } catch (e) {
      console.warn('Sound playback failed:', e);
    }
  }

  // Sparkle sound - for hover effects
  playSparkle() {
    if (!this.isEnabled) return;
    try {
      const ctx = this.getContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.setValueAtTime(2000, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(4000, ctx.currentTime + 0.08);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(this.volume * 0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.08);
    } catch (e) {
      console.warn('Sound playback failed:', e);
    }
  }

  // Success/positive sound - for AI responses, predictions
  playSuccess() {
    if (!this.isEnabled) return;
    try {
      const ctx = this.getContext();
      const frequencies = [440, 554.37, 659.25]; // A4, C#5, E5

      frequencies.forEach((freq, i) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
        oscillator.type = 'sine';

        const startTime = ctx.currentTime + i * 0.08;
        gainNode.gain.setValueAtTime(this.volume * 0.15, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);

        oscillator.start(startTime);
        oscillator.stop(startTime + 0.3);
      });
    } catch (e) {
      console.warn('Sound playback failed:', e);
    }
  }

  // Ambient cosmic drone - for background atmosphere
  playAmbientPulse() {
    if (!this.isEnabled) return;
    try {
      const ctx = this.getContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      oscillator.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.setValueAtTime(80, ctx.currentTime);
      oscillator.type = 'sine';

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(200, ctx.currentTime);

      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(this.volume * 0.08, ctx.currentTime + 0.5);
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 2);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 2);
    } catch (e) {
      console.warn('Sound playback failed:', e);
    }
  }

  // Chat open/close sound
  playChatToggle(isOpening: boolean) {
    if (!this.isEnabled) return;
    try {
      const ctx = this.getContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      if (isOpening) {
        oscillator.frequency.setValueAtTime(300, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
      } else {
        oscillator.frequency.setValueAtTime(600, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1);
      }
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(this.volume * 0.2, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.1);
    } catch (e) {
      console.warn('Sound playback failed:', e);
    }
  }

  // Message send sound
  playSend() {
    if (!this.isEnabled) return;
    try {
      const ctx = this.getContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.setValueAtTime(500, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.06);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(this.volume * 0.2, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.06);
    } catch (e) {
      console.warn('Sound playback failed:', e);
    }
  }

  // Message receive sound
  playReceive() {
    if (!this.isEnabled) return;
    try {
      const ctx = this.getContext();
      const oscillator = ctx.createOscillator();
      const oscillator2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      oscillator2.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.setValueAtTime(800, ctx.currentTime);
      oscillator.type = 'sine';
      
      oscillator2.frequency.setValueAtTime(1200, ctx.currentTime);
      oscillator2.type = 'sine';

      gainNode.gain.setValueAtTime(this.volume * 0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

      oscillator.start(ctx.currentTime);
      oscillator2.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.15);
      oscillator2.stop(ctx.currentTime + 0.15);
    } catch (e) {
      console.warn('Sound playback failed:', e);
    }
  }

  // Select/dropdown sound
  playSelect() {
    if (!this.isEnabled) return;
    try {
      const ctx = this.getContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.setValueAtTime(600, ctx.currentTime);
      oscillator.frequency.setValueAtTime(700, ctx.currentTime + 0.03);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(this.volume * 0.15, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.08);
    } catch (e) {
      console.warn('Sound playback failed:', e);
    }
  }
}

// Singleton instance
export const cosmicSounds = new CosmicSoundEngine();

// React hook for sound effects
import { useCallback } from 'react';

export function useSounds() {
  const playClick = useCallback(() => cosmicSounds.playClick(), []);
  const playWhoosh = useCallback(() => cosmicSounds.playWhoosh(), []);
  const playChime = useCallback(() => cosmicSounds.playChime(), []);
  const playSparkle = useCallback(() => cosmicSounds.playSparkle(), []);
  const playSuccess = useCallback(() => cosmicSounds.playSuccess(), []);
  const playAmbientPulse = useCallback(() => cosmicSounds.playAmbientPulse(), []);
  const playChatToggle = useCallback((isOpening: boolean) => cosmicSounds.playChatToggle(isOpening), []);
  const playSend = useCallback(() => cosmicSounds.playSend(), []);
  const playReceive = useCallback(() => cosmicSounds.playReceive(), []);
  const playSelect = useCallback(() => cosmicSounds.playSelect(), []);
  
  const setEnabled = useCallback((enabled: boolean) => cosmicSounds.setEnabled(enabled), []);
  const setVolume = useCallback((vol: number) => cosmicSounds.setVolume(vol), []);
  const getEnabled = useCallback(() => cosmicSounds.getEnabled(), []);
  const getVolume = useCallback(() => cosmicSounds.getVolume(), []);
  
  // Ambient space sounds
  const startAmbient = useCallback(() => cosmicSounds.startAmbient(), []);
  const stopAmbient = useCallback(() => cosmicSounds.stopAmbient(), []);
  const toggleAmbient = useCallback(() => cosmicSounds.toggleAmbient(), []);
  const setAmbientVolume = useCallback((vol: number) => cosmicSounds.setAmbientVolume(vol), []);
  const getAmbientVolume = useCallback(() => cosmicSounds.getAmbientVolume(), []);
  const isAmbientActive = useCallback(() => cosmicSounds.isAmbientActive(), []);

  // Background music
  const startBgm = useCallback(() => cosmicSounds.startBgm(), []);
  const stopBgm = useCallback(() => cosmicSounds.stopBgm(), []);
  const toggleBgm = useCallback(() => cosmicSounds.toggleBgm(), []);
  const setBgmVolume = useCallback((vol: number) => cosmicSounds.setBgmVolume(vol), []);
  const getBgmVolume = useCallback(() => cosmicSounds.getBgmVolume(), []);
  const isBgmActive = useCallback(() => cosmicSounds.isBgmActive(), []);

  return {
    playClick,
    playWhoosh,
    playChime,
    playSparkle,
    playSuccess,
    playAmbientPulse,
    playChatToggle,
    playSend,
    playReceive,
    playSelect,
    setEnabled,
    setVolume,
    getEnabled,
    getVolume,
    startAmbient,
    stopAmbient,
    toggleAmbient,
    setAmbientVolume,
    getAmbientVolume,
    isAmbientActive,
    startBgm,
    stopBgm,
    toggleBgm,
    setBgmVolume,
    getBgmVolume,
    isBgmActive,
  };
}
