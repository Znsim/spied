//앱 제공(사용자) 알림 목록

import React from 'react';
import { FlatList, View, Text, StyleSheet, Image } from 'react-native';
import { useAlerts } from './alertsStore';
import type { AlertItem } from './alertsStore';

type Props = {
  /** 필요하면 외부에서 주입해서도 사용할 수 있도록 optional */
  items?: AlertItem[];
};

export default function UserAlertList({ items }: Props) {
  const { userAlerts } = useAlerts();
  const data = items ?? userAlerts;

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      ItemSeparatorComponent={() => <View style={s.sep} />}
      renderItem={({ item }) => (
        <View style={s.item}>
          <Text style={s.title}>🔔 {item.title}</Text>
          {item.subtitle ? <Text style={s.sub}>{item.subtitle}</Text> : null}
          <Text style={s.time}>{item.timestamp}</Text>
          {item.photoUri ? (
            <Image source={{ uri: item.photoUri }} style={s.thumb} />
          ) : null}
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
  thumb: { marginTop: 8, width: 64, height: 64, borderRadius: 6 },
  sep: { height: 1, backgroundColor: '#e5e7eb' },
});
