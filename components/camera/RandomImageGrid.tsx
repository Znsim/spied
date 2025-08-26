// components/camera/RandomImageGrid.tsx
// ──────────────────────────────────────────────────────────────────────────────
// 목적
//  - 여러 개의 이미지(썸네일)를 "격자(Grid)" 형태로 보여주는 컴포넌트
//  - FlatList를 이용해 성능 최적화 (스크롤 시 렌더링 최소화)
// 특징
//  - 5열(Grid) 레이아웃
//  - 고정된 이미지 크기(60px)와 여백(3px)
//  - 랜덤 이미지 버튼(RandomImageButton)과 함께 사용하면 갤러리처럼 보여줄 수 있음
// ──────────────────────────────────────────────────────────────────────────────

import React, { memo, useCallback } from 'react';
import { Image, StyleSheet, FlatList, View } from 'react-native';

// 부모 컴포넌트에서 전달받는 props
type Props = {
  sources: number[]; // 이미지 소스 배열 (예: require(...) 결과 배열)
};

// 레이아웃 관련 상수
const NUM_COLS = 5;           // 한 줄에 보여줄 이미지 개수 (5개)
const IMG = 60;               // 이미지 크기 (가로/세로 60px)
const MARGIN = 3;             // 이미지 주변 여백
const ROW_H = IMG + MARGIN * 2; // 한 행(row)의 높이 = 66px

function RandomImageGrid({ sources }: Props) {
  // 각 아이템(이미지)을 렌더링하는 함수
  const renderItem = useCallback(
    ({ item }: { item: number }) => (
      <Image
        source={item}        // 전달받은 이미지 소스
        style={styles.img}   // 스타일 적용
        resizeMode="cover"   // 이미지가 꽉 차도록 비율 유지 + 잘림 허용
      />
    ),
    []
  );

  // 각 아이템 고유 key 생성
  const keyExtractor = useCallback((v: number, i: number) => `${v}-${i}`, []);

  // FlatList 성능 최적화를 위한 아이템 위치 계산
  // numColumns를 사용하면, index를 열 개수로 나누어 row를 계산함
  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: ROW_H,                                // 각 행 높이
      offset: ROW_H * Math.floor(index / NUM_COLS), // 스크롤 offset 계산
      index,
    }),
    []
  );

  return (
    <FlatList
      data={sources}                      // 표시할 이미지 데이터 배열
      keyExtractor={keyExtractor}         // key 지정
      numColumns={NUM_COLS}               // 열 개수 (5열)
      renderItem={renderItem}             // 아이템 렌더링 함수
      contentContainerStyle={styles.container} // 전체 컨테이너 스타일
      ListEmptyComponent={<View style={{ height: ROW_H }} />} 
      // 데이터가 비어있을 경우 빈 박스(66px 높이) 표시

      removeClippedSubviews               // 스크롤 시 보이지 않는 영역 제거 (성능 ↑)
      initialNumToRender={NUM_COLS * 3}   // 처음에 3줄(15개) 렌더링
      windowSize={5}                      // 화면 밖의 몇 개 row까지 미리 렌더링할지
      getItemLayout={getItemLayout}       // 아이템 위치 계산 (성능 ↑)
    />
  );
}

// memo로 감싸서 props(sources)가 변하지 않으면 리렌더링 방지
export default memo(RandomImageGrid);

// 스타일 정의
const styles = StyleSheet.create({
  container: { padding: 6 }, // gap 대신 padding 사용
  img: {
    width: IMG,
    height: IMG,
    margin: MARGIN,
    borderRadius: 6,             // 이미지 모서리 둥글게
    backgroundColor: '#f1f5f9',  // 로딩 중일 때 회색 배경
  },
});
