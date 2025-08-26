// components/modals/EditModal.tsx
// ──────────────────────────────────────────────────────────────────────────────
// 목적
//  - 사용자가 신고(알림)를 작성할 수 있는 모달 UI.
//  - 사진 업로드, 위험도 선택, 위치 정보, 설명 입력 등을 포함.
// 특징
//  - Modal + Card UI (중앙 팝업)
//  - 업로드 진행률 표시 (가짜 Progress + 실제 Progress 혼합)
//  - 사진 필수, 글자수 제한(15자), 위험도 선택 기능
//  - 신고 완료 시 store(addUserAlert)에 등록 후 지도에 표시
// ──────────────────────────────────────────────────────────────────────────────

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
import RandomImageButton from '../camera/RandomImageButton';   // 랜덤 이미지 선택 버튼
import SeverityPicker from '../risk/SeverityPicker';           // 위험도 선택 UI
import { reverseGeocode, coordLabel } from '../dev/amapGeocode'; // 좌표 → 주소 변환
import { useAlerts } from '../notification/alertsStore';
import type { Severity } from '../notification/alertsStore';

// ──────────────────────────────────────────────
// 타입 정의
// ──────────────────────────────────────────────
type LatLng = { latitude: number; longitude: number };

type UploadParams = {
  note: string;        // 신고 내용
  location: LatLng;    // 위치 좌표
  photoUri?: string;   // 선택된 사진 경로
};

type Props = {
  visible: boolean;    // 모달 표시 여부
  value: string;       // 입력 중인 신고 텍스트
  onChange: (v: string) => void; // 부모(App)에서 관리하는 상태 업데이트
  onClose: () => void;           // 닫기
  onUpload: (params: UploadParams, onProgress: (p: number) => void) => Promise<void>;
};

// 장수대 좌표 (기본 신고 위치)
const JANGSU_UNIV: LatLng = {
  latitude: 32.20008528203389,
  longitude: 119.51415636213258,
};

const MAX_LEN = 15; // 신고 텍스트 최대 길이

