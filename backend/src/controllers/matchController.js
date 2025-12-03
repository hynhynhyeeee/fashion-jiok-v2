const { pool: db } = require('../config/database');
// ========================================
// 좋아요 보내기 (수정됨: chat_rooms 생성 로직 추가)
// POST /api/matches/like
// ========================================
exports.sendLike = async (req, res) => {
    const { myId, targetId } = req.body;

    if (!myId || !targetId) {
        return res.status(400).json({ success: false, message: 'myId와 targetId가 필요합니다.' });
    }

    console.log(`[MATCH] 사용자 ${myId}가 ${targetId}에게 좋아요`);

    try {
        // 1. 이미 좋아요 했는지 확인 (생략)
        const [existingLike] = await db.query(
            'SELECT * FROM likes WHERE from_user_id = ? AND to_user_id = ?',
            [myId, targetId]
        );

        if (existingLike.length > 0) {
            return res.json({ success: true, message: '이미 좋아요 했습니다.', isMatch: false });
        }

        // 2. 좋아요 저장 (생략)
        await db.query(
            'INSERT INTO likes (from_user_id, to_user_id) VALUES (?, ?)',
            [myId, targetId]
        );
        console.log(`[MATCH] 좋아요 저장 완료: ${myId} → ${targetId}`);

        // 3. 상대방도 나를 좋아요 했는지 확인 (매칭 체크) (생략)
        const [mutualLike] = await db.query(
            'SELECT * FROM likes WHERE from_user_id = ? AND to_user_id = ?',
            [targetId, myId]
        );

        if (mutualLike.length > 0) {
            // 🎉 서로 좋아요 = 매칭 성공!
            console.log(`[MATCH] 🎉 매칭 성공! ${myId} ↔ ${targetId}`);

            const user1 = Math.min(myId, targetId);
            const user2 = Math.max(myId, targetId);

            // 4. matches 테이블에 저장
            const [existingMatch] = await db.query(
                'SELECT * FROM matches WHERE user_id_1 = ? AND user_id_2 = ?',
                [user1, user2]
            );

            if (existingMatch.length === 0) {
                await db.query(
                    `INSERT INTO matches (user_id_1, user_id_2, match_status, matched_at) 
                     VALUES (?, ?, 'accepted', NOW())`,
                    [user1, user2]
                );
                console.log(`[MATCH] matches 테이블에 저장 완료`);
            }
            
            // ⭐️ 5. CHAT_ROOMS 테이블에 방 생성 (추가된 로직)
            let roomId = null;
            const [existingRoom] = await db.query(
                'SELECT room_id FROM chat_rooms WHERE (user_id_1 = ? AND user_id_2 = ?) OR (user_id_1 = ? AND user_id_2 = ?)',
                [user1, user2, user2, user1]
            );

            if (existingRoom.length === 0) {
                const [result] = await db.query(
                    'INSERT INTO chat_rooms (user_id_1, user_id_2) VALUES (?, ?)',
                    [user1, user2]
                );
                // 삽입된 방의 ID를 가져옴
                roomId = result.insertId;
                console.log(`[MATCH] chat_rooms에 새 방 생성 완료 (Room ID: ${roomId})`);
            } else {
                roomId = existingRoom[0].room_id;
                console.log(`[MATCH] 기존 chat_rooms 재사용 (Room ID: ${roomId})`);
            }

            return res.json({ 
                success: true, 
                isMatch: true, 
                message: '매칭 성공! 🎉',
                matchedUserId: targetId,
                roomId: roomId // ⭐️ 채팅방 ID 반환
            });
        }

        // 매칭 안 됨 (상대방이 아직 좋아요 안 함)
        return res.json({ 
            success: true, 
            isMatch: false, 
            message: '좋아요를 보냈습니다.' 
        });

    } catch (error) {
        console.error('[MATCH] 좋아요 에러:', error);
        return res.status(500).json({ success: false, message: '서버 에러' });
    }
};

