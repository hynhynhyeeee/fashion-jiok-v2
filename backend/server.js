const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { pool, closePool } = require('./src/config/database');

// ⭐️ 라우트 파일 가져오기
const userRoutes = require('./src/routes/userRoutes');

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

// ⭐️ (4) 유저 관련 라우트 연결 (explore, locations 포함)
app.use('/api/users', userRoutes);

// ========================================
// 4. 서버 시작
// ========================================
const server = app.listen(PORT, () => {
  console.log(`🚀 서버가 실행되었습니다: http://localhost:${PORT}`);
  console.log(`📍 탐색 API: http://localhost:${PORT}/api/users/explore`);
  console.log(`🗺️ 지도 API: http://localhost:${PORT}/api/users/locations`);
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