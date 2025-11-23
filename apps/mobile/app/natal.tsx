import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';

export default function NatalScreen() {
    const router = useRouter();
    const [birthDate, setBirthDate] = useState('');
    const [birthTime, setBirthTime] = useState('');
    const [birthPlace, setBirthPlace] = useState('');
    const [loading, setLoading] = useState(false);
    const [chart, setChart] = useState('');

    const getChart = async () => {
        if (!birthDate || !birthTime || !birthPlace) return;

        setLoading(true);
        try {
            const response = await fetch('http://localhost:8000/ai/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: `Natal chart interpretation for birth date: ${birthDate}, time: ${birthTime}, place: ${birthPlace}`,
                    service_type: 'natal',
                    use_rag: true,
                }),
            });
            const data = await response.json();
            setChart(data.response);
        } catch (error) {
            setChart('Failed to fetch chart. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView className="flex-1 bg-cosmic">
            {/* Header */}
            <View className="px-6 pt-16 pb-6">
                <TouchableOpacity onPress={() => router.back()} className="mb-4">
                    <Text className="text-gold text-lg">← Back</Text>
                </TouchableOpacity>
                <Text className="text-4xl font-cinzel text-gold mb-2">Natal Chart</Text>
                <Text className="text-silver/60">Your cosmic blueprint</Text>
            </View>

            {/* Birth Info Form */}
            <View className="px-6 pb-6 space-y-4">
                <View>
                    <Text className="text-silver mb-2">Birth Date</Text>
                    <TextInput
                        value={birthDate}
                        onChangeText={setBirthDate}
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor="#666"
                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-silver"
                    />
                </View>

                <View>
                    <Text className="text-silver mb-2">Birth Time</Text>
                    <TextInput
                        value={birthTime}
                        onChangeText={setBirthTime}
                        placeholder="HH:MM (24-hour)"
                        placeholderTextColor="#666"
                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-silver"
                    />
                </View>

                <View>
                    <Text className="text-silver mb-2">Birth Place</Text>
                    <TextInput
                        value={birthPlace}
                        onChangeText={setBirthPlace}
                        placeholder="City, Country"
                        placeholderTextColor="#666"
                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-silver"
                    />
                </View>
            </View>

            {/* Generate Button */}
            <View className="px-6 pb-6">
                <TouchableOpacity
                    onPress={getChart}
                    disabled={loading || !birthDate || !birthTime || !birthPlace}
                    className={`rounded-xl p-4 ${birthDate && birthTime && birthPlace
                            ? 'bg-purple/20 border border-purple/30'
                            : 'bg-white/5 border border-white/10 opacity-50'
                        }`}
                >
                    <Text
                        className={`text-center font-bold text-lg ${birthDate && birthTime && birthPlace ? 'text-purple' : 'text-silver/40'
                            }`}
                    >
                        {loading ? 'Generating Chart...' : 'Generate Natal Chart'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Loading */}
            {loading && (
                <View className="px-6 pb-6">
                    <ActivityIndicator size="large" color="#9B59B6" />
                </View>
            )}

            {/* Chart Result */}
            {chart && !loading && (
                <View className="px-6 pb-12">
                    <View className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
                        <Text className="text-xl font-cinzel text-purple mb-4">
                            Your Natal Chart
                        </Text>
                        <Text className="text-silver/80 leading-6">{chart}</Text>
                    </View>
                </View>
            )}
        </ScrollView>
    );
}
