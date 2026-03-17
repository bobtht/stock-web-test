// Cloudflare Worker - 台股分析 API 連接器
// 連接 Python 分析腳本

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    };
    
    try {
      // API: 取得個股資料
      if (path.startsWith('/api/stock/')) {
        const symbol = path.split('/').pop();
        const data = await fetchStockFromPython(symbol, env);
        return new Response(JSON.stringify(data), { headers });
      }
      
      // API: 執行選股掃描
      if (path === '/api/screener/run') {
        const results = await runPythonScreener(env);
        return new Response(JSON.stringify(results), { headers });
      }
      
      // API: 取得大盤資料
      if (path === '/api/market') {
        const data = await fetchMarketData(env);
        return new Response(JSON.stringify(data), { headers });
      }
      
      // 主頁面
      return new Response(HTML_CONTENT, { 
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
      
    } catch (error) {
      console.error('API Error:', error);
      return new Response(JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }), { 
        status: 500, 
        headers 
      });
    }
  }
};

// 從 Python 腳本取得股票資料
async function fetchStockFromPython(symbol, env) {
  // 方法 1: 如果 Python 腳本有 HTTP API
  // const response = await fetch(`http://你的伺服器:port/api/stock/${symbol}`);
  // return await response.json();
  
  // 方法 2: 使用快取的資料（從 SQLite 資料庫）
  // 這裡先回傳模擬資料，之後可以連接真實資料
  
  const mockData = {
    symbol: symbol,
    name: getStockName(symbol),
    price: 1865 + Math.floor(Math.random() * 100 - 50),
    open: 1840,
    high: 1885,
    low: 1840,
    close: 1865,
    volume: 31118,
    change: -20,
    changePercent: -1.06,
    ma5: 1870,
    ma20: 1886,
    ma60: 1712,
    rsi: 46,
    macd: -0.5,
    kdj_k: 45,
    kdj_d: 42,
    timestamp: new Date().toISOString(),
    // K線資料（最近 60 天）
    candles: generateCandleData(60, symbol)
  };
  
  return mockData;
}

// 執行 Python 選股掃描
async function runPythonScreener(env) {
  // 這裡會呼叫你的 Python StockScreener
  // 暫時回傳模擬結果
  
  const results = {
    timestamp: new Date().toISOString(),
    totalScanned: 1080,
    selected: [
      { 
        symbol: '2330.TW', 
        name: '台積電', 
        price: 1865, 
        score: 4.5, 
        reasons: '均線多頭排列、MACD黃金交叉、量增價升',
        support: 1800,
        resistance: 1900
      },
      { 
        symbol: '2454.TW', 
        name: '聯發科', 
        price: 1720, 
        score: 4.2, 
        reasons: '量增價升、突破整理區間',
        support: 1650,
        resistance: 1800
      },
      { 
        symbol: '2308.TW', 
        name: '台達電', 
        price: 1385, 
        score: 3.8, 
        reasons: '均線多頭排列、法人買超',
        support: 1350,
        resistance: 1450
      },
    ],
    marketStatus: '偏多',
    recommendation: '可逢低布局績績股，設好停損'
  };
  
  return results;
}

// 取得大盤資料
async function fetchMarketData(env) {
  return {
    taiex: {
      index: 22456 + Math.floor(Math.random() * 200 - 100),
      change: Math.floor(Math.random() * 300 - 150),
      changePercent: (Math.random() * 2 - 1).toFixed(2),
      volume: '3,256億'
    },
    otc: {
      index: 285 + Math.floor(Math.random() * 10 - 5),
      change: Math.floor(Math.random() * 5 - 2),
      changePercent: (Math.random() * 1 - 0.5).toFixed(2),
    },
    updateTime: new Date().toISOString()
  };
}

// 輔助函數：取得股票名稱
function getStockName(symbol) {
  const names = {
    '2330.TW': '台灣積體電路製造',
    '2454.TW': '聯發科技',
    '2317.TW': '鴻海精密',
    '2308.TW': '台達電子',
    '2881.TW': '富邦金融',
    '2882.TW': '國泰金融',
    '0050.TW': '台灣50',
    '0056.TW': '台灣高股息'
  };
  return names[symbol] || '未知股票';
}

// 產生 K線資料
function generateCandleData(days, symbol) {
  const data = [];
  let basePrice = symbol === '2330.TW' ? 1865 : 
                  symbol === '2454.TW' ? 1720 : 
                  symbol === '0050.TW' ? 75 : 100;
  
  const now = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    const volatility = basePrice * 0.02;
    const change = (Math.random() - 0.5) * volatility;
    const open = basePrice;
    const close = basePrice + change;
    const high = Math.max(open, close) + Math.random() * volatility * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * 0.5;
    
    data.push({
      time: date.toISOString().split('T')[0],
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume: Math.floor(Math.random() * 1000000) + 500000
    });
    
    basePrice = close;
  }
  
  return data;
}