// ========================================
// 내 매칭 목록 조회
// GET /api/matches/list?userId=1
// ========================================
exports.getMatches = async (req, res) => {
    const { userId } = req.query;
    const currentUserId = parseInt(userId) || 1;

    console.log(`[MATCH] 사용자 ${currentUserId}의 매칭 목록 조회`);

    try {
        const query = `
            SELECT 
                m.match_id,
                m.match_status,
                m.matched_at,
                CASE 
                    WHEN m.user_id_1 = ? THEN m.user_id_2
                    ELSE m.user_id_1
                END AS matched_user_id,
                u.name,
                u.age,
                u.gender,
                i.image_url AS image
            FROM matches m
            JOIN users u ON u.user_id = CASE 
                WHEN m.user_id_1 = ? THEN m.user_id_2
                ELSE m.user_id_1
            END
            LEFT JOIN user_images i ON u.user_id = i.user_id AND i.is_primary = TRUE
            WHERE (m.user_id_1 = ? OR m.user_id_2 = ?)
              AND m.match_status = 'accepted'
            ORDER BY m.matched_at DESC
        `;

        const [rows] = await db.query(query, [currentUserId, currentUserId, currentUserId, currentUserId]);

        console.log(`[MATCH] 매칭 목록 ${rows.length}개 조회 완료`);
        return res.json(rows);

    } catch (error) {
        console.error('[MATCH] 매칭 목록 조회 에러:', error);
        return res.status(500).json({ success: false, message: '매칭 목록 조회 실패' });
    }
};

// ========================================
// 매칭 카드 목록 (추천 프로필)
// GET /api/matches/cards?userId=1
// ========================================
exports.getMatchCards = async (req, res) => {
    const { userId } = req.query;
    const currentUserId = parseInt(userId) || 1;

    console.log(`[MATCH] 사용자 ${currentUserId}의 추천 카드 조회`);

    try {
        // 이미 좋아요 한 사람, 이미 매칭된 사람 제외
        const query = `
            SELECT 
                u.user_id AS id,
                u.name,
                u.age,
                u.gender,
                s.primary_style AS style,
                i.image_url AS image,
                l.location_name AS location
            FROM users u
            LEFT JOIN ai_style_analysis s ON u.user_id = s.user_id
            LEFT JOIN user_images i ON u.user_id = i.user_id AND i.is_primary = TRUE
            LEFT JOIN user_locations l ON u.user_id = l.user_id
            WHERE u.user_id != ?
              AND u.user_id NOT IN (
                  SELECT to_user_id FROM likes WHERE from_user_id = ?
              )
              AND u.user_id NOT IN (
                  SELECT CASE WHEN user_id_1 = ? THEN user_id_2 ELSE user_id_1 END
                  FROM matches 
                  WHERE (user_id_1 = ? OR user_id_2 = ?) AND match_status = 'accepted'
              )
            ORDER BY RAND()
            LIMIT 20
        `;

        const [rows] = await db.query(query, [
            currentUserId, currentUserId, currentUserId, currentUserId, currentUserId
        ]);

        // 나를 좋아요 한 사람 표시
        const [likedMe] = await db.query(
            'SELECT from_user_id FROM likes WHERE to_user_id = ?',
            [currentUserId]
        );
        const likedMeIds = likedMe.map(l => l.from_user_id);

        const profilesWithType = rows.map(profile => ({
            ...profile,
            type: likedMeIds.includes(profile.id) ? 'liked_me' : 'normal'
        }));

        // 나를 좋아요 한 사람 먼저 보여주기
        profilesWithType.sort((a, b) => {
            if (a.type === 'liked_me' && b.type !== 'liked_me') return -1;
            if (a.type !== 'liked_me' && b.type === 'liked_me') return 1;
            return 0;
        });

        console.log(`[MATCH] 추천 카드 ${profilesWithType.length}개 조회 완료`);
        return res.json(profilesWithType);

    } catch (error) {
        console.error('[MATCH] 추천 카드 조회 에러:', error);
        return res.status(500).json({ success: false, message: '추천 카드 조회 실패' });
    }
};