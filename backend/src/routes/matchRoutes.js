const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');

// POST /api/matches/like - 좋아요 보내기
router.post('/like', matchController.sendLike);

// GET /api/matches/list - 내 매칭 목록
router.get('/list', matchController.getMatches);

// GET /api/matches/cards - 매칭 카드 목록 (추천 프로필)
router.get('/cards', matchController.getMatchCards);

module.exports = router;