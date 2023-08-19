const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const app = express();
app.use(cors());

// MongoDB 연결 정보
const uri = "mongodb+srv://ESCL:cnusoc100@cluster0.octm7po.mongodb.net/";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

app.get('/last-data', async (req, res) => {
  try {
    await client.connect(); // MongoDB에 연결

    const db = client.db('SOH_pred');
    const collection = db.collection('Hyundai_Kona1');

    // 컬렉션에서 마지막 데이터 가져오기
    const data = await collection.find({}).sort({ _id: -1 }).limit(1).toArray();

    if (data.length > 0) {
      res.json(data);
    } else {
      res.status(404).json({ 'error': '데이터를 찾을 수 없음' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ 'error': '서버 오류' });
  } finally {
    // 연결 해제
    await client.close();
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`서버가 ${PORT} 포트에서 실행 중입니다.`);
});