// components/controls/EditNoteController.tsx
// ──────────────────────────────────────────────────────────────────────────────
// 목적
//  - 상단바(NavigationBar), 알림(NotificationSidebar), 신고 작성(EditModal),
//    신규 사용자 알림 토스트(NewUserAlertToast) 등을 한 곳에서 관리하는 컨트롤러.
// 특징
//  - "연필 아이콘" 클릭 → 신고 작성 모달(EditModal) 열림
//  - "종 아이콘" 클릭 → 알림 사이드바(NotificationSidebar) 열림
//  - EditModal에서 글/사진 업로드 → 가짜 업로드 진행률을 보여주고 닫힘
// ──────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { View } from 'react-native';

// 상단 네비게이션 바 (연필, 종 아이콘 포함)
import NavigationBar from '../layout/NavigationBar';

// 신고 작성 모달
import EditModal from '../modals/EditModal';

// 알림 사이드바 + 패널
import NotificationSidebar from '../notification/side/NotificationSidebar';
import AlertsPanel from '../notification/side/AlertsPanel';

// 신규 알림 토스트 (화면 상단 중앙에 뜨는 알림)
import NewUserAlertToast from '../notification/tost/NewUserAlertToast';

// 다국어(i18n)
import { useTranslation } from 'react-i18next';

// sleep 함수 (업로드 진행률 시뮬레이션 용도)
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export default function EditNoteController() {
  // 상태값들
  const [visible, setVisible] = useState(false);   // 신고 작성 모달 표시 여부
  const [note, setNote] = useState('');            // 작성 중인 텍스트
  const [notiOpen, setNotiOpen] = useState(false); // 알림 사이드바 표시 여부
  const { t } = useTranslation();

  return (
    <View style={{ flex: 1 }}>
      {/* ──────────────────────────────
          상단 네비게이션 바
          - 연필 버튼: setVisible(true) → 신고 작성 모달 열기
          - 종 버튼: setNotiOpen(true) → 알림 사이드바 열기
         ────────────────────────────── */}
      <NavigationBar
        onPressPencil={() => setVisible(true)}
        onPressBell={() => setNotiOpen(true)}
      />

      {/* ──────────────────────────────
          알림 사이드바
          - AlertsPanel을 내용으로 포함
         ────────────────────────────── */}
      <NotificationSidebar
        visible={notiOpen}
        onClose={() => setNotiOpen(false)} // 닫기 버튼/백그라운드 터치 시 닫힘
        title={t('alerts.title')}          // 다국어 적용된 타이틀
      >
        <AlertsPanel />
      </NotificationSidebar>

      {/* ──────────────────────────────
          신고 작성 모달
          - 사진 + 메모 작성 가능
          - 업로드 버튼 클릭 시 가짜 진행률 시뮬레이션 실행
         ────────────────────────────── */}
      <EditModal
        visible={visible}
        value={note}                // 작성 중인 메모 값
        onChange={setNote}          // 텍스트 변경 시 업데이트
        onClose={() => setVisible(false)} // 닫기 버튼 누르면 false

        // 업로드 처리 (가짜 진행률 0% → 100%)
        onUpload={async ({ note: _note, photoUri: _photoUri }, onProgress) => {
          for (let i = 1; i <= 10; i++) {
            await sleep(80);         // 0.08초씩 대기
            onProgress(i / 10);      // 진행률 업데이트
          }
          // 실제 데이터 추가는 EditModal 내부에서 처리됨
          setVisible(false);         // 업로드 완료 후 모달 닫기
        }}
      />

      {/* ──────────────────────────────
          신규 사용자 알림 토스트
          - 화면 상단 중앙에 "새로운 신고/알림" 표시
         ────────────────────────────── */}
      <NewUserAlertToast />
    </View>
  );
}
