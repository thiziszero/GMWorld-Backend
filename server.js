const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());

// 루트 디렉토리 설정
const rootDir = path.join(__dirname, '..');

async function readTableInfo() {
  try {
    const filePath = path.join(rootDir, 'table_info.txt');
    console.log('Attempting to read file:', filePath);
    const data = await fs.readFile(filePath, 'utf8');
    // ... 나머지 코드는 그대로 유지
  } catch (error) {
    console.error('Error reading table info:', error);
    throw new Error('Unable to read table information');
  }
}

// ... 나머지 라우트 및 서버 설정 코드

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});