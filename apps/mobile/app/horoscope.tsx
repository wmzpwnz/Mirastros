import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { HoroscopeAPI } from '../src/services/api';
import { useOfflineApi } from '../src/hooks/useOfflineApi';

const zodiacSigns = [
    { name: 'Aries', icon: '♈', dates: 'Mar 21 - Apr 19' },
    { name: 'Taurus', icon: '♉', dates: 'Apr 20 - May 20' },
    { name: 'Gemini', icon: '♊', dates: 'May 21 - Jun 20' },
    { name: 'Cancer', icon: '♋', dates: 'Jun 21 - Jul 22' },
    { name: 'Leo', icon: '♌', dates: 'Jul 23 - Aug 22' },
    { name: 'Virgo', icon: '♍', dates: 'Aug 23 - Sep 22' },
    { name: 'Libra', icon: '♎', dates: 'Sep 23 - Oct 22' },
    { name: 'Scorpio', icon: '♏', dates: 'Oct 23 - Nov 21' },
    { name: 'Sagittarius', icon: '♐', dates: 'Nov 22 - Dec 21' },
    { name: 'Capricorn', icon: '♑', dates: 'Dec 22 - Jan 19' },
    { name: 'Aquarius', icon: '♒', dates: 'Jan 20 - Feb 18' },
    { name: 'Pisces', icon: '♓', dates: 'Feb 19 - Mar 20' },
];

export default function HoroscopeScreen() {
    const router = useRouter();
    const [selectedSign, setSelectedSign] = useState('Aries');
    
    const { data, loading, error, fromCache, execute } = useOfflineApi(HoroscopeAPI.getDaily);

    const getPrediction = async () => {
        await execute(selectedSign.toLowerCase());
    };

    return (
        <ScrollView className="flex-1 bg-cosmic">
            {/* Header */}
            <View className="px-6 pt-16 pb-6">
                <TouchableOpacity onPress={() => router.back()} className="mb-4">
                    <Text className="text-gold text-lg">← Back</Text>
                </TouchableOpacity>
                <Text className="text-4xl font-cinzel text-gold mb-2">Daily Horoscope</Text>
                <Text className="text-silver/60">Cosmic guidance for your sign</Text>
            </View>

            {/* Zodiac Sign Selection */}
            <View className="px-6 pb-6">
                <Text className="text-lg text-silver mb-4">Select Your Sign</Text>
                <View className="flex-row flex-wrap gap-2">
                    {zodiacSigns.map((sign) => (
                        <TouchableOpacity
                            key={sign.name}
                            onPress={() => setSelectedSign(sign.name)}
                            className={`px-4 py-3 rounded-xl ${selectedSign === sign.name
                                    ? 'bg-gold/20 border border-gold/30'
                                    : 'bg-white/5 border border-white/10'
                                }`}
                        >
                            <Text className="text-2xl mb-1">{sign.icon}</Text>
                            <Text
                                className={`text-sm ${selectedSign === sign.name ? 'text-gold' : 'text-silver/60'
                                    }`}
                            >
                                {sign.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Get Prediction Button */}
            <View className="px-6 pb-6">
                <TouchableOpacity
                    onPress={getPrediction}
                    disabled={loading}
                    className="bg-gold/20 border border-gold/30 rounded-xl p-4"
                >
                    <Text className="text-gold text-center font-bold text-lg">
                        {loading ? 'Loading...' : 'Get Today\'s Horoscope'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Prediction Result */}
            {loading && (
                <View className="px-6 pb-6">
                    <ActivityIndicator size="large" color="#D4AF37" />
                    <Text className="text-silver/60 text-center mt-4">
                        Reading the stars...
                    </Text>
                </View>
            )}

            {/* Error Message */}
            {error && !loading && (
                <View className="px-6 pb-6">
                    <View className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                        <Text className="text-red-400 text-center">{error}</Text>
                    </View>
                </View>
            )}

            {data && !loading && (
                <View className="px-6 pb-12">
                    <View className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
                        {fromCache && (
                            <View className="bg-gold/10 border border-gold/30 rounded-lg px-3 py-2 mb-4">
                                <Text className="text-gold text-xs text-center">
                                    📦 Cached Horoscope - Loaded from offline storage
                                </Text>
                            </View>
                        )}
                        <Text className="text-xl font-cinzel text-gold mb-4">
                            {selectedSign} - Today
                        </Text>
                        <Text className="text-silver/80 leading-6">
                            {data.prediction || data.response || 'No prediction available'}
                        </Text>
                    </View>
                </View>
            )}
        </ScrollView>
    );
}
