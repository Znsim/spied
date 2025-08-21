//토스트

import React, { useEffect, useRef, useState } from 'react';
import TopUserToast from './TopUserToast';
import { useAlerts } from '../alertsStore';

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

      // 자동 닫힘(확장 전) 5초
      if (hideTimer.current) clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => {
        setVisible(false);
        // 애니메이션 종료 후 컨슘
        setTimeout(consumeLastUserAlert, 250);
      }, 5000);
    }
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [lastUserAlert, consumeLastUserAlert]);

  const onToggle = () => {
    setExpanded((e) => !e);
    // 펼친 상태에선 자동 닫힘 취소
    if (!expanded && hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  };

  const onClose = () => {
    setVisible(false);
    setTimeout(consumeLastUserAlert, 250);
  };

  if (!lastUserAlert) return null;

  return (
    <TopUserToast
      visible={visible}
      title={lastUserAlert.title}
      photoUri={lastUserAlert.photoUri}
      expanded={expanded}
      onToggle={onToggle}
      onClose={onClose}
    />
  );
}
