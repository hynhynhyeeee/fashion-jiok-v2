import React, { useState, useEffect } from 'react';

// ⭐️ MOCK 데이터 (필요하다면 실제 사용하시는 Mock 데이터로 대체하세요)
// ChatScreen에서 AI 제안 테스트를 위해 필요합니다.
const MOCK_PROFILE = {
    name: '사용자',
    age: 28,
    style: '미니멀리즘',
    hobbies: ['독서', '카페 투어']
};

const MOCK_HISTORY = [
    { role: 'user', text: '안녕하세요! 스타일이 정말 좋으시네요.' },
    { role: 'model', text: '감사합니다! 혹시 좋아하는 취미가 있으세요?' }
];

// ----------------------------------------------------
// ⭐️ 1. 서버 주소 및 API 엔드포인트 정의 (중앙 관리)
// ----------------------------------------------------

// ChatListScreen에서 사용하던 하드코딩된 IP 주소를 중앙 관리합니다.
export const SERVER_URL = 'http://172.30.1.89:3000'; 

// 🚨 AI 추천 API URL: 404 오류 해결을 위해 백엔드 라우트와 일치시킵니다.
export const AI_SUGGESTIONS_URL = `${SERVER_URL}/api/recommendation`; 

// 다른 API URL들
export const CHATLIST_URL = `${SERVER_URL}/api/chatlist`;
export const DATE_COURSE_URL = `${SERVER_URL}/api/date-course`;
export const EXPLORE_URL = `${SERVER_URL}/api/users/explore`;

// ----------------------------------------------------
// ⭐️ 2. 함수 정의 및 Export
// ----------------------------------------------------

/**
 * 🤖 AI 추천 제안 API 호출
 * 🚨 이 함수 내부에 AI_SUGGESTIONS_URL을 사용하여 404 오류가 해결됩니다.
 * @param {object} chatContext - { userProfile, chatHistory }
 * @returns {Promise<Array<string>>} 추천 메시지 배열
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
            const errorData = await response.json().catch(() => ({ error: 'Unknown server error' }));
            throw new Error(errorData.error || `Server responded with status: ${response.status}`);
        }

        const data = await response.json();
        console.log('[API] Received AI suggestions:', data.suggestions);
        // 서버 응답 형태가 { suggestions: [...] } 일 때
        return data.suggestions || [];

    } catch (error) {
        // 이전 스크린샷에서 보았던 에러 로깅
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
            const errorData = await response.json().catch(() => ({ error: 'Unknown server error' }));
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
        console.log(`📡 데이터 요청 중: ${EXPLORE_URL}`);
        
        const response = await fetch(EXPLORE_URL);
        
        if (!response.ok) {
            console.error(`❌ 서버 응답 실패: ${response.status}`);
            return [];
        }
        
        const data = await response.json();
        
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

/**
 * 💬 채팅 목록 사용자 목록 로드 (ChatListScreen에서 분리된 로직)
 * @param {number} userId - 현재 사용자 ID
 * @returns {Promise<Array<object>>} 채팅 목록
 */
export const fetchChatList = async (userId) => { 
    try {
        const url = `${CHATLIST_URL}?userId=${userId}`;
        console.log(`📡 채팅 목록 요청 중: ${url}`);
        
        const response = await fetch(url);
        
        if (!response.ok) {
            console.error(`❌ 서버 응답 실패: ${response.status}`);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (Array.isArray(data)) {
            console.log(`✅ 채팅 목록 수신 완료: ${data.length}개`);
            return data;
        }
        
        return [];
    } catch (error) {
        console.error('❌ [CHATLIST] 데이터 로드 실패:', error);
        throw error;
    }
};