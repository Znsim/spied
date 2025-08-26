// components/map/MapViewContainer.tsx
// ──────────────────────────────────────────────────────────────────────────────
// 목적
//  - AMap(MapView)를 화면에 렌더링하고, 외부(App.tsx 등)에서 카메라를
//    제어(moveCamera)할 수 있게 "리모컨 핸들"을 제공하는 컨테이너.
// 특징
//  - forwardRef/useImperativeHandle 로 외부에서 mapRef.current.moveCamera(...) 호출 가능
//  - AMapSdk.init 는 앱 생애주기에서 단 1회만 실행되도록 가드
//  - moveCamera 호출 시 임시 핀(tempPin)을 해당 좌표에 5초간 표시
//  - 자식(children)을 그대로 MapView 안에 렌더 → 지도 위 그래픽/마커/오버레이 구성
// 주의
//  - AMap REST와 달리 SDK 좌표는 (lat, lng) 객체 형태 사용
//  - AMapSdk.init({ android: KEY }) 형태를 권장(아래는 기존 코드 유지)
// ──────────────────────────────────────────────────────────────────────────────

import React, {
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
  useCallback,
  useState,
} from 'react';
import { StyleSheet } from 'react-native';
import { AMapSdk, MapView, Marker } from 'react-native-amap3d';
import { useTranslation } from 'react-i18next';

// 외부에서 사용할 수 있는 "리모컨 핸들" 타입 정의
export type MapViewContainerHandle = {
  // 위도/경도/줌을 받아 카메라 이동
  moveCamera: (lat: number, lng: number, zoom?: number) => void;
};

// children: 지도 위에 올릴 추가 컴포넌트(마커/오버레이 등)
type Props = { children?: React.ReactNode };

// ⚠️ 샘플 키: 실제로는 .env 로 관리 권장
const AMAP_ANDROID_KEY = '8d5a6180afec6d7ae5587793e27074e0';

// AMapSdk.init 를 앱에서 1회만 하도록 전역 가드
let AMAP_INITIALIZED = false;

const MapViewContainer = forwardRef<MapViewContainerHandle, Props>(
  ({ children }, ref) => {
    const { t } = useTranslation();

    // 내부 MapView 참조 → 카메라 이동 API 탐색 등에 사용
    const mapRef = useRef<MapView | null>(null);

    // ✅ moveCamera 호출 시, 잠깐 표시해줄 "임시 핀" 상태
    const [tempPin, setTempPin] = useState<{ lat: number; lng: number } | null>(null);

    // ──────────────────────────────────────────────
    // AMap SDK 초기화 (앱에서 1회만)
    // ──────────────────────────────────────────────
    useEffect(() => {
      if (!AMAP_INITIALIZED) {
        // 권장 표기: AMapSdk.init({ android: AMAP_ANDROID_KEY })
        // 여기서는 기존 로직 유지
        AMapSdk.init(AMAP_ANDROID_KEY);
        AMAP_INITIALIZED = true;
      }
    }, []);

    // ──────────────────────────────────────────────
    // 카메라 이동을 최대 N번 재시도 (맵 레퍼런스 준비 타이밍 차이 대비)
    // - moveCamera (신규 API)
    // - setStatus  (구버전 API 호환)
    // 둘 중 존재하는 걸 사용
    // ──────────────────────────────────────────────
    const tryMove = useCallback(
      (lat: number, lng: number, zoom: number, tries = 10) => {
        const m: any = mapRef.current;

        // 공통 카메라 파라미터
        const cameraPos = {
          target: { latitude: lat, longitude: lng },
          zoom,
          tilt: 0,
        };

        // 신규 방식: moveCamera 가 있으면 우선 사용
        if (m && typeof m.moveCamera === 'function') {
          m.moveCamera(cameraPos, 600); // 600ms 애니메이션
          return;
        }

        // 구버전 호환: setStatus 가 있으면 사용
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

        // 아직 MapView가 준비 전이라면 150ms 간격으로 재시도
        if (tries > 0) {
          setTimeout(() => tryMove(lat, lng, zoom, tries - 1), 150);
        } else {
          // 끝까지 실패하면 경고 로그(다국어 키 사용)
          console.warn(
            t('map.moveApiMissing', 'Could not find a camera move API on this MapView.')
          );
        }
      },
      [t]
    );

    // ──────────────────────────────────────────────
    // 외부에서 mapRef.current?.moveCamera(...) 형태로 호출 가능하도록
    // useImperativeHandle 로 "리모컨 핸들" 노출
    // ──────────────────────────────────────────────
    useImperativeHandle(
      ref,
      () => ({
        moveCamera(lat: number, lng: number, zoom = 16) {
          // 카메라 이동
          tryMove(lat, lng, zoom);

          // ✅ 임시 핀 표시(5초 후 자동 제거)
          setTempPin({ lat, lng });
          setTimeout(() => setTempPin(null), 5000);
        },
      }),
      [tryMove]
    );

    return (
      <MapView
        ref={mapRef as any}
        // 지도는 상위 컨테이너가 flex:1 을 보장해야 화면을 가득 채움
        style={StyleSheet.absoluteFill}

        // 초기 카메라 위치(베이징 근처 샘플 좌표)
        // ⚠️ initialCameraPosition 과 initialStatus 는 일반적으로 하나만 사용 권장.
        //    (여기서는 호환을 위해 둘 다 제공. 내부 SDK가 우선순위로 처리)
        initialCameraPosition={{
          target: { latitude: 39.91095, longitude: 116.37296 },
          zoom: 11,
          tilt: 0,
        }}
        // @ts-expect-error 일부 타입 정의에 없을 수 있음 (구버전 호환)
        initialStatus={{
          center: { latitude: 39.91095, longitude: 116.37296 },
          zoomLevel: 11,
          tilt: 0,
        }}
      >
        {/* 부모에서 넘겨준 자식 요소들을 지도 위에 그대로 렌더
            (마커/도형/오버레이 등) */}
        {children}

        {/* ✅ moveCamera 호출 시 표시되는 "임시 핀" */}
        {tempPin && (
          <Marker
            // 최신 타입: coordinate (일부 버전에선만 존재)
            // @ts-expect-error: 구버전 타입엔 없을 수 있어 무시
            coordinate={{ latitude: tempPin.lat, longitude: tempPin.lng }}
            // 구버전: position 지원 (일부 버전 호환)
            position={{ latitude: tempPin.lat, longitude: tempPin.lng }}
            // 아이콘 커스터마이즈를 원하면 아래 주석 해제 (버전에 따라 prop 이름이 다를 수 있음)
            // image={require('../../assets/icons/alert_pin.png')}
            // icon={require('../../assets/icons/alert_pin.png')}
          />
        )}
      </MapView>
    );
  }
);

export default MapViewContainer;
