// components/map/MapFocus.ts
// ──────────────────────────────────────────────────────────────────────────────
// 목적
//  - 앱 어디서든 "지도를 특정 좌표로 이동"시키기 위한 전역 유틸.
// 특징
//  - App.tsx에서 MapViewContainer의 moveCamera를 등록(setMapMover).
//  - 이후 다른 컴포넌트에서 focusMap(lat, lng, zoom)을 호출하면
//    자동으로 지도 카메라가 해당 좌표로 이동.
// ──────────────────────────────────────────────────────────────────────────────

// 카메라 이동 함수의 타입 정의
// lat: 위도, lng: 경도, zoom: 확대 레벨
export type MapMover = (lat: number, lng: number, zoom?: number) => void;

// 전역 저장 변수 (App.tsx에서 등록됨)
let mover: MapMover | null = null;

/**
 * App.tsx에서 맵이 준비되면 호출하여 mover 등록
 * @param fn - moveCamera 함수 (또는 null로 해제)
 */
export function setMapMover(fn: MapMover | null) {
  mover = fn;
}

/**
 * 앱 어디서나 호출해 지도 카메라 이동
 * @param lat  - 위도
 * @param lng  - 경도
 * @param zoom - 줌 레벨 (기본값 17)
 */
export function focusMap(lat: number, lng: number, zoom = 17) {
  if (mover) {
    try {
      mover(lat, lng, zoom); // 등록된 mover 실행
    } catch (e) {
      console.warn('[MapFocus] mover failed:', e);
    }
  } else {
    // App.tsx에서 아직 setMapMover를 호출하지 않은 경우
    console.warn('[MapFocus] no mover is set yet');
  }
}
