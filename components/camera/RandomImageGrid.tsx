import React from 'react';
import {  Image, StyleSheet, FlatList } from 'react-native';

type Props = {
  sources: number[];
};

export default function RandomImageGrid({ sources }: Props) {
  return (
    <FlatList
      data={sources}
      keyExtractor={(v, i) => `${i}`}
      numColumns={5}
      renderItem={({ item }) => (
        <Image source={item} style={styles.img} />
      )}
      contentContainerStyle={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: { gap: 6, padding: 6 },
  img: {
    width: 60, height: 60, margin: 3,
    borderRadius: 6,
  },
});
