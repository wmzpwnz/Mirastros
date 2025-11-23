import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export class NotificationService {
  // Request notification permissions
  static async requestPermissions(): Promise<boolean> {
    if (!Device.isDevice) {
      console.log('Must use physical device for push notifications');
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push notification permissions');
      return false;
    }

    return true;
  }

  // Get push notification token
  static async getExpoPushToken(): Promise<string | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      const token = await Notifications.getExpoPushTokenAsync({
        projectId: 'your-project-id', // TODO: Replace with actual project ID
      });

      console.log('Expo Push Token:', token.data);

      // Configure Android notification channel
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#D4AF37',
        });
      }

      return token.data;
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  }

  // Schedule local notification
  static async scheduleNotification(
    title: string,
    body: string,
    data?: any,
    trigger?: Notifications.NotificationTriggerInput
  ): Promise<string> {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: trigger || null, // null means immediate
    });

    return id;
  }

  // Schedule daily horoscope notification
  static async scheduleDailyHoroscope(hour: number = 9, minute: number = 0): Promise<string> {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title: '🌟 Your Daily Horoscope',
        body: 'Discover what the stars have aligned for you today',
        data: { type: 'daily_horoscope' },
        sound: true,
      },
      trigger: {
        hour,
        minute,
        repeats: true,
      },
    });
  }

  // Schedule transit notification
  static async scheduleTransitNotification(
    transitName: string,
    date: Date
  ): Promise<string> {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title: '⭐ Important Transit Alert',
        body: `${transitName} is happening. Check your personalized insights.`,
        data: { type: 'transit', transitName },
        sound: true,
      },
      trigger: {
        date,
      },
    });
  }

  // Cancel notification
  static async cancelNotification(notificationId: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  // Cancel all notifications
  static async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  // Get all scheduled notifications
  static async getAllScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    return await Notifications.getAllScheduledNotificationsAsync();
  }

  // Add notification received listener
  static addNotificationReceivedListener(
    callback: (notification: Notifications.Notification) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(callback);
  }

  // Add notification response listener (when user taps notification)
  static addNotificationResponseListener(
    callback: (response: Notifications.NotificationResponse) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }

  // Register push token with backend
  static async registerPushToken(userId: string, token: string): Promise<void> {
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
      
      const response = await fetch(`${apiUrl}/notifications/register`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          user_id: userId, 
          push_token: token, 
          platform: Platform.OS,
          device_type: Device.deviceName || 'unknown'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to register push token');
      }

      console.log('Push token registered successfully');
    } catch (error) {
      console.error('Error registering push token:', error);
      throw error;
    }
  }

  // Unregister push token from backend
  static async unregisterPushToken(userId: string, token: string): Promise<void> {
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
      
      const response = await fetch(`${apiUrl}/notifications/unregister`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          user_id: userId, 
          push_token: token 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to unregister push token');
      }

      console.log('Push token unregistered successfully');
    } catch (error) {
      console.error('Error unregistering push token:', error);
      throw error;
    }
  }

  // Subscribe to transit notifications
  static async subscribeToTransitNotifications(
    userId: string,
    transitTypes: string[] = ['major']
  ): Promise<void> {
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
      
      const response = await fetch(`${apiUrl}/notifications/subscribe/transits`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          user_id: userId,
          transit_types: transitTypes
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to subscribe to transit notifications');
      }

      console.log('Subscribed to transit notifications');
    } catch (error) {
      console.error('Error subscribing to transit notifications:', error);
      throw error;
    }
  }

  // Unsubscribe from transit notifications
  static async unsubscribeFromTransitNotifications(userId: string): Promise<void> {
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
      
      const response = await fetch(`${apiUrl}/notifications/unsubscribe/transits`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          user_id: userId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to unsubscribe from transit notifications');
      }

      console.log('Unsubscribed from transit notifications');
    } catch (error) {
      console.error('Error unsubscribing from transit notifications:', error);
      throw error;
    }
  }

  // Subscribe to lunar phase notifications
  static async subscribeToLunarNotifications(userId: string): Promise<void> {
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
      
      const response = await fetch(`${apiUrl}/notifications/subscribe/lunar`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          user_id: userId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to subscribe to lunar notifications');
      }

      console.log('Subscribed to lunar notifications');
    } catch (error) {
      console.error('Error subscribing to lunar notifications:', error);
      throw error;
    }
  }

  // Test notification delivery
  static async sendTestNotification(): Promise<void> {
    await this.scheduleNotification(
      '🔮 Test Notification',
      'This is a test notification from Mirastros',
      { type: 'test' }
    );
  }
}
