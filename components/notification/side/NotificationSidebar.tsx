// components/notification/side/NotificationSidebar.tsx
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
  visible: boolean;
  onClose: () => void;
  /** 외부에서 제목 문자열을 넘기면 그대로 사용, 없으면 i18n 기본값 사용 */
  title?: string;
  /** 사이드 패널 너비 (기본: 화면 85%, 최대 360) */
  width?: number;
  /** 본문 컨텐츠 */
  children?: React.ReactNode;
  /** 테스트 ID 접두사 */
  testIDPrefix?: string;
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

  // 제목: props.title이 없으면 i18n 키 사용
  const computedTitle = title ?? t('alerts.title', 'Notifications');

  const screenW = Dimensions.get('window').width;
  const panelW = useMemo(
    () => Math.min(360, Math.round((width ?? screenW * 0.85))),
    [width, screenW]
  );

  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: visible ? 1 : 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [visible, anim]);

  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [panelW, 0],
  });
  const backdropOpacity = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.35],
  });

  // 문자열 children이 들어오면 자동으로 Text로 감싸기 (Text 오류 방지)
  const content = typeof children === 'string' ? <Text>{children}</Text> : children;

  return (
    <>
      {/* 바깥 클릭 → 닫기 */}
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View
          pointerEvents={visible ? 'auto' : 'none'}
          style={[styles.backdrop, { opacity: backdropOpacity }]}
          accessibilityElementsHidden={!visible}
          importantForAccessibility={visible ? 'yes' : 'no-hide-descendants'}
          testID={`${testIDPrefix}.backdrop`}
        />
      </TouchableWithoutFeedback>

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
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
            {computedTitle}
          </Text>

          {/* 오른쪽 컨트롤: 느낌표 버튼 + 닫기 */}
          <View style={styles.headerRight}>
            {/* 가이드 다시보기 버튼 (원형 느낌표) */}
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

        {/* 본문 */}
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
