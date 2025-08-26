// components/camera/RandomImageButton.tsx
// ──────────────────────────────────────────────────────────────────────────────
// 목적
//  - 📷 버튼을 누르면 준비된 RANDOM_IMAGES 배열에서 임의의 이미지를 선택해 부모에 전달.
// 특징
//  - 실제 카메라를 사용하지 않고 "랜덤 이미지"를 선택하는 기능 (테스트/샘플용)
//  - onPick(image) 콜백으로 선택된 이미지 인덱스(또는 ID)를 부모 컴포넌트에 전달.
// ──────────────────────────────────────────────────────────────────────────────

import React, { useCallback } from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { RANDOM_IMAGES } from '../RandomImg'; // 미리 준비된 랜덤 이미지 배열
import { useTranslation } from 'react-i18next';

// 부모로부터 받을 속성들
type Props = {
  size?: number;              // 아이콘(📷) 크기 (기본값 28)
  style?: ViewStyle;          // 외부에서 전달받은 스타일
  onPick: (image: number) => void; // 이미지 선택 시 호출되는 함수
  disabled?: boolean;         // 버튼 비활성화 여부
};

export default function RandomImageButton({
  size = 28,
  style,
  onPick,
  disabled,
}: Props) {
  const { t } = useTranslation();

  // 버튼 클릭 시 실행할 함수
  const onPress = useCallback(() => {
    if (disabled) return; // 비활성화 시 아무 동작 X

    // RANDOM_IMAGES 배열이 비어 있으면 경고 출력
    if (!Array.isArray(RANDOM_IMAGES) || RANDOM_IMAGES.length === 0) {
      console.warn('RANDOM_IMAGES is empty.');
      return;
    }

    // 배열 길이 안에서 무작위 인덱스 뽑기
    const i = Math.floor(Math.random() * RANDOM_IMAGES.length);

    // 부모에게 선택된 이미지 전달
    onPick(RANDOM_IMAGES[i]);
  }, [disabled, onPick]);

  return (
    <TouchableOpacity
      style={[styles.btn, style]} // 스타일 병합
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}        // 눌렀을 때 살짝 어두워짐
      accessibilityRole="button"  // 접근성: 버튼 역할
      accessibilityLabel={t('randomImage.pick', 'Pick a random image')} 
      // 접근성 라벨 (다국어 지원)
    >
      {/* 카메라 아이콘 (이모지) */}
      <Text style={[styles.icon, { fontSize: size }]}>📷</Text>
    </TouchableOpacity>
  );
}

// 스타일 정의
const styles = StyleSheet.create({
  btn: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.06)', // 연한 회색 배경
    borderRadius: 999,                   // 원형 버튼
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { color: '#111827' },             // 아이콘 색상 (짙은 회색)
});
