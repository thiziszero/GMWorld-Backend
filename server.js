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

// 테이블 정보를 읽는 함수
async function readTableInfo(name, phone) {
  try {
    const filePath = path.join(rootDir, 'table_info.txt');
    console.log('Attempting to read file:', filePath);
    const data = await fs.readFile(filePath, 'utf8');
    const tableData = JSON.parse(data);

    // 여기서 name과 phone에 맞는 테이블 정보를 찾는 로직을 추가하세요
    const table = tableData.find(entry => entry.name === name && entry.phone === phone);

    if (!table) {
      throw new Error('테이블 정보를 찾을 수 없습니다.');
    }

    return table;
  } catch (error) {
    console.error('Error reading table info:', error);
    throw new Error('Unable to read table information');
  }
}

// /find-table 라우트 추가
app.post('/find-table', async (req, res) => {
  const { name, phone } = req.body;

  try {
    const table = await readTableInfo(name, phone);
    res.status(200).json({ table });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

app.get('/find-table', (req, res) => {
     res.status(200).json({ message: "GET request to /find-table is working" });
   });

// 서버 실행
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
