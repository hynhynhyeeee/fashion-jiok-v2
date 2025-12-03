const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// GET /api/users/explore
// 탐색 화면을 위한 추천 사용자 목록
router.get('/explore', userController.getExploreUsers);

// GET /api/users/locations
// 지도 화면을 위한 근처 사용자 위치 및 정보 조회
router.get('/locations', userController.getNearbyUsers); 

// TODO: 다른 사용자 관련 라우트 (예: 프로필 조회, 좋아요 등)를 여기에 추가합니다.
// router.get('/:userId', userController.getUserProfile); 

module.exports = router;