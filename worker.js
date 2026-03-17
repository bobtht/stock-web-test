// Cloudflare Worker - Taiwan Stock Web
// 靜態網站 + API

const HTML_CONTENT = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>台股 AI 分析網</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lightweight-charts@4.1.0/dist/lightweight-charts.standalone.production.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700&display=swap" rel="stylesheet">
    <style>
        * { font-family: 'Noto Sans TC', sans-serif; }
        .gradient-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
    </style>
</head>
<body class="bg-gray-50 min-h-screen">
    <nav class="gradient-bg text-white sticky top-0 z-50 shadow-lg">
        <div class="container mx-auto px-4 py-4">
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                    <div class="bg-white/20 p-2 rounded-lg">
                        <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
                        </svg>
                    </div>
                    <div>
                        <h1 class="text-2xl font-bold">台股 AI 分析</h1>
                        <p class="text-sm text-white/80">Taiwan Stock Intelligence</p>
                    </div>
                </div>
            </div>
        </div>
    </nav>

    <main class="container mx-auto px-4 py-6">
        <div class="bg-white rounded-2xl p-6 shadow-lg mb-6">
            <h2 class="text-xl font-bold mb-4">🎉 網站部署成功！</h2>
            <p class="text-gray-600 mb-4">這是一個使用 Cloudflare Workers 建立的台股分析網站。</p>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="bg-blue-50 rounded-xl p-4 text-center">
                    <div class="text-3xl mb-2">📊</div>
                    <div class="font-bold">即時大盤</div>
                </div>
                <div class="bg-green-50 rounded-xl p-4 text-center">
                    <div class="text-3xl mb-2">🔍</div>
                    <div class="font-bold">個股查詢</div>
                </div>
                <div class="bg-purple-50 rounded-xl p-4 text-center">
                    <div class="text-3xl mb-2">🤖</div>
                    <div class="font-bold">AI 選股</div>
                </div>
            </div>
        </div>

        <div class="bg-white rounded-2xl p-6 shadow-lg">
            <h2 class="text-xl font-bold mb-4">📈 系統狀態</h2>
            <div class="space-y-2">
                <div class="flex justify-between">
                    <span>Worker 狀態</span>
                    <span class="text-green-500 font-bold">✅ 運作中</span>
                </div>
                <div class="flex justify-between">
                    <span>部署時間</span>
                    <span id="deployTime">--</span>
                </div>
                <div class="flex justify-between">
                    <span>版本</span>
                    <span>v1.0.0</span>
                </div>
            </div>
        </div>
    </main>

    <footer class="bg-gray-800 text-white py-8 mt-12">
        <div class="container mx-auto px-4 text-center">
            <p class="text-gray-400">© 2024 台股 AI 分析網 | 使用 Cloudflare Workers 部署</p>
        </div>
    </footer>

    <script>
        document.getElementById('deployTime').textContent = new Date().toLocaleString();
    </script>
</body>
</html>`;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // API 端點
    if (path === '/api/status') {
      return new Response(JSON.stringify({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 主頁面
    return new Response(HTML_CONTENT, {
      headers: { 'Content-Type': 'text/html' }
    });
  }
};
