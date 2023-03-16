import express from 'express';
import { parseUrlVariable } from './lib/parse-url-variable';
const app = express();

// 靜態檔案中介軟體
app.use(express.static('public'));

// Body 解析中介軟體
app.use(express.urlencoded({ extended: true }));

// 處理POST 請求
app.post('/convert', (req:any, res:any) => {
  const scss = req.body.scss;
  const obj = JSON.stringify(parseUrlVariable(scss));
  res.send(obj);
});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
