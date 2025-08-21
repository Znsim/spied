import React, { useEffect, useRef } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  visible: boolean;
  title: string;
  photoUri?: string;
  expanded: boolean;
  onToggle: () => void;
  onClose: () => void;
};

export default function TopUserToast({ visible, title, photoUri, expanded, onToggle, onClose }: Props) {
  const insets = useSafeAreaInsets();
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
      >
        <Pressable style={styles.card} onPress={onToggle}>
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={1}>{title}</Text>
            <Text style={styles.close} onPress={onClose}>✖️</Text>
          </View>

          {expanded && (
            photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.preview} />
            ) : (
              <Text style={styles.noPhoto}>첨부된 사진이 없습니다</Text>
            )
          )}
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  // ⬇️ 다른 absolute 요소들 위에 확실히 오도록 고정/우선순위 강화
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
  title: { flex: 1, color: '#fff', fontWeight: '700' },
  close: { color: '#9ca3af', marginLeft: 8 },
  preview: { marginTop: 10, width: '100%', height: 160, borderRadius: 10 },
  noPhoto: { marginTop: 10, color: '#cbd5e1', fontSize: 12 },
});
