// components/dev/amapGeocode.ts
// ──────────────────────────────────────────────────────────────────────────────
// 목적
//  - AMap(고덕 지도) REST API를 사용해 "좌표 → 주소" 역지오코딩을 수행하는 유틸.
// 특징
//  - fetch 기반 REST 호출
//  - (lng, lat) 순서 사용 (⚠️ 경도, 위도 순서임에 주의!)
//  - 호출 실패 시 null 반환 + 콘솔에 경고 출력
// ──────────────────────────────────────────────────────────────────────────────

// AMap Web API 키 (REST 호출용)
// 👉 보통은 .env에 저장하고 import하는 것이 안전함.
export const AMAP_WEB_KEY = 'c59e02f452531b5004180e41eaadb8a0';

// 역지오코딩 결과 타입 정의
export type RegeoResult = {
  formattedAddress?: string; // 전체 주소 문자열
  province?: string;         // 시/도
  city?: string;             // 시/군/구
  district?: string;         // 구/군/읍
  town?: string;             // 동/리
};

// Promise에 타임아웃을 추가하는 유틸 함수
// → 2.5초 안에 응답이 없으면 reject
function withTimeout<T>(p: Promise<T>, ms = 2500): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('regeo timeout')), ms);
    p.then(
      v => { clearTimeout(t); resolve(v); },
      e => { clearTimeout(t); reject(e); }
    );
  });
}

// ──────────────────────────────────────────────
// 역지오코딩: 좌표(lng,lat) → 주소 정보
// ──────────────────────────────────────────────
export async function reverseGeocode(lng: number, lat: number): Promise<RegeoResult | null> {
  try {
    // REST API URL 구성
    const url =
      `https://restapi.amap.com/v3/geocode/regeo?key=${encodeURIComponent(AMAP_WEB_KEY)}` +
      `&location=${lng},${lat}&radius=100&extensions=base`;

    // fetch 호출 (타임아웃 적용)
    const res = await withTimeout(fetch(url), 2500);
    const json = await res.json();

    // 실패 시 경고 로그 + null 반환
    if (json?.status !== '1') {
      console.warn('[AMap Regeo] fail:', json?.status, json?.info, json?.infocode);
      return null;
    }

    // 성공 시 주소 구성요소 파싱
    const regeo = json.regeocode;
    const comp = regeo?.addressComponent ?? {};
    return {
      formattedAddress: regeo?.formatted_address, // 전체 주소
      province: comp.province,                   // 도/광역시
      city: comp.city || comp.province,          // 도시명 (없는 경우 province 사용)
      district: comp.district,                   // 구/군
      town: comp.township,                       // 동/리
    };
  } catch (e) {
    // 네트워크 오류, 파싱 오류 등
    console.warn('[AMap Regeo] error:', e);
    return null;
  }
}

// ──────────────────────────────────────────────
// 좌표를 단순 텍스트(lat,lng)로 표시하는 폴백 함수
// digits: 소수점 자리수
// ──────────────────────────────────────────────
export function coordLabel(lat: number, lng: number, digits = 5) {
  return `${lat.toFixed(digits)}, ${lng.toFixed(digits)}`;
}
