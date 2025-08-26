// components/camera/CameraCaptureButton.tsx

import React from 'react';
import {
  TouchableOpacity,   // 터치 가능한 버튼 UI
  Text,               // 텍스트 (여기서는 카메라 이모지)
  StyleSheet,         // 스타일 정의 도구
  ViewStyle,          // style prop 타입 지정용
  PermissionsAndroid, // 안드로이드 권한 요청 API
  Platform,           // 현재 플랫폼(iOS/Android) 체크
} from 'react-native';

import { launchCamera, CameraOptions, Asset } from 'react-native-image-picker';
// react-native-image-picker: 카메라 실행 및 사진 가져오는 라이브러리

import { useTranslation } from 'react-i18next';
// 다국어(i18n) 지원 → 에러 메시지를 다국어로 표시하기 위해 사용

// 🔹 컴포넌트가 받을 props(외부에서 넘겨줌)
type Props = {
  size?: number;                 // 아이콘(텍스트) 크기 (기본값 24)
  disabled?: boolean;            // 버튼 비활성화 여부
  style?: ViewStyle;             // 위치/정렬 등 스타일 커스터마이징
  onCaptured: (asset: Asset) => void; // 사진을 성공적으로 찍었을 때 호출되는 함수
  onError: (msg: string) => void;     // 에러 발생 시 호출되는 함수
};

// 🔹 카메라/저장소 권한 요청 함수
async function requestPerms(): Promise<boolean> {
  // iOS는 별도 권한 요청이 없으므로 true 반환
  if (Platform.OS !== 'android') return true;
  try {
    // 카메라 권한 요청
    const cam = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA
    );

    // 안드로이드 13(API 33)+ 에서는 READ_MEDIA_IMAGES 권한 사용
    const read =
      (PermissionsAndroid as any).PERMISSIONS.READ_MEDIA_IMAGES
        ? await PermissionsAndroid.request(
            (PermissionsAndroid as any).PERMISSIONS.READ_MEDIA_IMAGES
          )
        : await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
          );

    // 두 권한 모두 허용된 경우에만 true
    return (
      cam === PermissionsAndroid.RESULTS.GRANTED &&
      read === PermissionsAndroid.RESULTS.GRANTED
    );
  } catch {
    // 예외 발생 시 false 반환
    return false;
  }
}

// 🔹 메인 컴포넌트 (카메라 촬영 버튼)
export default function CameraCaptureButton({
  size = 24,   // 기본 아이콘 크기 = 24
  disabled,
  style,
  onCaptured,
  onError,
}: Props) {
  const { t } = useTranslation(); // 다국어 번역 함수 가져오기

  // 버튼 눌렀을 때 실행되는 함수
  const onPress = async () => {
    if (disabled) return; // 비활성화 상태면 실행 안 함

    // 카메라 권한 요청
    const ok = await requestPerms();
    if (!ok) {
      onError(t('camera.permission.denied')); // 권한 거부 → 에러 콜백 실행
      return;
    }

    try {
      // 카메라 실행 옵션
      const options: CameraOptions = {
        mediaType: 'photo',          // 사진만 허용
        saveToPhotos: true,          // 촬영 후 갤러리에 저장
        includeBase64: false,        // base64 데이터는 제외
        cameraType: 'back',          // 기본 후면 카메라
        presentationStyle: 'fullScreen', // 전체 화면 모드
      };

      // 카메라 실행
      const res = await launchCamera(options);

      if (res.didCancel) return; // 사용자가 취소한 경우 아무 일도 안 함

      if (res.errorCode) {
        // 카메라 실행 실패
        onError(res.errorMessage || t('camera.launchFailed'));
        return;
      }

      // 성공적으로 찍힌 사진 데이터 (assets 배열 중 첫 번째)
      const asset = res.assets?.[0];
      if (asset?.uri) onCaptured(asset); // uri가 있으면 onCaptured 콜백 실행
    } catch {
      // 예외 처리 (카메라 실행 실패)
      onError(t('camera.launchFailed'));
    }
  };

  // 버튼 UI
  return (
    <TouchableOpacity
      onPress={onPress}             // 버튼 눌렀을 때 onPress 실행
      activeOpacity={0.8}           // 터치 시 투명도 (0~1)
      style={[styles.btn, style]}   // 기본 스타일 + 외부에서 전달된 스타일 병합
      disabled={disabled}           // 비활성화 여부
    >
      {/* 심플한 카메라 아이콘 (📷 이모지) */}
      <Text style={[styles.icon, { fontSize: size }]}>📷</Text>
    </TouchableOpacity>
  );
}

// 🔹 스타일 정의
const styles = StyleSheet.create({
  btn: {
    padding: 8,                          // 버튼 안쪽 여백
    backgroundColor: 'rgba(0,0,0,0.04)', // 옅은 회색 배경
    borderRadius: 999,                   // 둥근 버튼 (원형)
    alignItems: 'center',                // 아이콘 가로 중앙
    justifyContent: 'center',            // 아이콘 세로 중앙
  },
  icon: { color: '#111827' },            // 아이콘 색상 (짙은 회색)
});
