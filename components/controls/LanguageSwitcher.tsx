// components/controls/LanguageSwitcher.tsx
// ──────────────────────────────────────────────────────────────────────────────
// 목적
//  - 버튼을 눌러 앱의 언어를 순환(영어 → 한국어 → 일본어 → 중국어) 변경하는 UI.
// 특징
//  - 현재 언어(i18n.language)를 감지해서 "EN, KO, JA, ZH" 표시.
//  - 버튼을 누를 때마다 다음 언어로 전환.
//  - 실제 언어 저장(AsyncStorage)은 i18n/index.tsx에서 처리.
// ──────────────────────────────────────────────────────────────────────────────

import React, { useCallback } from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useTranslation } from 'react-i18next';
import { setAppLanguage } from '../i18n';

// 지원하는 언어 타입 정의
type Lng = 'en' | 'ko' | 'ja' | 'zh';

// 순환 순서 (영어 → 한국어 → 일본어 → 중국어)
const ORDER: Lng[] = ['en', 'ko', 'ja', 'zh'];

// i18n.language 값이 "ko-KR" 같은 형태로 들어와도 정규화해서 단순화
function normalize(l?: string): Lng {
  const s = (l || 'en').toLowerCase();
  if (s.startsWith('ko')) return 'ko';
  if (s.startsWith('ja')) return 'ja';
  if (s.startsWith('zh')) return 'zh';
  return 'en';
}

type Props = { style?: StyleProp<ViewStyle> };

export default function LanguageSwitcher({ style }: Props) {
  const { i18n, t } = useTranslation();
  const cur: Lng = normalize(i18n.language); // 현재 언어 (정규화)

  // 버튼 클릭 시 다음 언어로 순환
  const onCycle = useCallback(async () => {
    const idx = ORDER.indexOf(cur);             // 현재 언어의 위치
    const next = ORDER[(idx + 1) % ORDER.length]; // 다음 언어 (순환 구조)
    await setAppLanguage(next);                 // 언어 저장 및 변경 (AsyncStorage)
  }, [cur]);

  return (
    <Pressable
      onPress={onCycle}                          // 버튼 누르면 언어 변경
      style={[styles.chip, styles.shadow, style]} // 기본 스타일 + 외부 스타일 병합
      android_ripple={{ color: '#e5e7eb' }}       // 안드로이드 터치 효과
      hitSlop={6}                                 // 터치 영역 확장
      accessibilityRole="button"                  // 접근성: 버튼 역할
      accessibilityLabel={t('nav.changeLanguage', 'Switch language')} 
      // 다국어 접근성 라벨
      testID="lang-switcher"                      // 테스트 자동화 용도
    >
      {/* 현재 언어 표시 (대문자: EN, KO, JA, ZH) */}
      <Text style={styles.txt}>{cur.toUpperCase()}</Text>
    </Pressable>
  );
}

// 스타일 정의
const styles = StyleSheet.create({
  chip: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  txt: {
    color: '#111',
    fontWeight: '700',
    letterSpacing: 0.25,
  },
  shadow: {
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3, // 안드로이드 그림자
  },
});
