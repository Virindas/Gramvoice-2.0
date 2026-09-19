import React from 'react';
import { View, Text } from 'react-native';

export function WebBadge({ label = 'GramVoice Web' }: { label?: string }) {
  return (
    <View style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: 'rgba(16, 185, 129, 0.15)' }}>
      <Text style={{ color: '#10b981', fontSize: 11, fontWeight: '700' }}>{label}</Text>
    </View>
  );
}
