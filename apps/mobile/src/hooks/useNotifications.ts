import { useEffect, useState, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { NotificationService } from '../services/notifications';

export function useNotifications(userId?: string) {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    // Get push token
    NotificationService.getExpoPushToken().then(token => {
      setExpoPushToken(token);
    });

    // Listen for notifications received while app is foregrounded
    notificationListener.current = NotificationService.addNotificationReceivedListener(
      notification => {
        setNotification(notification);
      }
    );

    // Listen for user interactions with notifications
    responseListener.current = NotificationService.addNotificationResponseListener(
      response => {
        const data = response.notification.request.content.data;
        
        // Handle notification tap based on type
        if (data.type === 'daily_horoscope') {
          router.push('/horoscope');
        } else if (data.type === 'transit') {
          router.push('/transits');
        } else if (data.type === 'lunar') {
          router.push('/lunar');
        } else if (data.type === 'test') {
          console.log('Test notification received');
        }
      }
    );

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  // Register token with backend when user logs in
  useEffect(() => {
    if (userId && expoPushToken && !isRegistered) {
      NotificationService.registerPushToken(userId, expoPushToken)
        .then(() => setIsRegistered(true))
        .catch(error => console.error('Failed to register push token:', error));
    }
  }, [userId, expoPushToken, isRegistered]);

  // Helper functions
  const subscribeToTransits = async (transitTypes?: string[]) => {
    if (!userId) {
      throw new Error('User must be logged in to subscribe to notifications');
    }
    await NotificationService.subscribeToTransitNotifications(userId, transitTypes);
  };

  const unsubscribeFromTransits = async () => {
    if (!userId) {
      throw new Error('User must be logged in to unsubscribe from notifications');
    }
    await NotificationService.unsubscribeFromTransitNotifications(userId);
  };

  const subscribeToLunar = async () => {
    if (!userId) {
      throw new Error('User must be logged in to subscribe to notifications');
    }
    await NotificationService.subscribeToLunarNotifications(userId);
  };

  const scheduleDailyHoroscope = async (hour: number = 9, minute: number = 0) => {
    return await NotificationService.scheduleDailyHoroscope(hour, minute);
  };

  const sendTestNotification = async () => {
    await NotificationService.sendTestNotification();
  };

  return {
    expoPushToken,
    notification,
    isRegistered,
    subscribeToTransits,
    unsubscribeFromTransits,
    subscribeToLunar,
    scheduleDailyHoroscope,
    sendTestNotification,
  };
}
