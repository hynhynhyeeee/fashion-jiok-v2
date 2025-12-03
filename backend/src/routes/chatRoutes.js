const express = require('express');
const router = express.Router();
// const { authenticate } = require('../middleware/authMiddleware'); // 인증 미들웨어 (필요시 주석 해제)
// const db = require('../config/database'); // DB 연결 (필요시 주석 해제)

// 임시 인증 미들웨어 (실제 사용 시에는 보안을 위해 JWT 검증 등을 구현해야 합니다.)
const authenticate = (req, res, next) => {
    // TODO: 여기에 실제 인증(토큰 검증) 로직을 구현하세요.
    next(); 
};

/**
 * @route GET /api/chats/list
 * @desc 현재 사용자의 채팅 목록을 조회합니다.
 * @access Private (인증 필요)
 */
router.get('/', authenticate, async (req, res) => {
    // const userId = req.user.id; // 인증 미들웨어에서 가져온 사용자 ID
    
    try {
        // ❌ [현재 404 해결 후 다음 작업]
        // TODO: DB에서 userId를 기반으로 해당 사용자의 매칭 및 채팅방 목록을 조회합니다.
        
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

        console.log(`[CHATLIST] 목록 요청 처리 완료 - ${mockChatList.length}개`);
        res.json(mockChatList);

    } catch (error) {
        console.error('❌ [CHATLIST] 데이터 로드 오류:', error);
        // DB 오류는 500 에러로 응답
        res.status(500).json({ error: '채팅 목록을 로드하는 중 서버 오류가 발생했습니다.' });
    }
});

/**
 * @route GET /api/chats/:matchId
 * @desc 특정 매칭의 채팅 메시지 내역을 로드합니다.
 * @access Private (인증 필요)
 */
router.get('/:matchId', authenticate, (req, res) => {
    const { matchId } = req.params;
    console.log(`[CHAT] 채팅방 ${matchId} 메시지 요청`);

    // TODO: matchId를 사용하여 해당 채팅방의 메시지 내역을 DB에서 가져오는 로직 구현
    res.json({ matchId: parseInt(matchId), messages: [] });
});


module.exports = router;