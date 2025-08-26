// components/map/UserSeverityDots.tsx
// ──────────────────────────────────────────────────────────────────────────────
// 목적
//  - 사용자 신고(userAlerts)를 "작은 점(원)" 형태로 지도에 표시.
//  - 위험도(severity)에 따라 점의 색상을 구분.
// 특징
//  - react-native-amap3d 의 Circle 컴포넌트를 사용 (반경을 작게 해서 점처럼 보이게).
//  - ReportCircles와 달리 반경을 500m로 작게 설정해 "포인트" 느낌을 강조.
// ──────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { Circle } from 'react-native-amap3d';
import { useAlerts } from '../notification/alertsStore';
import type { Severity } from '../notification/alertsStore';

// ──────────────────────────────────────────────
// 위험도별 색상 매핑 (AMap Circle은 RGBA 문자열 사용)
// - fill: 안쪽 색 (반투명)
// - stroke: 테두리 색 (진하게)
// Tailwind 팔레트(red-500, amber-500, yellow-500)를 기준으로 지정
// ──────────────────────────────────────────────
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
  // 전역 store에서 사용자 신고목록을 불러옴
  // 각 항목 예: { id, location: { latitude, longitude }, severity: 'red'|'orange'|'yellow', ... }
  const { userAlerts } = useAlerts();

  // 목록이 비어 있으면 렌더링하지 않음
  if (!userAlerts?.length) return null;

  return (
    <>
      {userAlerts.map((a, i) => {
        // 위치가 없는 항목은 스킵
        if (!a.location) return null;

        // key: id가 있으면 id 사용, 없으면 인덱스로 대체
        const key = String(a.id ?? i);

        return (
          <Circle
            key={key}
            center={a.location}                // 원 중심 좌표 { latitude, longitude }
            radius={500}                       // ✅ 작은 반경(500m) → 점처럼 보이게
            fillColor={fill[a.severity]}       // 내부 색상 (반투명)
            strokeColor={stroke[a.severity]}   // 테두리 색상 (진하고 선명)
            strokeWidth={2}                    // 테두리 두께
            zIndex={10}                        // 다른 오버레이 위로 표시 우선순위
          />
        );
      })}
    </>
  );
}
