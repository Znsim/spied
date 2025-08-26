// components/camera/PhotoCaptureArea.tsx
// ──────────────────────────────────────────────────────────────────────────────
// 목적
//  - 사진 미리보기 + 촬영/재촬영 버튼을 한 박스 안에서 제공하는 UI.
// 사용 흐름
//  - photo가 없으면: 흐린 배경 + 중앙에 📷 버튼 → 촬영하면 onChange(asset) 호출
//  - photo가 있으면: 사진을 가득 표시 + 우하단에 작은 📷 버튼(재촬영)
// 의존성
//  - react-native-image-picker (CameraCaptureButton 내부에서 사용)
//  - i18n (오류 메시지 다국어 표시)
// ──────────────────────────────────────────────────────────────────────────────

import React from 'react';
import {
  View,
  Image,
  StyleSheet,
  Alert,
  ViewStyle,
} from 'react-native';

import type { Asset } from 'react-native-image-picker'; // 촬영 결과 타입
import CameraCaptureButton from './CameraCaptureButton'; // 실제 카메라 실행 버튼
import { useTranslation } from 'react-i18next';

// 부모로부터 받을 속성들 정의
type Props = {
  photo?: Asset | null;                // 표시할 사진(없으면 촬영 유도 UI)
  disabled?: boolean;                  // 업로드 중 등으로 비활성화할 때 true
  onChange: (asset: Asset | null) => void; // 촬영/재촬영 결과를 부모에 전달
  height?: number;                     // 박스 높이 (기본 160)
  style?: ViewStyle;                   // 바깥에서 위치/여백 등을 조절할 때
};

export default function PhotoCaptureArea({
  photo,
  disabled,
  onChange,
  height = 160, // 기본 높이 160
  style,
}: Props) {
  const { t } = useTranslation(); // 다국어 번역 함수

  return (
    // 전체 컨테이너: 고정 높이 박스 + 둥근 테두리
    <View style={[styles.box, { height }, style]}>
      {photo?.uri ? (
        // ─────────────────────────────────────────
        // 사진이 "존재"하는 경우: 미리보기 + 우하단 재촬영 버튼
        // ─────────────────────────────────────────
        <>
          {/* 촬영된 사진을 박스 전체에 맞춰 표시 */}
          <Image source={{ uri: photo.uri }} style={styles.image} />

          {/* 우하단 재촬영 버튼 (작게) */}
          <CameraCaptureButton
            style={styles.bottomRight}
            size={20}
            disabled={disabled}
            // 새로 촬영되면 유효한 asset.uri만 부모로 전달
            onCaptured={(asset) => asset?.uri && onChange(asset)}
            // 오류 시 다국어 메시지로 Alert
            onError={(msg) => Alert.alert(t('camera.errorTitle'), msg)}
          />
        </>
      ) : (
        // ─────────────────────────────────────────
        // 사진이 "없을" 경우: 흐린 배경 + 중앙 촬영 버튼
        // ─────────────────────────────────────────
        <View style={styles.fullBackground}>
          <CameraCaptureButton
            size={36}               // 처음 촬영은 버튼 크게
            disabled={disabled}
            onCaptured={(asset) => asset?.uri && onChange(asset)}
            onError={(msg) => Alert.alert(t('camera.errorTitle'), msg)}
          />
        </View>
      )}
    </View>
  );
}

// 스타일 정의
const styles = StyleSheet.create({
  box: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#e5e7eb', // 연한 회색 테두리
    borderRadius: 10,
    overflow: 'hidden',     // 둥근 모서리 밖으로 이미지가 나가지 않게
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,       // 아래쪽 여백
  },
  image: {
    width: '100%',
    height: '100%',         // 사진을 박스 전체에 꽉 채우기
  },
  bottomRight: {
    position: 'absolute',
    right: 10,
    bottom: 10,             // 우하단 고정 배치
  },
  fullBackground: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.05)', // 비어 있을 때 흐린 배경
    alignItems: 'center',   // 중앙 정렬
    justifyContent: 'center',
  },
});
