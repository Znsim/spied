// components/dev/amapGeocode.ts
// AMap 역지오코딩 (좌표 → 주소) 유틸
// ⚠️ AMap REST는 (lng,lat) 순서! (경도,위도)

export const AMAP_WEB_KEY = 'c59e02f452531b5004180e41eaadb8a0';

export type RegeoResult = {
  formattedAddress?: string;
  province?: string;
  city?: string;
  district?: string;
  town?: string;
};

function withTimeout<T>(p: Promise<T>, ms = 2500): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('regeo timeout')), ms);
    p.then(v => { clearTimeout(t); resolve(v); },
           e => { clearTimeout(t); reject(e); });
  });
}

export async function reverseGeocode(lng: number, lat: number): Promise<RegeoResult | null> {
  try {
    const url =
      `https://restapi.amap.com/v3/geocode/regeo?key=${encodeURIComponent(AMAP_WEB_KEY)}` +
      `&location=${lng},${lat}&radius=100&extensions=base`;

    const res = await withTimeout(fetch(url), 2500);
    const json = await res.json();

    if (json?.status !== '1') {
      // 실패 원인 바로 확인 (키/제한/쿼터 등)
      console.warn('[AMap Regeo] fail:', json?.status, json?.info, json?.infocode);
      return null;
    }

    const regeo = json.regeocode;
    const comp = regeo?.addressComponent ?? {};
    return {
      formattedAddress: regeo?.formatted_address,
      province: comp.province,
      city: comp.city || comp.province,
      district: comp.district,
      town: comp.township,
    };
  } catch (e) {
    console.warn('[AMap Regeo] error:', e);
    return null;
  }
}

// 좌표 텍스트 폴백
export function coordLabel(lat: number, lng: number, digits = 5) {
  return `${lat.toFixed(digits)}, ${lng.toFixed(digits)}`;
}
