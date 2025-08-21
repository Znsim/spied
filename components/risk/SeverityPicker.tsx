// components/risk/SeverityPicker.tsx
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import type { Severity } from '../notification/alertsStore';

type Props = {
  value: Severity;
  onChange: (s: Severity) => void;
  disabled?: boolean;
};

const COLORS = {
  red:    '#ef4444',
  orange: '#f59e0b',
  yellow: '#facc15',
};

export default function SeverityPicker({ value, onChange, disabled }: Props) {
  return (
    <View style={s.wrap}>
      {(['red','orange','yellow'] as Severity[]).map(c => (
        <TouchableOpacity
          key={c}
          onPress={() => !disabled && onChange(c)}
          style={[
            s.dot,
            { backgroundColor: COLORS[c], opacity: disabled ? 0.5 : 1 },
            value === c && s.dotActive,
          ]}
          activeOpacity={0.8}
          disabled={disabled}
        />
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flexDirection: 'row', gap: 10, alignItems: 'center', marginBottom: 8 },
  dot: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#fff', elevation: 2 },
  dotActive: { borderColor: '#111827', transform: [{ scale: 1.05 }] },
});
