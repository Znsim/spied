// components/map/UserSeverityDots.tsx
import React from 'react';
import { Circle } from 'react-native-amap3d';
import { useAlerts } from '../notification/alertsStore';
import type { Severity } from '../notification/alertsStore';

// 색상 매핑 (AMap Circle은 RGBA 문자열 사용)
const fill: Record<Severity, string> = {
  red:    'rgba(239,68,68,0.35)',   // tailwind red-500
  orange: 'rgba(245,158,11,0.35)',  // amber-500
  yellow: 'rgba(234,179,8,0.35)',   // yellow-500
};
const stroke: Record<Severity, string> = {
  red:    'rgba(239,68,68,0.9)',
  orange: 'rgba(245,158,11,0.9)',
  yellow: 'rgba(234,179,8,0.9)',
};

export default function UserSeverityDots() {
  const { userAlerts } = useAlerts(); // [{ id, location: {latitude, longitude}, severity, ... }]

  if (!userAlerts?.length) return null;

  return (
    <>
      {userAlerts.map((a, i) => {
        if (!a.location) return null;
        const key = String(a.id ?? i);
        return (
          <Circle
            key={key}
            center={a.location}
            radius={500}                  // ✅ 점처럼 보이게 작은 반경(미터)
            fillColor={fill[a.severity]}
            strokeColor={stroke[a.severity]}
            strokeWidth={2}
            zIndex={10}
          />
        );
      })}
    </>
  );
}
