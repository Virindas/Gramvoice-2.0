import React from 'react';
import { View } from 'react-native';
import { Mic } from 'lucide-react-native';

export function AnimatedIconWeb() {
  return (
    <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(16, 185, 129, 0.2)', alignItems: 'center', justifyContent: 'center' }}>
      <Mic size={24} color="#10b981" />
    </View>
  );
}
