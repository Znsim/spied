// components/MyLocationMarker.tsx
// ──────────────────────────────────────────────────────────────────────────────
// 목적
//  - 지도(MapView) 위에 "내 위치"를 나타내는 마커를 표시하는 전용 컴포넌트.
// 특징
//  - react-native-amap3d 의 Marker 컴포넌트 사용
//  - 부모(App.tsx 등)에서 내 위치 좌표를 props 로 전달받아 렌더링
//  - 추후 아이콘/스타일을 교체하기 쉽게 별도 컴포넌트로 분리
// ──────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { Marker } from 'react-native-amap3d';

// 부모로부터 받을 props 타입 정의
interface MyLocationMarkerProps {
  latitude: number;   // 위도
  longitude: number;  // 경도
}

export default function MyLocationMarker({ latitude, longitude }: MyLocationMarkerProps) {
  return (
    <Marker
      // 지도 위 특정 좌표에 마커 표시
      position={{ latitude, longitude }}

      // ✅ 기본 동그란 점 대신 커스텀 아이콘을 넣고 싶을 때:
      // icon={require('../assets/mylocation.png')}

      // ✅ 마커를 길게 눌렀을 때 표시되는 툴팁 텍스트:
      // title="내 위치"
    />
  );
}
