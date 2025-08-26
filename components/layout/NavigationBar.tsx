// components/layout/NavigationBar.tsx
// ──────────────────────────────────────────────────────────────────────────────
// 목적
//  - 앱 상단에 고정되는 네비게이션 바.
//  - 좌측: 앱 제목(혹은 부모에서 전달받은 title)
//  - 우측: 언어 전환 버튼, 신고(✏️), 알림(🔔) 버튼
// 특징
//  - SafeAreaInsets 사용 → iOS 노치 영역 고려
//  - 다국어 지원(i18n) 적용
//  - 접근성(Accessibility) 라벨/힌트 적용
// ──────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // 노치/상단 여백 대응
import { useTranslation } from 'react-i18next'; // 다국어 처리
import LanguageSwitcher from '../controls/LanguageSwitcher'; // 언어 전환 버튼

// 부모에서 전달받을 수 있는 props
type Props = {
  /** 상단바 제목 (문자열만 허용해 Text 오류 예방) */
  title?: string;
  onPressPencil?: () => void; // 연필 버튼(신고 모달 열기)
  onPressBell?: () => void;   // 종 버튼(알림 사이드바 열기)
};

export default function NavigationBar({
  title,
  onPressPencil,
  onPressBell,
}: Props) {
  const insets = useSafeAreaInsets(); // 기기별 안전 영역 (노치 등) padding
  const { t } = useTranslation();     // 다국어 번역 훅
  const H = 56;                       // 상단바 기본 높이

  // props.title이 없으면 다국어 리소스(app.title) 사용
  const computedTitle = title ?? t('app.title');

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, height: H + insets.top },
      ]}
    >
      {/* 좌측: 제목 */}
      <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
        {computedTitle}
      </Text>

      {/* 우측: 언어 전환 + 연필 + 종 버튼 */}
      <View style={styles.right}>
        {/* 🔤 언어 전환 버튼 (EN → KO → JA → ZH 순환) */}
        <LanguageSwitcher style={{ marginRight: 8 }} />

        {/* ✏️ 신고 버튼 */}
        <TouchableOpacity
          onPress={onPressPencil}
          hitSlop={HIT} // 터치 영역 확장
          accessibilityRole="button"
          accessibilityLabel={t('nav.pencilLabel', 'Open report modal')}
          accessibilityHint={t('nav.pencilHint', 'Create a new user report')}
          testID="nav.pencil" // 테스트 자동화 식별자
        >
          <Text style={styles.icon}>✏️</Text>
        </TouchableOpacity>

        {/* 버튼 사이 여백 */}
        <View style={{ width: 16 }} />

        {/* 🔔 알림 버튼 */}
        <TouchableOpacity
          onPress={onPressBell}
          hitSlop={HIT}
          accessibilityRole="button"
          accessibilityLabel={t('nav.bellLabel', 'Open notifications')}
          accessibilityHint={t('nav.bellHint', 'Show alerts sidebar')}
          testID="nav.bell"
        >
          <Text style={styles.icon}>🔔</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// 터치 영역 확장을 위한 상수 (버튼 크기보다 여유 공간)
const HIT = { top: 8, bottom: 8, left: 8, right: 8 };

// 스타일 정의
const styles = StyleSheet.create({
  container: {
    position: 'absolute', // 상단에 고정
    top: 0, left: 0, right: 0,
    zIndex: 2000,          // 다른 요소보다 위
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    flexDirection: 'row',  // 제목 왼쪽, 버튼 오른쪽
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,          // 안드로이드 그림자
    shadowColor: '#000',   // iOS 그림자
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    maxWidth: '60%', // 너무 길면 잘림
  },
  right: { flexDirection: 'row', alignItems: 'center' },
  icon: { fontSize: 22, lineHeight: 22 }, // 아이콘(Text) 스타일
});
