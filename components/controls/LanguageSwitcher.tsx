import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { setAppLanguage } from '../i18n';

const langs = [
  { code: 'en' as const, label: 'EN' },
  { code: 'zh' as const, label: '中' },
  { code: 'ja' as const, label: '日' },
  { code: 'ko' as const, label: '한' },
];

export default function LanguageSwitcher({ style }: { style?: ViewStyle }) {
  const { i18n } = useTranslation();
  const cur = langs.findIndex(l => l.code === (i18n.language as any)) ?? 0;
  const next = langs[(cur + 1) % langs.length];

  const onPress = () => setAppLanguage(next.code);

  const curLabel = (langs.find(l => l.code === i18n.language)?.label) || 'EN';

  return (
    <Pressable style={[s.btn, style]} hitSlop={8} onPress={onPress}>
      <Text style={s.txt}>{curLabel}</Text>
    </Pressable>
  );
}
const s = StyleSheet.create({
  btn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: '#d1d5db', backgroundColor: '#fff' },
  txt: { fontWeight: '800', color: '#374151' },
});
