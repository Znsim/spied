// components/layout/NavigationBar.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  /** 상단바 제목 (문자열만 허용해 Text 오류 예방) */
  title?: string;
  onPressPencil?: () => void;
  onPressBell?: () => void;
};

export default function NavigationBar({
  title = 'FloodGuard',
  onPressPencil,
  onPressBell,
}: Props) {
  const insets = useSafeAreaInsets();
  const H = 56;

  return (
    <View style={[styles.container, { paddingTop: insets.top, height: H + insets.top }]}>
      {/* 제목은 항상 Text로 감싸기 */}
      <Text style={styles.title}>{title}</Text>

      <View style={styles.right}>
        <TouchableOpacity onPress={onPressPencil} hitSlop={HIT}>
          {/* 이모지도 Text로 렌더 */}
          <Text style={styles.icon}>✏️</Text>
        </TouchableOpacity>

        <View style={{ width: 16 }} />

        <TouchableOpacity onPress={onPressBell} hitSlop={HIT}>
          <Text style={styles.icon}>🔔</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    zIndex: 2000,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  title: { fontSize: 18, fontWeight: '700' },
  right: { flexDirection: 'row', alignItems: 'center' },
  icon: { fontSize: 22, lineHeight: 22 },
});
