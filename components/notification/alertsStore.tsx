// components/notification/alertsStore.tsx
// ────────────────────────────────────────────────
// 목적
//  - 앱 전역에서 사용자/시스템 알림을 관리하는 Context(Store)
//  - 신규 알림 추가, 마지막 알림(토스트용) 추적, 리스트 유지, 다국어 텍스트 처리
//
// 특징
//  - userAlerts / systemAlerts: 화면에 뿌릴 리스트
//  - lastUserAlert / lastSystemAlert: 토스트로 즉시 보여줄 마지막 항목
//  - addUserAlert / addSystemAlert: 알림 추가(아이디/타임스탬프 자동 부여)
//  - updateUserAlertSubtitle: 역지오코딩 결과 등으로 subtitle 갱신
//  - asText / resolveI18nParams: i18n 텍스트 형식(string or {key, params}) 지원
//  - formatRelative: 상대시간 다국어 포맷 함수(분/시간 기준 버킷)
// ────────────────────────────────────────────────

import React, { createContext, useContext, useMemo, useRef, useState } from 'react';
import type { TFunction } from 'i18next';

/* ---------- 공통 타입 ---------- */

// 위험도
export type Severity = 'red' | 'orange' | 'yellow';

// 좌표
export type LatLng = { latitude: number; longitude: number };

// 다국어 텍스트: 그냥 문자열 또는 i18n key/params 형태 모두 허용
export type I18nText =
  | string
  | { key: string; params?: Record<string, I18nText | string | number | boolean | null | undefined> };

// 런타임 타입 가드: I18nText 객체인지 확인
export function isI18nText(v: unknown): v is Exclude<I18nText, string> {
  return !!v && typeof v === 'object' && 'key' in (v as any);
}

// 알림 한 건의 스키마
export type AlertItem = {
  id: string;          // 내부 식별자 (ua_ / sa_ prefix)
  title: I18nText;     // 제목(다국어 지원)
  subtitle?: I18nText; // 부제(주소, 설명 등)
  photoUri?: string;   // 첨부 이미지(선택)
  severity: Severity;  // 위험도
  location: LatLng;    // 지도 표시 좌표
  timestamp: number;   // 생성 시각(ms)
};

// Context에서 제공할 API/상태 타입
type AlertsContextType = {
  userAlerts: AlertItem[];                 // 사용자 신고 리스트
  systemAlerts: AlertItem[];               // 시스템 알림 리스트

  lastUserAlert: AlertItem | null;         // 토스트용 마지막 사용자 신고
  lastSystemAlert: AlertItem | null;       // 토스트용 마지막 시스템 알림

  addUserAlert: (a: Omit<AlertItem, 'id' | 'timestamp'>) => string;   // 사용자 신고 추가
  addSystemAlert: (a: Omit<AlertItem, 'id' | 'timestamp'>) => string; // 시스템 알림 추가

  updateUserAlertSubtitle: (id: string, subtitle: I18nText) => void;  // 특정 신고의 subtitle만 갱신
  consumeLastUserAlert: () => void;        // 토스트 소비(표시 끝) → null로
  consumeLastSystemAlert: () => void;      // 토스트 소비(표시 끝) → null로
};

const AlertsCtx = createContext<AlertsContextType | null>(null);

/* ---------- 스토어 구현 ---------- */
export function AlertsProvider({ children }: { children: React.ReactNode }) {
  // 리스트 상태
  const [userAlerts, setUserAlerts] = useState<AlertItem[]>([]);
  const [systemAlerts, setSystemAlerts] = useState<AlertItem[]>([]);

  // 토스트용 최근 항목
  const [lastUserAlert, setLastUserAlert] = useState<AlertItem | null>(null);
  const [lastSystemAlert, setLastSystemAlert] = useState<AlertItem | null>(null);

  // 간단한 증가 시퀀스(실서비스라면 uuid 권장)
  const idSeq = useRef(1);

  // 사용자 신고 추가 → 리스트 맨 앞 + 토스트 최신값 갱신
  const addUserAlert = (a: Omit<AlertItem, 'id' | 'timestamp'>) => {
    const id = `ua_${idSeq.current++}`;
    const item: AlertItem = { id, timestamp: Date.now(), ...a };
    setUserAlerts(prev => [item, ...prev]);
    setLastUserAlert(item);
    return id;
  };

  // 시스템 알림 추가 → 리스트 맨 앞 + 토스트 최신값 갱신
  const addSystemAlert = (a: Omit<AlertItem, 'id' | 'timestamp'>) => {
    const id = `sa_${idSeq.current++}`;
    const item: AlertItem = { id, timestamp: Date.now(), ...a };
    setSystemAlerts(prev => [item, ...prev]);
    setLastSystemAlert(item);
    return id;
  };

  // 특정 사용자 신고의 subtitle만 교체(역지오코딩 주소 반영 등)
  const updateUserAlertSubtitle = (id: string, subtitle: I18nText) => {
    setUserAlerts(prev => prev.map(it => (it.id === id ? { ...it, subtitle } : it)));
    // 토스트에 떠 있는 동일 항목도 동기 갱신
    setLastUserAlert(it => (it && it.id === id ? { ...it, subtitle } : it));
  };

  // 토스트 소비(표시 끝)
  const consumeLastUserAlert = () => setLastUserAlert(null);
  const consumeLastSystemAlert = () => setLastSystemAlert(null);

  // Context value 메모이제이션
  const value = useMemo(
    () => ({
      userAlerts,
      systemAlerts,
      lastUserAlert,
      lastSystemAlert,
      addUserAlert,
      addSystemAlert,
      updateUserAlertSubtitle,
      consumeLastUserAlert,
      consumeLastSystemAlert,
    }),
    [userAlerts, systemAlerts, lastUserAlert, lastSystemAlert]
  );

  return <AlertsCtx.Provider value={value}>{children}</AlertsCtx.Provider>;
}

