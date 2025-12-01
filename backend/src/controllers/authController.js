const { promisePool: db } = require('../config/database');

// ==========================================
// 1. 인증번호 발송 (모의 API)
// ==========================================
exports.sendVerificationCode = async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ success: false, message: '전화번호를 입력해주세요.' });
  }

  try {
    // TODO: 실제 SMS 발송 로직 (CoolSMS, Twilio 등)은 여기에 구현
    // 현재는 테스트를 위해 무조건 성공 처리하고, 인증번호를 '123456'으로 가정합니다.
    const mockCode = '123456';
    
    console.log(`[AUTH] ${phone} 번호로 인증번호 발송: ${mockCode}`);

    // 실제 서비스에서는 Redis 등에 (phone, code)를 저장하고 유효시간을 설정해야 합니다.
    
    return res.json({
      success: true,
      message: '인증번호가 발송되었습니다.',
      debugCode: mockCode // 개발 편의를 위해 응답에 포함 (배포 시 제거)
    });

  } catch (error) {
    console.error('인증번호 발송 에러:', error);
    return res.status(500).json({ success: false, message: '서버 에러가 발생했습니다.' });
  }
};

// ==========================================
// 2. 인증번호 검증 및 로그인/회원가입 처리
// ==========================================
exports.verifyCode = async (req, res) => {
  const { phone, code } = req.body;

  if (!phone || !code) {
    return res.status(400).json({ success: false, message: '전화번호와 인증번호가 필요합니다.' });
  }

  try {
    // 1. 인증번호 검증 (테스트용 고정값 사용)
    if (code !== '123456') {
      return res.status(400).json({ success: false, message: '인증번호가 일치하지 않습니다.' });
    }

    // 2. DB에서 사용자 조회
    const [rows] = await db.query('SELECT * FROM users WHERE phone_number = ?', [phone]);
    let user = rows[0];
    let isNewUser = false;

    // 3. 사용자가 없으면 자동 회원가입 처리
    if (!user) {
      console.log(`[AUTH] 신규 유저 발견! 회원가입 진행: ${phone}`);
      
      // 필수 컬럼인 password_hash 등은 더미 값으로 채움
      const insertQuery = `
        INSERT INTO users (phone_number, password_hash, name, age, gender, is_active, profile_completed)
        VALUES (?, 'sns_login_dummy_pass', '새로운 유저', 0, 'M', TRUE, FALSE)
      `;
      
      const [result] = await db.query(insertQuery, [phone]);
      
      // 방금 생성된 유저 정보 다시 조회
      const [newUserRows] = await db.query('SELECT * FROM users WHERE id = ?', [result.insertId]); // id 컬럼명 확인 필요 (user_id 또는 id)
      
      // 만약 user_id 컬럼을 쓰면 위 쿼리를 'WHERE user_id = ?'로 수정하세요.
      // 여기서는 스키마에 따라 id 또는 user_id 사용. (이전 스키마 기준 id 가정)
      
      user = newUserRows[0];
      isNewUser = true;
    }

    // 4. 로그인 성공 응답
    console.log(`[AUTH] 로그인 성공: ${user.name} (${user.phone_number})`);

    return res.json({
      success: true,
      message: isNewUser ? '회원가입 및 로그인 성공' : '로그인 성공',
      isNewUser: isNewUser, // 프론트엔드에서 온보딩으로 보낼지 결정하는 플래그
      user: {
        id: user.id || user.user_id, // DB 컬럼명에 따라 매핑
        name: user.name,
        phone: user.phone_number,
        profileCompleted: user.profile_completed
      },
      // TODO: 추후 JWT 토큰 발급 로직 추가
      // token: 'jwt_token_here' 
    });

  } catch (error) {
    console.error('인증 확인 에러:', error);
    return res.status(500).json({ success: false, message: '데이터베이스 오류 발생' });
  }
};