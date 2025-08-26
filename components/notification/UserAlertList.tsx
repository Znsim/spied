// components/notification/UserAlertList.tsx
// ────────────────────────────────────────────────
// 목적
//  - 사용자 신고(userAlerts) 리스트를 사이드바에서 보여줌
//  - 사진 미리보기(썸네일 → 탭하면 전체화면 Modal) 지원
//  - 리스트 아이템 클릭 시 지도 이동(focusMap)
// ────────────────────────────────────────────────

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
import { useAlerts, asText, formatRelative } from './alertsStore';
import type { AlertItem, Severity } from './alertsStore';

// ✅ 지도 카메라 이동 유틸
import { focusMap } from '../map/MapFocus';

type Props = { items?: AlertItem[] };

// 위험도별 아이콘(이모지)
function iconFor(sev?: Severity) {
  switch (sev) {
    case 'red': return '🔴';
    case 'orange': return '🟠';
    case 'yellow': return '🟡';
    default: return '🟡';
  }
}

export default function UserAlertList({ items }: Props) {
  const { t, i18n } = useTranslation();
  const { userAlerts } = useAlerts();
  const data = items ?? userAlerts;   // props로 받은 데이터 없으면 전역 userAlerts 사용

  // ✅ 사진 전체화면 미리보기 상태
  const [preview, setPreview] = useState<{ uri: string; title?: string } | null>(null);

  return (
    <>
      {/* 사용자 신고 리스트 */}
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={s.sep} />}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => {
          const titleText = asText(t, item.title);              // 다국어 변환
          const subtitleText = item.subtitle ? asText(t, item.subtitle) : '';

          // 리스트 아이템 클릭 시 지도 이동
          const onPress = () => {
            const loc = item.location;
            if (loc?.latitude != null && loc?.longitude != null) {
              focusMap(loc.latitude, loc.longitude, 17);
            }
          };

          return (
            <Pressable style={s.item} onPress={onPress}>
              {/* 제목 + 시간 */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={s.title}>
                  {iconFor(item.severity)} {titleText}
                </Text>
                <Text style={s.timeDot}>•</Text>
                <Text style={s.time}>{formatRelative(item.timestamp, i18n.language)}</Text>
              </View>

              {/* 부제목(주소 등) */}
              {subtitleText ? <Text style={s.sub}>{subtitleText}</Text> : null}

              {/* 썸네일 사진 (탭하면 미리보기 열림) */}
              {item.photoUri ? (
                <Pressable
                  onPress={() => setPreview({ uri: item.photoUri!, title: titleText })}
                  style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                  accessibilityRole="imagebutton"
                  accessibilityLabel={t('alerts.tapToZoom', '탭하여 확대')}
                  accessibilityHint={t('alerts.tapToZoom', '탭하여 확대')}
                >
                  <Image source={{ uri: item.photoUri }} style={s.thumb} />
                  <Text style={s.thumbHint}>{t('alerts.tapToZoom', '탭하여 확대')}</Text>
                </Pressable>
              ) : null}

              {/* 하단 힌트 */}
              <Text style={s.hint}>{t('alerts.tapToZoom', 'Tap to zoom')}</Text>
            </Pressable>
          );
        }}
      />

      {/* ✅ 전체 화면 사진 미리보기 Modal */}
      <Modal
        visible={!!preview}
        transparent
        animationType="fade"
        onRequestClose={() => setPreview(null)}
        statusBarTranslucent
      >
        <Pressable style={s.backdrop} onPress={() => setPreview(null)}>
          <Pressable onPress={() => {}} style={s.previewCard}>
            {/* 미리보기 헤더 (제목 + 닫기 버튼) */}
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
            {/* 본문 이미지 */}
            {preview?.uri ? (
              <Image source={{ uri: preview.uri }} style={s.previewImage} resizeMode="contain" />
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

/* ── 스타일 ── */
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
  hint: { marginTop: 6, color: '#cbd5e1', fontSize: 12 },

  // 미리보기 모달
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
