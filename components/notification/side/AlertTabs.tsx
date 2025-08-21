//탭 스위처 UI

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

type Props = {
  tabs: string[];          // 예: ['사용자 신고', '앱 제공']
  active: number;          // 0 or 1
  onChange: (index: number) => void;
};

export default function AlertTabs({ tabs, active, onChange }: Props) {
  return (
    <View style={styles.wrap}>
      {tabs.map((t, i) => (
        <TouchableOpacity key={t} style={[styles.tab, active === i && styles.tabActive]} onPress={() => onChange(i)}>
          <Text style={[styles.tabText, active === i && styles.tabTextActive]}>{t}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', backgroundColor: '#f1f5f9', borderRadius: 10, padding: 4, marginBottom: 8 },
  tab: { flex: 1, borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
  tabActive: { backgroundColor: '#fff', elevation: 1 },
  tabText: { fontSize: 13, color: '#6b7280', fontWeight: '600' },
  tabTextActive: { color: '#111827' },
});
