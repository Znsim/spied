// components/i18n/index.tsx
// ──────────────────────────────────────────────────────────────────────────────
// 목적
//  - 앱 전체 다국어(i18n) 초기화 및 설정
//  - 기본 언어: 영어
//  - 지원 언어: 영어, 한국어, 일본어, 중국어
//  - AsyncStorage를 이용해 사용자가 선택한 언어를 저장/불러오기
// ──────────────────────────────────────────────────────────────────────────────

import i18n from 'i18next';                  // i18n 핵심 라이브러리
import { initReactI18next } from 'react-i18next'; // React 전용 바인딩
import AsyncStorage from '@react-native-async-storage/async-storage';

// 언어별 번역 리소스 JSON
import en from './locales/en.json';
import ko from './locales/ko.json';
import ja from './locales/ja.json';
import zh from './locales/zh.json';

// 번역 리소스 매핑
const resources = {
  en: { translation: en },
  ko: { translation: ko },
  ja: { translation: ja },
  zh: { translation: zh },
};

// ──────────────────────────────────────────────
// i18n 초기화
// ──────────────────────────────────────────────
i18n
  .use(initReactI18next) // React에 연결
  .init({
    resources,           // 번역 리소스
    lng: 'en',           // ✅ 최초 앱 시작은 영어
    fallbackLng: 'en',   // 키가 없을 때 대체 언어 (영어)
    supportedLngs: ['en', 'ko', 'ja', 'zh'], // 지원하는 언어 목록
    interpolation: { escapeValue: false },   // React는 XSS 자동 방지 → escape 불필요
  });

// ──────────────────────────────────────────────
// 앱 시작 시 저장된 언어 불러오기
// - AsyncStorage에 저장된 언어(app_lng)가 있으면 그걸 사용
// - 없으면 그대로 'en'
// ──────────────────────────────────────────────
AsyncStorage.getItem('app_lng')
  .then((saved) => {
    if (saved && saved !== i18n.language) {
      i18n.changeLanguage(saved); // 저장된 언어로 변경
    }
  })
  .catch(() => {});

// i18n 인스턴스 내보내기
export default i18n;

// ──────────────────────────────────────────────
// 언어 변경 헬퍼 함수
// - LanguageSwitcher 같은 컴포넌트에서 사용
// - AsyncStorage에 저장하는 부분은 여기서 추가해도 됨
// ──────────────────────────────────────────────
export async function setAppLanguage(lng: 'en'|'ko'|'ja'|'zh') {
  await i18n.changeLanguage(lng);
  await AsyncStorage.setItem('app_lng', lng); // ✅ 선택한 언어를 저장
}
