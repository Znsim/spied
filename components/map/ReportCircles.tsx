// components/map/ReportCircles.tsx
// ──────────────────────────────────────────────────────────────────────────────
// 목적
//  - 사용자 신고(userAlerts)를 지도에 "원(circle)" 형태로 표시.
//  - 위험도(severity)에 따라 원의 색상을 다르게 적용.
// 특징
//  - react-native-amap3d 의 Circle 컴포넌트 사용.
//  - store( alertsStore )에서 userAlerts를 불러와 반복 렌더링.
// ──────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { Circle } from 'react-native-amap3d';
import { useAlerts } from '../notification/alertsStore';

// ──────────────────────────────────────────────
// severity(위험도) 값에 따라 색상 지정
// stroke: 원 테두리 색, fill: 안쪽 반투명 색
// ──────────────────────────────────────────────
const colorOf = (sev?: 'red' | 'orange' | 'yellow') => {
  switch (sev) {
    case 'red':     // 🚨 매우 위험
      return { stroke: '#ef4444', fill: 'rgba(239,68,68,0.25)' };
    case 'orange':  // ⚠️ 경고
      return { stroke: '#f59e0b', fill: 'rgba(245,158,11,0.25)' };
    case 'yellow':  // ⚡ 주의
      return { stroke: '#eab308', fill: 'rgba(234,179,8,0.25)' };
    default:        // 기타/미지정
      return { stroke: '#3b82f6', fill: 'rgba(59,130,246,0.15)' };
  }
};

export default function ReportCircles() {
  // userAlerts: 사용자가 등록한 신고 데이터 배열
  // 각 항목은 { id, location: {lat,lng}, severity } 형태
  const { userAlerts } = useAlerts();

  return (
    <>
      {userAlerts.map((a) => {
        // 🚫 위치나 위험도 없는 데이터는 무시
        if (!a.location || !a.severity) return null;

        const { stroke, fill } = colorOf(a.severity);

        return (
          <Circle
            key={a.id}                 // 리스트 렌더링 키
            center={a.location}        // 원 중심 좌표 { latitude, longitude }
            radius={1000}              // 반경(m) → 여기선 1km
            strokeWidth={2}            // 테두리 두께
            strokeColor={stroke}       // 테두리 색상
            fillColor={fill}           // 내부 색상 (투명도 포함)
            zIndex={10}                // 지도 위 겹침 우선순위
          />
        );
      })}
    </>
  );
}
