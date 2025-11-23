import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';

export default function SubscriptionScreen() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<'premium' | 'platinum' | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [loading, setLoading] = useState(false);

  const plans = {
    premium: {
      name: 'Premium',
      icon: '⭐',
      monthlyPrice: 9.99,
      annualPrice: 99,
      features: [
        'Unlimited daily horoscopes',
        'Unlimited Tarot readings',
        'Full natal chart analysis',
        'Planetary transits',
        'Compatibility analysis',
        'Dream interpretation',
        'Lunar calendar',
        'AI assistant access',
        'No advertisements',
        'Email support (24h)',
      ],
    },
    platinum: {
      name: 'Platinum',
      icon: '💎',
      monthlyPrice: 29.99,
      annualPrice: 299,
      features: [
        'All Premium features',
        'Personalized AI Astrologer',
        'Priority AI processing',
        'Extended natal chart',
        'Synastry analysis',
        'Solar return chart',
        'Horary astrology',
        'Personalized rituals',
        'Exclusive content',
        'Transit notifications',
        'Live consultation (30min/month)',
        'Priority support (2h)',
      ],
    },
  };

  const handleSubscribe = async () => {
    if (!selectedPlan) return;

    setLoading(true);
    try {
      // TODO: Implement RevenueCat subscription
      console.log('Subscribe to:', selectedPlan, billingPeriod);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      router.back();
    } catch (error) {
      console.error('Subscription error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-cosmic">
      <View className="px-6 pt-16 pb-8">
        {/* Header */}
        <TouchableOpacity onPress={() => router.back()} className="mb-6">
          <Text className="text-gold text-lg">← Back</Text>
        </TouchableOpacity>

        <View className="items-center mb-8">
          <Text className="text-4xl font-cinzel text-gold mb-2">Choose Your Plan</Text>
          <Text className="text-silver/60 text-center">
            Unlock the full power of Mirastros
          </Text>
        </View>

        {/* Billing Period Toggle */}
        <View className="flex-row bg-white/5 rounded-xl p-1 mb-8">
          <TouchableOpacity
            className={`flex-1 py-3 rounded-lg ${billingPeriod === 'monthly' ? 'bg-gold' : ''}`}
            onPress={() => setBillingPeriod('monthly')}
          >
            <Text className={`text-center font-semibold ${billingPeriod === 'monthly' ? 'text-cosmic' : 'text-silver'}`}>
              Monthly
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-3 rounded-lg ${billingPeriod === 'annual' ? 'bg-gold' : ''}`}
            onPress={() => setBillingPeriod('annual')}
          >
            <Text className={`text-center font-semibold ${billingPeriod === 'annual' ? 'text-cosmic' : 'text-silver'}`}>
              Annual (Save 17%)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Premium Plan */}
        <TouchableOpacity
          className={`bg-white/5 border-2 rounded-2xl p-6 mb-6 ${selectedPlan === 'premium' ? 'border-gold' : 'border-white/10'}`}
          onPress={() => setSelectedPlan('premium')}
        >
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-row items-center">
              <Text className="text-4xl mr-3">{plans.premium.icon}</Text>
              <View>
                <Text className="text-2xl font-cinzel text-gold">{plans.premium.name}</Text>
                <Text className="text-silver/60 text-sm">Most Popular</Text>
              </View>
            </View>
            <View className="items-end">
              <Text className="text-3xl font-bold text-gold">
                ${billingPeriod === 'monthly' ? plans.premium.monthlyPrice : plans.premium.annualPrice}
              </Text>
              <Text className="text-silver/60 text-sm">
                {billingPeriod === 'monthly' ? '/month' : '/year'}
              </Text>
            </View>
          </View>

          <View className="space-y-2">
            {plans.premium.features.map((feature, index) => (
              <View key={index} className="flex-row items-center">
                <Text className="text-gold mr-2">✓</Text>
                <Text className="text-silver/80 text-sm">{feature}</Text>
              </View>
            ))}
          </View>
        </TouchableOpacity>

        {/* Platinum Plan */}
        <TouchableOpacity
          className={`bg-white/5 border-2 rounded-2xl p-6 mb-8 ${selectedPlan === 'platinum' ? 'border-gold' : 'border-white/10'}`}
          onPress={() => setSelectedPlan('platinum')}
        >
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-row items-center">
              <Text className="text-4xl mr-3">{plans.platinum.icon}</Text>
              <View>
                <Text className="text-2xl font-cinzel text-gold">{plans.platinum.name}</Text>
                <Text className="text-silver/60 text-sm">VIP Experience</Text>
              </View>
            </View>
            <View className="items-end">
              <Text className="text-3xl font-bold text-gold">
                ${billingPeriod === 'monthly' ? plans.platinum.monthlyPrice : plans.platinum.annualPrice}
              </Text>
              <Text className="text-silver/60 text-sm">
                {billingPeriod === 'monthly' ? '/month' : '/year'}
              </Text>
            </View>
          </View>

          <View className="space-y-2">
            {plans.platinum.features.map((feature, index) => (
              <View key={index} className="flex-row items-center">
                <Text className="text-gold mr-2">✓</Text>
                <Text className="text-silver/80 text-sm">{feature}</Text>
              </View>
            ))}
          </View>
        </TouchableOpacity>

        {/* Subscribe Button */}
        <TouchableOpacity
          className={`bg-gold rounded-xl py-4 mb-4 ${(!selectedPlan || loading) ? 'opacity-50' : ''}`}
          onPress={handleSubscribe}
          disabled={!selectedPlan || loading}
        >
          {loading ? (
            <ActivityIndicator color="#0F0A1F" />
          ) : (
            <Text className="text-cosmic text-center font-bold text-base">
              {selectedPlan ? `Subscribe to ${plans[selectedPlan].name}` : 'Select a Plan'}
            </Text>
          )}
        </TouchableOpacity>

        <Text className="text-silver/60 text-xs text-center">
          Cancel anytime. No hidden fees.
        </Text>
      </View>
    </ScrollView>
  );
}
