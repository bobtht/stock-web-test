// 台股 AI 分析網 - 前端 JavaScript

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
    // 隱藏所有視圖
    document.getElementById('view-market').classList.add('hidden');
    document.getElementById('view-screener').classList.add('hidden');
    document.getElementById('view-news').classList.add('hidden');
    document.getElementById('view-stock').classList.add('hidden');
    
    // 顯示選中的視圖
    document.getElementById(`view-${view}`).classList.remove('hidden');
    
    // 更新按鈕樣式
    document.querySelectorAll('nav button').forEach(btn => {
        btn.classList.remove('bg-white/20');
        btn.classList.add('hover:bg-white/20');
    });
    document.getElementById(`btn-${view}`).classList.add('bg-white/20');
    
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
        crosshair: {
            mode: LightweightCharts.CrosshairMode.Normal,
        },
        rightPriceScale: {
            borderColor: '#e5e7eb',
        },
        timeScale: {
            borderColor: '#e5e7eb',
        },
    });
    
    const candleSeries = marketChart.addCandlestickSeries({
        upColor: '#ef4444',
        downColor: '#22c55e',
        borderUpColor: '#ef4444',
        borderDownColor: '#22c55e',
        wickUpColor: '#ef4444',
        wickDownColor: '#22c55e',
    });
    
    // 載入大盤資料
    loadMarketData(candleSeries);
}

// 載入大盤資料
async function loadMarketData(series) {
    try {
        // 這裡會呼叫你的 API
        // const response = await fetch('/api/market/index');
        // const data = await response.json();
        
        // 暫時使用假資料
        const data = generateMockData(30);
        series.setData(data);
        marketChart.timeScale().fitContent();
    } catch (error) {
        console.error('載入大盤資料失敗:', error);
    }
}

// 搜尋股票
async function searchStock() {
    const input = document.getElementById('stockInput').value.trim();
    if (!input) {
        alert('請輸入股票代號');
        return;
    }
    
    // 處理輸入（支援代號或名稱）
    let symbol = input;
    if (!input.includes('.')) {
        symbol = input + '.TW';
    }
    
    switchView('stock');
    await loadStockDetail(symbol);
}

// 載入個股詳情
async function loadStockDetail(symbol) {
    try {
        // 這裡會呼叫你的 API
        // const response = await fetch(`/api/stock/${symbol}`);
        // const data = await response.json();
        
        // 暫時使用假資料
        const mockData = {
            name: '台灣積體電路製造',
            symbol: symbol,
            price: 1865,
            change: -20,
            changePercent: -1.06,
            ma5: 1870,
            ma20: 1886,
            rsi: 46,
            macd: -0.5
        };
        
        // 更新UI
        document.getElementById('stockName').textContent = mockData.name;
        document.getElementById('stockSymbol').textContent = mockData.symbol;
        document.getElementById('stockPrice').textContent = mockData.price.toFixed(2);
        
        const changeEl = document.getElementById('stockChange');
        changeEl.textContent = `${mockData.change > 0 ? '▲' : '▼'} ${Math.abs(mockData.change)} (${mockData.changePercent}%)`;
        changeEl.className = `text-lg ${mockData.change > 0 ? 'text-red-500' : 'text-green-500'}`;
        
        document.getElementById('ma5Value').textContent = mockData.ma5;
        document.getElementById('ma20Value').textContent = mockData.ma20;
        document.getElementById('rsiValue').textContent = mockData.rsi;
        document.getElementById('macdValue').textContent = mockData.macd;
        
        // 載入圖表
        loadStockChart(symbol);
        
    } catch (error) {
        console.error('載入個股資料失敗:', error);
        alert('無法載入股票資料');
    }
}

// 載入個股圖表
function loadStockChart(symbol) {
    const chartContainer = document.getElementById('stockChart');
    if (!chartContainer) return;
    
    chartContainer.innerHTML = '';
    
    stockChart = LightweightCharts.createChart(chartContainer, {
        layout: {
            background: { color: '#ffffff' },
            textColor: '#333333',
        },
        grid: {
            vertLines: { color: '#e5e7eb' },
            horzLines: { color: '#e5e7eb' },
        },
        rightPriceScale: {
            borderColor: '#e5e7eb',
        },
        timeScale: {
            borderColor: '#e5e7eb',
        },
    });
    
    const candleSeries = stockChart.addCandlestickSeries({
        upColor: '#ef4444',
        downColor: '#22c55e',
        borderUpColor: '#ef4444',
        borderDownColor: '#22c55e',
        wickUpColor: '#ef4444',
        wickDownColor: '#22c55e',
    });
    
    // 加入均線
    const ma5Series = stockChart.addLineSeries({
        color: '#f59e0b',
        lineWidth: 2,
        title: 'MA5',
    });
    
    const ma20Series = stockChart.addLineSeries({
        color: '#3b82f6',
        lineWidth: 2,
        title: 'MA20',
    });
    
    // 載入資料
    const data = generateMockData(60);
    candleSeries.setData(data);
    
    // 計算均線
    const ma5Data = calculateMA(data, 5);
    const ma20Data = calculateMA(data, 20);
    
    ma5Series.setData(ma5Data);
    ma20Series.setData(ma20Data);
    
    stockChart.timeScale().fitContent();
}

