import React, { useState } from 'react';
import {
  FlatList,
  View,
  Text,
  StyleSheet,
  Image,
  Modal,
  Pressable,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAlerts } from './alertsStore';
import type { AlertItem, Severity } from './alertsStore';

type Props = { items?: AlertItem[] };

function iconFor(sev?: Severity) {
  switch (sev) {
    case 'red': return '🔴';
    case 'orange': return '🟠';
    case 'yellow': return '🟡';
    default: return '🟡';
  }
}

/** i18n 기반 상대시간: 1시간 이상은 0/30분 단위로 표기 */
function formatTimeAgo(
  t: (k: string, opt?: any) => string,
  ts: number,
  now = Date.now()
) {
  const m = Math.max(0, Math.round((now - ts) / 60000));
  if (m < 1) return t('alerts.timeAgo.justNow', '방금');
  if (m < 60) return t('alerts.timeAgo.m', { count: m }); // "{{count}}분 전"

  const h = Math.floor(m / 60);
  const rem = m % 60;
  if (rem === 0) return t('alerts.timeAgo.h', { count: h });

  const half = rem < 30 ? 0 : 30;
  // "{{h}}시간 {{half}}분 전"
  return t('alerts.timeAgo.hHalf', { h, half });
}

export default function UserAlertList({ items }: Props) {
  const { t } = useTranslation();
  const { userAlerts } = useAlerts();
  const data = items ?? userAlerts;

  const [preview, setPreview] = useState<{ uri: string; title?: string } | null>(null);

  return (
    <>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={s.sep} />}
        renderItem={({ item }) => (
          <View style={s.item}>
            {/* 제목: 위험도 아이콘 프리픽스 */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={s.title}>{iconFor(item.severity)} {item.title}</Text>
              {/* ✅ 상대시간(i18n) */}
              <Text style={s.timeDot}>•</Text>
              <Text style={s.time}>{formatTimeAgo(t, item.timestamp)}</Text>
            </View>

            {item.subtitle ? <Text style={s.sub}>{item.subtitle}</Text> : null}

            {item.photoUri ? (
              <Pressable
                onPress={() => setPreview({ uri: item.photoUri!, title: item.title })}
                style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                accessibilityRole="imagebutton"
                accessibilityLabel={t('alerts.tapToZoom', '탭하여 확대')}
                accessibilityHint={t('alerts.tapToZoom', '탭하여 확대')}
              >
                <Image source={{ uri: item.photoUri }} style={s.thumb} />
                <Text style={s.thumbHint}>{t('alerts.tapToZoom', '탭하여 확대')}</Text>
              </Pressable>
            ) : null}
          </View>
        )}
      />

      {/* 전체 화면 미리보기 */}
      <Modal
        visible={!!preview}
        transparent
        animationType="fade"
        onRequestClose={() => setPreview(null)}
        statusBarTranslucent
      >
        <Pressable style={s.backdrop} onPress={() => setPreview(null)}>
          <Pressable onPress={() => {}} style={s.previewCard}>
            <View style={s.previewHeader}>
              <Text style={s.previewTitle} numberOfLines={1}>
                {preview?.title ?? t('common.preview', '미리보기')}
              </Text>
              <Pressable
                onPress={() => setPreview(null)}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel={t('common.close', '닫기')}
              >
                <Text style={s.close}>✕</Text>
              </Pressable>
            </View>
            {preview?.uri ? (
              <Image source={{ uri: preview.uri }} style={s.previewImage} resizeMode="contain" />
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const s = StyleSheet.create({
  item: { paddingVertical: 12, paddingHorizontal: 16 },
  title: { fontWeight: '700', fontSize: 16 },
  sub: { color: '#6b7280', marginTop: 4 },
  time: { color: '#9ca3af', fontSize: 12 },
  timeDot: { color: '#d1d5db', marginHorizontal: 4 },
  thumb: {
    marginTop: 8,
    width: 96,
    height: 96,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  thumbHint: { marginTop: 4, fontSize: 12, color: '#9ca3af' },
  sep: { height: 1, backgroundColor: '#e5e7eb' },
  backdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 16, justifyContent: 'center', alignItems: 'center',
  },
  previewCard: {
    width: '100%', maxWidth: 520,
    borderRadius: 18, backgroundColor: '#0f172a', overflow: 'hidden',
  },
  previewHeader: {
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  previewTitle: { color: '#fff', fontWeight: '700', fontSize: 16 },
  close: { color: '#fff', fontSize: 18, fontWeight: '700' },
  previewImage: { width: '100%', height: 360, backgroundColor: '#0b1220' },
});
