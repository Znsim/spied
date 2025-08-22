// components/modals/GuideInfoButton.tsx
import React, { useState } from 'react';
import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import IntroSeverityGuide from './IntroSeverityGuide';

type Props = { style?: ViewStyle };

export default function GuideInfoButton({ style }: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={[styles.infoBtn, style]}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={t('guide.infoButtonLabel', 'Open severity guide')}
        accessibilityHint={t('guide.infoButtonHint', 'Shows how to choose risk level')}
        testID="guide.infoButton"
      >
        <Text style={styles.excl}>!</Text>
      </Pressable>

      <IntroSeverityGuide
        rememberOption={false}          // 시연 전까지는 false 유지
        controlledVisible={open}
        onRequestClose={() => setOpen(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  infoBtn: {
    width: 26, height: 26, borderRadius: 13,
    borderWidth: 2, borderColor: '#9CA3AF',
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#fff',
  },
  excl: { color: '#9CA3AF', fontWeight: '900', fontSize: 16, lineHeight: 18 },
});
