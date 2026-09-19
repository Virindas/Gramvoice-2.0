import React from 'react';
import { View, Text } from 'react-native';

export function HintRow({ label, hint }: { label: string; hint: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
      <Text style={{ color: '#94a3b8', fontSize: 12 }}>{label}</Text>
      <Text style={{ color: '#cbd5e1', fontSize: 12, fontWeight: '600' }}>{hint}</Text>
    </View>
  );
}
