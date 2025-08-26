// App.tsx
// ────────────────────────────────────────────────
// 📌 앱 진입점 (메인 화면 구성)
// - 지도(MapViewContainer)와 지도 위 오버레이 UI를 배치
// - 사용자 신고, 예측 데이터, 시스템/사용자 알림 표시
// - 처음 실행 시 안내 모달 표시
// - 전역 상태 관리(AlertsProvider), 다국어(i18n) 초기화 포함
//
// 레이아웃 계층:
//   1) ToastLayer (시스템 알림)
//   2) MapLayer (기본 지도 + 사용자/예측 데이터)
//   3) OverlayLayer (신고 작성 버튼, 내 위치 버튼)
//   4) ModalLayer (앱 최초 실행 안내 모달)
// ────────────────────────────────────────────────

import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// 지도와 지도 제어용 컴포넌트
import MapViewContainer, { MapViewContainerHandle } from './components/map/MapViewContainer';

// 지도 위에 올릴 버튼/마커 UI
import CurrentLocationBtn from './components/controls/CurrentLocationBtn';
import MyLocationMarker from './components/map/MyLocationMarker';
import EditNoteController from './components/controls/EditNoteController';

// 알림 기능 (전역 제공자 + 토스트)
import { AlertsProvider } from './components/notification/alertsStore';
import AlertsToasterSystem from './components/notification/tost/SystemAlertToast';

// 지도 위 사용자 데이터/예측 데이터 시각화
import UserSeverityDots from './components/map/UserSeverityDots';
import ForecastAutoMock from './components/risk/ForecastAutoMock';
import ForecastOverlay from './components/risk/ForecastOverlay';

// 처음 실행 시 안내 모달
import IntroSeverityGuide from './components/modals/IntroSeverityGuide';

// 다국어(i18n) 초기화
import './components/i18n/index';

// 지도 이동 유틸 (다른 컴포넌트에서 지도 카메라 움직이게 함)
import { setMapMover } from './components/map/MapFocus';

// 위도/경도 타입 정의
type LatLng = { latitude: number; longitude: number };

export default function App() {
  // 지도에 연결할 "리모컨" 참조 (카메라 이동 등)
  const mapRef = useRef<MapViewContainerHandle>(null);

  // 내 현재 위치 상태값 (latitude, longitude)
  const [myPos, setMyPos] = useState<LatLng | null>(null);

  // 현재 위치 버튼 눌렀을 때 실행되는 함수
  const handleLocationSet = (latitude: number, longitude: number) => {
    setMyPos({ latitude, longitude });              // 내 위치 상태 업데이트
    mapRef.current?.moveCamera(latitude, longitude, 16); // 지도 카메라 이동
  };

  // 지도 이동 함수를 전역으로 등록 → 다른 UI에서도 지도 움직이도록
  useEffect(() => {
    const mover = (lat: number, lng: number, zoom = 17) =>
      mapRef.current?.moveCamera(lat, lng, zoom);
    setMapMover(mover);        // 등록
    return () => setMapMover(null); // 컴포넌트 해제 시 제거
  }, []);

  return (
    // 알림 전역 제공자
    <AlertsProvider>
      <SafeAreaProvider>
        {/* 상태바 (폰 상단바) → 글씨는 검정, 배경은 흰색 */}
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

        {/* 시스템 토스트 (화면 맨 위 중앙에 잠깐 뜨는 알림) */}
        {/* pointerEvents="box-none" → 토스트가 지도 터치 막지 않도록 */}
        <View pointerEvents="box-none" style={styles.toastLayer}>
          <AlertsToasterSystem />
        </View>

        {/* 메인 화면 영역 */}
        <View
          style={styles.container}
          onLayout={(e) => console.log('SCREEN SIZE', e.nativeEvent.layout)}
        >
          {/* === 지도 레이어 (바닥에 지도) === */}
          <View
            style={styles.mapLayer}
            onLayout={(e) => console.log('MAP LAYER', e.nativeEvent.layout)}
          >
            <MapViewContainer ref={mapRef}>
              {/* 지도 위 사용자 신고 점 */}
              <UserSeverityDots />

              {/* 내 위치 마커 (내 위치 잡힌 경우에만 표시) */}
              {myPos && (
                <MyLocationMarker latitude={myPos.latitude} longitude={myPos.longitude} />
              )}

              {/* 예측 원 (최근 8개 표시, 반경 600m) */}
              <ForecastOverlay radiusM={600} maxCount={8} zIndex={8} />

              {/* 모의 예측 데이터 생성기 (테스트용) */}
              {myPos && (
                <ForecastAutoMock center={myPos} intervalSec={20} scatterKm={5} />
              )}
            </MapViewContainer>
          </View>

          {/* === 오버레이 레이어 (지도 위 UI 버튼/패널) === */}
          {/* absoluteFillObject + box-none → 지도는 그대로 보이고 터치도 통과 */}
          <View style={styles.overlayLayer} pointerEvents="box-none">
            <EditNoteController />                          {/* 신고 작성 버튼 */}
            <CurrentLocationBtn onLocationSet={handleLocationSet} /> {/* 내 위치 버튼 */}
          </View>
        </View>

        {/* === 모달 레이어 (처음 실행 안내창) === */}
        {/* 화면 맨 위 덮지만, 투명/반투명 배경만 사용 */}
        <View pointerEvents="box-none" style={styles.modalLayer}>
          <IntroSeverityGuide rememberOption={true} devResetOnMount={true} />
        </View>
      </SafeAreaProvider>
    </AlertsProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative', // 기준점 (이 안에서 오버레이를 절대 위치시킴)
    backgroundColor: '#fff',
  },
  mapLayer: {
    flex: 1, // 지도는 화면 전체를 차지
  },
  overlayLayer: {
    ...StyleSheet.absoluteFillObject, // 지도 위에 덮는 투명 레이어
  },
  toastLayer: {
    ...StyleSheet.absoluteFillObject, // 시스템 토스트 레이어
    // pointerEvents는 위에서 box-none 설정함
  },
  modalLayer: {
    ...StyleSheet.absoluteFillObject, // 모달 레이어
  },
});
