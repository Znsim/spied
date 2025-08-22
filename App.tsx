// App.tsx
import React, { useRef, useState } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import MapViewContainer, { MapViewContainerHandle } from './components/map/MapViewContainer';
import CurrentLocationBtn from './components/controls/CurrentLocationBtn';
import MyLocationMarker from './components/map/MyLocationMarker';
import EditNoteController from './components/controls/EditNoteController';
import { AlertsProvider } from './components/notification/alertsStore';
import UserSeverityDots from './components/map/UserSeverityDots';
import IntroSeverityGuide from './components/modals/IntroSeverityGuide';
import './components/i18n/index';

// ⬇️ 새로 추가
import PondingAuto from './components/risk/PondingAuto';

type LatLng = { latitude: number; longitude: number };

export default function App() {
  const mapRef = useRef<MapViewContainerHandle>(null);
  const [myPos, setMyPos] = useState<LatLng | null>(null);

  const handleLocationSet = (latitude: number, longitude: number) => {
    setMyPos({ latitude, longitude });
    mapRef.current?.moveCamera(latitude, longitude, 16);
  };

  return (
    <AlertsProvider>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.container}>
          <MapViewContainer ref={mapRef}>
            {/* 사용자 신고 색상 점 (기존 알림들 시각화) */}
            <UserSeverityDots />

            {/* 🔥 자동 침수 위험도 분석 + 원 오버레이 + 알림 생성 */}
            <PondingAuto center={myPos} />

            {/* 현재 내 위치 마커 (있을 때만) */}
            {myPos && (
              <MyLocationMarker latitude={myPos.latitude} longitude={myPos.longitude} />
            )}
          </MapViewContainer>

          <EditNoteController />
          <CurrentLocationBtn onLocationSet={handleLocationSet} />
        </View>

        {/* 처음 실행 공지 모달 — 오늘은 체크박스 끔 */}
        <IntroSeverityGuide rememberOption={false} />
      </SafeAreaProvider>
    </AlertsProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
});
