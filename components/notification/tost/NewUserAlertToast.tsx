// components/notification/NewUserAlertToast.tsx
// ────────────────────────────────────────────────
// 목적
//   - 사용자가 신고(알림)를 등록하면, 화면 상단에 작은 "토스트"가 뜸
//   - 몇 초 후 자동으로 사라지며, 닫기/펼치기 버튼도 제공
//   - 위험도(빨강/주황/노랑)에 따라 앞에 아이콘(🔴🟠🟡) 표시
// ────────────────────────────────────────────────

import React, { useEffect, useRef, useState } from 'react';
import TopUserToast from './TopUserToast';   // 실제 토스트 UI를 그리는 하위 컴포넌트
import { useAlerts } from '../alertsStore'; // 알림 전역 상태 (Context)
import type { Severity } from '../alertsStore';

// 위험도(severity)에 맞는 아이콘 반환 함수
function iconFor(sev?: Severity) {
  switch (sev) {
    case 'red': return '🔴';
    case 'orange': return '🟠';
    case 'yellow': return '🟡';
    default: return '🟡';
  }
}

export default function NewUserAlertToast() {
  // 알림 store에서 "마지막으로 추가된 사용자 알림"과 소비 함수 가져오기
  const { lastUserAlert, consumeLastUserAlert } = useAlerts();

  // 토스트 표시 여부
  const [visible, setVisible] = useState(false);
  // 펼침 여부 (간략 → 확장)
  const [expanded, setExpanded] = useState(false);

  // 자동 닫힘 타이머
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // (1) lastUserAlert이 새로 생기면 → 토스트 표시
  useEffect(() => {
    if (lastUserAlert) {
      setExpanded(false);   // 처음은 축소 모드
      setVisible(true);     // 보이게 전환

      // 이전 타이머 정리
      if (hideTimer.current) clearTimeout(hideTimer.current);

      // 5.5초 뒤 자동 닫힘 처리
      hideTimer.current = setTimeout(() => {
        setVisible(false);       // 숨김
        consumeLastUserAlert();  // 전역 상태에서도 "소비"
      }, 5500);
    }

    // 언마운트 시 타이머 해제
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [lastUserAlert, consumeLastUserAlert]);

  // (2) 수동 토글 버튼
  const onToggle = () => setExpanded((v) => !v);

  // (3) 수동 닫기 버튼
  const onClose = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setVisible(false);
    consumeLastUserAlert();
  };

  // 알림이 없으면 아무것도 렌더하지 않음
  if (!lastUserAlert) return null;

  // (4) 제목 앞에 위험도 아이콘 붙이기 (예: "🔴 침수 위험")
  const prefixedTitle = `${iconFor(lastUserAlert.severity)} ${lastUserAlert.title}`;

  // (5) 실제 렌더링은 TopUserToast에 위 상태 전달
  return (
    <TopUserToast
      visible={visible}               // 보임 여부
      title={prefixedTitle}           // 제목(아이콘 포함)
      photoUri={lastUserAlert.photoUri} // 첨부 이미지
      expanded={expanded}             // 확장 여부
      onToggle={onToggle}             // 펼치기 토글
      onClose={onClose}               // 닫기 버튼
    />
  );
}
