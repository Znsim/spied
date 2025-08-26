// components/notification/SystemAlertList.tsx
// ────────────────────────────────────────────────
// 목적
//  - 시스템 알림 리스트(앱이 제공하는 경보/공지)를 사이드바에서 보여줌
//  - 실제 데이터(systemAlerts) 또는 데모 데이터(showDemo) 표시
//
// 기능
//  - systemAlerts가 있으면 그대로 표시
//  - systemAlerts가 없을 때 "데모 알림 보기" 버튼 → showDemo = true → 샘플 데이터 표시
//  - 리스트 아이템 클릭 시 해당 좌표로 지도 이동(focusMap)
//  - FlatList로 스크롤/렌더링 최적화
// ────────────────────────────────────────────────

import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image, FlatList } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAlerts, asText } from './alertsStore';
import type { Severity } from './alertsStore';
import { focusMap } from '../map/MapFocus';

// 알림 위험도별 색상
const dotColor: Record<Severity, string> = {
  red: '#ef4444',
  orange: '#f59e0b',
  yellow: '#eab308',
};

/* ── 샘플 데모 데이터 (systemAlerts 없을 때 보여줌) ── */
type DemoItem = {
  id: string;
  title: string;
  subtitle: string;
  severity: Severity;
  createdAt: number;
  photoUri?: any;
  location?: { latitude: number; longitude: number };
};

function makeDemo(t: (k: string, opt?: any) => string, now = Date.now()): DemoItem[] {
  return [
    {
      id: 'demo-1',
      title: t('alerts.demo.floodWarningTitle', '침수 경보(시범)'),
      subtitle: t('alerts.demo.floodWarningSubtitle', '중문 교차로'),
      severity: 'red',
      createdAt: now - 5 * 60 * 1000, // 5분 전
    },
    {
      id: 'demo-2',
      title: t('alerts.demo.slowDownTitle', '서행 권고(시범)'),
      subtitle: t('alerts.demo.slowDownSubtitle', '체육관 앞 도로'),
      severity: 'orange',
      createdAt: now - 22 * 60 * 1000, // 22분 전
    },
    {
      id: 'demo-3',
      title: t('alerts.demo.drainWorkTitle', '배수 작업 중(시범)'),
      subtitle: t('alerts.demo.drainWorkSubtitle', '기숙사 A동'),
      severity: 'yellow',
      createdAt: now - 50 * 60 * 1000, // 50분 전
    },
  ];
}

/* ── FlatList에 넣을 공통 Row 타입 ── */
type Row = {
  id: string;
  title: string | { key: string; params?: Record<string, any> };
  subtitle?: string | { key: string; params?: Record<string, any> };
  severity: Severity;
  ts: number;
  photoUri?: any;
  location?: { latitude: number; longitude: number };
};

/* ── 상대 시간 포맷 ── */
function timeAgo(t: (k: string, opt?: any) => string, ts: number) {
  const m = Math.max(0, Math.round((Date.now() - ts) / 60000)); // 분 단위
  if (m < 1) return t('alerts.timeAgo.justNow', '방금');
  if (m < 60) return t('alerts.timeAgo.m', { count: m });
  const h = Math.floor(m / 60);
  const rem = m % 60;
  if (rem === 0) return t('alerts.timeAgo.h', { count: h });
  const half = rem < 30 ? 0 : 30;
  return t('alerts.timeAgo.hHalf', { h, half });
}

