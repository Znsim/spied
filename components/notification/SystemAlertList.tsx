import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAlerts } from './alertsStore';
import type { Severity } from './alertsStore';

const dotColor: Record<Severity, string> = {
  red: '#ef4444',
  orange: '#f59e0b',
  yellow: '#eab308',
};

type DemoItem = {
  id: string;
  title: string;
  subtitle: string;
  severity: Severity;
  createdAt: number;
  photoUri?: any; // require() 가능
};

function makeDemo(t: (k: string, opt?: any) => string, now = Date.now()): DemoItem[] {
  return [
    {
      id: 'demo-1',
      title: t('alerts.demo.floodWarningTitle', '침수 경보(시범)'),
      subtitle: t('alerts.demo.floodWarningSubtitle', '중문 교차로'),
      severity: 'red',
      createdAt: now - 5 * 60 * 1000,
    },
    {
      id: 'demo-2',
      title: t('alerts.demo.slowDownTitle', '서행 권고(시범)'),
      subtitle: t('alerts.demo.slowDownSubtitle', '체육관 앞 도로'),
      severity: 'orange',
      createdAt: now - 22 * 60 * 1000,
    },
    {
      id: 'demo-3',
      title: t('alerts.demo.drainWorkTitle', '배수 작업 중(시범)'),
      subtitle: t('alerts.demo.drainWorkSubtitle', '기숙사 A동'),
      severity: 'yellow',
      createdAt: now - 50 * 60 * 1000,
    },
  ];
}

/** i18n 기반 상대시간: 1시간 이상은 0/30분 단위로 표기 */
function timeAgo(t: (k: string, opt?: any) => string, ts: number) {
  const m = Math.max(0, Math.round((Date.now() - ts) / 60000));
  if (m < 1) return t('alerts.timeAgo.justNow', '방금');
  if (m < 60) return t('alerts.timeAgo.m', { count: m }); // "{{count}}분 전"
  const h = Math.floor(m / 60);
  const rem = m % 60;
  if (rem === 0) return t('alerts.timeAgo.h', { count: h });
  const half = rem < 30 ? 0 : 30;
  return t('alerts.timeAgo.hHalf', { h, half }); // "{{h}}시간 {{half}}분 전"
}

export default function SystemAlertList() {
  const { t } = useTranslation();
  const { systemAlerts } = useAlerts();
  const [showDemo, setShowDemo] = useState(false);

  const items = useMemo(() => {
    if (systemAlerts && systemAlerts.length > 0) {
      return systemAlerts.map((a: any) => ({
        id: String(a.id ?? a.title),
        title: a.title,
        subtitle: a.subtitle,
        severity: a.severity as Severity,
        createdAt: a.createdAt ?? Date.now(),
        photoUri: a.photoUri,
      })) as DemoItem[];
    }
    return showDemo ? makeDemo(t) : [];
  }, [systemAlerts, showDemo, t]);

  if ((systemAlerts?.length ?? 0) === 0 && !showDemo) {
    return (
      <View style={styles.emptyBox}>
        <Text style={styles.emptyTitle}>{t('alerts.systemEmptyTitle', '앱 제공 알림 영역')}</Text>
        <Text style={styles.emptyDesc}>
          {t('alerts.systemEmptyDesc', '여기에 앱에서 제공하는 공지/경보가 표시됩니다.\n(시연용) 아래 버튼을 눌러 데모 알림을 볼 수 있어요.')}
        </Text>

        <Pressable style={styles.demoBtn} onPress={() => setShowDemo(true)}>
          <Text style={styles.demoBtnText}>{t('alerts.showDemo', '데모 알림 보기')}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ gap: 14 }}>
      {systemAlerts?.length === 0 && (
        <View style={styles.demoBadge}>
          <Text style={styles.demoBadgeText}>{t('alerts.demoBadge', '시연용 데모 데이터')}</Text>
          <Pressable hitSlop={8} onPress={() => setShowDemo(false)}>
            <Text style={styles.demoHide}>{t('alerts.hide', '숨기기')}</Text>
          </Pressable>
        </View>
      )}

      {items.map((it) => (
        <View key={it.id} style={styles.card}>
          <View style={styles.row}>
            <View style={[styles.dot, { backgroundColor: dotColor[it.severity] }]} />
            <Text style={styles.title}>{it.title}</Text>
          </View>
          <Text style={styles.sub}>{it.subtitle}</Text>
          <Text style={styles.time}>{timeAgo(t, it.createdAt)}</Text>

          {it.photoUri ? (
            <Image source={it.photoUri} style={styles.thumb} resizeMode="cover" />
          ) : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  emptyBox: {
    padding: 16, borderRadius: 12, backgroundColor: '#f8fafc',
    borderWidth: 1, borderColor: '#e5e7eb',
  },
  emptyTitle: { fontSize: 16, fontWeight: '800', marginBottom: 6 },
  emptyDesc: { color: '#6b7280', lineHeight: 20, marginBottom: 12 },
  demoBtn: {
    alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 10, backgroundColor: '#2563eb',
  },
  demoBtnText: { color: '#fff', fontWeight: '800' },

  demoBadge: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#fff7ed', borderWidth: 1, borderColor: '#fed7aa',
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
  },
  demoBadgeText: { color: '#9a3412', fontWeight: '700' },
  demoHide: { color: '#9a3412', fontWeight: '700', padding: 4 },

  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: '#e5e7eb',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  title: { fontSize: 16, fontWeight: '700' },
  sub: { color: '#6b7280', marginBottom: 6 },
  time: { color: '#9ca3af', fontSize: 12, marginBottom: 8 },
  thumb: { width: 96, height: 64, borderRadius: 8, backgroundColor: '#f1f5f9' },
});
