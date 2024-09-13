const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const app = express();
const port = process.env.PORT || 4000;

// CORS 설정
app.use(cors({
  origin: ['https://main--sorobon.netlify.app', 'http://localhost:3000'], // 허용할 프론트엔드 URL 목록
  methods: ['GET', 'POST'], // 허용할 HTTP 메서드
  allowedHeaders: ['Content-Type'] // 허용할 헤더
}));

// JSON 파싱 설정
app.use(express.json());

// 루트 디렉토리 설정
const rootDir = path.join(__dirname, './');

app.use(express.static(rootDir));

// 테이블 정보를 읽는 함수
async function readTableInfo(name, phone) {
  try {
    const filePath = path.join(rootDir, 'table_info.txt');
    const data = await fs.readFile(filePath, 'utf8');
    
    const lines = data.split('\n');

    // 탭과 공백을 모두 처리할 수 있도록 수정된 부분
    const tableData = lines.map(line => {
      const [entryName, entryPhone, entryTable] = line.split(/\s+/); // 탭과 공백 모두 처리
      return { name: entryName.trim(), phone: entryPhone.trim(), table: entryTable.trim() };
    });

    // 전화번호에서 하이픈을 제거하고 비교
    const sanitizedPhone = phone.replace(/-/g, '');
    const table = tableData.find(entry => 
      entry.name === name && entry.phone.replace(/-/g, '') === sanitizedPhone
    );
    
    if (!table) {
      throw new Error('테이블 정보를 찾을 수 없습니다.');
    }
    
    return table;
  } catch (error) {
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
    return res.status(200).json({ message: "GET request to /find-table is working, but no name or phone provided" });
  }
  try {
    const table = await readTableInfo(name, phone);
    res.status(200).json({ table });
  } catch (error) {
    res.status(404).json({ message: error.message, details: error.stack });
  }
});

app.get('/tables', async (req, res) => {
  try {
    const filePath = path.join(rootDir, 'table_info.txt');
    const data = await fs.readFile(filePath, 'utf8');
    const lines = data.split('\n');
    const tables = lines.map(line => {
      const [name, phone, table] = line.split(/\s+/);
      return { name: name.trim(), phone: phone.trim(), table: table.trim() };
    });
    res.json({ tables });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// 서버 실행
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
