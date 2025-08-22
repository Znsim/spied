// components/notification/NewUserAlertToast.tsx
// 토스트 (새 사용자 신고가 생성될 때 상단에 잠깐 뜨는 UI)

import React, { useEffect, useRef, useState } from 'react';
import TopUserToast from './TopUserToast';
import { useAlerts } from '../alertsStore';
import type { Severity } from '../alertsStore';

function iconFor(sev?: Severity) {
  switch (sev) {
    case 'red': return '🔴';
    case 'orange': return '🟠';
    case 'yellow': return '🟡';
    default: return '🟡';
  }
}

export default function NewUserAlertToast() {
  const { lastUserAlert, consumeLastUserAlert } = useAlerts();
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 새 알림 감지 → 토스트 표시
  useEffect(() => {
    if (lastUserAlert) {
      setExpanded(false);
      setVisible(true);
      // 3.5초 뒤 자동 닫힘
      if (hideTimer.current) clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => {
        setVisible(false);
        consumeLastUserAlert();
      }, 5500);
    }
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [lastUserAlert, consumeLastUserAlert]);

  const onToggle = () => setExpanded((v) => !v);
  const onClose = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setVisible(false);
    consumeLastUserAlert();
  };

  if (!lastUserAlert) return null;

  // ✅ 제목 앞에 위험도 아이콘 프리픽스 추가
  const prefixedTitle = `${iconFor(lastUserAlert.severity)} ${lastUserAlert.title}`;

  return (
    <TopUserToast
      visible={visible}
      title={prefixedTitle}
      photoUri={lastUserAlert.photoUri}
      expanded={expanded}
      onToggle={onToggle}
      onClose={onClose}
    />
  );
}
