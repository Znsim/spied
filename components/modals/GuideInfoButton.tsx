// components/modals/GuideInfoButton.tsx
// ──────────────────────────────────────────────────────────────
// 목적
//  - 지도/화면 상단에 작은 "!" 버튼을 두고
//    누르면 IntroSeverityGuide 모달을 띄움.
// 특징
//  - 상태(useState)로 모달 표시 여부 제어
//  - 접근성(스크린리더) 라벨/힌트 제공
// ──────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import IntroSeverityGuide from './IntroSeverityGuide';

type Props = { style?: ViewStyle };

export default function GuideInfoButton({ style }: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false); // 모달 열림 여부 상태

  return (
    <>
      {/* ❗️ 버튼 (눌렀을 때 open = true) */}
      <Pressable
        onPress={() => setOpen(true)}
        style={[styles.infoBtn, style]}   // 스타일 병합 (외부에서 추가 가능)
        hitSlop={8}                       // 버튼 터치 범위 확장 (8px 여유)
        accessibilityRole="button"
        accessibilityLabel={t('guide.infoButtonLabel', 'Open severity guide')}
        accessibilityHint={t('guide.infoButtonHint', 'Shows how to choose risk level')}
        testID="guide.infoButton"
      >
        {/* ❗️ 아이콘 (텍스트로 표시) */}
        <Text style={styles.excl}>!</Text>
      </Pressable>

      {/* 위험도 가이드 모달 */}
      <IntroSeverityGuide
        rememberOption={false}          // "다시 보지 않기" 기능 비활성화 (시연용)
        controlledVisible={open}        // 외부에서 제어하는 표시 상태
        onRequestClose={() => setOpen(false)} // 닫기 이벤트 처리
      />
    </>
  );
}

// ──────────────────────────────────────────────
// 스타일 정의
// ──────────────────────────────────────────────
const styles = StyleSheet.create({
  infoBtn: {
    width: 26, height: 26, borderRadius: 13,   // 동그란 버튼
    borderWidth: 2, borderColor: '#9CA3AF',    // 테두리 회색
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#fff',                   // 흰 배경
  },
  excl: { 
    color: '#9CA3AF', 
    fontWeight: '900', 
    fontSize: 16, 
    lineHeight: 18 
  },
});
