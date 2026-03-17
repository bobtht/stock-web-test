// 台股 AI 分析 - 主程式

const HOT_STOCKS = [
    { symbol: '2330.TW', name: '台積電' },
    { symbol: '2317.TW', name: '鴻海' },
    { symbol: '2454.TW', name: '聯發科' },
    { symbol: '2308.TW', name: '台達電' },
    { symbol: '2881.TW', name: '富邦金' },
    { symbol: '2882.TW', name: '國泰金' },
];

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    loadMarketData();
    renderHotStocks();
    loadScreenerCount();
});

// 搜尋股票
function searchStock() {
    const input = document.getElementById('stockInput');
    const symbol = input.value.trim();
    
    if (!symbol) {
        alert('請輸入股票代號');
        return;
    }
    
    const fullSymbol = symbol.includes('.') ? symbol : symbol + '.TW';
    window.location.href = `/stock.html?symbol=${fullSymbol}`;
}

// 載入大盤資料
async function loadMarketData() {
    try {
        const response = await fetch('/api/market');
        const data = await response.json();
        
        document.getElementById('taiex').textContent = data.taiex.index.toLocaleString();
        const taiexChange = document.getElementById('taiex-change');
        taiexChange.textContent = `${data.taiex.change > 0 ? '+' : ''}${data.taiex.change} (${data.taiex.changePercent}%)`;
        taiexChange.className = `mt-2 ${data.taiex.change > 0 ? 'text-red-500' : 'text-green-500'}`;
        
        document.getElementById('otc').textContent = data.otc.index.toFixed(2);
        const otcChange = document.getElementById('otc-change');
        otcChange.textContent = `${data.otc.change > 0 ? '+' : ''}${data.otc.change} (${data.otc.changePercent}%)`;
        otcChange.className = `mt-2 ${data.otc.change > 0 ? 'text-red-500' : 'text-green-500'}`;
    } catch (error) {
        console.error('載入大盤資料失敗:', error);
    }
}

// 載入選股數量
async function loadScreenerCount() {
    try {
        // 這裡可以連接到你的選股結果
        document.getElementById('strong-count').textContent = '51';
    } catch (error) {
        console.error('載入選股數量失敗:', error);
    }
}

// 渲染熱門股票
function renderHotStocks() {
    const container = document.getElementById('hot-stocks');
    
    HOT_STOCKS.forEach(stock => {
        const div = document.createElement('div');
        div.className = 'bg-gray-100 rounded-xl p-4 text-center cursor-pointer hover:bg-indigo-100 transition';
        div.onclick = () => window.location.href = `/stock.html?symbol=${stock.symbol}`;
        div.innerHTML = `
            <div class="font-bold text-gray-800">${stock.name}</div>
            <div class="text-sm text-gray-500">${stock.symbol}</div>
        `;
        container.appendChild(div);
    });
}

// Enter 鍵搜尋
document.getElementById('stockInput')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchStock();
});