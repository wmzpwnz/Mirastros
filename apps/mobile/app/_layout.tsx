import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import OfflineIndicator from '../src/components/OfflineIndicator';
import { OfflineSyncService } from '../src/services/offlineSync';
import { useNotifications } from '../src/hooks/useNotifications';
import { AuthProvider } from '../src/contexts/AuthContext';
import '../global.css';

export default function RootLayout() {
    // Initialize notifications
    const { expoPushToken } = useNotifications();

    useEffect(() => {
        // Start auto-sync for offline requests
        const unsubscribe = OfflineSyncService.startAutoSync();
        
        return () => {
            unsubscribe();
        };
    }, []);

    useEffect(() => {
        if (expoPushToken) {
            console.log('Push token ready:', expoPushToken);
            // TODO: Send token to backend when user is authenticated
        }
    }, [expoPushToken]);

    return (
        <AuthProvider>
            <StatusBar style="light" />
            <View style={{ flex: 1 }}>
                <OfflineIndicator />
                <Stack
                    screenOptions={{
                        headerShown: false,
                        contentStyle: { backgroundColor: '#0F0A1F' },
                    }}
                >
                    <Stack.Screen name="index" />
                    <Stack.Screen name="auth/login" />
                    <Stack.Screen name="auth/register" />
                    <Stack.Screen name="profile" />
                    <Stack.Screen name="subscription" />
                    <Stack.Screen name="biometric-settings" />
                    <Stack.Screen name="notification-settings" />
                    <Stack.Screen name="horoscope" />
                    <Stack.Screen name="tarot" />
                    <Stack.Screen name="natal" />
                    <Stack.Screen name="numerology" />
                    <Stack.Screen name="dream" />
                    <Stack.Screen name="runes" />
                    <Stack.Screen name="iching" />
                </Stack>
            </View>
        </AuthProvider>
    );
}
