import { motion, AnimatePresence } from "framer-motion";
import { Search, FileText, TrendingUp, CheckCircle2, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";

export type GenerationStep = 'idle' | 'analyzing' | 'generating' | 'optimizing' | 'complete';

interface StepConfig {
  label: string;
  icon: React.ElementType;
  percentage: number;
}

const STEPS_CONFIG: Record<Exclude<GenerationStep, 'idle'>, StepConfig> = {
  analyzing: { label: "Analisando tema e contexto...", icon: Search, percentage: 25 },
  generating: { label: "Gerando conteúdo otimizado...", icon: FileText, percentage: 50 },
  optimizing: { label: "Otimizando SEO e estrutura...", icon: TrendingUp, percentage: 75 },
  complete: { label: "Artigo gerado com sucesso!", icon: CheckCircle2, percentage: 100 },
};

const STEPS_ORDER: Exclude<GenerationStep, 'idle'>[] = ['analyzing', 'generating', 'optimizing', 'complete'];

interface AIGenerationProgressProps {
  currentStep: GenerationStep;
  isVisible: boolean;
}

export function AIGenerationProgress({ currentStep, isVisible }: AIGenerationProgressProps) {
  if (currentStep === 'idle') return null;

  const currentStepIndex = STEPS_ORDER.indexOf(currentStep as Exclude<GenerationStep, 'idle'>);
  const progressValue = STEPS_CONFIG[currentStep as Exclude<GenerationStep, 'idle'>]?.percentage || 0;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <motion.div
                  animate={{ rotate: currentStep !== 'complete' ? 360 : 0 }}
                  transition={{ duration: 2, repeat: currentStep !== 'complete' ? Infinity : 0, ease: "linear" }}
                  className="p-2 rounded-full bg-primary/20"
                >
                  <FileText className="h-5 w-5 text-primary" />
                </motion.div>
                <div>
                  <h3 className="font-semibold text-foreground">Gerando Artigo com IA</h3>
                  <p className="text-sm text-muted-foreground">
                    {STEPS_CONFIG[currentStep as Exclude<GenerationStep, 'idle'>]?.label}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Progresso</span>
                  <span className="text-sm font-medium text-foreground">{progressValue}%</span>
                </div>
                <Progress value={progressValue} className="h-2" />
              </div>

              <div className="space-y-3">
                {STEPS_ORDER.map((step, index) => {
                  const config = STEPS_CONFIG[step];
                  const Icon = config.icon;
                  const isCompleted = index < currentStepIndex;
                  const isCurrent = step === currentStep;
                  const isPending = index > currentStepIndex;

                  return (
                    <motion.div
                      key={step}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                        isCurrent ? 'bg-primary/10' : ''
                      }`}
                    >
                      <div className={`flex-shrink-0 ${
                        isCompleted ? 'text-green-500' :
                        isCurrent ? 'text-primary' :
                        'text-muted-foreground/50'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : isCurrent ? (
                          <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          >
                            {step === 'complete' ? (
                              <CheckCircle2 className="h-5 w-5" />
                            ) : (
                              <Loader2 className="h-5 w-5 animate-spin" />
                            )}
                          </motion.div>
                        ) : (
                          <Icon className="h-5 w-5" />
                        )}
                      </div>
                      <span className={`text-sm ${
                        isCompleted ? 'text-green-500 line-through' :
                        isCurrent ? 'text-foreground font-medium' :
                        'text-muted-foreground/50'
                      }`}>
                        {config.label}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
