// D:\fashion-jiok\fashion-jiok\src\services\api.js (충돌 해결 및 기능 통합 최종 버전)

// ⚠️ 실제 폰에서 테스트하려면 PC의 내부 IP 주소로 변경해야 합니다.
const BASE_URL = 'http://172.30.1.89:3000'; 

// AI 서버의 엔드포인트
const AI_SUGGESTIONS_URL = `${BASE_URL}/api/chat/suggestions`;
const DATE_COURSE_URL = `${BASE_URL}/api/datecourse/suggestions`;


// =========================================================
// 🌟 [START] MOCK 데이터 정의
// =========================================================
const MOCK_PROFILE = { 
    userId: 'guest_test', 
    name: 'MockUser',
};

const MOCK_HISTORY = [
    { role: 'user', text: '대화를 시작하는 첫 멘트 추천해줄래? 날씨나 안부 물어보 좋아' },
    { role: 'model', text: '네, 대화를 시작하기에 적절한 멘트를 추천하겠습니다.' }
];
// =========================================================
// 🌟 [END] MOCK 데이터 정의
// =========================================================


/**
 * 🤖 AI 대화 제안 API 호출
 * @param {object} chatContext - { otherUserId, chatHistory, userProfile }
 * @returns {Promise<Array<string>>} AI가 생성한 추천 문구 배열
 */
export async function getAiSuggestions(chatContext = {}) {
    const contextToSend = { ...chatContext };

    // 1. userProfile이 없으면 Mock Profile 사용
    if (!contextToSend.userProfile) {
        console.warn("[MOCK] 'userProfile'이 누락되어 Mock 데이터를 사용합니다.");
        contextToSend.userProfile = MOCK_PROFILE;
    }

    // 2. chatHistory가 없거나 비어 있으면 Mock History 사용
    if (!contextToSend.chatHistory || contextToSend.chatHistory.length === 0) {
        console.warn("[MOCK] 'chatHistory'가 누락되어 Mock 데이터를 사용합니다.");
        contextToSend.chatHistory = MOCK_HISTORY;
    }
    
    console.log('[API] Sending AI context to server:', contextToSend);

    try {
        const response = await fetch(AI_SUGGESTIONS_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(contextToSend),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Server responded with status: ${response.status}`);
        }

        const data = await response.json();
        console.log('[API] Received AI suggestions:', data.suggestions);
        return data.suggestions || [];

    } catch (error) {
        console.error('Error calling AI Suggestions API:', error);
        return [`[API 호출 오류] ${error.message}`];
    }
}


/**
 * 🗺️ 데이트 코스 추천 API 호출
 * @param {object} context - { location, matchData }
 * @returns {Promise<Array<object>>} 추천 코스 배열
 */
export async function getDateCourseSuggestions(context) {
    console.log('[API] Sending Date Course context:', context);
    
    try {
        const response = await fetch(DATE_COURSE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(context),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Server responded with status: ${response.status}`);
        }

        const data = await response.json();
        console.log('[API] Received Date Courses:', data.courses);
        return data.courses || [];
        
    } catch (error) {
        console.error('Error calling Date Course API:', error);
        return [];
    }
}


/**
 * 👥 탐색 화면 사용자 목록 로드
 * @returns {Promise<Array<object>>} 탐색할 사용자 목록
 */
export const fetchExploreUsers = async () => {
    try {
        const EXPLORE_URL = `${BASE_URL}/api/users/explore`;
        console.log(`📡 데이터 요청 중: ${EXPLORE_URL}`);
        
        const response = await fetch(EXPLORE_URL);
        
        // ⭐️ 응답 상태 확인
        if (!response.ok) {
            console.error(`❌ 서버 응답 실패: ${response.status}`);
            return [];
        }
        
        const data = await response.json();
        
        // ⭐️ 수정: 백엔드가 배열을 직접 반환하므로 바로 사용
        // 배열인지 확인
        if (Array.isArray(data)) {
            console.log(`✅ 탐색 데이터 수신 완료: ${data.length}명`);
            return data;
        }
        
        // 혹시 { success: true, data: [...] } 형태로 오는 경우도 처리
        if (data.success && Array.isArray(data.data)) {
            console.log(`✅ 탐색 데이터 수신 완료: ${data.data.length}명`);
            return data.data;
        }
        
        console.error('❌ 예상치 못한 응답 형식:', data);
        return [];
        
    } catch (error) {
        console.error('❌ 네트워크 에러:', error);
        return [];
    }
};