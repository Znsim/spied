//앱 제공(시스템) 알림 목록

import React from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';
import { useAlerts } from './alertsStore';

export default function SystemAlertList() {
  const { systemAlerts } = useAlerts();
  return (
    <FlatList
      data={systemAlerts}
      keyExtractor={(item) => item.id}
      ItemSeparatorComponent={() => <View style={s.sep} />}
      renderItem={({ item }) => (
        <View style={s.item}>
          <Text style={s.title}>⚠️ {item.title}</Text>
          {item.subtitle ? <Text style={s.sub}>{item.subtitle}</Text> : null}
          <Text style={s.time}>{item.timestamp}</Text>
        </View>
      )}
    />
  );
}

const s = StyleSheet.create({
  item: { paddingVertical: 12, paddingHorizontal: 16 },
  title: { fontWeight: '700', fontSize: 16 },
  sub: { color: '#6b7280', marginTop: 4 },
  time: { color: '#9ca3af', marginTop: 4, fontSize: 12 },
  sep: { height: 1, backgroundColor: '#e5e7eb' },
});
