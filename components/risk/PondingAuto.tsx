// components/risk/PondingAuto.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { Circle } from 'react-native-amap3d';
import { useAlerts } from '../notification/alertsStore';
import { getRainMmH } from '../api/weather';
import { runPondingAnalysis } from '../engine/pondingEngine';

type LatLng = { latitude: number; longitude: number };
type Props = {
  center: LatLng | null;         // App에서 넘겨줌 (내 위치 등)
  radiusM?: number;              // 원 반경(기본 500m)
  analyzeOnMount?: boolean;      // mount 시에도 실행할지
};

export default function PondingAuto({ center, radiusM = 500, analyzeOnMount = false }: Props) {
  const { addUserAlert } = useAlerts();
  const [overlay, setOverlay] = useState<{ center: LatLng; radiusM: number; stroke: string; fill: string } | null>(null);

  const depKey = useMemo(() => (center ? `${center.latitude.toFixed(5)},${center.longitude.toFixed(5)}` : ''), [center]);

  useEffect(() => {
    let active = true;
    async function work() {
      if (!center) return;

      const { summary, overlay } = await runPondingAnalysis({
        lat: center.latitude,
        lon: center.longitude,
        getRainMmH,
        radiusM,
      });

      if (!active) return;

      // 1) 지도 원 오버레이 상태 저장
      setOverlay({
        center,
        radiusM: overlay.radiusM,
        stroke: overlay.stroke,
        fill: overlay.fill,
      });

      // 2) 위험도 기준에 따라 사용자 알림 생성 (기존 UI에 자동 반영됨)
      const risk = summary.ponding_index;
      const title = `자동 침수 감지 (risk ${risk.toFixed(2)})`;
      addUserAlert({
        title,
        subtitle: `${summary.center.lat.toFixed(5)}, ${summary.center.lon.toFixed(5)} / ${summary.rainMmH.toFixed(1)} mm/h`,
        severity: summary.severity,
        location: { latitude: center.latitude, longitude: center.longitude },
      });
    }

    if (center && (analyzeOnMount || depKey)) {
      void work();
    }
    return () => { active = false; };
  }, [center, depKey, radiusM, addUserAlert, analyzeOnMount]);

  if (!overlay) return null;

  return (
    <Circle
      center={overlay.center}
      radius={overlay.radiusM}
      strokeColor={overlay.stroke}
      fillColor={overlay.fill}
      strokeWidth={2}
      zIndex={9}
    />
  );
}
