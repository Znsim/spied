// i18n/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as RNLocalize from 'react-native-localize';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './locales/en.json';
import ko from './locales/ko.json';
import ja from './locales/ja.json';
import zh from './locales/zh.json';

export const LANG_STORAGE_KEY = 'app.lang';

const resources = {
  en: { translation: en },
  ko: { translation: ko },
  ja: { translation: ja },
  zh: { translation: zh },
};

type LanguageCode = keyof typeof resources; // 'en' | 'ko' | 'ja' | 'zh'

function normalize(tag?: string): LanguageCode {
  const t = (tag || '').toLowerCase();
  if (t.startsWith('ko')) return 'ko';
  if (t.startsWith('ja')) return 'ja';
  if (t.startsWith('zh')) return 'zh';
  return 'en';
}

// 기기 언어 → 최적 후보
const best = RNLocalize.findBestLanguageTag(Object.keys(resources));
const detected = normalize(best?.languageTag);

// 초기화: 초기 언어를 감지값으로 설정(깜빡임 방지)
i18n.use(initReactI18next).init({
  // compatibilityJSON: 'v4', // ← 있어도/없어도 OK
  resources,
  lng: detected,
  fallbackLng: 'en',
  supportedLngs: ['en', 'ko', 'ja', 'zh'],
  nonExplicitSupportedLngs: true, // 'zh-CN' 등도 'zh'로 처리
  interpolation: { escapeValue: false },
});

// 저장된 언어가 있으면 그걸로 교체
AsyncStorage.getItem(LANG_STORAGE_KEY)
  .then((stored) => {
    const code = normalize(stored || detected);
    if (i18n.language !== code) i18n.changeLanguage(code);
  })
  .catch(() => {
    if (i18n.language !== detected) i18n.changeLanguage(detected);
  });

export async function setAppLanguage(code: LanguageCode) {
  await AsyncStorage.setItem(LANG_STORAGE_KEY, code);
  await i18n.changeLanguage(code);
}

export default i18n;
