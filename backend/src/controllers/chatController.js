const { pool } = require('../config/database'); // DB 연결 객체 (나중에 사용)

// 임시 목업 데이터
const mockChatList = [
    { 
        matchId: 101, 
        partnerId: 2,
        partnerName: '재현', 
        lastMessage: '이번 주말에 카페에서 만날까요?', 
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        unreadCount: 1 
    },
    { 
        matchId: 102, 
        partnerId: 3,
        partnerName: '수민', 
        lastMessage: '요즘 날씨가 너무 좋네요!', 
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        unreadCount: 0
    },
];

/**
 * @desc 현재 사용자의 채팅 목록을 조회합니다. (임시 목업 데이터 반환)
 */
exports.getChatList = async (req, res) => {
    // TODO: [실제 구현]
    // 1. 인증 미들웨어에서 userId를 가져옵니다. (const userId = req.user.id;)
    // 2. DB에서 userId가 관련된 매칭 목록을 조회합니다.
    // 3. 각 매칭의 마지막 메시지와 안 읽은 메시지 수를 계산합니다.
    
    try {
        console.log(`[CHATLIST] 목록 요청 처리 (컨트롤러) - ${mockChatList.length}개`);
        // 현재는 목업 데이터 반환
        res.json(mockChatList);

    } catch (error) {
        console.error('❌ [CHATLIST] 데이터 로드 오류:', error);
        res.status(500).json({ error: '채팅 목록을 로드하는 중 서버 오류가 발생했습니다.' });
    }
};

/**
 * @desc 특정 매칭의 채팅 메시지 내역을 로드합니다.
 */
exports.getChatMessages = async (req, res) => {
    const { matchId } = req.params;
    
    // TODO: [실제 구현]
    // 1. matchId를 사용하여 해당 채팅방의 메시지 내역을 DB에서 가져오는 로직 구현
    
    console.log(`[CHAT] 채팅방 ${matchId} 메시지 요청 처리 (컨트롤러)`);
    
    // 임시 응답
    res.json({ 
        matchId: parseInt(matchId), 
        messages: [
            { id: 1, senderId: 2, text: '안녕하세요! 매칭 축하드려요.', timestamp: new Date().toISOString() },
            { id: 2, senderId: 1, text: '감사합니다! 혹시 주말에 시간 괜찮으세요?', timestamp: new Date().toISOString() }
        ] 
    });
};