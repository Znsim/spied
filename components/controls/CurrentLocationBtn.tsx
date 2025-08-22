// components/controls/CurrentLocationBtn.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

interface CurrentLocationBtnProps {
  onLocationSet: (latitude: number, longitude: number) => void;
}

export default function CurrentLocationBtn({ onLocationSet }: CurrentLocationBtnProps) {
  const { t } = useTranslation();

  // 장수대학교 좌표 (고정값)
  const JANGSU_UNIVERSITY_LAT = 32.20008528203389;
  const JANGSU_UNIVERSITY_LNG = 119.51415636213258;

  const handleGoToMyLocation = () => {
    onLocationSet(JANGSU_UNIVERSITY_LAT, JANGSU_UNIVERSITY_LNG);
  };

  return (
    <TouchableOpacity style={styles.locationButton} onPress={handleGoToMyLocation}>
      {/* 여기서 하드코딩 대신 다국어 키 사용 */}
      <Text style={styles.buttonText}>{t('map.myLocation')}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  locationButton: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1000,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
