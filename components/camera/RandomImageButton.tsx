// components/camera/RandomImageButton.tsx
import React, { useCallback } from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { RANDOM_IMAGES } from '../RandomImg';
import { useTranslation } from 'react-i18next';

type Props = {
  size?: number;
  style?: ViewStyle;
  onPick: (image: number) => void;
  disabled?: boolean;
};

export default function RandomImageButton({ size = 28, style, onPick, disabled }: Props) {
  const { t } = useTranslation();

  const onPress = useCallback(() => {
    if (disabled) return;
    if (!Array.isArray(RANDOM_IMAGES) || RANDOM_IMAGES.length === 0) {
      // 필요하면 Toast/Alert로 바꿔도 됨
      console.warn('RANDOM_IMAGES is empty.');
      return;
    }
    const i = Math.floor(Math.random() * RANDOM_IMAGES.length);
    onPick(RANDOM_IMAGES[i]);
  }, [disabled, onPick]);

  return (
    <TouchableOpacity
      style={[styles.btn, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={t('randomImage.pick', 'Pick a random image')}
    >
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
