// 사이드바
import React, { useState } from 'react';
import { View } from 'react-native';
import AlertTabs from './AlertTabs';
import UserAlertList from '../UserAlertList';
import SystemAlertList from '../SystemAlertList';

export default function AlertsPanel() {
  const [tab, setTab] = useState<0 | 1>(0); // 0: 사용자 신고, 1: 앱 제공

  // ⬇️ setTab 래핑해서 넘기면 타입 오류 사라짐
  const handleTabChange = (idx: number) => setTab((idx === 0 ? 0 : 1));

  return (
    <View style={{ flex: 1 }}>
      <AlertTabs
        tabs={['사용자 신고', '앱 제공']}
        active={tab}
        onChange={handleTabChange}
      />
      <View style={{ flex: 1 }}>
        {tab === 0 ? <UserAlertList /> : <SystemAlertList />}
      </View>
    </View>
  );
}
