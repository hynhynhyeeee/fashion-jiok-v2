const { pool: db } = require('../config/database'); 

// ========================================
// 탐색 화면용 추천 사용자 목록 조회
// GET /api/users/explore
// ========================================
exports.getExploreUsers = async (req, res) => {
    const { userId } = req.query;
    const currentUserId = parseInt(userId) || 1;

    console.log(`[EXPLORE] 사용자 ${currentUserId} 기준 탐색 목록 조회`);

    try {
        const query = `
            SELECT 
                u.user_id AS id,
                u.name,
                u.gender,
                u.age,
                s.primary_style AS style,
                i.image_url AS image,
                l.location_name AS location,
                FLOOR(50 + RAND() * 50) AS styleScore
            FROM users u
            LEFT JOIN ai_style_analysis s ON u.user_id = s.user_id
            LEFT JOIN user_images i ON u.user_id = i.user_id AND i.is_primary = TRUE
            LEFT JOIN user_locations l ON u.user_id = l.user_id
            WHERE u.user_id != ?
            ORDER BY RAND()
            LIMIT 20;
        `;
        
        const [rows] = await db.query(query, [currentUserId]); 

        // tags 필드 추가 (style 기반으로 생성)
        const profilesWithTags = rows.map(row => ({
            ...row,
            tags: row.style ? [row.style] : ['패션'],
            location: row.location || '서울',
            styleScore: row.styleScore || Math.floor(50 + Math.random() * 50)
        }));

        console.log(`[EXPLORE] 추천 사용자 ${profilesWithTags.length}명 조회 성공`);
        return res.json(profilesWithTags);

    } catch (error) {
        console.error('[EXPLORE] DB 에러:', error);
        return res.status(500).json({ success: false, message: '사용자 목록 조회 실패' });
    }
};

// ========================================
// 근처 사용자 위치 및 기본 정보 조회
// GET /api/users/locations
// ========================================
exports.getNearbyUsers = async (req, res) => {
    const { userId, lat, lon } = req.query; 

    const currentLat = parseFloat(lat) || 37.5663;
    const currentLon = parseFloat(lon) || 126.9015;
    const currentUserId = parseInt(userId) || 1;
    const MAX_DISTANCE_KM = 5;

    console.log(`[MAP] 사용자 ${currentUserId} 기준, 위치 (${currentLat}, ${currentLon})에서 5km 이내 검색 시도`);

    try {
        const query = `
            SELECT 
                u.user_id, 
                u.name, 
                u.gender,
                u.age,
                s.primary_style,  
                l.latitude, 
                l.longitude,
                l.location_name,
                i.image_url,
                ST_Distance_Sphere(
                    l.location_point, 
                    ST_SRID(POINT(?, ?), 4326)
                ) / 1000 AS distance_km
            FROM users u
            JOIN user_locations l ON u.user_id = l.user_id
            LEFT JOIN ai_style_analysis s ON u.user_id = s.user_id
            LEFT JOIN user_images i ON u.user_id = i.user_id AND i.is_primary = TRUE
            WHERE u.user_id != ?
            HAVING distance_km < ?
            ORDER BY distance_km
            LIMIT 20;
        `;
        
        const [rows] = await db.query(query, [currentLon, currentLat, currentUserId, MAX_DISTANCE_KM]); 

        console.log(`[MAP] 근처 사용자 ${rows.length}명 조회 성공. (기준: ${currentLat}, ${currentLon})`);
        return res.json(rows);

    } catch (error) {
        console.error('[MAP] 근처 사용자 조회 DB 에러:', error);
        return res.status(500).json({ success: false, message: '위치 기반 사용자 조회 실패' });
    }
};