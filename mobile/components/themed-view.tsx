import React from 'react';
import { View, ViewProps } from 'react-native';

export function ThemedView({ style, children, ...props }: ViewProps) {
  return (
    <View style={[{ backgroundColor: '#020617' }, style]} {...props}>
      {children}
    </View>
  );
}
