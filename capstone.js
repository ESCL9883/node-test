const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const app = express();
app.use(cors());

// MongoDB 연결 정보
const uri = "mongodb+srv://ESCL:cnusoc100@cluster0.octm7po.mongodb.net/";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

app.get('/last-data/:collectionName', async (req, res) => {
  try {
    const { collectionName } = req.params;

    await client.connect(); // MongoDB에 연결
    const dbSOH = client.db('SOH_pred');
    const dbRUL = client.db('RUL');

    const collectionSOH = dbSOH.collection(collectionName);
    const collectionRUL = dbRUL.collection(collectionName);

    // 컬렉션에서 마지막 데이터 가져오기
    const lastDataSOH = await collectionSOH.find({}).sort({ _id: -1 }).limit(1).toArray();
    const lastDataRUL = await collectionRUL.find({}).sort({ _id: -1 }).limit(1).toArray();
    
    if (lastDataSOH.length > 0 && lastDataRUL.length > 0) {
      const response = {
        SOH : lastDataSOH[0].Pred_SOH, RUL : lastDataRUL[0].Pred_RUL
      };
      res.json(response); // 마지막 데이터 전송
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