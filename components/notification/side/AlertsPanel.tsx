// components/notification/side/AlertsPanel.tsx
// ────────────────────────────────────────────────
// 목적
//  - 알림 사이드바(슬라이드 패널) 안에서
//    "사용자 신고"와 "앱 제공(시스템 알림)"을
//    탭으로 전환하여 보여주는 컴포넌트
//
// 특징
//  - 탭 전환 상태를 useState로 관리 (0: 사용자, 1: 시스템)
//  - AlertTabs: 상단 탭 UI
//  - UserAlertList, SystemAlertList: 각 탭의 리스트 컴포넌트
//  - 리스트 스크롤은 내부 FlatList 컴포넌트가 담당
// ────────────────────────────────────────────────

import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import AlertTabs from './AlertTabs';          // 상단 탭 UI (2개 탭)
import UserAlertList from '../UserAlertList'; // 사용자 신고 리스트
import SystemAlertList from '../SystemAlertList'; // 앱 제공 알림 리스트

export default function AlertsPanel() {
  const { t } = useTranslation();

  // 현재 선택된 탭 상태 (0 = 사용자 신고, 1 = 앱 제공)
  const [tab, setTab] = useState<0 | 1>(0);

  // 탭 클릭 시 상태 갱신
  const handleTabChange = useCallback((idx: number) => {
    setTab(idx === 0 ? 0 : 1);
  }, []);

  // 다국어 탭 라벨 정의
  const tabs = [
    t('alerts.tabs.userReports', '사용자 신고'),
    t('alerts.tabs.systemReports', '앱 제공'),
  ];

  return (
    <View style={styles.wrap}>
      {/* 상단 탭 */}
      <AlertTabs tabs={tabs} active={tab} onChange={handleTabChange} />

      {/* ▼ 리스트 영역 (스크롤은 내부 UserAlertList/SystemAlertList에서 담당) */}
      <View style={styles.listArea}>
        {tab === 0 ? (
          <UserAlertList />
        ) : (
          <SystemAlertList />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },    // 전체 영역 차지
  listArea: { flex: 1 } // 리스트도 가득 채움
});
