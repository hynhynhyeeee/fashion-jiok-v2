// src/routes/auth.js
// 인증 관련 라우터

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
// const { authenticateToken } = require('../middleware/auth');

// 회원가입
//router.post('/register', authController.register);

// 로그인
//router.post('/login', authController.login);

// 토큰 검증 (인증 필요)
//router.get('/verify', authenticateToken, authController.verifyToken);

// 로그아웃 (인증 필요)
//router.post('/logout', authenticateToken, authController.logout);

// 전화번호 중복 확인
//router.post('/check-phone', authController.checkPhoneNumber);




// POST /api/auth/send-code
router.post('/send-code', authController.sendVerificationCode);

// POST /api/auth/verify-code
router.post('/verify-code', authController.verifyCode);

module.exports = router;