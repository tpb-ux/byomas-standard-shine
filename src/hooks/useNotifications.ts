import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  data?: Record<string, unknown>;
}

export function useNotifications() {
  const { user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  useEffect(() => {
    // Check if notifications are supported
    const supported = 'Notification' in window && 'serviceWorker' in navigator;
    setIsSupported(supported);

    if (supported) {
      setPermission(Notification.permission);
    }
  }, []);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      toast.error('Notificações não são suportadas neste navegador');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        toast.success('Notificações ativadas!');
        await registerServiceWorker();
        return true;
      } else if (result === 'denied') {
        toast.error('Notificações bloqueadas pelo navegador');
        return false;
      }
      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast.error('Erro ao solicitar permissão de notificação');
      return false;
    }
  }, [isSupported]);

  // Register service worker
  const registerServiceWorker = useCallback(async () => {
    if (!('serviceWorker' in navigator)) return null;

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);

      // Wait for the service worker to be ready
      await navigator.serviceWorker.ready;

      // Subscribe to push notifications (simplified without VAPID for now)
      try {
        const pushSubscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            // Placeholder VAPID key - replace with real one in production
            'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U'
          ),
        });

        setSubscription(pushSubscription);

        // Save subscription to database if user is logged in
        if (user) {
          await saveSubscription(pushSubscription);
        }

        return pushSubscription;
      } catch (pushError) {
        console.log('Push subscription not available:', pushError);
        return null;
      }
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }, [user]);

  // Save subscription to database
  const saveSubscription = async (sub: PushSubscription) => {
    if (!user) return;

    const subscriptionData = sub.toJSON();
    
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({
        user_id: user.id,
        endpoint: subscriptionData.endpoint!,
        p256dh: subscriptionData.keys?.p256dh || '',
        auth: subscriptionData.keys?.auth || '',
        is_active: true,
      }, {
        onConflict: 'user_id,endpoint',
      });

    if (error) {
      console.error('Error saving push subscription:', error);
    }
  };

  // Show local notification
  const showNotification = useCallback(async (options: NotificationOptions) => {
    if (permission !== 'granted') {
      // Fallback to toast
      toast(options.title, {
        description: options.body,
      });
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(options.title, {
        body: options.body,
        icon: options.icon || '/logo.png',
        tag: options.tag,
        data: options.data,
        badge: '/logo.png',
      });
    } catch (error) {
      console.error('Error showing notification:', error);
      // Fallback to toast
      toast(options.title, {
        description: options.body,
      });
    }
  }, [permission]);

  // Predefined notification types
  const notify = {
    badgeEarned: (badgeName: string, points: number) => {
      showNotification({
        title: '🏆 Novo Badge Conquistado!',
        body: `Você ganhou o badge "${badgeName}" e +${points} pontos!`,
        tag: 'badge-earned',
      });
    },
    
    challengeCompleted: (challengeName: string, points: number) => {
      showNotification({
        title: '🎯 Desafio Completo!',
        body: `Você completou "${challengeName}"! Resgate ${points} pontos.`,
        tag: 'challenge-completed',
      });
    },
    
    newCourse: (courseName: string) => {
      showNotification({
        title: '📚 Novo Curso Disponível!',
        body: `Confira o novo curso: "${courseName}"`,
        tag: 'new-course',
      });
    },
    
    rankingUpdate: (position: number) => {
      showNotification({
        title: '📈 Você Subiu no Ranking!',
        body: `Parabéns! Você está agora na posição #${position}`,
        tag: 'ranking-update',
      });
    },
    
    studyReminder: () => {
      showNotification({
        title: '🔔 Hora de Estudar!',
        body: 'Continue sua jornada de aprendizado. Há lições esperando por você!',
        tag: 'study-reminder',
      });
    },
    
    weeklyChallenge: () => {
      showNotification({
        title: '🎯 Novos Desafios Semanais!',
        body: 'Novos desafios estão disponíveis. Complete-os para ganhar pontos extras!',
        tag: 'weekly-challenge',
      });
    },
  };

  return {
    isSupported,
    permission,
    subscription,
    requestPermission,
    showNotification,
    notify,
  };
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): BufferSource {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray.buffer;
}
