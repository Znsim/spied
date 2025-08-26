// components/modals/IntroSeverityGuide.tsx
// ──────────────────────────────────────────────────────────────
// 목적
//  - "위험도 선택 가이드" 모달을 띄워서 각 색상(빨강/주황/노랑)의 의미를 안내.
// 특징
//  - AsyncStorage를 활용해 "다시 보지 않기" 기능 지원.
//  - 제어형(외부에서 visible을 직접 제어) / 비제어형(컴포넌트 내부 상태로 표시 여부 관리) 둘 다 가능.
//  - i18n 번역 키를 사용해 다국어 지원.
// ──────────────────────────────────────────────────────────────

import React, { useEffect, useState } from 'react';
import { Modal, View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

const STORE_KEY = 'introGuideHidden.v1';

/** ✅ 외부에서 호출해 저장된 '다시 보지 않기' 플래그를 초기화 */
export async function resetIntroGuideHidden() {
  await AsyncStorage.removeItem(STORE_KEY);
}

type Props = {
  /** 체크박스(다신 안 보기) 사용 여부 — 기본: 꺼짐 */
  rememberOption?: boolean;
  /** 외부에서 직접 모달 표시 제어(제어형). 지정되면 rememberOption 로직은 건너뜁니다. */
  controlledVisible?: boolean;
  /** 제어형일 때 닫기 콜백 */
  onRequestClose?: () => void;

  /** ✅ 개발/테스트용: 마운트 시 저장된 '다시 보지 않기' 플래그를 지움(기본 false) */
  devResetOnMount?: boolean;
};

export default function IntroSeverityGuide({
  rememberOption = false,
  controlledVisible,
  onRequestClose,
  devResetOnMount = false,   // 기본은 off
}: Props) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);       // 모달 표시 여부
  const [dontShowAgain, setDontShowAgain] = useState(false); // "다시 보지 않기" 체크 상태

  const isControlled = typeof controlledVisible === 'boolean'; // 제어형 여부 판단

  useEffect(() => {
    (async () => {
      // 개발용 옵션: 항상 초기화
      if (devResetOnMount) {
        try { await AsyncStorage.removeItem(STORE_KEY); } catch {}
      }

      if (isControlled) {
        // 외부에서 visible을 직접 제어
        setVisible(!!controlledVisible);
        return;
      }

      if (rememberOption) {
        // 저장된 값 확인 → '1'이면 숨김
        try {
          const v = await AsyncStorage.getItem(STORE_KEY);
          setVisible(v !== '1');
        } catch {
          setVisible(true);
        }
      } else {
        // 옵션 꺼져있으면 항상 표시
        setVisible(true);
      }
    })();
  }, [controlledVisible, rememberOption, isControlled, devResetOnMount]);

  /** 닫기 처리 */
  const close = async () => {
    try {
      if (!isControlled && rememberOption && dontShowAgain) {
        // 체크되어 있으면 AsyncStorage에 기록
        await AsyncStorage.setItem(STORE_KEY, '1');
      }
    } finally {
      setVisible(false);
      onRequestClose?.();
    }
  };

  if (!visible) return null; // 표시 안 함

  // i18n 배열 안전 처리 (desc가 여러 줄일 수 있으므로 배열로 받음)
  const asArray = (v: unknown): string[] => (Array.isArray(v) ? (v as string[]) : []);
  const rows = [
    {
      color: '#ef4444',
      title: t('guide.rows.red.title'),
      desc: asArray(t('guide.rows.red.desc', { returnObjects: true })),
    },
    {
      color: '#f97316',
      title: t('guide.rows.orange.title'),
      desc: asArray(t('guide.rows.orange.desc', { returnObjects: true })),
    },
    {
      color: '#fbbf24',
      title: t('guide.rows.yellow.title'),
      desc: asArray(t('guide.rows.yellow.desc', { returnObjects: true })),
    },
  ];

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={close}
      presentationStyle="overFullScreen"
    >
      <View style={s.backdrop} testID="introGuide.backdrop">
        <View style={s.sheet} testID="introGuide.sheet" accessible accessibilityLabel={t('guide.title')}>
          {/* 타이틀 */}
          <Text style={s.title} accessibilityRole="header" testID="introGuide.title">
            {t('guide.title')}
          </Text>

          <Text style={s.sub} testID="introGuide.sub">
            {t('guide.sub')}
          </Text>

          {/* 위험도 리스트 */}
          <ScrollView
            style={{ maxHeight: 360 }}
            contentContainerStyle={{ paddingBottom: 8 }}
            testID="introGuide.list"
          >
            {rows.map((r, idx) => (
              <RowDot key={idx} color={r.color} title={r.title} desc={r.desc} />
            ))}
          </ScrollView>

          {/* "다시 보지 않기" 체크박스 */}
          {rememberOption && (
            <Pressable
              style={s.checkboxRow}
              onPress={() => setDontShowAgain(v => !v)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: dontShowAgain }}
              accessibilityLabel={t('guide.dontShowAgain')}
              testID="introGuide.checkbox"
            >
              <View style={[s.checkbox, dontShowAgain && s.checkboxOn]}>
                {dontShowAgain ? <Text style={s.checkboxTick}>✓</Text> : null}
              </View>
              <Text style={s.checkboxLabel}>{t('guide.dontShowAgain')}</Text>
            </Pressable>
          )}

          {/* 닫기 버튼 */}
          <Pressable
            style={s.primaryBtn}
            onPress={close}
            accessibilityRole="button"
            accessibilityLabel={t('common.close')}
            testID="introGuide.close"
          >
            <Text style={s.primaryBtnText}>{t('common.close')}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

// 개별 행 (색상 점 + 타이틀 + 설명 목록)
function RowDot({ color, title, desc }: { color: string; title: string; desc: string[] }) {
  return (
    <View style={s.row}>
      <View style={[s.dot, { backgroundColor: color }]} />
      <View style={{ flex: 1 }}>
        <Text style={s.rowTitle}>{title}</Text>
        {desc.map((d, i) => (
          <View key={i} style={s.bulletRow}>
            <Text style={s.bullet}>•</Text>
            <Text style={s.rowDesc}>{d}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ──────────────────────────────────────────────
// 스타일 정의
// ──────────────────────────────────────────────
const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', padding: 18 },
  sheet: { width: '100%', maxWidth: 480, backgroundColor: '#fff', borderRadius: 16, padding: 18, elevation: 10 },
  title: { fontSize: 18, fontWeight: '800', marginBottom: 8 },
  sub: { color: '#6b7280', lineHeight: 20, marginBottom: 12 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  dot: { width: 18, height: 18, borderRadius: 9, marginTop: 2 },
  rowTitle: { fontWeight: '700', marginBottom: 4 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  bullet: { color: '#9ca3af', marginTop: 2 },
  rowDesc: { color: '#4b5563', flexShrink: 1, lineHeight: 18 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  checkbox: { width: 18, height: 18, borderRadius: 4, borderWidth: 1.5, borderColor: '#cbd5e1', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  checkboxOn: { backgroundColor: '#f87171', borderColor: '#f87171' },
  checkboxTick: { color: '#fff', fontSize: 12, fontWeight: '800' },
  checkboxLabel: { color: '#374151' },
  primaryBtn: { marginTop: 14, backgroundColor: '#b91c1c', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