// 載入熱門股票
async function loadHotStocks() {
    const tableBody = document.getElementById('hotStocksTable');
    if (!tableBody) return;
    
    // 暫時使用假資料
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
        html += `
            <tr class="hover:bg-gray-50 transition">
                <td class="px-4 py-3">
                    <div class="font-bold text-gray-800">${stock.name}</div>
                    <div class="text-sm text-gray-500">${stock.symbol}</div>
                </td>
                <td class="px-4 py-3 text-right font-medium">${stock.price}</td>
                <td class="px-4 py-3 text-right">
                    <span class="${isUp ? 'text-red-500' : 'text-green-500'}">
                        ${isUp ? '▲' : '▼'} ${Math.abs(stock.change)}%
                    </span>
                </td>
                <td class="px-4 py-3 text-right text-gray-600">${stock.volume}</td>
                <td class="px-4 py-3 text-center">
                    <button onclick="loadStockDetail('${stock.symbol}')" class="text-indigo-600 hover:text-indigo-800 font-medium">
                        查看
                    </button>
                </td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = html;
}

// 執行選股掃描
async function runScreener() {
    const resultsDiv = document.getElementById('screenerResults');
    resultsDiv.innerHTML = '<div class="text-center py-12"><div class="text-4xl mb-4">⏳</div><p>AI 正在分析全市場股票...</p></div>';
    
    try {
        // 這裡會呼叫你的 Python 腳本
        // const response = await fetch('/api/screener/run', { method: 'POST' });
        // const results = await response.json();
        
        // 暫時使用假資料
        await new Promise(resolve => setTimeout(resolve, 2000)); // 模擬載入時間
        
        const results = [
            { symbol: '2330.TW', name: '台積電', price: 1865, score: 4.5, reasons: '均線多頭+MACD金叉' },
            { symbol: '2454.TW', name: '聯發科', price: 1720, score: 4.2, reasons: '量增價升+突破整理' },
            { symbol: '2308.TW', name: '台達電', price: 1385, score: 3.8, reasons: '均線多頭排列' },
        ];
        
        displayScreenerResults(results);
    } catch (error) {
        console.error('選股掃描失敗:', error);
        resultsDiv.innerHTML = '<div class="text-center py-12 text-red-500">掃描失敗，請稍後再試</div>';
    }
}

// 顯示選股結果
function displayScreenerResults(stocks) {
    const resultsDiv = document.getElementById('screenerResults');
    
    let html = `
        <div class="mb-4 flex items-center justify-between">
            <h3 class="text-lg font-bold text-gray-800">掃描完成，找到 ${stocks.length} 檔強勢股</h3>
            <span class="text-sm text-gray-500">更新時間: ${new Date().toLocaleString()}</span>
        </div>
        <div class="grid gap-4">
    `;
    
    stocks.forEach((stock, index) => {
        html += `
            <div class="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100 hover:shadow-md transition">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                        <div class="bg-indigo-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                            ${index + 1}
                        </div>
                        <div>
                            <div class="font-bold text-gray-800">${stock.name}</div>
                            <div class="text-sm text-gray-500">${stock.symbol}</div>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="text-2xl font-bold text-gray-800">$${stock.price}</div>
                        <div class="text-sm text-green-600">評分: ${stock.score}</div>
                    </div>
                </div>
                <div class="mt-2 text-sm text-gray-600">
                    <span class="bg-green-100 text-green-700 px-2 py-1 rounded">${stock.reasons}</span>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    resultsDiv.innerHTML = html;
}

// 載入新聞
async function loadNews() {
    const newsContainer = document.getElementById('newsContainer');
    if (!newsContainer) return;
    
    // 暫時使用假資料
    const news = [
        { title: '台積電法說會即將登場，市場關注展望', time: '2小時前', source: '財經新聞', tag: '重要' },
        { title: 'Fed 暗示降息腳步近了，台股可望受惠', time: '3小時前', source: '國際財經', tag: '國際' },
        { title: 'AI 伺服器需求強勁，相關供應鏈受關注', time: '5小時前', source: '產業新聞', tag: '產業' },
        { title: '外資連續買超台股，金額逾百億', time: '6小時前', source: '市場快訊', tag: '籌碼' },
    ];
    
    let html = '';
    news.forEach(item => {
        html += `
            <div class="bg-white rounded-xl p-4 card-shadow hover:shadow-md transition cursor-pointer">
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <h3 class="font-bold text-gray-800 mb-1 hover:text-indigo-600 transition">${item.title}</h3>
                        <div class="flex items-center space-x-3 text-sm text-gray-500">
                            <span>${item.source}</span>
                            <span>•</span>
                            <span>${item.time}</span>
                        </div>
                    </div>
                    <span class="bg-indigo-100 text-indigo-600 px-2 py-1 rounded text-xs font-medium">
                        ${item.tag}
                    </span>
                </div>
            </div>
        `;
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
        ma.push({
            time: data[i].time,
            value: sum / period,
        });
    }
    return ma;
}

// 產生假資料（測試用）
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
            open: open,
            high: high,
            low: low,
            close: close,
        });
        
        price = close;
    }
    
    return data;
}

// Enter 鍵搜尋
document.getElementById('stockInput')?.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchStock();
    }
});
