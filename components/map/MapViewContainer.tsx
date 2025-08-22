// components/map/MapViewContainer.tsx
import React, {
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from 'react';
import { StyleSheet } from 'react-native';
import { AMapSdk, MapView } from 'react-native-amap3d';
import { useTranslation } from 'react-i18next';

export type MapViewContainerHandle = {
  moveCamera: (lat: number, lng: number, zoom?: number) => void;
};

type Props = { children?: React.ReactNode };

/** 🔑 ANDROID API 키 (요기서 직접 관리) */
const AMAP_ANDROID_KEY = '62e382c3d28ec0351d76f3ce18779a47';

/** ✅ 중복 초기화 방지 */
let AMAP_INITIALIZED = false;

const MapViewContainer = forwardRef<MapViewContainerHandle, Props>(
  ({ children }, ref) => {
    const { t } = useTranslation();
    const mapRef = useRef<MapView | null>(null);

    useEffect(() => {
      if (!AMAP_INITIALIZED) {
        AMapSdk.init(AMAP_ANDROID_KEY);
        AMAP_INITIALIZED = true;
      }
    }, []);

    // 최신/구버전 모두 대응
    const tryMove = useCallback(
      (lat: number, lng: number, zoom: number, tries = 10) => {
        const m: any = mapRef.current;

        // 최신: moveCamera(cameraPosition, durationMs)
        const cameraPos = {
          target: { latitude: lat, longitude: lng },
          zoom,
          tilt: 0, // bearing/rotation은 아예 넣지 않음
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
            },
            600
          );
          return;
        }

        if (tries > 0) {
          setTimeout(() => tryMove(lat, lng, zoom, tries - 1), 150);
        } else {
          console.warn(
            t(
              'map.moveApiMissing',
              'Could not find a map camera move API on this MapView.'
            )
          );
        }
      },
      [t]
    );

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
        /** ✅ 신버전: initialCameraPosition */
        initialCameraPosition={{
          target: { latitude: 39.91095, longitude: 116.37296 },
          zoom: 11,
          tilt: 0,
        }}
        /** ✅ 구버전 호환: initialStatus (없는 구현은 무시됨) */
        // @ts-expect-error: 일부 타입 정의에는 없을 수 있음
        initialStatus={{
          center: { latitude: 39.91095, longitude: 116.37296 },
          zoomLevel: 11,
          tilt: 0,
        }}
      >
        {children /* 도트/서클/마커 등 오버레이 */ }
      </MapView>
    );
  }
);

export default MapViewContainer;
