// components/MyLocationMarker.tsx
import React from 'react';
import { Marker } from 'react-native-amap3d';

interface MyLocationMarkerProps {
  latitude: number;
  longitude: number;
}

export default function MyLocationMarker({ latitude, longitude }: MyLocationMarkerProps) {
  return (
    <Marker
      position={{ latitude, longitude }}
      // icon={require('../assets/mylocation.png')} // 아이콘 이미지 따로 넣고 싶으면 사용
      // title="내 위치" // 마커 툴팁
    />
  );
}
