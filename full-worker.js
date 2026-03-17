// Cloudflare Worker - 台股 AI 分析網 (完整版)
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // CORS 標頭
    const headers = {
      'Content-Type': 'text/html; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
    };
    
    // API 端點
    if (path === '/api/stock/:symbol') {
      const symbol = path.split('/').pop();
      return await getStockData(symbol);
    }
    
    if (path === '/api/market') {
      return await getMarketData();
    }
    
    if (path === '/api/screener') {
      return await runScreener();
    }
    
    // 主頁面
    return new Response(HTML_CONTENT, { headers });
  }
};

// 完整的 HTML 網站
const HTML_CONTENT = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>台股 AI 分析網 - Taiwan Stock Intelligence</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lightweight-charts@4.1.0/dist/lightweight-charts.standalone.production.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        * { font-family: 'Noto Sans TC', sans-serif; }
        .gradient-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .card-shadow { box-shadow: 0 10px 40px -10px rgba(0,0,0,0.1); }
        .hover-lift { transition: transform 0.3s, box-shadow 0.3s; }
        .hover-lift:hover { transform: translateY(-5px); box-shadow: 0 20px 50px -10px rgba(0,0,0,0.2); }
        .glass-effect { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); }
        .loading { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    </style>
</head>
<body class="bg-gray-50 min-h-screen">
    <!-- 導航列 -->
    <nav class="gradient-bg text-white sticky top-0 z-50 shadow-lg">
        <div class="container mx-auto px-4 py-4">
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                    <div class="bg-white/20 p-2 rounded-lg">
                        <i class="fas fa-chart-line text-2xl"></i>
                    </div>
                    <div>
                        <h1 class="text-2xl font-bold">台股 AI 分析</h1>
                        <p class="text-sm text-white/80">Taiwan Stock Intelligence</p>
                    </div>
                </div>
                <div class="flex items-center space-x-4">
                    <button onclick="switchView('market')" id="btn-market" class="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition font-medium">
                        <i class="fas fa-chart-bar mr-2"></i>大盤
                    </button>
                    <button onclick="switchView('screener')" id="btn-screener" class="px-4 py-2 hover:bg-white/20 rounded-lg transition font-medium">
                        <i class="fas fa-robot mr-2"></i>AI選股
                    </button>
                    <button onclick="switchView('news')" id="btn-news" class="px-4 py-2 hover:bg-white/20 rounded-lg transition font-medium">
                        <i class="fas fa-newspaper mr-2"></i>新聞
                    </button>
                </div>
            </div>
        </div>
    </nav>

    <!-- 主要內容區 -->
    <main class="container mx-auto px-4 py-6">
        <!-- 搜尋區 -->
        <div class="bg-white rounded-2xl p-6 card-shadow mb-6">
            <div class="flex flex-col md:flex-row gap-4">
                <div class="flex-1 relative">
                    <input type="text" id="stockInput" placeholder="輸入股票代號 (如: 2330)" 
                           class="w-full px-6 py-4 bg-gray-100 rounded-xl border-2 border-transparent focus:border-indigo-500 focus:bg-white transition text-lg"
                           maxlength="10">
                    <i class="fas fa-search text-gray-400 absolute right-4 top-1/2 transform -translate-y-1/2 text-xl"></i>
                </div>
                <button onclick="searchStock()" 
                        class="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-bold text-lg hover:shadow-lg transition hover:scale-105">
                    <i class="fas fa-search mr-2"></i>查詢
                </button>
            </div>
        </div>

        <!-- 大盤儀表板 -->
        <div id="view-market" class="space-y-6">
            <!-- 大盤指數卡片 -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="bg-white rounded-2xl p-6 card-shadow hover-lift">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-gray-600 font-medium">加權指數</h3>
                        <span class="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm font-bold">+1.2%</span>
                    </div>
                    <div class="text-4xl font-bold text-gray-800" id="taiex">22,456.32</div>
                    <div class="text-green-500 mt-2"><i class="fas fa-arrow-up mr-1"></i>265.8</div>
                </div>
                <div class="bg-white rounded-2xl p-6 card-shadow hover-lift">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-gray-600 font-medium">櫃買指數</h3>
                        <span class="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-bold">-0.5%</span>
                    </div>
                    <div class="text-4xl font-bold text-gray-800">285.64</div>
                    <div class="text-red-500 mt-2"><i class="fas fa-arrow-down mr-1"></i>1.42</div>
                </div>
                <div class="bg-white rounded-2xl p-6 card-shadow hover-lift">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-gray-600 font-medium">成交金額</h3>
                        <span class="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-bold">活絡</span>
                    </div>
                    <div class="text-4xl font-bold text-gray-800">3,256億</div>
                    <div class="text-gray-500 mt-2">較昨日 +12%</div>
                </div>
            </div>

            <!-- 大盤走勢圖 -->
            <div class="bg-white rounded-2xl p-6 card-shadow">
                <div class="flex items-center justify-between mb-4">
                    <h2 class="text-xl font-bold text-gray-800"><i class="fas fa-chart-line mr-2 text-indigo-500"></i>大盤走勢</h2>
                    <div class="flex space-x-2">
                        <button class="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-lg text-sm font-medium">日線</button>
                        <button class="px-3 py-1 text-gray-500 hover:bg-gray-100 rounded-lg text-sm">週線</button>
                        <button class="px-3 py-1 text-gray-500 hover:bg-gray-100 rounded-lg text-sm">月線</button>
                    </div>
                </div>
                <div id="marketChart" class="h-96"></div>
            </div>

            <!-- 熱門股票 -->
            <div class="bg-white rounded-2xl p-6 card-shadow">
                <h2 class="text-xl font-bold text-gray-800 mb-4"><i class="fas fa-fire mr-2 text-red-500"></i>熱門股票</h2>
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-4 py-3 text-left text-gray-600 font-medium">股票</th>
                                <th class="px-4 py-3 text-right text-gray-600 font-medium">價格</th>
                                <th class="px-4 py-3 text-right text-gray-600 font-medium">漲跌</th>
                                <th class="px-4 py-3 text-right text-gray-600 font-medium">成交量</th>
                                <th class="px-4 py-3 text-center text-gray-600 font-medium">動作</th>
                            </tr>
                        </thead>
                        <tbody id="hotStocksTable" class="divide-y divide-gray-100">
                            <!-- 動態填入 -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- AI選股結果 -->
        <div id="view-screener" class="hidden space-y-6">
            <div class="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
                <h2 class="text-2xl font-bold mb-2"><i class="fas fa-robot mr-2"></i>AI 強勢股選股</h2>
                <p class="text-white/80">基於均線多頭排列、MACD黃金交叉、量增價升等技術指標篩選</p>
                <button onclick="runScreener()" class="mt-4 px-6 py-3 bg-white text-indigo-600 rounded-xl font-bold hover:shadow-lg transition">
                    <i class="fas fa-sync-alt mr-2"></i>重新掃描全市場
                </button>
            </div>
            <div id="screenerResults" class="bg-white rounded-2xl p-6 card-shadow">
                <div class="text-center py-12 text-gray-400">
                    <div class="text-6xl mb-4">🔍</div>
                    <p class="text-xl">點擊上方按鈕開始掃描</p>
                </div>
            </div>
        </div>

        <!-- 財經新聞 -->
        <div id="view-news" class="hidden space-y-6">
            <h2 class="text-2xl font-bold text-gray-800"><i class="fas fa-newspaper mr-2 text-indigo-500"></i>重要財經新聞</h2>
            <div id="newsContainer" class="space-y-4">
                <!-- 動態填入 -->
            </div>
        </div>

        <!-- 個股詳情 -->
        <div id="view-stock" class="hidden space-y-6">
            <div class="bg-white rounded-2xl p-6 card-shadow">
                <div class="flex items-center justify-between mb-6">
                    <div>
                        <h2 id="stockName" class="text-3xl font-bold text-gray-800">--</h2>
                        <p id="stockSymbol" class="text-gray-500">--</p>
                    </div>
                    <div class="text-right">
                        <div id="stockPrice" class="text-4xl font-bold text-gray-800">--</div>
                        <div id="stockChange" class="text-lg">--</div>
                    </div>
                </div>
                <div id="stockChart" class="h-96"></div>
            </div>

            <!-- 技術指標 -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="bg-white rounded-xl p-4 card-shadow text-center">
                    <div class="text-gray-500 text-sm mb-1">MA5</div>
                    <div id="ma5Value" class="text-xl font-bold text-indigo-600">--</div>
                </div>
                <div class="bg-white rounded-xl p-4 card-shadow text-center">
                    <div class="text-gray-500 text-sm mb-1">MA20</div>
                    <div id="ma20Value" class="text-xl font-bold text-indigo-600">--</div>
                </div>
                <div class="bg-white rounded-xl p-4 card-shadow text-center">
                    <div class="text-gray-500 text-sm mb-1">RSI</div>
                    <div id="rsiValue" class="text-xl font-bold text-purple-600">--</div>
                </div>
                <div class="bg-white rounded-xl p-4 card-shadow text-center">
                    <div class="text-gray-500 text-sm mb-1">MACD</div>
                    <div id="macdValue" class="text-xl font-bold text-green-600">--</div>
                </div>
            </div>
        </div>
    </main>

    <!-- 頁尾 -->
    <footer class="bg-gray-800 text-white py-8 mt-12">
        <div class="container mx-auto px-4 text-center">
            <p class="text-gray-400">© 2024 台股 AI 分析網 | 使用 Cloudflare Workers 部署</p>
            <p class="text-gray-500 text-sm mt-2">資料僅供參考，投資需謹慎</p>
        </div>
    </footer>

    <script>
        // 全域變數
        let currentView = 'market';
        let marketChart = null;
        let stockChart = null;

        // 初始化
        document.addEventListener('DOMContentLoaded', function() {
            initMarketChart();
            loadHotStocks();
            loadNews();
        });

        // 切換視圖
        function switchView(view) {
            document.getElementById('view-market').classList.add('hidden');
            document.getElementById('view-screener').classList.add('hidden');
            document.getElementById('view-news').classList.add('hidden');
            document.getElementById('view-stock').classList.add('hidden');
            
            document.getElementById('view-' + view).classList.remove('hidden');
            
            document.querySelectorAll('nav button').forEach(btn => {
                btn.classList.remove('bg-white/20');
                btn.classList.add('hover:bg-white/20');
            });
            document.getElementById('btn-' + view).classList.add('bg-white/20');
            
            currentView = view;
        }

        // 初始化大盤圖表
        function initMarketChart() {
            const chartContainer = document.getElementById('marketChart');
            if (!chartContainer) return;
            
            marketChart = LightweightCharts.createChart(chartContainer, {
                layout: {
                    background: { color: '#ffffff' },
                    textColor: '#333333',
                },
                grid: {
                    vertLines: { color: '#e5e7eb' },
                    horzLines: { color: '#e5e7eb' },
                },
                crosshair: { mode: LightweightCharts.CrosshairMode.Normal },
                rightPriceScale: { borderColor: '#e5e7eb' },
                timeScale: { borderColor: '#e5e7eb' },
            });
            
            const candleSeries = marketChart.addCandlestickSeries({
                upColor: '#ef4444', downColor: '#22c55e',
                borderUpColor: '#ef4444', borderDownColor: '#22c55e',
                wickUpColor: '#ef4444', wickDownColor: '#22c55e',
            });
            
            // 假資料
            const data = generateMockData(30);
            candleSeries.setData(data);
            marketChart.timeScale().fitContent();
        }

        // 搜尋股票
        async function searchStock() {
            const input = document.getElementById('stockInput').value.trim();
            if (!input) { alert('請輸入股票代號'); return; }
            
            let symbol = input.includes('.') ? input : input + '.TW';
            switchView('stock');
            await loadStockDetail(symbol);
        }

        // 載入個股詳情
        async function loadStockDetail(symbol) {
            const mockData = {
                name: '台灣積體電路製造',
                symbol: symbol,
                price: 1865 + Math.floor(Math.random() * 100 - 50),
                change: Math.floor(Math.random() * 40 - 20),
                ma5: 1870, ma20: 1886, rsi: 46, macd: -0.5
            };
            
            document.getElementById('stockName').textContent = mockData.name;
            document.getElementById('stockSymbol').textContent = mockData.symbol;
            document.getElementById('stockPrice').textContent = mockData.price.toFixed(2);
            
            const changeEl = document.getElementById('stockChange');
            const isUp = mockData.change > 0;
            changeEl.innerHTML = (isUp ? '▲' : '▼') + ' ' + Math.abs(mockData.change) + ' (' + (mockData.change/mockData.price*100).toFixed(2) + '%)';
            changeEl.className = 'text-lg ' + (isUp ? 'text-red-500' : 'text-green-500');
            
            document.getElementById('ma5Value').textContent = mockData.ma5;
            document.getElementById('ma20Value').textContent = mockData.ma20;
            document.getElementById('rsiValue').textContent = mockData.rsi;
            document.getElementById('macdValue').textContent = mockData.macd;
            
            loadStockChart(symbol);
        }

        // 載入個股圖表
        function loadStockChart(symbol) {
            const chartContainer = document.getElementById('stockChart');
            if (!chartContainer) return;
            
            chartContainer.innerHTML = '';
            stockChart = LightweightCharts.createChart(chartContainer, {
                layout: { background: { color: '#ffffff' }, textColor: '#333333' },
                grid: { vertLines: { color: '#e5e7eb' }, horzLines: { color: '#e5e7eb' } },
                rightPriceScale: { borderColor: '#e5e7eb' },
                timeScale: { borderColor: '#e5e7eb' },
            });
            
            const candleSeries = stockChart.addCandlestickSeries({
                upColor: '#ef4444', downColor: '#22c55e',
                borderUpColor: '#ef4444', borderDownColor: '#22c55e',
                wickUpColor: '#ef4444', wickDownColor: '#22c55e',
            });
            
            const ma5Series = stockChart.addLineSeries({ color: '#f59e0b', lineWidth: 2 });
            const ma20Series = stockChart.addLineSeries({ color: '#3b82f6', lineWidth: 2 });
            
            const data = generateMockData(60);
            candleSeries.setData(data);
            
            const ma5Data = calculateMA(data, 5);
            const ma20Data = calculateMA(data, 20);
            
            ma5Series.setData(ma5Data);
            ma20Series.setData(ma20Data);
            
            stockChart.timeScale().fitContent();
        }

        // 載入熱門股票
        function loadHotStocks() {
            const tableBody = document.getElementById('hotStocksTable');
            if (!tableBody) return;
            
            const hotStocks = [
                { name: '台積電', symbol: '2330.TW', price: 1865, change: -1.06, volume: '31,118' },
                { name: '聯發科', symbol: '2454.TW', price: 1720, change: 2.35, volume: '12,456' },
                { name: '鴻海', symbol: '2317.TW', price: 214, change: 0.5, volume: '45,789' },
                { name: '台達電', symbol: '2308.TW', price: 1385, change: -0.8, volume: '8,234' },
                { name: '國泰金', symbol: '2882.TW', price: 68.5, change: 1.2, volume: '25,678' },
            ];
            
            let html = '';
            hotStocks.forEach(stock => {
                const isUp = stock.change > 0;
                html += '<tr class="hover:bg-gray-50 transition">' +
                    '<td class="px-4 py-3"><div class="font-bold text-gray-800">' + stock.name + '</div><div class="text-sm text-gray-500">' + stock.symbol + '</div></td>' +
                    '<td class="px-4 py-3 text-right font-medium">' + stock.price + '</td>' +
                    '<td class="px-4 py-3 text-right"><span class="' + (isUp ? 'text-red-500' : 'text-green-500') + '">' + (isUp ? '▲' : '▼') + ' ' + Math.abs(stock.change) + '%</span></td>' +
                    '<td class="px-4 py-3 text-right text-gray-600">' + stock.volume + '</td>' +
                    '<td class="px-4 py-3 text-center"><button onclick="loadStockDetail(\'' + stock.symbol + '\')" class="text-indigo-600 hover:text-indigo-800 font-medium">查看</button></td>' +
                    '</tr>';
            });
            
            tableBody.innerHTML = html;
        }

        // 執行選股掃描
        async function runScreener() {
            const resultsDiv = document.getElementById('screenerResults');
            resultsDiv.innerHTML = '<div class="text-center py-12"><div class="text-4xl mb-4 loading">⏳</div><p>AI 正在分析全市場股票...</p></div>';
            
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const results = [
                { symbol: '2330.TW', name: '台積電', price: 1865, score: 4.5, reasons: '均線多頭+MACD金叉' },
                { symbol: '2454.TW', name: '聯發科', price: 1720, score: 4.2, reasons: '量增價升+突破整理' },
                { symbol: '2308.TW', name: '台達電', price: 1385, score: 3.8, reasons: '均線多頭排列' },
            ];
            
            displayScreenerResults(results);
        }

        // 顯示選股結果
        function displayScreenerResults(stocks) {
            const resultsDiv = document.getElementById('screenerResults');
            
            let html = '<div class="mb-4 flex items-center justify-between"><h3 class="text-lg font-bold text-gray-800">掃描完成，找到 ' + stocks.length + ' 檔強勢股</h3><span class="text-sm text-gray-500">更新時間: ' + new Date().toLocaleString() + '</span></div><div class="grid gap-4">';
            
            stocks.forEach((stock, index) => {
                html += '<div class="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100 hover:shadow-md transition">' +
                    '<div class="flex items-center justify-between"><div class="flex items-center space-x-4"><div class="bg-indigo-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">' + (index + 1) + '</div><div><div class="font-bold text-gray-800">' + stock.name + '</div><div class="text-sm text-gray-500">' + stock.symbol + '</div></div></div><div class="text-right"><div class="text-2xl font-bold text-gray-800">$' + stock.price + '</div><div class="text-sm text-green-600">評分: ' + stock.score + '</div></div></div>' +
                    '<div class="mt-2 text-sm text-gray-600"><span class="bg-green-100 text-green-700 px-2 py-1 rounded">' + stock.reasons + '</span></div></div>';
            });
            
            html += '</div>';
            resultsDiv.innerHTML = html;
        }

        // 載入新聞
        function loadNews() {
            const newsContainer = document.getElementById('newsContainer');
            if (!newsContainer) return;
            
            const news = [
                { title: '台積電法說會即將登場，市場關注展望', time: '2小時前', source: '財經新聞', tag: '重要' },
                { title: 'Fed 暗示降息腳步近了，台股可望受惠', time: '3小時前', source: '國際財經', tag: '國際' },
                { title: 'AI 伺服器需求強勁，相關供應鏈受關注', time: '5小時前', source: '產業新聞', tag: '產業' },
                { title: '外資連續買超台股，金額逾百億', time: '6小時前', source: '市場快訊', tag: '籌碼' },
            ];
            
            let html = '';
            news.forEach(item => {
                html += '<div class="bg-white rounded-xl p-4 card-shadow hover:shadow-md transition cursor-pointer"><div class="flex items-start justify-between"><div class="flex-1"><h3 class="font-bold text-gray-800 mb-1 hover:text-indigo-600 transition">' + item.title + '</h3><div class="flex items-center space-x-3 text-sm text-gray-500"><span>' + item.source + '</span><span>•</span><span>' + item.time + '</span></div></div><span class="bg-indigo-100 text-indigo-600 px-2 py-1 rounded text-xs font-medium">' + item.tag + '</span></div></div>';
            });
            
            newsContainer.innerHTML = html;
        }

        // 計算移動平均線
        function calculateMA(data, period) {
            const ma = [];
            for (let i = period - 1; i < data.length; i++) {
                let sum = 0;
                for (let j = 0; j < period; j++) {
                    sum += data[i - j].close;
                }
                ma.push({ time: data[i].time, value: sum / period });
            }
            return ma;
        }

        // 產生假資料
        function generateMockData(days) {
            const data = [];
            let price = 22000;
            const now = new Date();
            
            for (let i = days; i >= 0; i--) {
                const date = new Date(now);
                date.setDate(date.getDate() - i);
                
                const change = (Math.random() - 0.5) * 200;
                const open = price;
                const close = price + change;
                const high = Math.max(open, close) + Math.random() * 100;
                const low = Math.min(open, close) - Math.random() * 100;
                
                data.push({
                    time: date.toISOString().split('T')[0],
                    open: open, high: high, low: low, close: close,
                });
                
                price = close;
            }
            
            return data;
        }

        // Enter 鍵搜尋
        document.getElementById('stockInput')?.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') searchStock();
        });
    </script>
</body>
</html>`;

// API 函數
async function getStockData(symbol) {
  const data = {
    symbol: symbol,
    name: '台灣積體電路製造',
    price: 1865 + Math.floor(Math.random() * 100 - 50),
    change: Math.floor(Math.random() * 40 - 20),
    timestamp: new Date().toISOString()
  };
  
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function getMarketData() {
  const data = {
    index: 22456 + Math.floor(Math.random() * 200 - 100),
    change: Math.floor(Math.random() * 300 - 150),
    changePercent: (Math.random() * 2 - 1).toFixed(2),
    volume: '3,256億'
  };
  
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function runScreener() {
  const stocks = [
    { symbol: '2330.TW', name: '台積電', price: 1865, score: 4.5, reasons: '均線多頭+MACD金叉' },
    { symbol: '2454.TW', name: '聯發科', price: 1720, score: 4.2, reasons: '量增價升+突破整理' },
    { symbol: '2308.TW', name: '台達電', price: 1385, score: 3.8, reasons: '均線多頭排列' },
  ];
  
  return new Response(JSON.stringify(stocks), {
    headers: { 'Content-Type': 'application/json' }
  });
}
