import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Input, Card, Tabs } from '../../src/components';

export default function ProfileScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('John Doe');
  const [email, setEmail] = useState('john@example.com');
  const [birthDate, setBirthDate] = useState('01/15/1990');
  const [birthTime, setBirthTime] = useState('14:30');
  const [birthLocation, setBirthLocation] = useState('New York, NY');
  const [notifications, setNotifications] = useState(true);
  const [editing, setEditing] = useState(false);

  const handleSave = () => {
    // TODO: Implement save profile API call
    setEditing(false);
  };

  const handleLogout = () => {
    // TODO: Implement logout logic
    router.replace('/auth/login');
  };

  return (
    <ScrollView className="flex-1 bg-cosmic">
      <View className="px-6 pt-16 pb-8">
        {/* Header */}
        <TouchableOpacity onPress={() => router.back()} className="mb-6">
          <Text className="text-gold text-lg">← Back</Text>
        </TouchableOpacity>

        <View className="items-center mb-8">
          <View className="w-24 h-24 bg-gold/20 rounded-full items-center justify-center mb-4">
            <Text className="text-5xl">👤</Text>
          </View>
          <Text className="text-3xl font-cinzel text-gold mb-2">Profile</Text>
          <Text className="text-silver/60 text-center">
            Manage your account
          </Text>
        </View>

        {/* Profile Info */}
        <View className="mb-8">
          <Card className="mb-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-cinzel text-gold">Personal Information</Text>
              <TouchableOpacity onPress={() => setEditing(!editing)}>
                <Text className="text-gold">{editing ? 'Cancel' : 'Edit'}</Text>
              </TouchableOpacity>
            </View>

            <View className="gap-4">
              <Input
                placeholder="Full Name"
                value={fullName}
                onChange={setFullName}
                disabled={!editing}
                accessibilityLabel="Full name"
              />

              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={setEmail}
                disabled={!editing}
                accessibilityLabel="Email address"
              />

              <Input
                placeholder="Birth Date"
                value={birthDate}
                onChange={setBirthDate}
                disabled={!editing}
                accessibilityLabel="Birth date"
              />

              <Input
                placeholder="Birth Time"
                value={birthTime}
                onChange={setBirthTime}
                disabled={!editing}
                accessibilityLabel="Birth time"
              />

              <Input
                placeholder="Birth Location"
                value={birthLocation}
                onChange={setBirthLocation}
                disabled={!editing}
                accessibilityLabel="Birth location"
              />
            </View>

            {editing && (
              <Button
                onPress={handleSave}
                className="w-full mt-6"
                accessibilityLabel="Save changes button"
              >
                Save Changes
              </Button>
            )}
          </Card>

          {/* Subscription */}
          <Card className="mb-6">
            <Text className="text-xl font-cinzel text-gold mb-4">Subscription</Text>
            <View className="flex-row justify-between items-center mb-4">
              <View>
                <Text className="text-silver font-semibold mb-1">Freemium</Text>
                <Text className="text-silver/60 text-sm">Limited access</Text>
              </View>
              <Button
                size="sm"
                onPress={() => router.push('/subscription')}
                accessibilityLabel="Upgrade subscription button"
              >
                Upgrade
              </Button>
            </View>
          </Card>

          {/* Settings */}
          <Card className="mb-6">
            <Text className="text-xl font-cinzel text-gold mb-4">Settings</Text>
            
            <TouchableOpacity 
              className="flex-row justify-between items-center py-3 border-b border-white/10"
              onPress={() => router.push('/biometric-settings')}
              accessibilityRole="button"
            >
              <View className="flex-row items-center">
                <Text className="text-2xl mr-3">🔐</Text>
                <Text className="text-silver">Biometric Authentication</Text>
              </View>
              <Text className="text-silver/60">›</Text>
            </TouchableOpacity>

            <View className="flex-row justify-between items-center py-3 border-b border-white/10">
              <Text className="text-silver">Push Notifications</Text>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: '#444', true: '#D4AF37' }}
                thumbColor="#fff"
                accessibilityLabel="Push notifications toggle"
              />
            </View>

            <TouchableOpacity className="py-3 border-b border-white/10" accessibilityRole="button">
              <Text className="text-silver">Change Password</Text>
            </TouchableOpacity>

            <TouchableOpacity className="py-3" accessibilityRole="button">
              <Text className="text-silver">Privacy Policy</Text>
            </TouchableOpacity>
          </Card>

          {/* Logout */}
          <Button
            variant="danger"
            onPress={handleLogout}
            className="w-full"
            accessibilityLabel="Logout button"
          >
            Logout
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}
