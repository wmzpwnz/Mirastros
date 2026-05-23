import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { TarotAPI } from '../src/services/api';
import { useOfflineApi } from '../src/hooks/useOfflineApi';
import { Button, Card } from '../src/components';

const tarotCards = [
    { name: 'The Fool', number: 0 },
    { name: 'The Magician', number: 1 },
    { name: 'The High Priestess', number: 2 },
    { name: 'The Empress', number: 3 },
    { name: 'The Emperor', number: 4 },
    { name: 'The Hierophant', number: 5 },
    { name: 'The Lovers', number: 6 },
    { name: 'The Chariot', number: 7 },
    { name: 'Strength', number: 8 },
    { name: 'The Hermit', number: 9 },
];

export default function TarotScreen() {
    const router = useRouter();
    const [selectedCards, setSelectedCards] = useState<number[]>([]);
    const [question, setQuestion] = useState('');
    
    const { data, loading, error, fromCache, execute } = useOfflineApi(TarotAPI.getReading);

    const toggleCard = (index: number) => {
        if (selectedCards.includes(index)) {
            setSelectedCards(selectedCards.filter((i) => i !== index));
        } else if (selectedCards.length < 3) {
            setSelectedCards([...selectedCards, index]);
        }
    };

    const getReading = async () => {
        if (selectedCards.length !== 3) return;
        
        const cards = selectedCards.map((i) => tarotCards[i].name);
        await execute(cards, question || undefined);
    };

    return (
        <ScrollView className="flex-1 bg-cosmic">
            {/* Header */}
            <View className="px-6 pt-16 pb-6">
                <TouchableOpacity onPress={() => router.back()} className="mb-4">
                    <Text className="text-gold text-lg">← Back</Text>
                </TouchableOpacity>
                <Text className="text-4xl font-cinzel text-gold mb-2">Tarot Reading</Text>
                <Text className="text-silver/60">Select 3 cards for your reading</Text>
            </View>

            {/* Card Selection */}
            <View className="px-6 pb-6">
                <Text className="text-lg text-silver mb-4">
                    Selected: {selectedCards.length}/3
                </Text>
                <View className="flex-row flex-wrap gap-3">
                    {tarotCards.map((card, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => toggleCard(index)}
                            className={`w-[30%] aspect-[2/3] rounded-xl justify-center items-center ${selectedCards.includes(index)
                                    ? 'bg-turquoise/20 border-2 border-turquoise'
                                    : 'bg-white/5 border border-white/10'
                                }`}
                            accessibilityRole="button"
                            accessibilityState={{ selected: selectedCards.includes(index) }}
                        >
                            <Text className="text-3xl mb-2">🔮</Text>
                            <Text
                                className={`text-xs text-center px-2 ${selectedCards.includes(index) ? 'text-turquoise' : 'text-silver/60'
                                    }`}
                            >
                                {card.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Get Reading Button */}
            <View className="px-6 pb-6">
                <Button
                    onPress={getReading}
                    disabled={loading || selectedCards.length !== 3}
                    loading={loading}
                    className="w-full"
                    accessibilityLabel="Get your tarot reading button"
                >
                    {loading ? 'Reading Cards...' : 'Get Your Reading'}
                </Button>
            </View>

            {/* Error Message */}
            {error && !loading && (
                <View className="px-6 pb-6">
                    <Card variant="outlined" className="bg-red-500/10 border-red-500/30">
                        <Text className="text-red-400 text-center">{error}</Text>
                    </Card>
                </View>
            )}

            {/* Reading Result */}
            {data && !loading && (
                <View className="px-6 pb-12">
                    <Card>
                        {fromCache && (
                            <View className="bg-turquoise/10 border border-turquoise/30 rounded-lg px-3 py-2 mb-4">
                                <Text className="text-turquoise text-xs text-center">
                                    📦 Cached Reading - Loaded from offline storage
                                </Text>
                            </View>
                        )}
                        <Text className="text-xl font-cinzel text-turquoise mb-4">
                            Your Reading
                        </Text>
                        <Text className="text-silver/80 leading-6">
                            {data.interpretation || data.response || 'No interpretation available'}
                        </Text>
                    </Card>
                </View>
            )}
        </ScrollView>
    );
}
