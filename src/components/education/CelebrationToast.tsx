import { motion } from "framer-motion";
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
  X,
} from "lucide-react";

interface CelebrationToastProps {
  badgeName: string;
  badgeIcon: string;
  badgeColor: string;
  points: number;
  onDismiss: () => void;
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

export const CelebrationToast = ({
  badgeName,
  badgeIcon,
  badgeColor,
  points,
  onDismiss,
}: CelebrationToastProps) => {
  const Icon = iconMap[badgeIcon] || Award;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.8 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="relative flex items-center gap-4 p-4 pr-12 bg-background border border-border rounded-xl shadow-2xl max-w-md"
    >
      {/* Glow background */}
      <div
        className="absolute inset-0 rounded-xl opacity-20 blur-xl"
        style={{ backgroundColor: badgeColor }}
      />

      {/* Badge icon with pulse animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.2, 1] }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="relative flex-shrink-0"
      >
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${badgeColor}20` }}
        >
          <motion.div
            animate={{ 
              boxShadow: [
                `0 0 0 0 ${badgeColor}40`,
                `0 0 0 10px ${badgeColor}00`,
              ]
            }}
            transition={{ duration: 1, repeat: 2 }}
          >
            <Icon className="h-7 w-7" style={{ color: badgeColor }} />
          </motion.div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="relative z-10 flex-1">
        <motion.p
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="text-xs text-muted-foreground font-medium uppercase tracking-wider"
        >
          🎉 Badge Conquistado!
        </motion.p>
        <motion.h4
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="text-base font-bold text-foreground"
          style={{ color: badgeColor }}
        >
          {badgeName}
        </motion.h4>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-sm font-semibold text-primary"
        >
          +{points} pontos
        </motion.p>
      </div>

      {/* Close button */}
      <button
        onClick={onDismiss}
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted transition-colors"
      >
        <X className="h-4 w-4 text-muted-foreground" />
      </button>

      {/* Sparkle decorations */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ delay: 0.3, duration: 1.5, repeat: Infinity }}
        className="absolute -top-1 -right-1 text-lg"
      >
        ✨
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ delay: 0.6, duration: 1.5, repeat: Infinity }}
        className="absolute -bottom-1 -left-1 text-lg"
      >
        ⭐
      </motion.div>
    </motion.div>
  );
};