export default function EditModal({
  visible, value, onChange, onClose, onUpload,
}: Props) {
  const { t } = useTranslation();
  const here: LatLng = JANGSU_UNIV; // 현재 위치 (임시 하드코딩)

  // 전역 알림 Store 사용
  const { addUserAlert, updateUserAlertSubtitle } = useAlerts();

  // 로컬 상태
  const [pickedImg, setPickedImg] = useState<number | null>(null); // 선택된 랜덤 이미지
  const [photoError, setPhotoError] = useState(false);             // 사진 필수 체크
  const [severity, setSeverity] = useState<Severity>('yellow');    // 위험도
  const [loading, setLoading] = useState(false);                   // 업로드 중 여부
  const [progress, setProgress] = useState(0);                     // 진행률(0~1)
  const [btnWidth, setBtnWidth] = useState(0);                     // 버튼 너비(프로그레스바용)

  const fakeTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const wasVisible = useRef(false); // 모달이 열림/닫힘 감지용

  // 버튼 레이아웃 측정 → 진행률 바 크기 계산
  const onBtnLayout = (e: LayoutChangeEvent) => setBtnWidth(e.nativeEvent.layout.width);

  // 가짜 진행률 시작 (실제 업로드 진행 전에도 UI는 "로딩 중"처럼 보이게)
  const startFake = () => {
    if (fakeTimer.current) clearInterval(fakeTimer.current);
    fakeTimer.current = setInterval(() => {
      setProgress((p) => (p < 0.95 ? p + (1 - p) * 0.12 : p));
    }, 250);
  };

  // 가짜 진행률 정지
  const stopFake = useCallback(() => {
    if (fakeTimer.current) clearInterval(fakeTimer.current);
    fakeTimer.current = null;
  }, []);

  /** 폼 전체 초기화 */
  const resetForm = useCallback(() => {
    stopFake();
    setPickedImg(null);
    setPhotoError(false);
    setSeverity('yellow');
    setLoading(false);
    setProgress(0);
    setBtnWidth(0);
    onChange(''); // 부모 상태도 비움
  }, [stopFake, onChange]);

  /** 모달 열릴 때마다 초기화 */
  useEffect(() => {
    if (visible && !wasVisible.current) {
      resetForm();
    }
    wasVisible.current = visible;
  }, [visible, resetForm]);

  /** 취소 버튼 */
  const handleCancel = () => {
    if (loading) return; // 업로드 중엔 취소 불가
    resetForm();
    onClose();
  };

  /** 업로드 실행 */
  const handleUpload = async () => {
    if (loading) return;

    // ✅ 사진이 없으면 업로드 불가
    if (!pickedImg) {
      setPhotoError(true);
      return;
    }
    setPhotoError(false);

    setLoading(true);
    setProgress(0);
    startFake();

    try {
      // 사진 리소스 → uri 변환
      const photoUri =
        pickedImg != null ? Image.resolveAssetSource(pickedImg).uri : undefined;

      // (1) 부모로부터 받은 onUpload 실행 (API 호출 등)
      await onUpload(
        { note: value, location: here, photoUri },
        (p: number) => setProgress(Math.max(0, Math.min(1, p))) // 진행률 업데이트
      );

      // (2) Store에 알림 추가 (좌표만 우선 subtitle로 표시)
      const initialSubtitle = coordLabel(here.latitude, here.longitude);
      const id = addUserAlert({
        title: value?.trim() ? value.trim() : t('alerts.userReportDefaultTitle'),
        subtitle: initialSubtitle,
        photoUri,
        severity,
        location: here,
      });

      // (3) 역지오코딩 → 주소 얻어 subtitle 교체
      reverseGeocode(here.longitude, here.latitude)
        .then((re) => {
          const addr = re?.formattedAddress;
          if (addr && addr !== initialSubtitle) {
            updateUserAlertSubtitle(id, addr);
          }
        })
        .catch(() => { /* 실패 시 좌표 유지 */ });

      // (4) 업로드 종료 → 초기화 후 모달 닫기
      stopFake();
      setProgress(1);
      setTimeout(() => {
        resetForm();
        onClose();
      }, 300);
    } catch (e) {
      // 실패 시 초기화
      stopFake();
      setLoading(false);
      setProgress(0);
      console.warn('upload failed:', e);
    }
  };

  // 텍스트 길이 카운트
  const charCount = value?.length ?? 0;
  // 업로드 버튼 비활성화 조건
  const uploadDisabled = loading || !pickedImg;

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

          {/* 설명 입력 */}
          <Text style={styles.inputLabel}>{t('edit.inputLabel')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('edit.inputPlaceholderShort')}
            value={value}
            onChangeText={onChange}
            editable={!loading}
            multiline
            maxLength={MAX_LEN} // ✅ 글자수 제한
          />
          <Text style={styles.charCounter}>
            {t('edit.charCounter', { count: charCount, max: MAX_LEN })}
          </Text>

          {/* 사진 영역 */}
          <View style={[styles.imageBox, photoError && styles.imageBoxError]}>
            {pickedImg ? (
              <>
                <Image source={pickedImg} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                {/* 재촬영/재선택 */}
                <RandomImageButton
                  style={{ position: 'absolute', right: 10, bottom: 10 }}
                  size={20}
                  onPick={(id) => { setPickedImg(id); setPhotoError(false); }}
                  disabled={loading}
                />
              </>
            ) : (
              <>
                {/* 첫 선택 버튼 */}
                <RandomImageButton
                  style={styles.centerBtn}
                  size={36}
                  onPick={(id) => { setPickedImg(id); setPhotoError(false); }}
                  disabled={loading}
                />
                <Text style={styles.photoHint}>{t('edit.needPhoto')}</Text>
              </>
            )}
          </View>
          {photoError && (
            <Text style={styles.photoErrorText}>{t('edit.needPhoto')}</Text>
          )}

          {/* 위험도 선택 */}
          <View style={{ marginBottom: 8 }}>
            <Text style={{ fontSize: 13, color: '#6b7280', marginBottom: 6 }}>
              {t('edit.severity')}
            </Text>
            <SeverityPicker value={severity} onChange={setSeverity} disabled={loading} />
          </View>

          {/* 액션 버튼 */}
          <View style={styles.actions}>
            {/* 취소 */}
            <TouchableOpacity
              style={[styles.btn, styles.btnGhost]}
              onPress={handleCancel}
              disabled={loading}
            >
              <Text style={styles.btnGhostText}>{t('common.cancel')}</Text>
            </TouchableOpacity>

            <View style={{ width: 12 }} />

            {/* 업로드 */}
            <TouchableOpacity
              activeOpacity={0.9}
              onLayout={onBtnLayout}
              style={[
                styles.btn,
                styles.btnPrimary,
                uploadDisabled && styles.btnPrimaryDisabled,
              ]}
              onPress={handleUpload}
              disabled={uploadDisabled}
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

// ──────────────────────────────────────────────
// 스타일 정의
// ──────────────────────────────────────────────
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

  inputLabel: { marginTop: 10, fontSize: 13, color: '#6b7280' },
  input: {
    minHeight: 56, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10,
    padding: 12, fontSize: 15, textAlignVertical: 'top', marginTop: 6, marginBottom: 6,
  },
  charCounter: { alignSelf: 'flex-end', color: '#9ca3af', fontSize: 12, marginBottom: 10 },

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
    marginBottom: 6,
  },
  imageBoxError: { borderColor: '#ef4444' },
  photoHint: { marginTop: 8, color: 'rgba(0,0,0,0.45)' },
  photoErrorText: { color: '#ef4444', marginBottom: 8, fontSize: 12 },

  centerBtn: {
    position: 'absolute', left: 0, right: 0, top: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center',
  },

  actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 },
  btn: { flexGrow: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center', overflow: 'hidden' },
  btnGhost: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb' },
  btnPrimary: { backgroundColor: '#007AFF', position: 'relative' },
  btnPrimaryDisabled: { opacity: 0.5 },
  btnPrimaryText: { color: '#fff', fontWeight: '700' },
  btnGhostText: { color: '#111827', fontWeight: '700' },
  progressFill: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.35)' },
});
