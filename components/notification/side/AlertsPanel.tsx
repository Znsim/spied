// components/notification/side/AlertsPanel.tsx
import React, { useState, useCallback } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import AlertTabs from './AlertTabs';
import UserAlertList from '../UserAlertList';
import SystemAlertList from '../SystemAlertList';

export default function AlertsPanel() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<0 | 1>(0); // 0: 사용자 신고, 1: 앱 제공

  const handleTabChange = useCallback((idx: number) => {
    setTab(idx === 0 ? 0 : 1);
  }, []);

  const tabs = [
    t('alerts.tabs.userReports', '사용자 신고'),
    t('alerts.tabs.systemReports', '앱 제공'),
  ];

  return (
    <View style={{ flex: 1 }}>
      <AlertTabs
        tabs={tabs}
        active={tab}
        onChange={handleTabChange}
        // 선택 사항: 접근성/테스트용 식별자
      />
      <View style={{ flex: 1 }}>
        {tab === 0 ? <UserAlertList /> : <SystemAlertList />}
      </View>
    </View>
  );
}
