// components/modals/IntroSeverityGuide.tsx
import React, { useEffect, useState } from 'react';
import { Modal, View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

const STORE_KEY = 'introGuideHidden.v1';

type Props = {
  /** 체크박스(다신 안 보기) 사용 여부 — 기본: 꺼짐 */
  rememberOption?: boolean;
  /** 외부에서 직접 모달 표시 제어(제어형). 지정되면 rememberOption 로직은 건너뜁니다. */
  controlledVisible?: boolean;
  /** 제어형일 때 닫기 콜백 */
  onRequestClose?: () => void;
};

export default function IntroSeverityGuide({
  rememberOption = false,
  controlledVisible,
  onRequestClose,
}: Props) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const isControlled = typeof controlledVisible === 'boolean';

  useEffect(() => {
    if (isControlled) {
      setVisible(!!controlledVisible);
      return;
    }
    (async () => {
      if (rememberOption) {
        const v = await AsyncStorage.getItem(STORE_KEY).catch(() => null);
        setVisible(v !== '1');
      } else {
        setVisible(true);
      }
    })();
  }, [controlledVisible, rememberOption, isControlled]);

  const close = async () => {
    try {
      if (!isControlled && rememberOption && dontShowAgain) {
        await AsyncStorage.setItem(STORE_KEY, '1');
      }
    } finally {
      setVisible(false);
      onRequestClose?.();
    }
  };

  if (!visible) return null;

  // i18n 배열 안전 처리
  const asArray = (v: unknown): string[] => (Array.isArray(v) ? v as string[] : []);
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
          <Text
            style={s.title}
            accessibilityRole="header"
            testID="introGuide.title"
          >
            {t('guide.title')}
          </Text>

          <Text style={s.sub} testID="introGuide.sub">
            {t('guide.sub')}
          </Text>

          <ScrollView
            style={{ maxHeight: 360 }}
            contentContainerStyle={{ paddingBottom: 8 }}
            testID="introGuide.list"
          >
            {rows.map((r, idx) => (
              <RowDot key={idx} color={r.color} title={r.title} desc={r.desc} />
            ))}
          </ScrollView>

          {/* rememberOption=true일 때만 체크박스 노출 */}
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
