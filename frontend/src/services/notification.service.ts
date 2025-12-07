import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from './supabase';

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
      console.log('Notifications only work on physical devices');
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return false;
    }

    return true;
  }

  // Get Expo push token
  static async getPushToken(): Promise<string | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      const token = await Notifications.getExpoPushTokenAsync({
        projectId: 'your-project-id', // Replace with actual project ID
      });

      if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#186EDE',
        });
      }

      return token.data;
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  }

  // Save push token to database
  static async savePushToken(userId: string, token: string) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ push_token: token })
        .eq('id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error saving push token:', error);
    }
  }

  // Schedule local notification
  static async scheduleNotification(
    title: string,
    body: string,
    data: any,
    triggerSeconds: number
  ) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: {
        seconds: triggerSeconds,
      },
    });
  }

  // Send reminder for transaction
  static async scheduleTransactionReminder(
    transactionId: string,
    counterpartyName: string,
    amount: number,
    dueDate: Date,
    type: 'lend' | 'borrow'
  ) {
    const now = new Date();
    const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilDue <= 0) {
      // Overdue
      await this.scheduleNotification(
        'Payment Overdue',
        `${counterpartyName} - $${amount} is overdue`,
        { transactionId, type: 'overdue' },
        60 // 1 minute for testing
      );
    } else if (daysUntilDue === 1) {
      // Due tomorrow
      await this.scheduleNotification(
        'Payment Due Tomorrow',
        `${counterpartyName} - $${amount} is due tomorrow`,
        { transactionId, type: 'due_tomorrow' },
        60
      );
    } else if (daysUntilDue <= 7) {
      // Due within a week
      await this.scheduleNotification(
        'Upcoming Payment',
        `${counterpartyName} - $${amount} is due in ${daysUntilDue} days`,
        { transactionId, type: 'upcoming' },
        60
      );
    }
  }
}
