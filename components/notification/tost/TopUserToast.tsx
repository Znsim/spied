// components/notification/tost/TopUserToast.tsx
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

// 앱에서 쓰는 Severity 타입과 맞춰주세요.
// 필요 시 import type { Severity } from '../../notification/alertsStore';
type Severity = 'red' | 'orange' | 'yellow';

type Props = {
  visible: boolean;
  title: string;
  photoUri?: string;
  expanded: boolean;
  severity?: Severity;         // ✅ 추가: 위험도
  onToggle: () => void;
  onClose: () => void;
};

const SEVERITY_COLOR: Record<Severity, string> = {
  red: '#ef4444',
  orange: '#f97316',
  yellow: '#fbbf24',
};

export default function TopUserToast({
  visible,
  title,
  photoUri,
  expanded,
  severity,
  onToggle,
  onClose,
}: Props) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const y = useRef(new Animated.Value(-120)).current;

  useEffect(() => {
    Animated.timing(y, {
      toValue: visible ? 0 : -140,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [visible, y]);

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <Animated.View
        style={[
          styles.wrap,
          { paddingTop: insets.top + 8, transform: [{ translateY: y }] },
        ]}
        pointerEvents="box-none"
        accessibilityRole="alert"
      >
        {/* 카드 전체 탭 → 확장/축소 */}
        <Pressable style={styles.card} onPress={onToggle}>
          <View style={styles.header}>
            {/* ✅ 위험도 점 아이콘(있을 때만) */}
            {severity ? (
              <View
                style={[
                  styles.dot,
                  { backgroundColor: SEVERITY_COLOR[severity] },
                ]}
              />
            ) : null}

            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>

            {/* 닫기 버튼 */}
            <Pressable
              onPress={onClose}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={t('common.close')}
              style={{ marginLeft: 8 }}
            >
              <Text style={styles.close}>✖️</Text>
            </Pressable>
          </View>

          {/* 확장 영역: 사진 또는 '없음' 문구 */}
          {expanded &&
            (photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.preview} />
            ) : (
              <Text style={styles.noPhoto}>{t('toast.noPhoto')}</Text>
            ))}
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    zIndex: 9999,
    elevation: 20,
    alignItems: 'center',
  },
  card: {
    maxWidth: 360,
    width: '88%',
    backgroundColor: '#111827',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  header: { flexDirection: 'row', alignItems: 'center' },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  title: { flex: 1, color: '#fff', fontWeight: '700' },
  close: { color: '#9ca3af' },
  preview: { marginTop: 10, width: '100%', height: 160, borderRadius: 10 },
  noPhoto: { marginTop: 10, color: '#cbd5e1', fontSize: 12 },
});
