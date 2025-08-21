// components/modals/EditModal.tsx
import React, { useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  LayoutChangeEvent,
  Image, // resolveAssetSource 및 표시용
} from 'react-native';

import RandomImageButton from '../camera/RandomImageButton';
// ⚠️ 현재 실제 파일명이 ServerityPicker.tsx 이므로, 임시로 오타 경로에 맞춰 import
import SeverityPicker from '../risk/SeverityPicker';

import { useAlerts } from '../notification/alertsStore';
import type { Severity } from '../notification/alertsStore';

type LatLng = { latitude: number; longitude: number };

type UploadParams = {
  note: string;
  location: LatLng;
  photoUri?: string;
};

type Props = {
  visible: boolean;
  value: string;
  onChange: (v: string) => void;
  onClose: () => void;
  onUpload: (params: UploadParams, onProgress: (p: number) => void) => Promise<void>;
};

const JANGSU_UNIV: LatLng = {
  latitude: 32.20008528203389,
  longitude: 119.51415636213258,
};

export default function EditModal({
  visible, value, onChange, onClose, onUpload,
}: Props) {
  const here: LatLng = JANGSU_UNIV;

  const { addUserAlert } = useAlerts(); // ✅ 컴포넌트 내부에서 호출
  const [pickedImg, setPickedImg] = useState<number | null>(null);
  const [severity, setSeverity] = useState<Severity>('yellow');

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0); // 0~1
  const [btnWidth, setBtnWidth] = useState(0);
  const fakeTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const onBtnLayout = (e: LayoutChangeEvent) => setBtnWidth(e.nativeEvent.layout.width);

  const startFake = () => {
    if (fakeTimer.current) clearInterval(fakeTimer.current);
    fakeTimer.current = setInterval(() => {
      setProgress((p) => (p < 0.95 ? p + (1 - p) * 0.12 : p));
    }, 250);
  };
  const stopFake = () => {
    if (fakeTimer.current) clearInterval(fakeTimer.current);
    fakeTimer.current = null;
  };

  const handleUpload = async () => {
    if (loading) return;
    setLoading(true);
    setProgress(0);
    startFake();

    try {
      // 로컬 require 리소스를 업로드할 경우, 파일 uri로 변환
      const photoUri =
        pickedImg != null ? Image.resolveAssetSource(pickedImg).uri : undefined;

      // (1) 진행률 페이크 콜백
      await onUpload(
        { note: value, location: here, photoUri },
        (p: number) => setProgress(Math.max(0, Math.min(1, p)))
      );

      // (2) 사용자 알림 저장
      addUserAlert({
        title: value?.trim() ? value.trim() : '사용자 신고',
        subtitle: `${here.latitude.toFixed(5)}, ${here.longitude.toFixed(5)}`,
        photoUri,
        severity,
        location: here,
      });

      stopFake();
      setProgress(1);
      setTimeout(() => {
        setLoading(false);
        setProgress(0);
        onClose();
      }, 300);
    } catch (e) {
      stopFake();
      setLoading(false);
      setProgress(0);
      console.warn('upload failed:', e);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>업로드</Text>

          {/* 현 위치 */}
          <View style={styles.rowInfo}>
            <Text style={styles.label}>현 위치 </Text>
            <Text style={styles.value}>
              {here.latitude.toFixed(6)}, {here.longitude.toFixed(6)}
            </Text>
          </View>

          {/* 설명 */}
          <TextInput
            style={styles.input}
            placeholder="설명을 입력하세요"
            value={value}
            onChangeText={onChange}
            editable={!loading}
            multiline
          />

          {/* 사진 영역: 버튼을 누를 때마다 한 장씩 표시/교체 */}
          <View style={styles.imageBox}>
            {pickedImg ? (
              <>
                <Image source={pickedImg} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                {/* 우하단 다시 뽑기 */}
                <RandomImageButton
                  style={{ position: 'absolute', right: 10, bottom: 10 }}
                  size={20}
                  onPick={setPickedImg}
                  disabled={loading}
                />
              </>
            ) : (
              // 처음 상태: 중앙 버튼
              <RandomImageButton
                style={{
                  position: 'absolute', left: 0, right: 0, top: 0, bottom: 0,
                  alignItems: 'center', justifyContent: 'center',
                }}
                size={36}
                onPick={setPickedImg}
                disabled={loading}
              />
            )}
          </View>

          {/* 위험도 선택 */}
          <View style={{ marginBottom: 8 }}>
            <Text style={{ fontSize: 13, color: '#6b7280', marginBottom: 6 }}>위험도</Text>
            <SeverityPicker value={severity} onChange={setSeverity} disabled={loading} />
          </View>

          {/* 액션 */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.btn, styles.btnGhost]}
              onPress={() => { if (!loading) onClose(); }}
              disabled={loading}
            >
              <Text style={styles.btnGhostText}>취소</Text>
            </TouchableOpacity>

            <View style={{ width: 12 }} />

            <TouchableOpacity
              activeOpacity={0.9}
              onLayout={onBtnLayout}
              style={[styles.btn, styles.btnPrimary]}
              onPress={handleUpload}
              disabled={loading}
            >
              {loading && (
                <View style={[styles.progressFill, { width: btnWidth * progress }]} />
              )}
              <Text style={styles.btnPrimaryText}>
                {loading ? `${Math.round(progress * 100)}%` : '업로드'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center', justifyContent: 'center', padding: 20,
  },
  card: {
    width: '100%', maxWidth: 420, backgroundColor: '#fff',
    borderRadius: 14, padding: 18, elevation: 8,
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  title: { fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 12 },
  rowInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  label: { fontSize: 13, color: '#6b7280' },
  value: { fontSize: 13, color: '#111827' },
  input: {
    minHeight: 56, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10,
    padding: 12, fontSize: 15, textAlignVertical: 'top', marginTop: 8, marginBottom: 12,
  },
  imageBox: {
    width: '100%',
    height: 200,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginBottom: 14,
  },
  actions: { flexDirection: 'row', justifyContent: 'flex-end' },
  btn: { flexGrow: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center', overflow: 'hidden' },
  btnGhost: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb' },
  btnPrimary: { backgroundColor: '#007AFF', position: 'relative' },
  btnPrimaryText: { color: '#fff', fontWeight: '700' },
  btnGhostText: { color: '#111827', fontWeight: '700' },
  progressFill: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.35)' },
});
