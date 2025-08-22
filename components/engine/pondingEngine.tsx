// components/engine/pondingEngine.ts
export type PondingSummary = {
    center: { lat: number; lon: number };
    rainMmH: number;
    ponding_index: number; // 0~1
    severity: 'yellow' | 'orange' | 'red';
  };
  
  export type OverlayStyle = {
    radiusM: number;
    fill: string;
    stroke: string;
  };
  
  export async function runPondingAnalysis(opts: {
    lat: number;
    lon: number;
    getRainMmH: (lat: number, lon: number) => Promise<number>;
    radiusM?: number; // 원 반경(m)
  }) {
    const { lat, lon, getRainMmH, radiusM = 500 } = opts;
  
    // 1) 강수량
    const rain = await getRainMmH(lat, lon);
  
    // 2) 매우 단순한 예시 룰 (팀 룰로 교체 가능)
    //   - >= 30mm/h → orange, >= 50mm/h → red (데모 기준)
    let severity: 'yellow' | 'orange' | 'red' = 'yellow';
    if (rain >= 50) severity = 'red';
    else if (rain >= 30) severity = 'orange';
  
    // 0~1 지표 (단순 보간)
    const ponding_index = Math.max(0, Math.min(1, (rain - 10) / 60));
  
    // 3) 지도 색상
    const palette = {
      red:    { stroke: 'rgba(239,68,68,0.9)',  fill: 'rgba(239,68,68,0.28)' },
      orange: { stroke: 'rgba(245,158,11,0.9)', fill: 'rgba(245,158,11,0.28)' },
      yellow: { stroke: 'rgba(234,179,8,0.9)',  fill: 'rgba(234,179,8,0.28)' },
    }[severity];
  
    const summary: PondingSummary = {
      center: { lat, lon },
      rainMmH: rain,
      ponding_index,
      severity,
    };
    const overlay: OverlayStyle = {
      radiusM,
      stroke: palette.stroke,
      fill: palette.fill,
    };
    return { summary, overlay };
  }
  