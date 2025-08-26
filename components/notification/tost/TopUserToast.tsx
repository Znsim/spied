// components/notification/tost/TopUserToast.tsx
// ────────────────────────────────────────────────
// 목적
//   - 사용자가 새로 신고(리포트)를 작성하면 상단에 토스트로 잠깐 표시
//   - 제목, 위험도 색 점, 닫기 버튼 포함
//   - 눌러서 확장 시: 신고 사진을 미리보기 (없으면 "사진 없음" 문구)
// ────────────────────────────────────────────────

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

// 앱의 Severity 타입 정의 (위험도 단계)
type Severity = 'red' | 'orange' | 'yellow';

// props 타입 정의
type Props = {
  visible: boolean;        // 보일지 여부
  title: string;           // 신고 제목
  photoUri?: string;       // 신고 사진 (선택)
  expanded: boolean;       // 확장 모드 여부
  severity?: Severity;     // 위험도 (빨강/주황/노랑)
  onToggle: () => void;    // 토스트 전체를 눌렀을 때(확장/축소 토글)
  onClose: () => void;     // 닫기 버튼 눌렀을 때
};

// 위험도 색상 매핑
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
  const insets = useSafeAreaInsets(); // 상태바 높이 확보
  const { t } = useTranslation();
  const y = useRef(new Animated.Value(-120)).current; // Y 위치 애니메이션 초기값

  // visible 값이 바뀔 때마다 슬라이드 애니메이션 실행
  useEffect(() => {
    Animated.timing(y, {
      toValue: visible ? 0 : -140, // 보이면 0 (화면 안), 숨기면 -140 (화면 위)
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
        {/* 카드 전체 탭 → 확장/축소 토글 */}
        <Pressable style={styles.card} onPress={onToggle}>
          <View style={styles.header}>
            {/* 위험도 점 (severity 있을 때만 표시) */}
            {severity ? (
              <View
                style={[
                  styles.dot,
                  { backgroundColor: SEVERITY_COLOR[severity] },
                ]}
              />
            ) : null}

            {/* 제목 */}
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>

            {/* 닫기 버튼 (✖️) */}
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

          {/* 확장 모드일 때만 아래 표시 */}
          {expanded &&
            (photoUri ? (
              // 사진이 있으면 미리보기
              <Image source={{ uri: photoUri }} style={styles.preview} />
            ) : (
              // 없으면 안내 문구
              <Text style={styles.noPhoto}>{t('toast.noPhoto')}</Text>
            ))}
        </Pressable>
      </Animated.View>
    </View>
  );
}

// 스타일 정의
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
    backgroundColor: '#111827', // 어두운 배경
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
    width: 10, height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  title: { flex: 1, color: '#fff', fontWeight: '700' },
  close: { color: '#9ca3af' },
  preview: { marginTop: 10, width: '100%', height: 160, borderRadius: 10 },
  noPhoto: { marginTop: 10, color: '#cbd5e1', fontSize: 12 },
});
