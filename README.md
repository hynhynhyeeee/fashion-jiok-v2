# Prototype-of-Fashion-Jiok-Dating-App
 AI 패션·라이프스타일 기반 매칭 소개팅 앱

#파일구조

```
fashion-jiok/
├── .gitignore
├── android/
├── assets/
│   ├── adaptive-icon.png
│   ├── favicon.png
│   ├── icon.png
│   └── splash-icon.png
├── ios/
├── src/
│   ├── screens/
│   │   ├── Auth/
│   │   │   ├── LoginScreen.js
│   │   │   └── PhoneVerifyScreen.js
│   │   ├── Main/
│   │   │   ├── ExploreScreen.js
│   │   │   ├── MapScreen.js
│   │   │   ├── MatchesScreen.js
│   │   │   └── MyProfileScreen.js
│   │   └── Chat/
│   │       ├── ChatListScreen.js
│   │       └── ChatRoomScreen.js
│   ├── navigation/
│   │   ├── AppNavigator.js
│   │   ├── AuthNavigator.js
│   │   └── MainTabNavigator.js
│   ├── context/
│   │   └── AuthContext.js
│   ├── services/
│   │   └── firebase.js
│   └── constants/
│       └── styles.js
├── App.js
├── app.json
├── babel.config.js
├── google-services.json   
├── index.js
├── package.json
└── tailwind.config.js
```

**[실행방법]**

🚀백엔드와 프론트엔드는 각각 다른 폴더에서, 동시에 실행되어야 합니다.

**1️⃣ 터미널 1: 백엔드 실행 (서버 켜기)**
```
# 1. 터미널을 열고 백엔드 폴더로 이동
cd backend

# 2. 서버 실행
npm run dev
(성공 시: 🚀 서버가 실행되었습니다... 메시지가 뜸. 이 터미널은 켜두세요.)
```


**2️⃣ 터미널 2: 프론트엔드 실행 (앱 켜기 : expo 실행)**
**새로운 터미널 창(Tab)**을 열어서 진행하세요.


```
# 1. 프로젝트 최상위 폴더(FJ_new)로 이동
cd ..

# 2. 앱 실행
npx expo start -c

```
