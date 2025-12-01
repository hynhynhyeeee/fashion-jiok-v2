// D:\fashion-jiok\fashion-jiok\src\services\api.js

// ⚠️ 'localhost'는 시뮬레이터에서만 작동합니다.
// ⚠️ 실제 폰에서 테스트하려면 PC의 내부 IP 주소로 변경해야 합니다.
const BASE_URL = 'http://192.168.0.11:3000';

export const fetchExploreUsers = async () => {
  try {
    console.log(`📡 데이터 요청 중: ${BASE_URL}/api/users/explore`);
    
    const response = await fetch(`${BASE_URL}/api/users/explore`);
    const json = await response.json();

    if (json.success) {
      console.log(`✅ 데이터 수신 완료: ${json.data.length}명`);
      return json.data;
    } else {
      console.error('❌ 서버 응답 실패:', json.message);
      return [];
    }
  } catch (error) {
    console.error('❌ 네트워크 에러:', error);
    return [];
  }
};