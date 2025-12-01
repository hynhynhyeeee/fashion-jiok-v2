const mysql = require('mysql2');
require('dotenv').config();

// 1. Connection Pool 생성
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'fashionjiok',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// 2. Promise 기반 인터페이스
const promisePool = pool.promise();

// 3. 연결 테스트
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ MySQL 연결 실패:', err.message);
  } else {
    console.log('✅ MySQL 데이터베이스 연결 성공!');
    connection.release();
  }
});

// 4. 종료 함수
const closePool = async () => {
  try {
    await promisePool.end();
    console.log('✅ MySQL 연결 종료');
  } catch (err) {
    console.error('❌ 연결 종료 실패:', err);
  }
};

module.exports = { pool: promisePool, closePool };