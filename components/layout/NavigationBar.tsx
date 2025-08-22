// components/layout/NavigationBar.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../controls/LanguageSwitcher';

type Props = {
  /** 상단바 제목 (문자열만 허용해 Text 오류 예방) */
  title?: string;
  onPressPencil?: () => void;
  onPressBell?: () => void;
};

export default function NavigationBar({
  title,
  onPressPencil,
  onPressBell,
}: Props) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const H = 56;

  // props.title이 없으면 i18n 키 사용
  const computedTitle = title ?? t('app.title');

  return (
    <View style={[styles.container, { paddingTop: insets.top, height: H + insets.top }]}>
      {/* 제목은 항상 Text로 감싸기 */}
      <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
        {computedTitle}
      </Text>

      <View style={styles.right}>
        {/* 🔤 언어 전환 버튼 (EN → 中 → 日 → 한 순환) */}
        <LanguageSwitcher style={{ marginRight: 8 }} />

        <TouchableOpacity
          onPress={onPressPencil}
          hitSlop={HIT}
          accessibilityRole="button"
          accessibilityLabel={t('nav.pencilLabel', 'Open report modal')}
          accessibilityHint={t('nav.pencilHint', 'Create a new user report')}
          testID="nav.pencil"
        >
          {/* 이모지도 Text로 렌더 */}
          <Text style={styles.icon}>✏️</Text>
        </TouchableOpacity>

        <View style={{ width: 16 }} />

        <TouchableOpacity
          onPress={onPressBell}
          hitSlop={HIT}
          accessibilityRole="button"
          accessibilityLabel={t('nav.bellLabel', 'Open notifications')}
          accessibilityHint={t('nav.bellHint', 'Show alerts sidebar')}
          testID="nav.bell"
        >
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
  title: { fontSize: 18, fontWeight: '700', maxWidth: '60%' },
  right: { flexDirection: 'row', alignItems: 'center' },
  icon: { fontSize: 22, lineHeight: 22 },
});
