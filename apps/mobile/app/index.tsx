import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import ZScrollView from '../src/components/ZScrollView';
import ServiceCard from '../src/components/ServiceCard';

export default function HomeScreen() {
    const router = useRouter();

    const services = [
        {
            title: 'Daily Horoscope',
            description: 'Cosmic guidance for your zodiac sign. Discover what the stars have aligned for you today.',
            icon: '♈',
            route: '/horoscope',
            gradient: ['#D4AF37', '#FFD700'],
        },
        {
            title: 'Tarot Reading',
            description: 'Mystical insights from the cards. Unveil hidden truths and future possibilities.',
            icon: '🔮',
            route: '/tarot',
            gradient: ['#40E0D0', '#00CED1'],
        },
        {
            title: 'Natal Chart',
            description: 'Your cosmic blueprint revealed. Understand your astrological DNA and life path.',
            icon: '⭐',
            route: '/natal',
            gradient: ['#9B59B6', '#8E44AD'],
        },
        {
            title: 'Numerology',
            description: 'Decode the numbers of your destiny. Discover your life path and soul purpose.',
            icon: '🔢',
            route: '/numerology',
            gradient: ['#FF6B6B', '#EE5A6F'],
        },
        {
            title: 'Dream Interpretation',
            description: 'Unlock the secrets of your subconscious. Understand the messages in your dreams.',
            icon: '💭',
            route: '/dream',
            gradient: ['#4ECDC4', '#44A08D'],
        },
    ];

    return (
        <View className="flex-1 bg-cosmic">
            {/* Hero Header */}
            <View className="absolute top-0 left-0 right-0 z-10 pt-16 pb-6 px-6 bg-cosmic/80 backdrop-blur-lg">
                <View className="items-center">
                    <Text className="text-4xl font-cinzel text-gold mb-2">Mirastros</Text>
                    <Text className="text-silver/60 text-center text-sm">
                        Gateway to the Unknown
                    </Text>
                </View>
            </View>

            {/* Z-Scroll Services */}
            <View className="flex-1 pt-32">
                <ZScrollView>
                    {services.map((service, index) => (
                        <ServiceCard
                            key={index}
                            title={service.title}
                            description={service.description}
                            icon={service.icon}
                            gradient={service.gradient}
                            onPress={() => router.push(service.route as any)}
                        />
                    ))}
                </ZScrollView>
            </View>
        </View>
    );
}