// 훅: Provider 내부에서만 사용 가능하도록 가드
export function useAlerts() {
  const v = useContext(AlertsCtx);
  if (!v) throw new Error('useAlerts must be used within AlertsProvider');
  return v;
}

/* ---------- i18n 렌더 헬퍼 ---------- */

// 중첩 params 안의 I18nText도 재귀적으로 번역해 params로 치환
export function resolveI18nParams(
  t: TFunction,
  params?: Record<string, I18nText | string | number | boolean | null | undefined>
) {
  if (!params) return undefined;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(params)) {
    out[k] = isI18nText(v) ? t(v.key, resolveI18nParams(t, v.params)) : v;
  }
  return out;
}

// I18nText → 최종 문자열
export function asText(t: TFunction, v?: I18nText): string {
  if (!v) return '';
  if (typeof v === 'string') return v;
  return t(v.key, resolveI18nParams(t, v.params));
}

/* ---------- 상대시간 포맷터 (다국어) ---------- */

// 분 단위 버킷(UX: 세밀도보다 가독성 우선)
export const MIN_BUCKETS = [1, 3, 5, 10, 15, 20, 30, 45] as const;

// 간단한 언어 정규화
type Lang = 'ko' | 'en' | 'ja' | 'zh';
function normalizeLang(x?: string): Lang {
  const tag = (x || '').toLowerCase();
  if (tag.startsWith('ko')) return 'ko';
  if (tag.startsWith('ja')) return 'ja';
  if (tag.startsWith('zh')) return 'zh';
  return 'en';
}

// 언어별 텍스트 테이블
const L = {
  ko: {
    justNow: '방금 전',
    minAgo: (n: number) => `${n}분 전`,
    hourAgo: (h: number) => `${h}시간 전`,
    hourHalfAgo: (h: number) => `${h}시간 30분 전`,
  },
  en: {
    justNow: 'just now',
    minAgo: (n: number) => `${n} min ago`,
    hourAgo: (h: number) => `${h} hr ago`,
    hourHalfAgo: (h: number) => `${h} hr 30 min ago`,
  },
  ja: {
    justNow: 'たった今',
    minAgo: (n: number) => `${n}分前`,
    hourAgo: (h: number) => `${h}時間前`,
    hourHalfAgo: (h: number) => `${h}時間30分前`,
  },
  zh: {
    justNow: '刚刚',
    minAgo: (n: number) => `${n} 分钟前`,
    hourAgo: (h: number) => `${h} 小时前`,
    hourHalfAgo: (h: number) => `${h} 小时30分钟前`,
  },
} as const;

// timestamp → 상대시간 문자열(언어 반영)
//  - 0분: '방금 전'
//  - 1/3/5/10/15/20/30/45분 버킷
//  - 1시간 이상: 'N시간 전' 또는 'N시간 30분 전'
export function formatRelative(ts: number, lang?: string, now = Date.now()): string {
  const d = Math.max(0, now - ts);
  const min = Math.floor(d / 60000);
  const i = L[normalizeLang(lang)];
  if (min === 0) return i.justNow;
  if (min < 60) {
    const bucket = MIN_BUCKETS.reduce((acc, b) => (b <= min ? b : acc), 1);
    return i.minAgo(bucket);
  }
  const hours = Math.floor(min / 60);
  const mins = min % 60;
  return mins >= 30 ? i.hourHalfAgo(hours) : i.hourAgo(hours);
}
