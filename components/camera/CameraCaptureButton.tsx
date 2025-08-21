// components/camera/CameraCaptureButton.tsx
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import { launchCamera, CameraOptions, Asset } from 'react-native-image-picker';

type Props = {
  size?: number;                 // 아이콘(텍스트) 크기
  disabled?: boolean;
  style?: ViewStyle;             // 위치/정렬 등은 style로
  onCaptured: (asset: Asset) => void;
  onError: (msg: string) => void;
};

async function requestPerms(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  try {
    const cam = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA
    );
    const read =
      (PermissionsAndroid as any).PERMISSIONS.READ_MEDIA_IMAGES
        ? await PermissionsAndroid.request(
            (PermissionsAndroid as any).PERMISSIONS.READ_MEDIA_IMAGES
          )
        : await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
          );
    return (
      cam === PermissionsAndroid.RESULTS.GRANTED &&
      read === PermissionsAndroid.RESULTS.GRANTED
    );
  } catch (e) {
    return false;
  }
}

export default function CameraCaptureButton({
  size = 24,
  disabled,
  style,
  onCaptured,
  onError,
}: Props) {
  const onPress = async () => {
    if (disabled) return;
    const ok = await requestPerms();
    if (!ok) {
      onError('설정에서 카메라/사진 권한을 허용해주세요.');
      return;
    }
    try {
      const options: CameraOptions = {
        mediaType: 'photo',
        saveToPhotos: true,
        includeBase64: false,
        cameraType: 'back',
        presentationStyle: 'fullScreen',
      };
      const res = await launchCamera(options);
      if (res.didCancel) return;
      if (res.errorCode) {
        onError(res.errorMessage || res.errorCode);
        return;
      }
      const asset = res.assets?.[0];
      if (asset?.uri) onCaptured(asset);
    } catch (e: any) {
      onError(String(e?.message ?? e));
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.btn, style]}
      disabled={disabled}
    >
      {/* 심플한 카메라 이모지 아이콘 */}
      <Text style={[styles.icon, { fontSize: size }]}>📷</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { color: '#111827' },
});
