// 내위치
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface CurrentLocationBtnProps {
  onLocationSet: (latitude: number, longitude: number) => void;
}

export default function CurrentLocationBtn({ onLocationSet }: CurrentLocationBtnProps) {
  // 장수대학교 좌표 (고정값)
  const JANGSU_UNIVERSITY_LAT = 32.20008528203389;
  const JANGSU_UNIVERSITY_LNG = 119.51415636213258;

  const handleGoToMyLocation = () => {
    onLocationSet(JANGSU_UNIVERSITY_LAT, JANGSU_UNIVERSITY_LNG);
  };

  return (
    <TouchableOpacity style={styles.locationButton} onPress={handleGoToMyLocation}>
      <Text style={styles.buttonText}>내 위치</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  locationButton: {
    position: 'absolute',
    bottom: 24,         // ⬅️ 하단
    left: 20,           // ⬅️ 왼쪽
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 3,       // Android 그림자
    shadowColor: '#000',// iOS 그림자
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
