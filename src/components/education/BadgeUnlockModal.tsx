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

export const BadgeUnlockModal = ({
  badge,
  open,
  onClose,
}: BadgeUnlockModalProps) => {
  if (!badge) return null;

  const Icon = iconMap[badge.icon] || Award;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader>
          <DialogTitle className="sr-only">Badge Conquistado</DialogTitle>
          <DialogDescription className="sr-only">
            Você desbloqueou um novo badge
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          {/* Celebration */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
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

          {/* Badge Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 15,
              delay: 0.3,
            }}
            className="relative mx-auto w-24 h-24 mb-6"
          >
            {/* Glow effect */}
            <div
              className="absolute inset-0 rounded-full blur-xl opacity-50"
              style={{ backgroundColor: badge.color }}
            />
            {/* Badge circle */}
            <div
              className="relative w-full h-full rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${badge.color}20` }}
            >
              <Icon
                className="h-12 w-12"
                style={{ color: badge.color }}
              />
            </div>
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
            className="text-xl font-semibold text-foreground mb-2"
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
            className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold"
          >
            +{badge.points} pontos
          </motion.div>
        </div>

        <Button onClick={onClose} className="w-full">
          Continuar
        </Button>
      </DialogContent>
    </Dialog>
  );
};