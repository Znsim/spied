// components/RandomImg/index.ts
// ────────────────────────────────────────────────
// 목적
//  - 앱 내에서 랜덤으로 보여줄 더미 이미지 모음
//  - "RandomImageButton" 같은 컴포넌트에서 불러와 사용
//  - 실제 촬영한 사진 대신 시뮬레이션/테스트 용도
// ────────────────────────────────────────────────

// ✅ 배열에 require()를 넣으면 React Native가 번들링할 때 이미지 리소스를 포함시킴
//    → ./components/RandomImg 폴더에 jpg/jpeg 파일이 실제로 존재해야 함
export const RANDOM_IMAGES = [
  require('./1.jpg'),   // 예시 이미지 1
  require('./2.jpeg'),  // 예시 이미지 2
  require('./3.jpeg'),
  require('./4.jpeg'),
  require('./5.jpeg'),
  // ⚠️ 6번이 빠져 있음 (필요하면 추가 가능)
  require('./7.jpeg'),
  require('./8.jpeg'),
  require('./9.jpeg'),
  require('./10.jpeg'),
];
