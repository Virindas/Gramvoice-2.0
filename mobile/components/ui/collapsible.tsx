import React, { useState } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';

export function Collapsible({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <View style={{ marginVertical: 4 }}>
      <TouchableOpacity onPress={() => setOpen(!open)} style={{ padding: 8, backgroundColor: '#0f172a', borderRadius: 8 }}>
        <Text style={{ color: '#ffffff', fontWeight: 'bold' }}>{title}</Text>
      </TouchableOpacity>
      {open && <View style={{ padding: 8 }}>{children}</View>}
    </View>
  );
}
