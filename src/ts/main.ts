import express from 'express';
import bodyparser from 'body-parser';
import { parseUrlVariable } from './lib/parse-url-variable';
const app = express();

// 靜態檔案中介軟體
app.use(express.static('public'));
app.use(bodyparser.text());

// Body 解析中介軟體
app.use(express.urlencoded({ extended: true }));

// 處理POST 請求
app.post('/convert', (req:any, res:any) => {
  const scss = req.body;
  const output = parseUrlVariable(scss);
  res.set('Access-Control-Allow-Origin', 'https://mizok.github.io/');
  res.setHeader('Content-Type', 'text/plain'); // 設定回應的 Content-Type 為 text/plain
  res.send(output); // 傳送純文字
});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
