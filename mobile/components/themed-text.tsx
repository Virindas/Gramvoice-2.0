import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';

export function ThemedText({ style, children, ...props }: TextProps) {
  return (
    <Text style={[{ color: '#cbd5e1' }, style]} {...props}>
      {children}
    </Text>
  );
}
