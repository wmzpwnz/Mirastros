import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { useRouter } from 'expo-router';

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
          <View className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-cinzel text-gold">Personal Information</Text>
              <TouchableOpacity onPress={() => setEditing(!editing)}>
                <Text className="text-gold">{editing ? 'Cancel' : 'Edit'}</Text>
              </TouchableOpacity>
            </View>

            <View className="space-y-4">
              <View>
                <Text className="text-silver/60 text-sm mb-2">Full Name</Text>
                <TextInput
                  className={`bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-silver ${!editing && 'opacity-50'}`}
                  value={fullName}
                  onChangeText={setFullName}
                  editable={editing}
                />
              </View>

              <View>
                <Text className="text-silver/60 text-sm mb-2">Email</Text>
                <TextInput
                  className={`bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-silver ${!editing && 'opacity-50'}`}
                  value={email}
                  onChangeText={setEmail}
                  editable={editing}
                  keyboardType="email-address"
                />
              </View>

              <View>
                <Text className="text-silver/60 text-sm mb-2">Birth Date</Text>
                <TextInput
                  className={`bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-silver ${!editing && 'opacity-50'}`}
                  value={birthDate}
                  onChangeText={setBirthDate}
                  editable={editing}
                />
              </View>

              <View>
                <Text className="text-silver/60 text-sm mb-2">Birth Time</Text>
                <TextInput
                  className={`bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-silver ${!editing && 'opacity-50'}`}
                  value={birthTime}
                  onChangeText={setBirthTime}
                  editable={editing}
                />
              </View>

              <View>
                <Text className="text-silver/60 text-sm mb-2">Birth Location</Text>
                <TextInput
                  className={`bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-silver ${!editing && 'opacity-50'}`}
                  value={birthLocation}
                  onChangeText={setBirthLocation}
                  editable={editing}
                />
              </View>
            </View>

            {editing && (
              <TouchableOpacity
                className="bg-gold rounded-xl py-3 mt-6"
                onPress={handleSave}
              >
                <Text className="text-cosmic text-center font-bold">Save Changes</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Subscription */}
          <View className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
            <Text className="text-xl font-cinzel text-gold mb-4">Subscription</Text>
            <View className="flex-row justify-between items-center mb-4">
              <View>
                <Text className="text-silver font-semibold mb-1">Freemium</Text>
                <Text className="text-silver/60 text-sm">Limited access</Text>
              </View>
              <TouchableOpacity
                className="bg-gold px-4 py-2 rounded-lg"
                onPress={() => router.push('/subscription')}
              >
                <Text className="text-cosmic font-semibold">Upgrade</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Settings */}
          <View className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
            <Text className="text-xl font-cinzel text-gold mb-4">Settings</Text>
            
            <TouchableOpacity 
              className="flex-row justify-between items-center py-3 border-b border-white/10"
              onPress={() => router.push('/biometric-settings')}
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
              />
            </View>

            <TouchableOpacity className="py-3 border-b border-white/10">
              <Text className="text-silver">Change Password</Text>
            </TouchableOpacity>

            <TouchableOpacity className="py-3">
              <Text className="text-silver">Privacy Policy</Text>
            </TouchableOpacity>
          </View>

          {/* Logout */}
          <TouchableOpacity
            className="bg-red-500/10 border border-red-500/30 rounded-xl py-4"
            onPress={handleLogout}
          >
            <Text className="text-red-500 text-center font-semibold">Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
