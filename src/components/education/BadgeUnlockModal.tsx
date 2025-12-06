import { useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge as BadgeType } from "./BadgeCard";
import {
  Award,
  BookOpen,
  Target,
  Trophy,
  Bookmark,
  GraduationCap,
  Flame,
  Compass,
  Diamond,
  Medal,
  Sprout,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";

interface BadgeUnlockModalProps {
  badge: BadgeType | null;
  open: boolean;
  onClose: () => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  award: Award,
  "book-open": BookOpen,
  target: Target,
  trophy: Trophy,
  bookmark: Bookmark,
  "graduation-cap": GraduationCap,
  flame: Flame,
  compass: Compass,
  diamond: Diamond,
  medal: Medal,
  sprout: Sprout,
};

// Convert hex color to RGB for confetti
const hexToRgb = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : [16, 185, 129]; // Default green
};

export const BadgeUnlockModal = ({
  badge,
  open,
  onClose,
}: BadgeUnlockModalProps) => {
  const triggerConfetti = useCallback(() => {
    if (!badge) return;

    const badgeColor = badge.color || "#10b981";
    const [r, g, b] = hexToRgb(badgeColor);

    // Create multiple confetti bursts
    const colors = [badgeColor, "#fbbf24", "#8b5cf6", "#ec4899"];

    // Center burst
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: colors,
    });

    // Left burst
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.65 },
        colors: colors,
      });
    }, 100);

    // Right burst
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.65 },
        colors: colors,
      });
    }, 200);

    // Star burst
    setTimeout(() => {
      confetti({
        particleCount: 30,
        spread: 360,
        startVelocity: 30,
        gravity: 0.5,
        origin: { x: 0.5, y: 0.5 },
        shapes: ["star"],
        colors: [badgeColor, "#fbbf24"],
      });
    }, 400);
  }, [badge]);

  useEffect(() => {
    if (open && badge) {
      // Trigger confetti when modal opens
      setTimeout(triggerConfetti, 300);

      // Play celebration sound (optional - Web Audio API)
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
      } catch (e) {
        // Audio not supported or blocked
        console.log("Audio feedback not available");
      }
    }
  }, [open, badge, triggerConfetti]);

  if (!badge) return null;

  const Icon = iconMap[badge.icon] || Award;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md text-center overflow-hidden">
        <DialogHeader>
          <DialogTitle className="sr-only">Badge Conquistado</DialogTitle>
          <DialogDescription className="sr-only">
            Você desbloqueou um novo badge
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 relative">
          {/* Background glow effect */}
          <div 
            className="absolute inset-0 opacity-10 blur-3xl"
            style={{ backgroundColor: badge.color }}
          />

          {/* Celebration sparkles */}
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
            }}
            className="flex justify-center mb-4"
          >
            <Sparkles className="h-8 w-8 text-amber-500" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold text-foreground mb-6"
          >
            🎉 Parabéns!
          </motion.h2>

          {/* Badge Icon with enhanced animation */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 15,
              delay: 0.3,
            }}
            className="relative mx-auto w-28 h-28 mb-6"
          >
            {/* Animated glow rings */}
            <motion.div
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-0 rounded-full"
              style={{ backgroundColor: badge.color }}
            />
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.3, 0, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
              }}
              className="absolute inset-0 rounded-full"
              style={{ backgroundColor: badge.color }}
            />
            
            {/* Glow effect */}
            <div
              className="absolute inset-0 rounded-full blur-xl opacity-50"
              style={{ backgroundColor: badge.color }}
            />
            
            {/* Badge circle */}
            <motion.div
              animate={{
                boxShadow: [
                  `0 0 20px ${badge.color}40`,
                  `0 0 40px ${badge.color}60`,
                  `0 0 20px ${badge.color}40`,
                ],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative w-full h-full rounded-full flex items-center justify-center border-2"
              style={{ 
                backgroundColor: `${badge.color}20`,
                borderColor: badge.color,
              }}
            >
              <Icon
                className="h-14 w-14"
                style={{ color: badge.color }}
              />
            </motion.div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-muted-foreground mb-2"
          >
            Você desbloqueou um novo badge!
          </motion.p>

          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-xl font-semibold mb-2"
            style={{ color: badge.color }}
          >
            {badge.name}
          </motion.h3>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-sm text-muted-foreground mb-4"
          >
            "{badge.description}"
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary/10 text-primary font-bold text-lg"
          >
            <Trophy className="h-5 w-5" />
            +{badge.points} pontos
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Button onClick={onClose} className="w-full" size="lg">
            Continuar Aprendendo
          </Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
