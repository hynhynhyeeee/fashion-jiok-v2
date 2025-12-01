const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');
// ★ 중요: 경로가 정확해야 합니다.
const { pool, closePool } = require('./src/config/database');

// 환경 변수 로드
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ========================================
// 1. 미들웨어 설정
// ========================================
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// 요청 로깅
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.path}`);
  next();
});

// ========================================
// 2. Gemini AI 초기화
// ========================================
const apiKey = process.env.GEMINI_API_KEY;
let genAI;
const MODEL_NAME = "gemini-2.0-flash-exp";

if (apiKey) {
  genAI = new GoogleGenerativeAI(apiKey);
  console.log('✅ Gemini AI 로드 완료');
} else {
  console.error('❌ 경고: GEMINI_API_KEY가 없습니다.');
}

// ========================================
// 3. API 라우트
// ========================================

// (1) 헬스 체크
app.get('/', (req, res) => {
  res.json({ status: 'running', message: 'Fashion Jiok Backend' });
});

// (2) DB 테스트
app.get('/api/test-db', async (req, res) => {
  try {
    // 간단한 쿼리로 연결 확인
    const [rows] = await pool.query('SELECT 1 + 1 AS solution');
    res.json({ success: true, message: 'DB 연결 정상', result: rows[0].solution });
  } catch (error) {
    console.error('DB Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// (3) AI 추천 API
app.post('/api/recommendation', async (req, res) => {
  const { userProfile, chatHistory } = req.body;

  if (!userProfile || !chatHistory) {
    return res.status(400).json({ error: '데이터가 부족합니다.' });
  }
  if (!genAI) return res.status(503).json({ error: 'AI 서비스를 사용할 수 없습니다.' });

  try {
    const profileInfo = JSON.stringify(userProfile);
    const historyText = chatHistory.map(msg => `${msg.role || 'user'}: ${msg.text}`).join('\n');

    const prompt = `당신은 연애 코치 AI입니다. 
    다음 사용자 정보를 바탕으로 상대방에게 보낼 자연스러운 메시지 3개를 추천해주세요.
    
    [프로필]: ${profileInfo}
    [대화내역]:\n${historyText}
    
    조건: 번호 없이 한 줄에 하나씩 3문장만 출력하세요.`;

    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const suggestions = text.trim().split('\n').filter(s => s).slice(0, 3);
    
    console.log('🤖 AI 추천 완료:', suggestions);
    res.json({ suggestions });

  } catch (error) {
    console.error('❌ AI 오류:', error);
    res.status(500).json({ error: 'AI 처리 중 오류 발생' });
  }
});

// ========================================
// 4. 서버 시작
// ========================================
const server = app.listen(PORT, () => {
  console.log(`🚀 서버가 실행되었습니다: http://localhost:${PORT}`);
});

// 종료 처리
process.on('SIGINT', async () => {
  console.log('\n⚠️ 서버 종료 중...');
  await closePool();
  server.close(() => {
    console.log('👋 서버가 안전하게 종료되었습니다.');
    process.exit(0);
  });
});


// ★ [추가] (2-1) 탐색 화면용 유저 목록 API
app.get('/api/users/explore', async (req, res) => {
  try {
    // 1. 유저 정보와 대표 이미지(is_primary=1)를 조인해서 가져옴
    const query = `
      SELECT 
        u.user_id as id, 
        u.name, 
        u.age, 
        u.location, 
        u.job,
        i.image_url as image,
        80 + FLOOR(RAND() * 20) as styleScore -- 스타일 점수는 일단 랜덤 (나중에 AI로 교체)
      FROM users u
      LEFT JOIN user_images i ON u.user_id = i.user_id
      WHERE i.is_primary = 1 OR i.is_primary IS NULL
      ORDER BY RAND() -- 랜덤하게 섞어서 보여줌
      LIMIT 10
    `;
    
    const [rows] = await pool.query(query);
    
    // 2. 태그는 아직 없으니 임시 태그 추가 (DB 구조에 맞게 추후 수정)
    const usersWithTags = rows.map(user => ({
      ...user,
      tags: ["미니멀", "데일리"] // 임시 태그
    }));

    res.json({ success: true, data: usersWithTags });
  } catch (error) {
    console.error('유저 조회 에러:', error);
    res.status(500).json({ success: false, message: '서버 에러' });
  }
});