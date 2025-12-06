import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Bell, BellOff, Check } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";

export function NotificationBell() {
  const { isSupported, permission, requestPermission } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const handleEnableNotifications = async () => {
    await requestPermission();
  };

  if (!isSupported) {
    return null;
  }

  const isEnabled = permission === 'granted';

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "relative",
            isEnabled && "text-primary"
          )}
        >
          {isEnabled ? (
            <Bell className="h-5 w-5" />
          ) : (
            <BellOff className="h-5 w-5 text-muted-foreground" />
          )}
          
          {/* Notification dot */}
          {isEnabled && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full" />
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-72" align="end">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-full",
              isEnabled ? "bg-green-500/20" : "bg-muted"
            )}>
              {isEnabled ? (
                <Bell className="h-5 w-5 text-green-500" />
              ) : (
                <BellOff className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            
            <div>
              <h4 className="font-semibold">
                {isEnabled ? "Notificações Ativas" : "Notificações Desativadas"}
              </h4>
              <p className="text-xs text-muted-foreground">
                {isEnabled 
                  ? "Você receberá alertas sobre novos badges, desafios e cursos."
                  : "Ative para receber alertas importantes."
                }
              </p>
            </div>
          </div>
          
          {!isEnabled && (
            <Button 
              className="w-full" 
              onClick={handleEnableNotifications}
            >
              <Bell className="h-4 w-4 mr-2" />
              Ativar Notificações
            </Button>
          )}
          
          {isEnabled && (
            <div className="space-y-2 pt-2 border-t">
              <p className="text-xs font-medium text-muted-foreground uppercase">
                Você será notificado sobre:
              </p>
              {[
                "Novos badges conquistados",
                "Desafios semanais",
                "Novos cursos disponíveis",
                "Atualizações de ranking",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm">
                  <Check className="h-3 w-3 text-green-500" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
