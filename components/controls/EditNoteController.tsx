// components/controls/EditNoteController.tsx
import React, { useState } from 'react';
import { View } from 'react-native';
import NavigationBar from '../layout/NavigationBar';
import EditModal from '../modals/EditModal';
import NotificationSidebar from '../notification/side/NotificationSidebar';
import AlertsPanel from '../notification/side/AlertsPanel';
import NewUserAlertToast from '../notification/tost/NewUserAlertToast';

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export default function EditNoteController() {
  const [visible, setVisible] = useState(false);
  const [note, setNote] = useState('');
  const [notiOpen, setNotiOpen] = useState(false);

  return (
    <View style={{ flex: 1 }}>
      <NavigationBar
        title="FloodGuard"
        onPressPencil={() => setVisible(true)}
        onPressBell={() => setNotiOpen(true)}
      />

      <NotificationSidebar visible={notiOpen} onClose={() => setNotiOpen(false)} title="알림">
        <AlertsPanel />
      </NotificationSidebar>

      <EditModal
        visible={visible}
        value={note}
        onChange={setNote}
        onClose={() => setVisible(false)}
        onUpload={async ({ note: _note, photoUri: _photoUri }, onProgress) => {
          // 네트워크 예시용 페이크 진행률만 처리
          for (let i = 1; i <= 10; i++) {
            await sleep(80);
            onProgress(i / 10);
          }
          // 실제 addUserAlert는 EditModal 내부에서 수행됨
          setVisible(false);
        }}
      />

      <NewUserAlertToast />
    </View>
  );
}
