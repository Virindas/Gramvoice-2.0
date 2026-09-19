import React from 'react';
import { TouchableOpacity, Text, Linking } from 'react-native';

interface ExternalLinkProps {
  href: string;
  children: React.ReactNode;
}

export function ExternalLink({ href, children }: ExternalLinkProps) {
  return (
    <TouchableOpacity onPress={() => Linking.openURL(href)}>
      <Text style={{ color: '#3b82f6' }}>{children}</Text>
    </TouchableOpacity>
  );
}
