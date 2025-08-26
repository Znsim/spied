// components/risk/ForecastAutoMock.tsx
// ────────────────────────────────────────────────
// 목적
//   - 서버 연동 전, "예측 경보"를 자동으로 생성하는 데모/모의(mock) 컴포넌트
//   - 일정 주기마다(center 주변에) 무작위 좌표로 시스템 알림을 추가해 UI와 흐름을 테스트
//
// 동작 개요
//   1) intervalSec(초)마다 setInterval로 실행
//   2) 중심 좌표(center) 기준 scatterKm 반경 내 무작위 지점을 샘플링
//   3) 20% 확률로 "실패(서버 미응답)" 알림, 80% 확률로 정상 예측 알림을 추가
//   4) 다국어(i18n)를 위해 title/subtitle은 { key, params } 형태(I18nText)로 저장
//   5) 언마운트 시 interval 정리
// ────────────────────────────────────────────────

import { useEffect } from 'react';
import { useAlerts } from '../notification/alertsStore';

type Props = {
  center: { latitude: number; longitude: number }; // 예측의 중심 좌표(보통 현재 위치 등)
  /** 예측 주기(초). 기본 10초 간격으로 새 알림 생성 */
  intervalSec?: number;
  /** 무작위 산포 반경(km). 기본 10km 안에서 점을 뿌림 */
  scatterKm?: number;
};

// 심각도 후보(빨강/주황/노랑)
const SEVERITIES = ['red', 'orange', 'yellow'] as const;
type Sev = (typeof SEVERITIES)[number];

/** 중심(lat, lon)에서 반경 rKm 내 임의의 점(균등분포) 반환
 *  - 원판 균등 샘플링: r = R * sqrt(u), θ = 2πv  (u, v ~ U(0,1))
 *  - 위도(longitude), 경도(latitude) 각도 단위 보정 포함
 */
function randomPointInRadius(lat: number, lon: number, rKm: number) {
  // 위도 1도 ≈ 111.32km
  const earthKmPerDegLat = 111.32;
  // 경도 1도는 위도에 따라 길이가 달라짐 → cos(lat) 보정
  const earthKmPerDegLon = earthKmPerDegLat * Math.cos((lat * Math.PI) / 180);

  // 원판 균등 샘플링
  const u = Math.random();
  const v = Math.random();
  const r = rKm * Math.sqrt(u);          // 반지름
  const theta = 2 * Math.PI * v;         // 각도

  // km → 도(degree) 변환
  const dLat = (r * Math.cos(theta)) / earthKmPerDegLat;
  const dLon = (r * Math.sin(theta)) / earthKmPerDegLon;

  return { latitude: lat + dLat, longitude: lon + dLon };
}

export default function ForecastAutoMock({
  center,
  intervalSec = 10, // 기본 10초 주기
  scatterKm = 10,   // 기본 10km 반경
}: Props) {
  const { addSystemAlert } = useAlerts();

  useEffect(() => {
    // intervalSec마다 한 번씩 "예측 알림"을 추가
    const timer = setInterval(() => {
      const loc = randomPointInRadius(center.latitude, center.longitude, scatterKm);

      // 20% 확률: 실패 케이스
      // - 서버 미응답 등 상황을 시뮬레이션
      // - 다국어 키만 저장 (화면에서 t('forecast.errorTitle')로 번역)
      if (Math.random() < 0.2) {
        addSystemAlert({
          title: { key: 'forecast.errorTitle' },      // 예: "예측 실패"
          subtitle: { key: 'forecast.errorSubtitle' },// 예: "서버 응답이 없습니다"
          severity: 'yellow',
          location: loc,
          photoUri: undefined,                        // 이미지 없음
        });
        if (__DEV__) console.warn('[ForecastAutoMock] prediction failed: no server response');
        return;
      }

      // 80% 확률: 정상 케이스
      // - 무작위 심각도 선택
      // - subtitle에 params로 severity 키를 전달 (다국어 텍스트 내 치환용)
      const pick: Sev = SEVERITIES[Math.floor(Math.random() * SEVERITIES.length)];
      addSystemAlert({
        title: { key: 'forecast.autoTitle' },         // 예: "자동 예측 경보"
        subtitle: {
          key: 'forecast.autoSubtitle',               // 예: "{severity} 발생 가능성 감지"
          params: { severity: { key: `severity.${pick}` } }, // severity.red/orange/yellow
        },
        severity: pick,
        location: loc,
        photoUri: undefined,
      });

      if (__DEV__) console.log(`[ForecastAutoMock] prediction added: ${pick}`, loc);
    }, intervalSec * 1000);

    // 언마운트/의존성 변경 시 interval 해제
    return () => clearInterval(timer);
  }, [center, intervalSec, scatterKm, addSystemAlert]);

  // UI를 렌더링하지 않는 "동작만 하는" 컴포넌트이므로 null 반환
  return null;
}
