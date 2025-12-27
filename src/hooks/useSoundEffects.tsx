import { useCallback, useEffect, useRef, createContext, useContext, ReactNode, useState } from "react";

type SoundType = "success" | "click" | "pop" | "whoosh" | "error" | "notification" | "complete";

export const useSoundEffects = (enabled: boolean) => {
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (enabled && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
  }, [enabled]);

  const playTone = useCallback((frequency: number, duration: number, type: OscillatorType = "sine", volume = 0.1) => {
    if (!enabled || !audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
    
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  }, [enabled]);

  const playSound = useCallback((type: SoundType) => {
    if (!enabled) return;

    if (audioContextRef.current?.state === "suspended") {
      audioContextRef.current.resume();
    }

    switch (type) {
      case "success":
        playTone(523.25, 0.1, "sine", 0.08);
        setTimeout(() => playTone(659.25, 0.1, "sine", 0.08), 80);
        setTimeout(() => playTone(783.99, 0.15, "sine", 0.08), 160);
        break;
        
      case "click":
        playTone(800, 0.05, "sine", 0.05);
        break;
        
      case "pop":
        playTone(600, 0.08, "sine", 0.06);
        setTimeout(() => playTone(900, 0.05, "sine", 0.04), 50);
        break;
        
      case "whoosh":
        const ctx = audioContextRef.current;
        if (ctx) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = "sine";
          osc.frequency.setValueAtTime(200, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15);
          gain.gain.setValueAtTime(0.05, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.15);
        }
        break;
        
      case "error":
        playTone(400, 0.15, "sine", 0.08);
        setTimeout(() => playTone(300, 0.2, "sine", 0.08), 100);
        break;
        
      case "notification":
        playTone(880, 0.1, "sine", 0.05);
        setTimeout(() => playTone(1108.73, 0.15, "sine", 0.05), 100);
        break;
        
      case "complete":
        playTone(523.25, 0.1, "sine", 0.06);
        setTimeout(() => playTone(659.25, 0.1, "sine", 0.06), 100);
        setTimeout(() => playTone(783.99, 0.1, "sine", 0.06), 200);
        setTimeout(() => playTone(1046.50, 0.2, "sine", 0.08), 300);
        break;
    }
  }, [enabled, playTone]);

  return { playSound };
};

interface SoundContextType {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  playSound: (type: SoundType) => void;
}

const SoundContext = createContext<SoundContextType | null>(null);

interface SoundProviderProps {
  children: ReactNode;
  initialEnabled?: boolean;
}

export const SoundProvider = ({ children, initialEnabled = false }: SoundProviderProps) => {
  const [enabled, setEnabled] = useState(initialEnabled);
  const { playSound } = useSoundEffects(enabled);

  return (
    <SoundContext.Provider value={{ enabled, setEnabled, playSound }}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSounds = () => {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error("useSounds must be used within a SoundProvider");
  }
  return context;
};