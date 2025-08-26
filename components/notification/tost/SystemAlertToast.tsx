// components/notification/tost/SystemAlertToast.tsx
// ────────────────────────────────────────────────
// 목적
//   - 서버나 시스템에서 오는 "시스템 알림"을 화면 상단에 잠시 표시
//   - 사용자가 누르면 지도에서 해당 위치로 이동 (focusMap)
//   - 일정 시간 후 자동으로 사라짐
//   - 닫기 버튼(✕)도 제공
// ────────────────────────────────────────────────

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAlerts, asText } from '../alertsStore'; // 알림 상태 관리 훅
import { focusMap } from '../../map/MapFocus';     // 지도 포커싱 유틸

// 토스트 표시 시간/닫힘 애니메이션 시간
const SHOW_MS = 3500; // 3.5초 뒤 자동 닫힘
const HIDE_MS = 220;

export default function SystemAlertToast() {
  const { t } = useTranslation();

  // 알림 Context에서 "마지막 시스템 알림" 가져오기
  const { lastSystemAlert, consumeLastSystemAlert } = useAlerts();

  // 현재 토스트 표시 여부
  const [visible, setVisible] = useState(false);
  // 현재 표시 중인 알림 데이터
  const [cur, setCur] = useState<typeof lastSystemAlert | null>(null);

  // 애니메이션 값 (0=숨김, 1=보임)
  const anim = useRef(new Animated.Value(0)).current;

  // 자동 닫힘 타이머
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 새 시스템 알림이 오면 실행
  useEffect(() => {
    if (!lastSystemAlert) return;
    setCur(lastSystemAlert);
    setVisible(true);

    // 나타나는 애니메이션 실행
    Animated.timing(anim, { toValue: 1, duration: 220, useNativeDriver: true }).start();

    // 이전 타이머 있으면 제거 후 새 타이머 시작
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => dismiss(), SHOW_MS);

    // 언마운트 시 타이머 정리
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastSystemAlert]);

  // 닫기 동작
  const dismiss = () => {
    if (!visible) return;
    if (hideTimer.current) clearTimeout(hideTimer.current);

    // 숨김 애니메이션 실행 후 state 초기화
    Animated.timing(anim, { toValue: 0, duration: HIDE_MS, useNativeDriver: true }).start(() => {
      setVisible(false);
      setCur(null);
      consumeLastSystemAlert(); // 큐에서 제거
    });
  };

  // 토스트 카드를 눌렀을 때 → 지도 이동
  const onPressCard = () => {
    if (cur?.location?.latitude != null && cur?.location?.longitude != null) {
      focusMap(cur.location.latitude, cur.location.longitude, 17);
    }
    dismiss();
  };

  // 다국어 번역 처리 (title, subtitle이 객체일 수 있어서 asText 사용)
  const title = useMemo(() => asText(t, cur?.title), [t, cur?.title]);
  const subtitle = useMemo(() => asText(t, cur?.subtitle), [t, cur?.subtitle]);

  if (!visible || !cur) return null;

  // 애니메이션 값 → Y축 이동 / 투명도
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] });
  const opacity = anim;

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[StyleSheet.absoluteFill, { zIndex: 9999, elevation: 9999, alignItems: 'center' }]}
    >
      <Animated.View style={[styles.wrap, { opacity, transform: [{ translateY }] }]}>
        {/* 토스트 카드 (전체 터치 가능) */}
        <Pressable style={styles.card} onPress={onPressCard}>
          <View style={styles.headerRow}>
            {/* SYSTEM 뱃지 */}
            <Text style={styles.badge}>SYSTEM</Text>

            {/* 제목 */}
            <Text style={styles.title} numberOfLines={1}>{title}</Text>

            {/* ✕ 닫기 버튼 */}
            <Pressable
              onPress={(e) => {
                e.stopPropagation?.(); // 카드 onPress와 겹치지 않도록
                dismiss();
              }}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={t('common.close', 'Close')}
              style={styles.closeBtn}
              testID="systemToast.close"
            >
              <Text style={styles.closeTxt}>✕</Text>
            </Pressable>
          </View>

          {/* 서브텍스트 (2줄까지) */}
          {!!subtitle && <Text style={styles.sub} numberOfLines={2}>{subtitle}</Text>}

          {/* 안내문구 */}
          <Text style={styles.hint} numberOfLines={1}>
            {t('alerts.tapToZoom', 'Tap to zoom')}
          </Text>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 18,
    paddingHorizontal: 12,
  },
  card: {
    maxWidth: 420,
    minWidth: 260,
    backgroundColor: '#0f172a',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  badge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#93c5fd',
    backgroundColor: '#1e293b',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  title: { color: '#fff', fontWeight: '800', flex: 1 },
  sub: { color: '#cbd5e1', marginTop: 4 },
  hint: { color: '#94a3b8', marginTop: 6, fontSize: 12 },
  closeBtn: {
    marginLeft: 8,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeTxt: { color: '#cbd5e1', fontSize: 16, fontWeight: '800' },
});
