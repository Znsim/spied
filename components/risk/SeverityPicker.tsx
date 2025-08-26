// components/risk/SeverityPicker.tsx
// ────────────────────────────────────────────────
// 목적
//   - 사용자가 "위험도(Severity)"를 선택할 수 있는 작은 버튼 UI
//   - 빨강(red), 주황(orange), 노랑(yellow) 중 하나를 고를 수 있음
//
// 사용 위치
//   - 신고 작성(EditModal)에서 위험도 선택할 때 사용
//   - props.value 로 현재 선택된 값 전달
//   - props.onChange 로 선택 변경 시 알림
//   - props.disabled 가 true면 선택 불가(투명도 적용)
// ────────────────────────────────────────────────

import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import type { Severity } from '../notification/alertsStore';

type Props = {
  /** 현재 선택된 위험도 */
  value: Severity;
  /** 선택이 바뀔 때 부모 컴포넌트로 전달 */
  onChange: (s: Severity) => void;
  /** true면 비활성화(선택 불가) */
  disabled?: boolean;
};

/** 각 위험도에 대응하는 색상 */
const COLORS = {
  red:    '#ef4444',  // 빨강
  orange: '#f59e0b',  // 주황
  yellow: '#facc15',  // 노랑
};

export default function SeverityPicker({ value, onChange, disabled }: Props) {
  return (
    <View style={s.wrap}>
      {/* red, orange, yellow 순서대로 원형 버튼 렌더링 */}
      {(['red','orange','yellow'] as Severity[]).map(c => (
        <TouchableOpacity
          key={c}
          // 비활성화(disabled)가 아니면 해당 색상 선택
          onPress={() => !disabled && onChange(c)}
          style={[
            s.dot,
            { backgroundColor: COLORS[c], opacity: disabled ? 0.5 : 1 },
            value === c && s.dotActive,   // 현재 선택된 값은 강조 스타일
          ]}
          activeOpacity={0.8}
          disabled={disabled}
        />
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  // 전체 래퍼: 가로 정렬, 점 간격 유지
  wrap: { flexDirection: 'row', gap: 10, alignItems: 'center', marginBottom: 8 },
  // 위험도 점: 원형 + 살짝 그림자
  dot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#fff',
    elevation: 2,
  },
  // 선택된 점: 진한 테두리 + 살짝 확대
  dotActive: { borderColor: '#111827', transform: [{ scale: 1.05 }] },
});
