// metro.config.js

const { getDefaultConfig } = require('@expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

// 백엔드 폴더 이름입니다.
const backendFolder = 'Backend'; 

module.exports = {
  ...defaultConfig,
  // ⭐️ [핵심 수정 부분] Watchman의 추적 대상에서 백엔드 폴더 제외
  resolver: {
    ...defaultConfig.resolver,
    blockList: [
      ...defaultConfig.resolver.blockList || [],
      // 백엔드 폴더 내의 모든 파일을 추적하지 않도록 설정
      new RegExp(`.*${backendFolder}\/.*$`), 
    ],
  },
  // ⭐️ [추가 수정] 심볼릭 링크(symlinks) 문제 방지
  watchFolders: [
    ...defaultConfig.watchFolders || [],
    __dirname,
  ],
};