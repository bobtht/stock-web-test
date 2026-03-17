# 台股 AI 分析網 

AI 驅動的台股技術分析與選股平台

## 🚀 功能特色

- 📊 即時大盤指數儀表板
- 🔍 個股技術分析圖表
- 🤖 AI 強勢股選股掃描
- 📰 財經新聞整合
- 📱 響應式設計（手機/電腦）

## 🛠️ 技術棧

- **前端**: HTML5 + Tailwind CSS + Vanilla JS
- **圖表**: TradingView Lightweight Charts
- **後端**: Cloudflare Workers
- **部署**: Cloudflare Pages + GitHub Actions

## 🌐 網站網址

https://taiwan-stock-web.pages.dev

## 📁 專案結構

```
taiwan-stock-web/
├── public/              # 靜態網站檔案
│   ├── index.html      # 主頁面
│   └── app.js          # 前端邏輯
├── src/
│   └── api/
│       └── stock.js    # API 端點
├── .github/
│   └── workflows/
│       └── deploy.yml  # 自動部署
└── _worker.js          # Cloudflare Worker
```

## 🚀 本地開發

```bash
# 啟動本地伺服器
cd public
python3 -m http.server 8080

# 開啟 http://localhost:8080
```

## 📦 部署

每次 push 到 main 分支會自動部署到 Cloudflare Pages。

## 🔒 安全性

- HTTPS 強制
- CSP 內容安全策略
- CORS 跨域設定
- API 速率限制

## 📝 授權

MIT License
