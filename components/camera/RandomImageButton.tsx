import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { RANDOM_IMAGES } from '../RandomImg'; // ../RandomImg/index 생략 가능

type Props = {
  size?: number;
  style?: ViewStyle;
  onPick: (image: number) => void;   // ★ 1장만 전달
  disabled?: boolean;
};

export default function RandomImageButton({ size = 28, style, onPick, disabled }: Props) {
  const onPress = () => {
    if (disabled) return;
    const i = Math.floor(Math.random() * RANDOM_IMAGES.length);
    onPick(RANDOM_IMAGES[i]);        // ★ 한 장만 선택
  };

  return (
    <TouchableOpacity style={[styles.btn, style]} onPress={onPress} disabled={disabled} activeOpacity={0.85}>
      <Text style={[styles.icon, { fontSize: size }]}>📷</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { color: '#111827' },
});
