// components/map/MapViewContainer.tsx
import React, { useEffect, useRef, forwardRef, useImperativeHandle, useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { AMapSdk, MapView } from 'react-native-amap3d';

export type MapViewContainerHandle = {
  moveCamera: (lat: number, lng: number, zoom?: number) => void;
};

type Props = { children?: React.ReactNode };

const MapViewContainer = forwardRef<MapViewContainerHandle, Props>(({ children }, ref) => {
  const mapRef = useRef<MapView | null>(null);

  useEffect(() => {
    // 버전에 따라 아래 두 형태 중 하나를 사용
    // AMapSdk.init('YOUR_ANDROID_KEY');
    // 또는
    // AMapSdk.init({ android: 'YOUR_ANDROID_KEY', ios: 'YOUR_IOS_KEY' });
    AMapSdk.init('62e382c3d28ec0351d76f3ce18779a47');
  }, []);

  // 최신/구버전 모두 대응
  const tryMove = useCallback((lat: number, lng: number, zoom: number, tries = 10) => {
    const m: any = mapRef.current;

    // 최신: moveCamera(cameraPosition, durationMs)
    const cameraPos = {
      target: { latitude: lat, longitude: lng },
      zoom,
      tilt: 0,
      // bearing 제거
    };

    if (m && typeof m.moveCamera === 'function') {
      m.moveCamera(cameraPos, 600);
      return;
    }
    // 구버전/포크: setStatus(status, durationMs)
    if (m && typeof m.setStatus === 'function') {
      m.setStatus(
        {
          center: { latitude: lat, longitude: lng },
          zoomLevel: zoom,
          tilt: 0,
          // rotation 제거
        },
        600
      );
      return;
    }
    if (tries > 0) {
      setTimeout(() => tryMove(lat, lng, zoom, tries - 1), 150);
    } else {
      console.warn('카메라 이동 API를 찾지 못했습니다.');
    }
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      moveCamera(lat: number, lng: number, zoom = 16) {
        tryMove(lat, lng, zoom);
      },
    }),
    [tryMove]
  );

  return (
    <MapView
      ref={mapRef as any}
      style={StyleSheet.absoluteFill}
      initialCameraPosition={{
        target: { latitude: 39.91095, longitude: 116.37296 },
        zoom: 11,
      }}
    >
      {children /* <ReportCircles /> 같은 오버레이는 여기 children으로 렌더 */}
    </MapView>
  );
});

export default MapViewContainer;