// HTML 內容（完整版）
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

    <!-- 主要內容 -->
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
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="bg-white rounded-2xl p-6 card-shadow hover-lift">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-gray-600 font-medium">加權指數</h3>
                        <span id="taiex-badge" class="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm font-bold">--</span>
                    </div>
                    <div class="text-4xl font-bold text-gray-800" id="taiex-value">--</div>
                    <div class="text-green-500 mt-2" id="taiex-change">--</div>
                </div>
                <div class="bg-white rounded-2xl p-6 card-shadow hover-lift">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-gray-600 font-medium">櫃買指數</h3>
                        <span id="otc-badge" class="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-bold">--</span>
                    </div>
                    <div class="text-4xl font-bold text-gray-800" id="otc-value">--</div>
                    <div class="text-gray-500 mt-2" id="otc-change">--</div>
                </div>
                <div class="bg-white rounded-2xl p-6 card-shadow hover-lift">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-gray-600 font-medium">成交金額</h3>
                        <span class="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-bold">活絡</span>
                    </div>
                    <div class="text-4xl font-bold text-gray-800" id="volume-value">--</div>
                    <div class="text-gray-500 mt-2">大盤成交</div>
                </div>
            </div>

            <div class="bg-white rounded-2xl p-6 card-shadow">
                <div class="flex items-center justify-between mb-4">
                    <h2 class="text-xl font-bold text-gray-800"><i class="fas fa-chart-line mr-2 text-indigo-500"></i>大盤走勢</h2>
                </div>
                <div id="marketChart" class="h-96"></div>
            </div>
        </div>

        <!-- AI選股 -->
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

        <!-- 新聞 -->
        <div id="view-news" class="hidden space-y-6">
            <h2 class="text-2xl font-bold text-gray-800"><i class="fas fa-newspaper mr-2 text-indigo-500"></i>重要財經新聞</h2>
            <div id="newsContainer" class="space-y-4"></div>
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

    <footer class="bg-gray-800 text-white py-8 mt-12">
        <div class="container mx-auto px-4 text-center">
            <p class="text-gray-400">© 2024 台股 AI 分析網 | 使用 Cloudflare Workers 部署</p>
        </div>
    </footer>

    <script>
        // JavaScript 邏輯
        let currentView = 'market';
        let marketChart = null;
        let stockChart = null;

        document.addEventListener('DOMContentLoaded', function() {
            initMarketChart();
            loadMarketData();
            loadNews();
        });

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

        // 載入大盤資料
        async function loadMarketData() {
            try {
                const response = await fetch('/api/market');
                const data = await response.json();
                
                document.getElementById('taiex-value').textContent = data.taiex.index.toLocaleString();
                document.getElementById('taiex-change').textContent = 
                    (data.taiex.change > 0 ? '▲ ' : '▼ ') + Math.abs(data.taiex.change);
                document.getElementById('taiex-change').className = 
                    data.taiex.change > 0 ? 'text-red-500 mt-2' : 'text-green-500 mt-2';
                document.getElementById('taiex-badge').textContent = 
                    (data.taiex.changePercent > 0 ? '+' : '') + data.taiex.changePercent + '%';
                document.getElementById('taiex-badge').className = 
                    data.taiex.changePercent > 0 ? 
                    'bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-bold' :
                    'bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm font-bold';
                
                document.getElementById('otc-value').textContent = data.otc.index.toFixed(2);
                document.getElementById('otc-change').textContent = 
                    (data.otc.change > 0 ? '▲ ' : '▼ ') + Math.abs(data.otc.change);
                document.getElementById('volume-value').textContent = data.taiex.volume;
                
            } catch (error) {
                console.error('載入大盤資料失敗:', error);
            }
        }

        // 初始化圖表
        function initMarketChart() {
            const chartContainer = document.getElementById('marketChart');
            if (!chartContainer) return;
            
            marketChart = LightweightCharts.createChart(chartContainer, {
                layout: { background: { color: '#ffffff' }, textColor: '#333333' },
                grid: { vertLines: { color: '#e5e7eb' }, horzLines: { color: '#e5e7eb' } },
                crosshair: { mode: LightweightCharts.CrosshairMode.Normal },
            });
            
            const candleSeries = marketChart.addCandlestickSeries({
                upColor: '#ef4444', downColor: '#22c55e',
                borderUpColor: '#ef4444', borderDownColor: '#22c55e',
                wickUpColor: '#ef4444', wickDownColor: '#22c55e',
            });
            
            // 載入資料
            fetch('/api/market')
                .then(r => r.json())
                .then(data => {
                    // 這裡可以顯示大盤走勢
                });
        }

        // 搜尋股票
        async function searchStock() {
            const input = document.getElementById('stockInput').value.trim();
            if (!input) { alert('請輸入股票代號'); return; }
            
            const symbol = input.includes('.') ? input : input + '.TW';
            switchView('stock');
            
            try {
                const response = await fetch('/api/stock/' + symbol);
                const data = await response.json();
                
                document.getElementById('stockName').textContent = data.name;
                document.getElementById('stockSymbol').textContent = data.symbol;
                document.getElementById('stockPrice').textContent = data.close.toFixed(2);
                
                const changeEl = document.getElementById('stockChange');
                const isUp = data.change >= 0;
                changeEl.innerHTML = (isUp ? '▲ ' : '▼ ') + Math.abs(data.change) + ' (' + data.changePercent + '%)';
                changeEl.className = 'text-lg ' + (isUp ? 'text-red-500' : 'text-green-500');
                
                document.getElementById('ma5Value').textContent = data.ma5;
                document.getElementById('ma20Value').textContent = data.ma20;
                document.getElementById('rsiValue').textContent = data.rsi;
                document.getElementById('macdValue').textContent = data.macd;
                
                // 繪製圖表
                drawStockChart(data.candles);
                
            } catch (error) {
                console.error('載入股票資料失敗:', error);
            }
        }

        // 繪製個股圖表
        function drawStockChart(candles) {
            const chartContainer = document.getElementById('stockChart');
            if (!chartContainer) return;
            
            chartContainer.innerHTML = '';
            stockChart = LightweightCharts.createChart(chartContainer, {
                layout: { background: { color: '#ffffff' }, textColor: '#333333' },
                grid: { vertLines: { color: '#e5e7eb' }, horzLines: { color: '#e5e7eb' } },
            });
            
            const candleSeries = stockChart.addCandlestickSeries({
                upColor: '#ef4444', downColor: '#22c55e',
                borderUpColor: '#ef4444', borderDownColor: '#22c55e',
                wickUpColor: '#ef4444', wickDownColor: '#22c55e',
            });
            
            candleSeries.setData(candles);
            stockChart.timeScale().fitContent();
        }

        // 執行選股掃描
        async function runScreener() {
            const resultsDiv = document.getElementById('screenerResults');
            resultsDiv.innerHTML = '<div class="text-center py-12"><div class="text-4xl mb-4 loading">⏳</div><p>AI 正在分析全市場股票...</p></div>';
            
            try {
                const response = await fetch('/api/screener/run');
                const data = await response.json();
                
                let html = '<div class="mb-4 flex items-center justify-between">' +
                    '<h3 class="text-lg font-bold text-gray-800">掃描完成，找到 ' + data.selected.length + ' 檔強勢股</h3>' +
                    '<span class="text-sm text-gray-500">更新時間: ' + new Date(data.timestamp).toLocaleString() + '</span></div>' +
                    '<div class="grid gap-4">';
                
                data.selected.forEach((stock, index) => {
                    html += '<div class="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">' +
                        '<div class="flex items-center justify-between">' +
                        '<div class="flex items-center space-x-4">' +
                        '<div class="bg-indigo-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">' + (index + 1) + '</div>' +
                        '<div><div class="font-bold text-gray-800">' + stock.name + '</div><div class="text-sm text-gray-500">' + stock.symbol + '</div></div></div>' +
                        '<div class="text-right"><div class="text-2xl font-bold text-gray-800">$' + stock.price + '</div>' +
                        '<div class="text-sm text-green-600">評分: ' + stock.score + '</div></div></div>' +
                        '<div class="mt-2 text-sm text-gray-600"><span class="bg-green-100 text-green-700 px-2 py-1 rounded">' + stock.reasons + '</span></div>' +
                        '<div class="mt-2 text-xs text-gray-500">支撐: $' + stock.support + ' | 壓力: $' + stock.resistance + '</div></div>';
                });
                
                html += '</div>';
                resultsDiv.innerHTML = html;
                
            } catch (error) {
                resultsDiv.innerHTML = '<div class="text-center py-12 text-red-500">掃描失敗，請稍後再試</div>';
            }
        }

        // 載入新聞
        function loadNews() {
            const newsContainer = document.getElementById('newsContainer');
            if (!newsContainer) return;
            
            const news = [
                { title: '台積電法說會即將登場，市場關注展望', time: '2小時前', source: '財經新聞', tag: '重要' },
                { title: 'Fed 暗示降息腳步近了，台股可望受惠', time: '3小時前', source: '國際財經', tag: '國際' },
                { title: 'AI 伺服器需求強勁，相關供應鏈受關注', time: '5小時前', source: '產業新聞', tag: '產業' },
            ];
            
            let html = '';
            news.forEach(item => {
                html += '<div class="bg-white rounded-xl p-4 card-shadow hover:shadow-md transition cursor-pointer">' +
                    '<div class="flex items-start justify-between"><div class="flex-1">' +
                    '<h3 class="font-bold text-gray-800 mb-1 hover:text-indigo-600 transition">' + item.title + '</h3>' +
                    '<div class="flex items-center space-x-3 text-sm text-gray-500">' +
                    '<span>' + item.source + '</span><span>•</span><span>' + item.time + '</span></div></div>' +
                    '<span class="bg-indigo-100 text-indigo-600 px-2 py-1 rounded text-xs font-medium">' + item.tag + '</span></div></div>';
            });
            
            newsContainer.innerHTML = html;
        }

        // Enter 鍵搜尋
        document.getElementById('stockInput')?.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') searchStock();
        });
    </script>
</body>
</html>`;
