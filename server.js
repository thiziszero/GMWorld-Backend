const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const app = express();
const port = process.env.PORT || 4000;

// CORS 설정
app.use(cors({
  origin: 'https://main--sorobon.netlify.app', // 프론트엔드 URL
  methods: ['GET', 'POST'], // 허용할 HTTP 메서드
  allowedHeaders: ['Content-Type'] // 허용할 헤더
}));

// JSON 파싱 설정
app.use(express.json());

// 루트 디렉토리 설정
const rootDir = path.join(__dirname, './');

// 테이블 정보를 읽는 함수
async function readTableInfo(name, phone) {
  try {
    const filePath = path.join(rootDir, 'table_info.txt');
    console.log('Attempting to read file:', filePath);
    const data = await fs.readFile(filePath, 'utf8');
    console.log(data);
    
    // 파일 내용을 줄 단위로 나누고 각 줄을 파싱합니다.
    const lines = data.split('\n');
    console.log(lines);

    // 탭과 공백을 모두 처리할 수 있도록 수정된 부분
    const tableData = lines.map(line => {
      const [name, phone, table] = line.split(/\s+/); // 탭과 공백 모두 처리
      return { name: name.trim(), phone: phone.trim(), table: table.trim() };
    });

    // 입력받은 name과 phone에 맞는 테이블 정보를 찾습니다.
    const table = tableData.find(entry => entry.name === name && entry.phone === phone);
    
    if (!table) {
      throw new Error('테이블 정보를 찾을 수 없습니다.');
    }
    
    return table;
  } catch (error) {
    console.error('Error reading table info:', error);
    if (error.code === 'ENOENT') {
      throw new Error('테이블 정보 파일을 찾을 수 없습니다.');
    }
    throw new Error(`테이블 정보를 읽는 중 오류 발생: ${error.message}`);
  }
}

// GET /find-table 라우트 수정
app.get('/find-table', async (req, res) => {
  const { name, phone } = req.query;
  if (!name || !phone) {
    return res.status(200).json({ message: "GET request to /find-table is working" });
  }
  try {
    const table = await readTableInfo(name, phone);
    res.status(200).json({ table });
  } catch (error) {
    console.error('Error in /find-table route:', error);
    res.status(404).json({ message: error.message, details: error.stack });
  }
});

app.get('/tables', async (req, res) => {
  try {
    console.log('Fetching tables...');
    const filePath = path.join(rootDir, 'table_info.txt');
    const data = await fs.readFile(filePath, 'utf8');
    const lines = data.split('\n');
    const tables = lines.map(line => {
      const [name, phone, table] = line.split(/\s+/);
      return { name: name.trim(), phone: phone.trim(), table: table.trim() };
    });
    console.log('Tables data:', tables);
    res.json({ tables });
  } catch (error) {
    console.error('Error in /tables route:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// 서버 실행
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
