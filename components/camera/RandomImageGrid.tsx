// components/camera/RandomImageGrid.tsx
import React, { memo, useCallback } from 'react';
import { Image, StyleSheet, FlatList, View } from 'react-native';

type Props = {
  sources: number[];
};

const NUM_COLS = 5;
const IMG = 60;
const MARGIN = 3;
const ROW_H = IMG + MARGIN * 2; // 66

function RandomImageGrid({ sources }: Props) {
  const renderItem = useCallback(
    ({ item }: { item: number }) => (
      <Image source={item} style={styles.img} resizeMode="cover" />
    ),
    []
  );

  const keyExtractor = useCallback((v: number, i: number) => `${v}-${i}`, []);

  // numColumns 사용 시: offset = ROW_H * floor(index / NUM_COLS)
  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: ROW_H,
      offset: ROW_H * Math.floor(index / NUM_COLS),
      index,
    }),
    []
  );

  return (
    <FlatList
      data={sources}
      keyExtractor={keyExtractor}
      numColumns={NUM_COLS}
      renderItem={renderItem}
      contentContainerStyle={styles.container}
      ListEmptyComponent={<View style={{ height: ROW_H }} />}
      removeClippedSubviews
      initialNumToRender={NUM_COLS * 3}
      windowSize={5}
      getItemLayout={getItemLayout}
    />
  );
}

export default memo(RandomImageGrid);

const styles = StyleSheet.create({
  container: { padding: 6 }, // gap 대신 margin 사용
  img: {
    width: IMG,
    height: IMG,
    margin: MARGIN,
    borderRadius: 6,
    backgroundColor: '#f1f5f9',
  },
});
