import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface DirectAnswerProps {
  answer: string;
  className?: string;
}

const DirectAnswer = ({ answer, className = "" }: DirectAnswerProps) => {
  if (!answer) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`my-8 p-6 bg-primary/5 border-l-4 border-primary rounded-r-lg ${className}`}
    >
      <div className="flex items-start gap-3">
        <Sparkles className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
        <div>
          <span className="text-xs font-medium text-primary uppercase tracking-wide">
            Resposta Rápida
          </span>
          <p className="mt-2 text-foreground/90 font-medium leading-relaxed">
            {answer}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default DirectAnswer;
