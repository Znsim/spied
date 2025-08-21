// components/map/ReportCircles.tsx
import React from 'react';
import { Circle } from 'react-native-amap3d';
import { useAlerts } from '../notification/alertsStore';

// severity -> stroke/fill 색상
const colorOf = (sev?: 'red' | 'orange' | 'yellow') => {
  switch (sev) {
    case 'red':
      return { stroke: '#ef4444', fill: 'rgba(239,68,68,0.25)' };
    case 'orange':
      return { stroke: '#f59e0b', fill: 'rgba(245,158,11,0.25)' };
    case 'yellow':
      return { stroke: '#eab308', fill: 'rgba(234,179,8,0.25)' };
    default:
      return { stroke: '#3b82f6', fill: 'rgba(59,130,246,0.15)' };
  }
};

export default function ReportCircles() {
  const { userAlerts } = useAlerts();

  return (
    <>
      {userAlerts.map((a) => {
        // 위치/위험도가 없는 항목은 스킵
        if (!a.location || !a.severity) return null;

        const { stroke, fill } = colorOf(a.severity);
        return (
          <Circle
            key={a.id}
            center={a.location}   // { latitude, longitude }
            radius={1000}         // 1km
            strokeWidth={2}
            strokeColor={stroke}
            fillColor={fill}
            zIndex={10}
          />
        );
      })}
    </>
  );
}