/* ── 메인 컴포넌트 ── */
export default function SystemAlertList() {
  const { t } = useTranslation();
  const { systemAlerts } = useAlerts();
  const [showDemo, setShowDemo] = useState(false);

  // ✅ Row[] 데이터 구성: 실제 → 데모 → 빈배열
  const rows: Row[] = useMemo(() => {
    if (systemAlerts && systemAlerts.length > 0) {
      return systemAlerts.map((a: any) => ({
        id: String(a.id ?? a.title),
        title: a.title,
        subtitle: a.subtitle,
        severity: a.severity as Severity,
        ts: typeof a.timestamp === 'number' ? a.timestamp : Date.now(),
        photoUri: a.photoUri,
        location: a.location,
      }));
    }
    if (showDemo) {
      return makeDemo(t).map((d) => ({
        id: d.id,
        title: d.title,
        subtitle: d.subtitle,
        severity: d.severity,
        ts: d.createdAt,
        photoUri: d.photoUri,
        location: d.location,
      }));
    }
    return [];
  }, [systemAlerts, showDemo, t]);

  /* ── systemAlerts 없음 + showDemo false일 때: 안내/버튼 UI ── */
  if ((systemAlerts?.length ?? 0) === 0 && !showDemo) {
    return (
      <View style={styles.emptyBox}>
        <Text style={styles.emptyTitle}>{t('alerts.systemEmptyTitle', '앱 제공 알림 영역')}</Text>
        <Text style={styles.emptyDesc}>
          {t(
            'alerts.systemEmptyDesc',
            '여기에 앱에서 제공하는 공지/경보가 표시됩니다.\n(시연용) 아래 버튼을 눌러 데모 알림을 볼 수 있어요.'
          )}
        </Text>

        <Pressable style={styles.demoBtn} onPress={() => setShowDemo(true)}>
          <Text style={styles.demoBtnText}>{t('alerts.showDemo', '데모 알림 보기')}</Text>
        </Pressable>
      </View>
    );
  }

  /* ── 알림 리스트 ── */
  return (
    <FlatList<Row>
      data={rows}
      keyExtractor={(it, idx) =>
        String(it.id ?? `${asText(t, it.title)}-${it.ts}-${idx}`)
      }
      ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
      contentContainerStyle={{ paddingBottom: 20 }}
      // systemAlerts가 없을 때 데모 배지 표시
      ListHeaderComponent={
        systemAlerts?.length === 0
          ? () => (
              <View style={styles.demoBadge}>
                <Text style={styles.demoBadgeText}>{t('alerts.demoBadge', '시연용 데모 데이터')}</Text>
                <Pressable hitSlop={8} onPress={() => setShowDemo(false)}>
                  <Text style={styles.demoHide}>{t('alerts.hide', '숨기기')}</Text>
                </Pressable>
              </View>
            )
          : null
      }
      renderItem={({ item: it }) => {
        const title = asText(t, it.title);
        const subtitle = it.subtitle ? asText(t, it.subtitle) : '';

        // 카드 클릭 시 지도 이동
        const onPress = () => {
          const loc = it.location;
          if (loc?.latitude != null && loc?.longitude != null) {
            focusMap(loc.latitude, loc.longitude, 17);
          }
        };

        return (
          <Pressable style={styles.card} onPress={onPress}>
            <View style={styles.row}>
              <View style={[styles.dot, { backgroundColor: dotColor[it.severity] }]} />
              <Text style={styles.title} numberOfLines={1}>{title}</Text>
            </View>
            {subtitle ? <Text style={styles.sub} numberOfLines={2}>{subtitle}</Text> : null}
            <Text style={styles.time}>{timeAgo(t, it.ts)}</Text>
            {it.photoUri ? (
              <Image source={it.photoUri as any} style={styles.thumb} resizeMode="cover" />
            ) : null}
            <Text style={styles.hint}>{t('alerts.tapToZoom', 'Tap to zoom')}</Text>
          </Pressable>
        );
      }}
    />
  );
}

/* ── 스타일 ── */
const styles = StyleSheet.create({
  emptyBox: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  emptyTitle: { fontSize: 16, fontWeight: '800', marginBottom: 6 },
  emptyDesc: { color: '#6b7280', lineHeight: 20, marginBottom: 12 },
  demoBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#2563eb',
  },
  demoBtnText: { color: '#fff', fontWeight: '800' },

  demoBadge: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#fed7aa',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 14,
  },
  demoBadgeText: { color: '#9a3412', fontWeight: '700' },
  demoHide: { color: '#9a3412', fontWeight: '700', padding: 4 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  title: { fontSize: 16, fontWeight: '700', flexShrink: 1 },
  sub: { color: '#6b7280', marginBottom: 6 },
  time: { color: '#9ca3af', fontSize: 12, marginBottom: 4 },
  hint: { color: '#cbd5e1', fontSize: 12 },
  thumb: { width: 96, height: 64, borderRadius: 8, backgroundColor: '#f1f5f9' },
});
