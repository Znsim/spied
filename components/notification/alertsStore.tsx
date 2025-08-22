// components/notification/alertsStore.tsx
import React, { createContext, useContext, useMemo, useRef, useState } from 'react';

export type Severity = 'red' | 'orange' | 'yellow';
export type LatLng = { latitude: number; longitude: number };

export type AlertItem = {
  id: string;
  title: string;
  subtitle?: string;
  photoUri?: string;
  severity: Severity;
  location: LatLng;
  timestamp: number; // ms
};

type AlertsContextType = {
  // 데이터
  userAlerts: AlertItem[];
  systemAlerts: AlertItem[];

  // 토스트용
  lastUserAlert: AlertItem | null;

  // 액션
  addUserAlert: (a: Omit<AlertItem, 'id' | 'timestamp'>) => string; // id 반환
  updateUserAlertSubtitle: (id: string, subtitle: string) => void;
  consumeLastUserAlert: () => void;
};

const AlertsCtx = createContext<AlertsContextType | null>(null);

export function AlertsProvider({ children }: { children: React.ReactNode }) {
  const [userAlerts, setUserAlerts] = useState<AlertItem[]>([]);
  const [systemAlerts] = useState<AlertItem[]>([]);
  const [lastUserAlert, setLastUserAlert] = useState<AlertItem | null>(null);
  const idSeq = useRef(1);

  const addUserAlert = (a: Omit<AlertItem, 'id' | 'timestamp'>) => {
    const id = `ua_${idSeq.current++}`;
    const item: AlertItem = { id, timestamp: Date.now(), ...a };
    setUserAlerts(prev => [item, ...prev]);
    setLastUserAlert(item);
    return id;
  };

  const updateUserAlertSubtitle = (id: string, subtitle: string) => {
    setUserAlerts(prev => prev.map(it => (it.id === id ? { ...it, subtitle } : it)));
    setLastUserAlert(it => (it && it.id === id ? { ...it, subtitle } : it));
  };

  const consumeLastUserAlert = () => setLastUserAlert(null);

  const value = useMemo(
    () => ({
      userAlerts,
      systemAlerts,
      lastUserAlert,
      addUserAlert,
      updateUserAlertSubtitle,
      consumeLastUserAlert,
    }),
    [userAlerts, systemAlerts, lastUserAlert]
  );

  return <AlertsCtx.Provider value={value}>{children}</AlertsCtx.Provider>;
}

export function useAlerts() {
  const v = useContext(AlertsCtx);
  if (!v) throw new Error('useAlerts must be used within AlertsProvider');
  return v;
}

/* ---------- 상대시간 포맷터 (다국어) ---------- */

// 1시간 미만: 이 버킷 중 가장 가까운 "아래" 값으로 표기
export const MIN_BUCKETS = [1, 3, 5, 10, 15, 20, 30, 45] as const;

type Lang = 'ko' | 'en' | 'ja' | 'zh';
function normalizeLang(x?: string): Lang {
  const t = (x || '').toLowerCase();
  if (t.startsWith('ko')) return 'ko';
  if (t.startsWith('ja')) return 'ja';
  if (t.startsWith('zh')) return 'zh';
  return 'en';
}

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

/**
 * ts: 타임스탬프(ms)
 * lang: 'ko' | 'en' | 'ja' | 'zh' 또는 'en-US' 같은 태그도 OK
 */
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
