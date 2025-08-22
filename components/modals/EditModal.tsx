// components/modals/EditModal.tsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  LayoutChangeEvent,
  Image,
} from 'react-native';

import { useTranslation } from 'react-i18next';
import RandomImageButton from '../camera/RandomImageButton';
import SeverityPicker from '../risk/SeverityPicker';
import { reverseGeocode, coordLabel } from '../dev/amapGeocode';
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
  const { t } = useTranslation();
  const here: LatLng = JANGSU_UNIV;

  const { addUserAlert, updateUserAlertSubtitle } = useAlerts();
  const [pickedImg, setPickedImg] = useState<number | null>(null);
  const [severity, setSeverity] = useState<Severity>('yellow');

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0); // 0~1
  const [btnWidth, setBtnWidth] = useState(0);
  const fakeTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const wasVisible = useRef(false);

  const onBtnLayout = (e: LayoutChangeEvent) => setBtnWidth(e.nativeEvent.layout.width);

  const startFake = () => {
    if (fakeTimer.current) clearInterval(fakeTimer.current);
    fakeTimer.current = setInterval(() => {
      setProgress((p) => (p < 0.95 ? p + (1 - p) * 0.12 : p));
    }, 250);
  };

  const stopFake = useCallback(() => {
    if (fakeTimer.current) clearInterval(fakeTimer.current);
    fakeTimer.current = null;
  }, []);

  /** 폼 초기화(텍스트 포함) */
  const resetForm = useCallback(() => {
    stopFake();
    setPickedImg(null);
    setSeverity('yellow');
    setLoading(false);
    setProgress(0);
    setBtnWidth(0);
    onChange(''); // 부모의 입력값까지 비움
  }, [stopFake, onChange]);

  /** 모달이 열릴 때마다 폼을 초기화 */
  useEffect(() => {
    if (visible && !wasVisible.current) {
      resetForm();
    }
    wasVisible.current = visible;
  }, [visible, resetForm]);

  const handleCancel = () => {
    if (loading) return;
    resetForm();
    onClose();
  };

  const handleUpload = async () => {
    if (loading) return;
    setLoading(true);
    setProgress(0);
    startFake();

    try {
      const photoUri =
        pickedImg != null ? Image.resolveAssetSource(pickedImg).uri : undefined;

      // (1) 업로드 진행
      await onUpload(
        { note: value, location: here, photoUri },
        (p: number) => setProgress(Math.max(0, Math.min(1, p)))
      );

      // (2) 사용자 알림: 우선 좌표로 추가
      const initialSubtitle = coordLabel(here.latitude, here.longitude);
      const id = addUserAlert({
        title: value?.trim() ? value.trim() : t('alerts.userReportDefaultTitle'),
        subtitle: initialSubtitle,
        photoUri,
        severity,
        location: here,
      });

      // (3) 주소 조회 성공 시 해당 항목만 치환
      reverseGeocode(here.longitude, here.latitude)
        .then((re) => {
          const addr = re?.formattedAddress;
          if (addr && addr !== initialSubtitle) {
            updateUserAlertSubtitle(id, addr);
          }
        })
        .catch(() => { /* 실패 시 좌표 유지 */ });

      // (4) 종료/리셋
      stopFake();
      setProgress(1);
      setTimeout(() => {
        resetForm(); // 텍스트/이미지/위험도 모두 초기화
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
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleCancel}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>{t('edit.uploadTitle')}</Text>

          {/* 현 위치 */}
          <View style={styles.rowInfo}>
            <Text style={styles.label}>{t('edit.currentLocation')}</Text>
            <Text style={styles.value}>
              {here.latitude.toFixed(6)}, {here.longitude.toFixed(6)}
            </Text>
          </View>

          {/* 설명 */}
          <TextInput
            style={styles.input}
            placeholder={t('edit.inputPlaceholder')}
            value={value}
            onChangeText={onChange}
            editable={!loading}
            multiline
          />

          {/* 사진 영역 */}
          <View style={styles.imageBox}>
            {pickedImg ? (
              <>
                <Image source={pickedImg} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                <RandomImageButton
                  style={{ position: 'absolute', right: 10, bottom: 10 }}
                  size={20}
                  onPick={setPickedImg}
                  disabled={loading}
                />
              </>
            ) : (
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
            <Text style={{ fontSize: 13, color: '#6b7280', marginBottom: 6 }}>
              {t('edit.severity')}
            </Text>
            <SeverityPicker value={severity} onChange={setSeverity} disabled={loading} />
          </View>

          {/* 액션 */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.btn, styles.btnGhost]}
              onPress={handleCancel}
              disabled={loading}
            >
              <Text style={styles.btnGhostText}>{t('common.cancel')}</Text>
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
                {loading ? `${Math.round(progress * 100)}%` : t('common.upload')}
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
