// components/notification/side/NotificationSidebar.tsx
// ────────────────────────────────────────────────
// 목적
//  - 화면 오른쪽에서 슬라이드 애니메이션으로 열리고 닫히는 알림 사이드바 패널
//  - 바깥(검은 영역)을 클릭하면 닫히고, 상단에는 제목 + 가이드버튼 + 닫기 버튼이 표시됨
//
// Props
//  - visible: 현재 보이는 상태 (true/false)
//  - onClose: 닫기 동작 실행 함수
//  - title: 헤더 제목 (없으면 i18n 기본값 사용)
//  - width: 패널 너비 (기본 85% 화면, 최대 360px)
//  - children: 본문에 표시할 ReactNode (알림 리스트 등)
// ────────────────────────────────────────────────

import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  Text,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import GuideInfoButton from '../../modals/GuideInfoButton';

type Props = {
  visible: boolean;           // 보이는지 여부
  onClose: () => void;        // 닫기 콜백
  title?: string;             // 제목 (없으면 i18n 기본)
  width?: number;             // 패널 너비
  children?: React.ReactNode; // 패널 안에 표시할 내용
  testIDPrefix?: string;      // 테스트 ID 접두사
};

export default function NotificationSidebar({
  visible,
  onClose,
  title,
  width,
  children,
  testIDPrefix = 'sidebar',
}: Props) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  // 제목: props.title이 없으면 다국어 번역 키 사용
  const computedTitle = title ?? t('alerts.title', 'Notifications');

  // 패널 너비 계산 (기본 화면 85%, 최대 360px)
  const screenW = Dimensions.get('window').width;
  const panelW = useMemo(
    () => Math.min(360, Math.round((width ?? screenW * 0.85))),
    [width, screenW]
  );

  // 애니메이션 값 (0=숨김, 1=보임)
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: visible ? 1 : 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [visible, anim]);

  // 오른쪽 → 왼쪽 슬라이드
  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [panelW, 0],
  });

  // 뒷배경(검은 오버레이) 투명도
  const backdropOpacity = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.35],
  });

  // children이 문자열이면 자동으로 <Text>로 감싸기 (React Native 오류 방지)
  const content = typeof children === 'string' ? <Text>{children}</Text> : children;

  return (
    <>
      {/* ▶ 바깥(검은 영역)을 누르면 닫힘 */}
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View
          pointerEvents={visible ? 'auto' : 'none'}
          style={[styles.backdrop, { opacity: backdropOpacity }]}
          accessibilityElementsHidden={!visible}
          importantForAccessibility={visible ? 'yes' : 'no-hide-descendants'}
          testID={`${testIDPrefix}.backdrop`}
        />
      </TouchableWithoutFeedback>

      {/* ▶ 실제 사이드 패널 */}
      <Animated.View
        pointerEvents={visible ? 'auto' : 'none'}
        style={[
          styles.panel,
          {
            width: panelW,
            transform: [{ translateX }],
            paddingTop: insets.top + 12,
            paddingBottom: insets.bottom + 12,
          },
        ]}
        accessibilityViewIsModal={visible}
        accessibilityLabel={computedTitle}
        testID={`${testIDPrefix}.panel`}
      >
        {/* ── 헤더 영역 ── */}
        <View style={styles.header}>
          {/* 제목 */}
          <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
            {computedTitle}
          </Text>

          {/* 오른쪽 컨트롤 (가이드 버튼 + 닫기 버튼) */}
          <View style={styles.headerRight}>
            {/* 느낌표 버튼 (위험도 안내 모달 열기) */}
            <GuideInfoButton style={{ marginRight: 8 }} />

            {/* 닫기 버튼 */}
            <Pressable
              onPress={onClose}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={t('common.close', 'Close')}
              testID={`${testIDPrefix}.close`}
            >
              <Text style={styles.close}>✖️</Text>
            </Pressable>
          </View>
        </View>

        {/* ── 본문 영역 ── */}
        <View style={{ flex: 1 }}>{content}</View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0, right: 0, bottom: 0, left: 0,
    backgroundColor: '#000',
    zIndex: 2500,
  },
  panel: {
    position: 'absolute',
    top: 0, right: 0, bottom: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    zIndex: 2600,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: -2, height: 0 },
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', maxWidth: '70%' },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  close: { fontSize: 18, padding: 6 },
});
