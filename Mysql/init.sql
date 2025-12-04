-- ========================================
-- 1. 데이터베이스 초기화 (이름 통일: fashionjiok)
-- ========================================
DROP DATABASE IF EXISTS fashionjiok;
CREATE DATABASE IF NOT EXISTS fashionjiok;
USE fashionjiok;

-- ========================================
-- [DDL] 테이블 생성
-- ========================================

-- 1. 사용자 기본 정보 테이블
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(50) NOT NULL,
    age INT NOT NULL,
    gender ENUM('M', 'F') COMMENT '성별',
    location VARCHAR(100) ,
    job VARCHAR(100),
    education VARCHAR(100),
    bio TEXT COMMENT '자기소개',
    profile_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_phone (phone_number),
    INDEX idx_location (location),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. 사용자 프로필 이미지 테이블
CREATE TABLE user_images (
    image_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    image_order INT DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. MBTI 정보 테이블
CREATE TABLE user_mbti (
    mbti_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE NOT NULL,
    energy ENUM('E', 'I') NOT NULL,
    information ENUM('N', 'S') NOT NULL,
    decisions ENUM('F', 'T') NOT NULL,
    lifestyle ENUM('P', 'J') NOT NULL,
    mbti_type VARCHAR(4) GENERATED ALWAYS AS (CONCAT(energy, information, decisions, lifestyle)) STORED,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_mbti_type (mbti_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. 스타일 태그 마스터 테이블
CREATE TABLE style_tags (
    tag_id INT PRIMARY KEY AUTO_INCREMENT,
    tag_name VARCHAR(50) UNIQUE NOT NULL,
    tag_category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. 사용자 스타일 태그 매핑 테이블
CREATE TABLE user_styles (
    user_style_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    tag_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES style_tags(tag_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_style (user_id, tag_id),
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. 관심사 카테고리 마스터 테이블
CREATE TABLE interest_categories (
    category_id INT PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. 관심사 아이템 마스터 테이블
CREATE TABLE interests (
    interest_id INT PRIMARY KEY AUTO_INCREMENT,
    category_id INT NOT NULL,
    interest_name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES interest_categories(category_id) ON DELETE CASCADE,
    UNIQUE KEY unique_interest (category_id, interest_name),
    INDEX idx_category (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. 사용자 관심사 매핑 테이블
CREATE TABLE user_interests (
    user_interest_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    interest_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (interest_id) REFERENCES interests(interest_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_interest (user_id, interest_id),
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. AI 스타일 분석 결과 테이블
CREATE TABLE ai_style_analysis (
    analysis_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE NOT NULL,
    primary_style VARCHAR(50),
    secondary_style VARCHAR(50),
    preferred_colors JSON,
    preferred_brands JSON,
    style_score DECIMAL(3,2),
    analysis_data JSON,
    analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. 매칭 테이블
CREATE TABLE matches (
    match_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id_1 INT NOT NULL,
    user_id_2 INT NOT NULL,
    match_status ENUM('pending', 'accepted', 'rejected', 'expired') DEFAULT 'pending',
    match_score DECIMAL(3,2),
    matched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP NULL,
    FOREIGN KEY (user_id_1) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id_2) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_match (user_id_1, user_id_2),
    INDEX idx_user1 (user_id_1),
    INDEX idx_user2 (user_id_2),
    INDEX idx_status (match_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. 좋아요 테이블
CREATE TABLE likes (
    like_id INT PRIMARY KEY AUTO_INCREMENT,
    from_user_id INT NOT NULL,
    to_user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (from_user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (to_user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_like (from_user_id, to_user_id),
    INDEX idx_from_user (from_user_id),
    INDEX idx_to_user (to_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. 채팅방 테이블
CREATE TABLE chat_rooms (
    room_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id_1 INT NOT NULL,
    user_id_2 INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_message_at TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id_1) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id_2) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_room (user_id_1, user_id_2),
    INDEX idx_user1 (user_id_1),
    INDEX idx_user2 (user_id_2),
    INDEX idx_last_message (last_message_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. 채팅 메시지 테이블
CREATE TABLE chat_messages (
    message_id INT PRIMARY KEY AUTO_INCREMENT,
    room_id INT NOT NULL,
    sender_id INT NOT NULL,
    message_type ENUM('text', 'image', 'system') DEFAULT 'text',
    message_content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES chat_rooms(room_id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_room (room_id),
    INDEX idx_sender (sender_id),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. 사용자 위치 정보 테이블
CREATE TABLE user_locations (
    location_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL, 
    location_point POINT NOT NULL SRID 4326, -- 공간 연산용
    location_name VARCHAR(100),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    SPATIAL INDEX idx_location_point (location_point), -- POINT 타입에만 SPATIAL INDEX 적용
    INDEX idx_lat_lon (latitude, longitude) -- 일반 위경도 값 검색용 인덱스
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. 차단 사용자 테이블
CREATE TABLE blocked_users (
    block_id INT PRIMARY KEY AUTO_INCREMENT,
    blocker_id INT NOT NULL,
    blocked_id INT NOT NULL,
    reason VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (blocker_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (blocked_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_block (blocker_id, blocked_id),
    INDEX idx_blocker (blocker_id),
    INDEX idx_blocked (blocked_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. 신고 테이블
CREATE TABLE reports (
    report_id INT PRIMARY KEY AUTO_INCREMENT,
    reporter_id INT NOT NULL,
    reported_id INT NOT NULL,
    report_type ENUM('spam', 'inappropriate', 'fake', 'harassment', 'other') NOT NULL,
    report_reason TEXT,
    status ENUM('pending', 'reviewed', 'resolved', 'dismissed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    FOREIGN KEY (reporter_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (reported_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_reporter (reporter_id),
    INDEX idx_reported (reported_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ========================================
-- [DML] 기본 및 더미 데이터 삽입
-- ========================================

-- 1. 스타일 태그 데이터
INSERT INTO style_tags (tag_name, tag_category) VALUES
('미니멀', 'basic'), ('모던', 'basic'), ('캐주얼', 'basic'), ('스트리트', 'basic'),
('빈티지', 'basic'), ('클래식', 'basic'), ('페미닌', 'basic'), ('스포티', 'basic'),
('심플', 'detailed'), ('댄디', 'detailed'), ('로맨틱', 'detailed'), ('힙스터', 'detailed'),
('보헤미안', 'detailed'), ('프레피', 'detailed'), ('고프코어', 'detailed'), ('아메카지', 'detailed');

-- 2. 관심사 카테고리 데이터
INSERT INTO interest_categories (category_name) VALUES
('게임'), ('집순이/집돌이'), ('아웃도어'), ('문화생활'), ('음식'), ('운동');

-- 3. 관심사 아이템 데이터
INSERT INTO interests (category_id, interest_name) VALUES
(1, '닌텐도'), (1, 'PC방'), (1, '로블록스'), (1, '오버워치'), (1, 'E-sports'),
(2, '독서'), (2, '드라마정주행'), (2, '베이킹'), (2, '보드게임'), (2, '식물가꾸기'), (2, '온라인게임'), (2, '요리'), (2, '홈트'),
(3, '등산'), (3, '캠핑'), (3, '자전거'), (3, '러닝'), (3, '서핑'),
(4, '전시회'), (4, '영화'), (4, '공연'), (4, '페스티벌'), (4, '뮤지컬'),
(5, '맛집투어'), (5, '카페'), (5, '와인'),
(6, '헬스'), (6, '요가'), (6, '필라테스'), (6, '수영'), (6, '테니스');


-- 4. 사용자 데이터 (총 33명)
-- 4-1. 기존 멤버 및 신규 멤버 1 (User 1~13)
INSERT INTO users (phone_number, password_hash, name, age, gender, location, job, education, bio, profile_completed) VALUES
('010-1234-5678', '$2b$10$hash1', '민수', 27, 'M', '서울 강남구', '프로덕트 디자이너', '홍익대학교', '패션과 디자인을 사랑합니다.', TRUE),
('010-2345-6789', '$2b$10$hash2', '지은', 25, 'F', '서울 마포구', 'UX 디자이너', '이화여대', '감각적인 스타일을 좋아해요.', TRUE),
('010-3456-7890', '$2b$10$hash3', '태양', 29, 'M', '서울 송파구', '개발자', 'KAIST', '너드미와 힙합의 조화.', TRUE),
('010-4001-1001', '$2b$10$hash4', '성훈', 26, 'M', '서울 성동구', '패션 포토그래퍼', '예술대학교', '순간을 기록하는 것을 좋아합니다. 📸', TRUE),
('010-4002-1002', '$2b$10$hash5', '도윤', 30, 'M', '서울 영등포구', '금융 애널리스트', '연세대학교', '퇴근 후 위스키와 재즈를 즐겨요.', TRUE),
('010-4003-1003', '$2b$10$hash6', '기용', 30, 'M', '서울 마포구', '바리스타', '미수료', '향긋한 커피와 함께하는 아침.', TRUE),
('010-4004-1004', '$2b$10$hash7', '건호', 20, 'M', '성남 분당구', '건축가', '한양대학교', '공간이 주는 힘을 믿습니다.', TRUE),
('010-4005-1005', '$2b$10$hash8', '마틴', 22, 'M', '서울 관악구', '헬스 트레이너', '체육대학교', '건강한 신체에 건강한 정신! 💪', TRUE),
('010-5001-2001', '$2b$10$hash9', '서연', 25, 'F', '서울 강남구', '마케터', '이화여자대학교', '트렌드를 읽는 핫플 탐방러!', TRUE),
('010-5002-2002', '$2b$10$hash10', '지아', 29, 'F', '서울 용산구', '전시 큐레이터', '파리 유학파', '예술적 영감을 주고받아요.', TRUE),
('010-5003-2003', '$2b$10$hash11', '하은', 23, 'F', '서울 서대문구', '유튜버', '휴학 중', '브이로그 찍는 게 일상이에요.', TRUE),
('010-5004-2004', '$2b$10$hash12', '윤아', 27, 'F', '서울 송파구', '플로리스트', '원예학과', '꽃을 만질 때 가장 행복해요. 🌷', TRUE),
('010-5005-2005', '$2b$10$hash13', '채원', 31, 'F', '서울 종로구', '약사', '약학대학', '조용하고 차분한 데이트 선호.', TRUE);

INSERT INTO user_images (user_id, image_url, image_order, is_primary) VALUES
(1, 'https://i.pinimg.com/736x/4f/25/42/4f254296535a3ed3386afed0e3ab3860.jpg', 0, TRUE),
(2, 'https://i.pinimg.com/736x/cf/44/d9/cf44d9bf8c6e22d57891cd8d5d470bfe.jpg', 0, TRUE),
(2, 'https://i.pinimg.com/1200x/71/02/1a/71021aa608dd13a686e68986b4aa6a2d.jpg', 1, FALSE),
(3, 'https://i.pinimg.com/736x/d1/4b/0d/d14b0df833edda104295bd28a97de7fc.jpg', 0, TRUE),
(4, 'https://i.pinimg.com/736x/08/8f/9d/088f9db74d0acaacecb1f460bbf64955.jpg', 0, TRUE),
(5, 'https://i.pinimg.com/1200x/8d/10/58/8d1058a16d8610a11389577b355c5a6a.jpg', 0, TRUE),
(6, 'https://i.pinimg.com/1200x/29/00/13/2900138968b8cd944433d62a222ffee9.jpg', 0, TRUE),
(6, 'https://i.pinimg.com/1200x/a4/d0/55/a4d055246c732c6e22fb7348f8adcc8d.jpg', 1, FALSE),
(7, 'https://i.pinimg.com/1200x/c7/df/68/c7df68cce3c8660f3ecf7939f87333e2.jpg', 0, TRUE),
(8, 'https://i.pinimg.com/736x/2a/be/72/2abe7264688ec41c7c9e7418dd351fc2.jpg', 0, TRUE),
(9, 'https://i.pinimg.com/1200x/37/58/53/3758539461d87ca939fe05273e99b883.jpg', 0, TRUE),
(10, 'https://i.pinimg.com/1200x/9a/44/e8/9a44e860d3c035e28193a718b666003d.jpg', 0, TRUE),
(11, 'https://i.pinimg.com/736x/67/cb/59/67cb59377b6308c9f1aa70fba0e14064.jpg', 0, TRUE),
(12, 'https://i.pinimg.com/1200x/ed/60/b8/ed60b897b30f5cd6c71ab4736c354f39.jpg', 0, TRUE),
(13, 'https://i.pinimg.com/736x/bf/f6/1f/bff61f66cdb2efffe65e33f5c9a21f8a.jpg', 0, TRUE);

-- 4-2. 추가 남성 멤버 (User 14~23)
INSERT INTO users (phone_number, password_hash, name, age, gender, location, job, education, bio, profile_completed) VALUES
('010-6001-3001', '$2b$10$hash14', '연준', 26, 'M', '서울 용산구', '브랜드 전략가', '고려대학교', '브랜드의 스토리를 만드는 일을 합니다.', TRUE),
('010-6002-3002', '$2b$10$hash15', '다니엘', 26, 'M', '부산 해운대구', '포토그래퍼', '부산예대', '도시의 순간을 담습니다.', TRUE),
('010-6003-3003', '$2b$10$hash16', '유진', 31, 'M', '서울 종로구', '변호사', '서울대학교', '차분하지만 유머를 좋아해요.', TRUE),
('010-6004-3004', '$2b$10$hash17', '지환', 24, 'M', '대구 수성구', '게임 디자이너', '한국게임대학', '재미있는 경험을 만드는 중입니다.', TRUE),
('010-6005-3005', '$2b$10$hash18', '로완', 29, 'M', '서울 중구', '편집 디자이너', '홍익대학교', '미니멀리즘 애호가.', TRUE),
('010-6006-3006', '$2b$10$hash19', '시온', 30, 'M', '인천 연수구', '데이터 분석가', 'KAIST', '숫자와 패턴에 빠져 사는 사람.', TRUE),
('010-6007-3007', '$2b$10$hash20', '승호', 27, 'M', '서울 강서구', '체대생 · 헬스 트레이너', '체육대학교', '운동과 균형을 추구합니다.', TRUE),
('010-6008-3008', '$2b$10$hash21', '레이', 23, 'M', '경기 성남시', '패션 쇼 모델', '패션아카데미', '런웨이 위의 자신감을 사랑해요.', TRUE),
('010-6009-3009', '$2b$10$hash22', '정후', 32, 'M', '서울 광진구', '프론트엔드 개발자', '건국대학교', 'UI/UX에 진심입니다.', TRUE),
('010-6010-3010', '$2b$10$hash23', '주연', 35, 'M', '경기 고양시', '일러스트레이터', '예술학원', '감성을 그려내는 사람.', TRUE);

INSERT INTO user_images (user_id, image_url, image_order, is_primary) VALUES
(14, 'https://i.pinimg.com/736x/27/30/6f/27306fc55f4d3f04ecf5a0d448fc97e1.jpg', 0, TRUE),
(15, 'https://i.pinimg.com/1200x/77/7f/19/777f190e01c72852677b6a1d1ef39dc9.jpg', 0, TRUE),
(16, 'https://i.pinimg.com/736x/23/a2/a3/23a2a30089cd3a8137c52d493c2ccd39.jpg', 0, TRUE),
(17, 'https://i.pinimg.com/736x/ce/65/b7/ce65b7df4e538f11cb786642655d92f5.jpg', 0, TRUE),
(18, 'https://i.pinimg.com/1200x/4f/8f/b4/4f8fb476d39fe17ae1dfadbec3df0e59.jpg', 0, TRUE),
(19, 'https://i.pinimg.com/736x/39/2b/4e/392b4e4674d7821e2d136c06242dce34.jpg', 0, TRUE),
(20, 'https://i.pinimg.com/736x/cd/29/8c/cd298cfc18586e8a78fbc3fd7b208b53.jpg', 0, TRUE),
(21, 'https://i.pinimg.com/1200x/a1/5d/a2/a15da27902c1e34b6afd2f2eb4a00b25.jpg', 0, TRUE),
(22, 'https://i.pinimg.com/736x/5e/e0/ad/5ee0ad56133df3270698ca71d3e6b50e.jpg', 0, TRUE),
(23, 'https://i.pinimg.com/736x/95/ba/0c/95ba0c563272c9bb05b6ddabb50c66ff.jpg', 0, TRUE);

-- 4-3. 추가 여성 멤버 (User 24~33)
INSERT INTO users (phone_number, password_hash, name, age, gender, location, job, education, bio, profile_completed) VALUES
('010-7001-4001', '$2b$10$hash24', '가윤', 26, 'F', '서울 서초구', '브랜딩 디자이너', '이화여자대학교', '디테일에 강한 감성파.', TRUE),
('010-7002-4002', '$2b$10$hash25', '소정', 30, 'F', '경기 안양시', '약사', '성균관대학교', '신뢰와 안정감을 중요시해요.', TRUE),
('010-7003-4003', '$2b$10$hash26', '하린', 24, 'F', '대전 유성구', '영상 에디터', '대전예대', '감각적인 무드의 영상 좋아해요.', TRUE),
('010-7004-4004', '$2b$10$hash27', '주아', 29, 'F', '서울 송파구', '스타일리스트', '패션스쿨', '사람을 빛나게 하는 옷을 좋아해요.', TRUE),
('010-7005-4005', '$2b$10$hash28', '은채', 27, 'F', '인천 계양구', '초등교사', '교육대학교', '긍정 에너지 가득!', TRUE),
('010-7006-4006', '$2b$10$hash29', '라엘', 31, 'F', '부산 남구', '바이올리니스트', '음대 졸업', '음악과 함께하는 삶 🎻', TRUE),
('010-7007-4007', '$2b$10$hash30', '세아', 23, 'F', '서울 동작구', '카페 사장', '고졸', '커피 향이 삶의 행복.', TRUE),
('010-7008-4008', '$2b$10$hash31', '보민', 28, 'F', '경기 수원시', '마케팅 PM', '한양대학교', '트렌드를 읽는 사람.', TRUE),
('010-7009-4009', '$2b$10$hash32', '이안', 25, 'F', '서울 은평구', '웹디자이너', '디지털디자인학과', '깔끔·심플한 디자인 추구.', TRUE),
('010-7010-4010', '$2b$10$hash33', '소윤', 30, 'F', '경기 파주시', '피트니스 코치', '체대', '건강한 루틴을 나누고 싶어요.', TRUE);

INSERT INTO user_images (user_id, image_url, image_order, is_primary) VALUES
(24, 'https://i.pinimg.com/1200x/ec/ff/17/ecff17a8b16e6982c26c7242ed2a536f.jpg', 0, TRUE),
(25, 'https://i.pinimg.com/736x/ee/80/7d/ee807d3f3e2a0509c8e5e8387ef7eaa9.jpg', 0, TRUE),
(26, 'https://kittenalarm.com/cdn/shop/files/Patchwork-Mesh-Top_1000x.jpg?v=1756804592', 0, TRUE),
(27, 'https://i.pinimg.com/1200x/78/de/f5/78def5256045152caf0ef1615ae99ba8.jpg', 0, TRUE),
(28, 'https://i.pinimg.com/736x/40/10/cd/4010cd372ad8386d07e91fe591e0d84d.jpg', 0, TRUE),
(29, 'https://i.pinimg.com/1200x/52/d3/28/52d32833e1ff4e5e297abd2c7aa5db14.jpg', 0, TRUE),
(30, 'https://i.pinimg.com/1200x/59/8e/eb/598eeb5824f6f586880057d6fd20f3fb.jpg', 0, TRUE),
(31, 'https://i.pinimg.com/736x/15/6e/c8/156ec8d9653dffd20ae4d075200dbc80.jpg', 0, TRUE),
(32, 'https://i.pinimg.com/1200x/f5/2b/78/f52b78e3577637099086d0c2ba1932f9.jpg', 0, TRUE),
(33, 'https://i.pinimg.com/736x/26/e0/d6/26e0d6467594d3cfb716511ea241d467.jpg', 0, TRUE);

-- 5. 좋아요 더미 데이터 (테스트용)
-- ⭐️ 짝수 번호 유저들이 나(user_id=1)를 좋아하도록 설정
INSERT INTO likes (from_user_id, to_user_id) VALUES 
(2, 1), (4, 1), (6, 1), (8, 1), (10, 1),
(12, 1), (14, 1), (16, 1), (18, 1), (20, 1),
(22, 1), (24, 1), (26, 1), (28, 1), (30, 1);


-- ========================================
-- [검증] 데이터 확인
-- ========================================

-- 테이블별 데이터 개수 확인
SELECT 'users' as TableName, COUNT(*) as Count FROM users
UNION ALL
SELECT 'user_images', COUNT(*) FROM user_images
UNION ALL
SELECT 'likes', COUNT(*) FROM likes;

-- 유저 및 이미지 정보 샘플 확인
SELECT 
    u.user_id, 
    u.name, 
    u.gender, 
    i.image_url 
FROM users u
LEFT JOIN user_images i ON u.user_id = i.user_id
ORDER BY u.user_id
LIMIT 5;

-- 좋아요 데이터 상세 확인 (User 1에게 온 좋아요)
SELECT 
    l.like_id,
    u1.name as '좋아요 보낸 사람',
    u2.name as '받은 사람'
FROM likes l
JOIN users u1 ON l.from_user_id = u1.user_id
JOIN users u2 ON l.to_user_id = u2.user_id
WHERE l.to_user_id = 1;