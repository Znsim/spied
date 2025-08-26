// components/controls/CurrentLocationBtn.tsx
// ──────────────────────────────────────────────────────────────────────────────
// 목적
//  - 화면 하단 왼쪽에 "내 위치" 버튼을 띄워 특정 좌표로 지도를 이동시킴.
// 특징
//  - onLocationSet(latitude, longitude)를 부모에 전달 → 부모가 지도 카메라 이동
//  - 현재는 "장수대학교" 좌표를 하드코딩 (테스트용)
//  - 실제 GPS 연동 시 이 부분을 수정 가능
// ──────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

// 부모로부터 받을 속성: 내 위치 버튼 클릭 시 호출할 함수
interface CurrentLocationBtnProps {
  onLocationSet: (latitude: number, longitude: number) => void;
}

export default function CurrentLocationBtn({ onLocationSet }: CurrentLocationBtnProps) {
  const { t } = useTranslation(); // 다국어 번역 함수 가져오기

  // 장수대학교 좌표 (현재 고정값으로 사용 중)
  const JANGSU_UNIVERSITY_LAT = 32.20008528203389;
  const JANGSU_UNIVERSITY_LNG = 119.51415636213258;

  // 다른 테스트 좌표 (서울) → 필요 시 교체 가능
  // const JANGSU_UNIVERSITY_LAT = 37.540265;
  // const JANGSU_UNIVERSITY_LNG = 126.984428;

  // 버튼 눌렀을 때 실행되는 함수
  const handleGoToMyLocation = () => {
    // 부모 컴포넌트(App.tsx 등)로 좌표 전달
    onLocationSet(JANGSU_UNIVERSITY_LAT, JANGSU_UNIVERSITY_LNG);
  };

  return (
    <TouchableOpacity
      style={styles.locationButton}
      onPress={handleGoToMyLocation}
    >
      {/* 다국어 키 사용: locales/en.json, ko.json 등에서 'map.myLocation' 정의 필요 */}
      <Text style={styles.buttonText}>{t('map.myLocation')}</Text>
    </TouchableOpacity>
  );
}

// 스타일 정의
const styles = StyleSheet.create({
  locationButton: {
    position: 'absolute',        // 화면 안에서 고정 위치
    bottom: 24,                  // 하단에서 24px 위
    left: 20,                    // 왼쪽에서 20px
    backgroundColor: '#007AFF',  // iOS 스타일 파란색
    paddingHorizontal: 16,       // 좌우 여백
    paddingVertical: 12,         // 상하 여백
    borderRadius: 8,             // 둥근 모서리
    elevation: 3,                // 안드로이드 그림자
    shadowColor: '#000',         // iOS 그림자 색
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1000,                // 다른 요소보다 위에 표시
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
