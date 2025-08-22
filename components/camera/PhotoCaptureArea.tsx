// components/camera/PhotoCaptureArea.tsx
import React from 'react';
import {
  View,
  Image,
  StyleSheet,
  Alert,
  ViewStyle,
} from 'react-native';
import type { Asset } from 'react-native-image-picker';
import CameraCaptureButton from './CameraCaptureButton';
import { useTranslation } from 'react-i18next';

type Props = {
  photo?: Asset | null;                // 표시할 사진
  disabled?: boolean;                  // 업로드 중 등 비활성화
  onChange: (asset: Asset | null) => void; // 촬영/재촬영 결과 전달
  height?: number;                     // 박스 높이 (기본 160)
  style?: ViewStyle;                   // 외부 스타일(선택)
};

export default function PhotoCaptureArea({
  photo,
  disabled,
  onChange,
  height = 160,
  style,
}: Props) {
  const { t } = useTranslation();

  return (
    <View style={[styles.box, { height }, style]}>
      {photo?.uri ? (
        <>
          <Image source={{ uri: photo.uri }} style={styles.image} />
          {/* 우하단 재촬영 */}
          <CameraCaptureButton
            style={styles.bottomRight}
            size={20}
            disabled={disabled}
            onCaptured={(asset) => asset?.uri && onChange(asset)}
            onError={(msg) => Alert.alert(t('camera.errorTitle'), msg)}
          />
        </>
      ) : (
        // 사진이 없으면 박스 전체 배경 + 중앙 카메라 버튼
        <View style={styles.fullBackground}>
          <CameraCaptureButton
            size={36}
            disabled={disabled}
            onCaptured={(asset) => asset?.uri && onChange(asset)}
            onError={(msg) => Alert.alert(t('camera.errorTitle'), msg)}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  image: { width: '100%', height: '100%' },
  bottomRight: { position: 'absolute', right: 10, bottom: 10 },
  fullBackground: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
