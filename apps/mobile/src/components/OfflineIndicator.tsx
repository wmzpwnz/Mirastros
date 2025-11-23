import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { OfflineSyncService, SyncStatus } from '../services/offlineSync';

export default function OfflineIndicator() {
  const { isOffline } = useNetworkStatus();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isSyncing: false,
    queueLength: 0,
    lastSyncTime: null,
    failedRequests: 0,
  });
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const unsubscribe = OfflineSyncService.subscribeSyncStatus(setSyncStatus);
    return unsubscribe;
  }, []);

  const handleManualSync = async () => {
    await OfflineSyncService.manualSync();
  };

  if (!isOffline && syncStatus.queueLength === 0) return null;

  return (
    <View className="bg-cosmic-dark border-b border-white/10">
      {/* Main Status Bar */}
      <TouchableOpacity
        onPress={() => setShowDetails(!showDetails)}
        className={`px-4 py-2 ${
          isOffline ? 'bg-red-500/20' : 'bg-turquoise/20'
        }`}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <Text className="text-lg mr-2">
              {isOffline ? '📡' : syncStatus.isSyncing ? '🔄' : '✓'}
            </Text>
            <Text className="text-white text-sm font-semibold flex-1">
              {isOffline
                ? 'No Internet - Working Offline'
                : syncStatus.isSyncing
                ? 'Syncing...'
                : syncStatus.queueLength > 0
                ? `${syncStatus.queueLength} pending request${syncStatus.queueLength > 1 ? 's' : ''}`
                : 'All synced'}
            </Text>
          </View>
          
          {syncStatus.isSyncing && (
            <ActivityIndicator size="small" color="#FFFFFF" />
          )}
          
          {!isOffline && syncStatus.queueLength > 0 && !syncStatus.isSyncing && (
            <TouchableOpacity
              onPress={handleManualSync}
              className="bg-turquoise/30 px-3 py-1 rounded-full ml-2"
            >
              <Text className="text-turquoise text-xs font-semibold">Sync Now</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>

      {/* Details Panel */}
      {showDetails && (
        <View className="px-4 py-3 bg-cosmic-dark/50">
          <View className="space-y-2">
            <View className="flex-row justify-between">
              <Text className="text-silver/60 text-xs">Status:</Text>
              <Text className="text-silver text-xs">
                {isOffline ? 'Offline' : 'Online'}
              </Text>
            </View>
            
            <View className="flex-row justify-between">
              <Text className="text-silver/60 text-xs">Pending Requests:</Text>
              <Text className="text-silver text-xs">{syncStatus.queueLength}</Text>
            </View>
            
            {syncStatus.failedRequests > 0 && (
              <View className="flex-row justify-between">
                <Text className="text-silver/60 text-xs">Failed:</Text>
                <Text className="text-red-400 text-xs">{syncStatus.failedRequests}</Text>
              </View>
            )}
            
            {syncStatus.lastSyncTime && (
              <View className="flex-row justify-between">
                <Text className="text-silver/60 text-xs">Last Sync:</Text>
                <Text className="text-silver text-xs">
                  {new Date(syncStatus.lastSyncTime).toLocaleTimeString()}
                </Text>
              </View>
            )}
          </View>
          
          <Text className="text-silver/40 text-xs mt-3 text-center">
            Tap to {showDetails ? 'hide' : 'show'} details
          </Text>
        </View>
      )}
    </View>
  );
}
