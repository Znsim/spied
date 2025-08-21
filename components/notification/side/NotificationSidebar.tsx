//오른쪽에서 나오는 사이드바

import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, TouchableWithoutFeedback, View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  width?: number;                 // 기본: 화면 85%, 최대 360
  children?: React.ReactNode;     // ← children 받기
};

export default function NotificationSidebar({
  visible,
  onClose,
  title = '알림',
  width,
  children,
}: Props) {
  const insets = useSafeAreaInsets();
  const screenW = Dimensions.get('window').width;
  const panelW = useMemo(() => Math.min(360, Math.round((width ?? screenW * 0.85))), [width, screenW]);

  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, { toValue: visible ? 1 : 0, duration: 220, useNativeDriver: true }).start();
  }, [visible, anim]);

  const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [panelW, 0] });
  const backdropOpacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.35] });

  // 문자열 children이 들어오면 자동으로 Text로 감싸기
  const content = typeof children === 'string' ? <Text>{children}</Text> : children;

  return (
    <>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View
          pointerEvents={visible ? 'auto' : 'none'}
          style={[styles.backdrop, { opacity: backdropOpacity }]}
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
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{title}</Text>
          <Text style={styles.close} onPress={onClose}>✖️</Text>
        </View>

        <View style={{ flex: 1 }}>
          {content}
        </View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: '#000', zIndex: 2500 },
  panel: {
    position: 'absolute', top: 0, right: 0, bottom: 0,
    backgroundColor: '#fff', paddingHorizontal: 16, zIndex: 2600,
    elevation: 10, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 10, shadowOffset: { width: -2, height: 0 },
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  close: { fontSize: 18, padding: 6 },
});
