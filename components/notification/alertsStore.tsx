// components/notification/alertsStore.tsx
import React, {
  createContext, useContext, useCallback, useState, ReactNode, useRef, useEffect,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ===== 새 타입 =====
export type Severity = 'red' | 'orange' | 'yellow';
export type LatLng = { latitude: number; longitude: number };

export type AlertItem = {
  id: string;
  title: string;
  subtitle?: string;
  timestamp: string;
  unread?: boolean;
  createdAt: number;
  photoUri?: string;

  // 새 필드
  severity?: Severity;
  location?: LatLng;
};

type AlertsContextValue = {
  userAlerts: AlertItem[];
  systemAlerts: AlertItem[];

  addUserAlert: (p: {
    title: string;
    subtitle?: string;
    photoUri?: string;
    severity: Severity;
    location: LatLng;
  }) => void;

  addSystemAlert: (p: { title: string; subtitle?: string }) => void;
  seedDemo: () => void;
  clearUserAlerts: () => void;
  clearSystemAlerts: () => void;
  clearAll: () => void;
  markAllRead: () => void;

  lastUserAlert: AlertItem | null;
  consumeLastUserAlert: () => void;

  isHydrated: boolean;
};

const AlertsContext = createContext<AlertsContextValue | null>(null);
const nowLabel = () => '방금';

// 유니크 id
let __seq = 0;
const uid = (prefix: 'u' | 's') =>
  `${prefix}${Date.now()}_${(__seq++).toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;

// ✅ 스키마 버전 변경(v2: severity/location 추가)
const STORAGE_KEY = 'alerts_state_v2';

type PersistedState = {
  userAlerts: AlertItem[];
  systemAlerts: AlertItem[];
};

export function AlertsProvider({ children }: { children: ReactNode }) {
  // 기본 시드: 시스템 2개 / 사용자 0개
  const [systemAlerts, setSystemAlerts] = useState<AlertItem[]>([
    {
      id: 's_seed_1',
      title: '새 경보: 강우량 증가',
      subtitle: '장수대학교 인근 지역',
      timestamp: '오늘 10:24',
      unread: true,
      createdAt: Date.now() - 30 * 60 * 1000,
    },
    {
      id: 's_seed_2',
      title: '주의보 해제 예정',
      subtitle: '금일 18:00 해제',
      timestamp: '2일 전',
      unread: false,
      createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
    },
  ]);
  const [userAlerts, setUserAlerts] = useState<AlertItem[]>([]);
  const [lastUserAlert, setLastUserAlert] = useState<AlertItem | null>(null);

  // 하이드레이트 제어
  const hydrateOnceRef = useRef(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // StrictMode 중복 방지
  const lastAddRef = useRef<{ key: string; at: number } | null>(null);

  // ---------- Hydrate ----------
  useEffect(() => {
    if (hydrateOnceRef.current) return;
    hydrateOnceRef.current = true;

    (async () => {
      try {
        // v2 우선 시도, 없으면 v1도 한 번 시도(하위호환)
        const rawV2 = await AsyncStorage.getItem(STORAGE_KEY);
        const rawV1 = !rawV2 ? await AsyncStorage.getItem('alerts_state_v1') : null;
        const raw = rawV2 ?? rawV1;

        if (raw) {
          const parsed: PersistedState = JSON.parse(raw);
          if (Array.isArray(parsed.userAlerts)) setUserAlerts(parsed.userAlerts);
          if (Array.isArray(parsed.systemAlerts)) setSystemAlerts(parsed.systemAlerts);
        }
      } catch (e) {
        console.warn('[alertsStore] hydrate failed:', e);
      } finally {
        setIsHydrated(true);
      }
    })();
  }, []);

  // ---------- Persist (debounce) ----------
  useEffect(() => {
    if (!isHydrated) return; // 복원 전 저장 금지
    const t = setTimeout(() => {
      const state: PersistedState = { userAlerts, systemAlerts };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch((e) =>
        console.warn('[alertsStore] persist failed:', e),
      );
    }, 200);
    return () => clearTimeout(t);
  }, [userAlerts, systemAlerts, isHydrated]);

  // ---------- Actions ----------
  const addUserAlert = useCallback((p: {
    title: string; subtitle?: string; photoUri?: string; severity: Severity; location: LatLng;
  }) => {
    const key = `${p.title}|${p.subtitle ?? ''}|${p.photoUri ?? ''}|${p.severity}|${p.location.latitude},${p.location.longitude}`;
    const now = Date.now();
    if (lastAddRef.current && lastAddRef.current.key === key && now - lastAddRef.current.at < 1000) {
      return; // 1초 내 동일 payload 방지
    }

    const item: AlertItem = {
      id: uid('u'),
      title: p.title,
      subtitle: p.subtitle,
      photoUri: p.photoUri,
      severity: p.severity,
      location: p.location,
      timestamp: nowLabel(),
      unread: true,
      createdAt: now,
    };
    setUserAlerts(prev => [item, ...prev]);
    setLastUserAlert(item);
    lastAddRef.current = { key, at: now };
  }, []);

  const addSystemAlert = useCallback((p: { title: string; subtitle?: string }) => {
    const item: AlertItem = {
      id: uid('s'),
      title: p.title,
      subtitle: p.subtitle,
      timestamp: nowLabel(),
      unread: true,
      createdAt: Date.now(),
    };
    setSystemAlerts(prev => [item, ...prev]);
  }, []);

  const seedDemo = useCallback(() => {
    // 데모: 위험도/좌표 포함
    addUserAlert({
      title: '사용자 신고: 배수로 막힘',
      subtitle: '서문 인근',
      severity: 'orange',
      location: { latitude: 32.200085, longitude: 119.514156 },
    });
    addSystemAlert({ title: '점검 스케줄 안내', subtitle: '오늘 15:00 ~ 16:00' });
  }, [addUserAlert, addSystemAlert]);

  const clearUserAlerts = useCallback(() => setUserAlerts([]), []);
  const clearSystemAlerts = useCallback(() => setSystemAlerts([]), []);
  const clearAll = useCallback(() => {
    setUserAlerts([]);
    setSystemAlerts([]);
    AsyncStorage.removeItem(STORAGE_KEY).catch((e) =>
      console.warn('[alertsStore] clearAll persist remove failed:', e),
    );
  }, []);
  const markAllRead = useCallback(() => {
    setUserAlerts(list => list.map(x => ({ ...x, unread: false })));
    setSystemAlerts(list => list.map(x => ({ ...x, unread: false })));
  }, []);
  const consumeLastUserAlert = useCallback(() => setLastUserAlert(null), []);

  return (
    <AlertsContext.Provider value={{
      userAlerts,
      systemAlerts,
      addUserAlert,
      addSystemAlert,
      seedDemo,
      clearUserAlerts,
      clearSystemAlerts,
      clearAll,
      markAllRead,
      lastUserAlert,
      consumeLastUserAlert,
      isHydrated,
    }}>
      {children}
    </AlertsContext.Provider>
  );
}

export function useAlerts() {
  const ctx = useContext(AlertsContext);
  if (!ctx) throw new Error('useAlerts must be used within AlertsProvider');
  return ctx;
}
