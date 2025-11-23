import { View, Text, ScrollView, Switch, TouchableOpacity, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useNotifications } from '../src/hooks/useNotifications';

export default function NotificationSettings() {
  const { 
    expoPushToken, 
    subscribeToTransits, 
    unsubscribeFromTransits,
    subscribeToLunar,
    scheduleDailyHoroscope,
    sendTestNotification 
  } = useNotifications('user-id-placeholder'); // TODO: Get actual user ID from auth context

  const [settings, setSettings] = useState({
    dailyHoroscope: true,
    horoscopeTime: '09:00',
    transits: false,
    lunarPhases: false,
    reminders: true,
  });

  const [loading, setLoading] = useState(false);

  const handleToggle = async (key: keyof typeof settings) => {
    const newValue = !settings[key];
    setSettings(prev => ({ ...prev, [key]: newValue }));

    try {
      setLoading(true);

      if (key === 'transits') {
        if (newValue) {
          await subscribeToTransits(['major']);
          Alert.alert('Success', 'You will now receive transit notifications');
        } else {
          await unsubscribeFromTransits();
          Alert.alert('Success', 'Transit notifications disabled');
        }
      } else if (key === 'lunarPhases') {
        if (newValue) {
          await subscribeToLunar();
          Alert.alert('Success', 'You will now receive lunar phase notifications');
        }
      } else if (key === 'dailyHoroscope') {
        if (newValue) {
          await scheduleDailyHoroscope(9, 0);
          Alert.alert('Success', 'Daily horoscope notifications enabled');
        }
      }
    } catch (error) {
      console.error('Error updating notification settings:', error);
      Alert.alert('Error', 'Failed to update notification settings');
      // Revert the change
      setSettings(prev => ({ ...prev, [key]: !newValue }));
    } finally {
      setLoading(false);
    }
  };

  const handleTestNotification = async () => {
    try {
      await sendTestNotification();
      Alert.alert('Test Sent', 'Check your notifications!');
    } catch (error) {
      Alert.alert('Error', 'Failed to send test notification');
    }
  };

  return (
    <LinearGradient
      colors={['#0F0A1F', '#1a0f2e', '#0F0A1F']}
      className="flex-1"
    >
      <ScrollView className="flex-1 px-6 pt-16">
        {/* Header */}
        <View className="mb-8">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mb-4"
          >
            <Text className="text-[#D4AF37] text-lg">← Back</Text>
          </TouchableOpacity>
          <Text className="text-white text-3xl font-bold mb-2">
            🔔 Notifications
          </Text>
          <Text className="text-gray-400 text-base">
            Manage your notification preferences
          </Text>
        </View>

        {/* Push Token Status */}
        {expoPushToken && (
          <View className="bg-[#1a0f2e] rounded-2xl p-4 mb-6 border border-[#D4AF37]/20">
            <Text className="text-[#D4AF37] text-sm mb-1">✓ Push Notifications Enabled</Text>
            <Text className="text-gray-500 text-xs">Token: {expoPushToken.substring(0, 20)}...</Text>
          </View>
        )}

        {/* Settings */}
        <View className="space-y-4">
          {/* Daily Horoscope */}
          <View className="bg-[#1a0f2e] rounded-2xl p-5 border border-[#D4AF37]/20">
            <View className="flex-row justify-between items-center">
              <View className="flex-1 mr-4">
                <Text className="text-white text-lg font-semibold mb-1">
                  🌟 Daily Horoscope
                </Text>
                <Text className="text-gray-400 text-sm">
                  Get your daily horoscope every morning
                </Text>
              </View>
              <Switch
                value={settings.dailyHoroscope}
                onValueChange={() => handleToggle('dailyHoroscope')}
                trackColor={{ false: '#3e3e3e', true: '#D4AF37' }}
                thumbColor={settings.dailyHoroscope ? '#FFD700' : '#f4f3f4'}
                disabled={loading}
              />
            </View>
          </View>

          {/* Transit Notifications */}
          <View className="bg-[#1a0f2e] rounded-2xl p-5 border border-[#D4AF37]/20">
            <View className="flex-row justify-between items-center">
              <View className="flex-1 mr-4">
                <Text className="text-white text-lg font-semibold mb-1">
                  ⭐ Transit Alerts
                </Text>
                <Text className="text-gray-400 text-sm">
                  Important planetary transits (Platinum only)
                </Text>
              </View>
              <Switch
                value={settings.transits}
                onValueChange={() => handleToggle('transits')}
                trackColor={{ false: '#3e3e3e', true: '#D4AF37' }}
                thumbColor={settings.transits ? '#FFD700' : '#f4f3f4'}
                disabled={loading}
              />
            </View>
          </View>

          {/* Lunar Phase Notifications */}
          <View className="bg-[#1a0f2e] rounded-2xl p-5 border border-[#D4AF37]/20">
            <View className="flex-row justify-between items-center">
              <View className="flex-1 mr-4">
                <Text className="text-white text-lg font-semibold mb-1">
                  🌙 Lunar Phases
                </Text>
                <Text className="text-gray-400 text-sm">
                  New moon, full moon, and other phases (Platinum only)
                </Text>
              </View>
              <Switch
                value={settings.lunarPhases}
                onValueChange={() => handleToggle('lunarPhases')}
                trackColor={{ false: '#3e3e3e', true: '#D4AF37' }}
                thumbColor={settings.lunarPhases ? '#FFD700' : '#f4f3f4'}
                disabled={loading}
              />
            </View>
          </View>

          {/* General Reminders */}
          <View className="bg-[#1a0f2e] rounded-2xl p-5 border border-[#D4AF37]/20">
            <View className="flex-row justify-between items-center">
              <View className="flex-1 mr-4">
                <Text className="text-white text-lg font-semibold mb-1">
                  🔔 Reminders
                </Text>
                <Text className="text-gray-400 text-sm">
                  General app reminders and updates
                </Text>
              </View>
              <Switch
                value={settings.reminders}
                onValueChange={() => handleToggle('reminders')}
                trackColor={{ false: '#3e3e3e', true: '#D4AF37' }}
                thumbColor={settings.reminders ? '#FFD700' : '#f4f3f4'}
                disabled={loading}
              />
            </View>
          </View>
        </View>

        {/* Test Notification Button */}
        <TouchableOpacity
          onPress={handleTestNotification}
          className="bg-[#D4AF37] rounded-xl p-4 mt-8 mb-8"
        >
          <Text className="text-[#0F0A1F] text-center text-lg font-bold">
            Send Test Notification
          </Text>
        </TouchableOpacity>

        {/* Info */}
        <View className="bg-[#1a0f2e]/50 rounded-xl p-4 mb-8">
          <Text className="text-gray-400 text-sm text-center">
            💡 Some notifications require Premium or Platinum subscription
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
