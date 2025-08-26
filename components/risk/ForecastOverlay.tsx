// components/risk/ForecastOverlay.tsx
// ────────────────────────────────────────────────
// 목적
//   - "시스템 알림(systemAlerts)" 중 최신 N개를 지도 위 원(Circle)으로 시각화
//   - 위험도(Severity)에 따라 원의 선/면 색상을 다르게 표시
//
// 사용 위치
//   - <MapViewContainer> 내부 children으로 넣어 지도 위에 겹쳐 그립니다.
//   - 예) <ForecastOverlay radiusM={600} maxCount={8} zIndex={8} />
//
// 주의
//   - AMap Circle은 center(위도/경도) + radius(미터) 기반으로 렌더링됩니다.
//   - systemAlerts가 비어 있으면 null 반환(렌더 없음).
// ────────────────────────────────────────────────

import React from 'react';
import { Circle } from 'react-native-amap3d';
import { useAlerts, Severity } from '../notification/alertsStore';

type Props = {
  /** 각 예측 원의 반경(미터 단위). 기본 600m */
  radiusM?: number;
  /** 지도 위 레이어 우선순위(겹침 순서). 숫자가 클수록 위에 표시 */
  zIndex?: number;
  /** 최신순으로 최대 몇 개를 표시할지. 기본 6개 */
  maxCount?: number;
};

/** 위험도별 선/면 색상 매핑 */
function colorBySeverity(sev: Severity) {
  switch (sev) {
    case 'red':
      return { stroke: '#ef4444', fill: 'rgba(239,68,68,0.28)' };     // 빨강
    case 'orange':
      return { stroke: '#f59e0b', fill: 'rgba(245,158,11,0.26)' };    // 주황
    case 'yellow':
    default:
      return { stroke: '#eab308', fill: 'rgba(234,179,8,0.24)' };     // 노랑(기본)
  }
}

export default function ForecastOverlay({
  radiusM = 600,
  zIndex = 8,
  maxCount = 6,
}: Props) {
  // 시스템 알림 목록(토스트/사이드바와 동일한 소스)
  const { systemAlerts } = useAlerts();

  // 시스템 알림이 없으면 아무것도 렌더하지 않음(성능/불필요 렌더 방지)
  if (!systemAlerts.length) return null;

  // 최신순 상위 N개만 지도에 표시 (store에서 앞쪽이 최신이라고 가정)
  const items = systemAlerts.slice(0, maxCount);

  return (
    <>
      {items.map((it) => {
        const c = colorBySeverity(it.severity);
        return (
          <Circle
            key={it.id}
            center={it.location}      // { latitude, longitude }
            radius={radiusM}          // 미터 단위
            strokeColor={c.stroke}    // 테두리 색
            fillColor={c.fill}        // 내부 채움 색(투명도 포함)
            strokeWidth={2}
            zIndex={zIndex}           // 다른 오버레이와의 겹침 우선순위
          />
        );
      })}
    </>
  );
}
