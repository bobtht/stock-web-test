// 台股 AI 分析 - 更新版 API 模組
// 支援即時分析：網頁 → Cloudflare Function → RPi API → 回傳結果

const API_BASE = '/api';
const LOCAL_API = 'http://localhost:8788';  // 開發時使用

// 分析股票（即時）
async function analyzeStock(symbol) {
    const resultsDiv = document.getElementById('analysis-results') || document.body;
    
    // 顯示載入中
    showLoading('正在分析 ' + symbol + '...');
    
    try {
        // 呼叫 Cloudflare Function API
        const response = await fetch(`${API_BASE}/analyze/${symbol}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        // 隱藏載入中
        hideLoading();
        
        // 渲染結果
        renderAnalysis(data);
        
        return data;
        
    } catch (error) {
        console.error('分析失敗:', error);
        hideLoading();
        showError('分析失敗: ' + error.message);
        return null;
    }
}

// 顯示載入中
function showLoading(message) {
    let loadingDiv = document.getElementById('loading-overlay');
    if (!loadingDiv) {
        loadingDiv = document.createElement('div');
        loadingDiv.id = 'loading-overlay';
        loadingDiv.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
        document.body.appendChild(loadingDiv);
    }
    
    loadingDiv.innerHTML = `
        <div class="bg-white rounded-2xl p-8 text-center shadow-2xl">
            <div class="text-4xl mb-4 animate-spin">⏳</div>
            <p class="text-lg font-medium text-gray-800">${message}</p>
            <p class="text-sm text-gray-500 mt-2">AI 正在進行四面向分析...</p>
        </div>
    `;
    loadingDiv.style.display = 'flex';
}

// 隱藏載入中
function hideLoading() {
    const loadingDiv = document.getElementById('loading-overlay');
    if (loadingDiv) {
        loadingDiv.style.display = 'none';
    }
}

// 顯示錯誤
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    errorDiv.innerHTML = `
        <div class="flex items-center">
            <span class="mr-2">❌</span>
            <span>${message}</span>
        </div>
    `;
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// 渲染分析結果
function renderAnalysis(data) {
    // 更新股票資訊
    document.getElementById('stock-name').textContent = data.name;
    document.getElementById('stock-symbol').textContent = data.symbol;
    document.getElementById('stock-price').textContent = `$${data.price.toFixed(2)}`;
    
    const changeEl = document.getElementById('stock-change');
    const isUp = data.change_5d >= 0;
    changeEl.innerHTML = `${isUp ? '▲' : '▼'} ${Math.abs(data.change_5d).toFixed(1)}% (5日)`;
    changeEl.className = `text-lg ${isUp ? 'text-red-500' : 'text-green-500'}`;
    
    // 更新四面向卡片
    updateCard('technical', data.technical.verdict, data.technical, [
        { label: '趨勢', value: data.technical.trend },
        { label: 'MACD', value: data.technical.macd },
        { label: 'RSI', value: data.technical.rsi.toFixed(0) },
        { label: '支撐', value: `$${data.technical.support.toFixed(0)}` },
        { label: '壓力', value: `$${data.technical.resistance.toFixed(0)}` }
    ]);
    
    updateCard('fundamental', data.fundamental.verdict, data.fundamental, [
        { label: '本益比', value: data.fundamental.pe?.toFixed(1) || 'N/A' },
        { label: '股價淨值比', value: data.fundamental.pb?.toFixed(1) || 'N/A' },
        { label: '營收成長', value: `+${(data.fundamental.revenue_growth * 100).toFixed(1)}%` },
        { label: '獲利成長', value: `+${(data.fundamental.earnings_growth * 100).toFixed(1)}%` }
    ]);
    
    updateCard('chip', data.chip.verdict, data.chip, [
        { label: '三大法人', value: data.chip.total }
    ]);
    
    updateCard('news', data.news.verdict, data.news, data.news.items.map(item => ({
        label: item.sentiment,
        value: item.title.substring(0, 20) + '...'
    })));
    
    // 更新綜合建議
    updateRecommendation(data);
}

// 更新卡片
function updateCard(type, verdict, data, items) {
    const card = document.getElementById(`${type}-analysis`);
    if (!card) return;
    
    const colorClass = getVerdictColor(verdict);
    const badgeClass = getVerdictBadgeClass(verdict);
    
    let html = `
        <div class="flex items-center justify-between mb-2">
            <h4 class="font-bold text-gray-800">${getCardTitle(type)}</h4>
            <span class="px-2 py-1 ${badgeClass} rounded text-sm">${verdict}</span>
        </div>
        <div class="space-y-2 text-sm text-gray-600">
    `;
    
    items.forEach(item => {
        html += `<div>${item.label}: <span class="font-medium">${item.value}</span></div>`;
    });
    
    html += '</div>';
    card.innerHTML = html;
    card.className = `bg-white rounded-2xl p-6 shadow-lg border-l-4 ${colorClass}`;
}

// 取得卡片標題
function getCardTitle(type) {
    const titles = {
        'technical': '技術面',
        'fundamental': '基本面', 
        'chip': '籌碼面',
        'news': '新聞面'
    };
    return titles[type] || type;
}

// 取得評估顏色
function getVerdictColor(verdict) {
    if (verdict.includes('偏多') || verdict.includes('偏強')) return 'border-green-500';
    if (verdict.includes('偏空')) return 'border-red-500';
    if (verdict.includes('中性')) return 'border-yellow-500';
    return 'border-gray-400';
}

function getVerdictBadgeClass(verdict) {
    if (verdict.includes('偏多') || verdict.includes('偏強')) return 'bg-green-100 text-green-700';
    if (verdict.includes('偏空')) return 'bg-red-100 text-red-700';
    if (verdict.includes('中性')) return 'bg-yellow-100 text-yellow-700';
    return 'bg-gray-100 text-gray-600';
}

// 更新交易建議
function updateRecommendation(data) {
    const summaryDiv = document.querySelector('.recommendation-section');
    if (!summaryDiv) return;
    
    summaryDiv.innerHTML = `
        <h3 class="text-xl font-bold mb-4">💡 綜合分析與交易建議</h3>
        <div class="bg-white/10 rounded-xl p-4">
            <p class="text-lg mb-4"><strong>${data.summary}</strong></p>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                    <span class="text-white/80">建議動作：</span>
                    <span class="font-bold">${data.recommendation.action}</span>
                </div>
                <div>
                    <span class="text-white/80">進場區間：</span>
                    <span class="font-bold">$${data.recommendation.entry_zone[0]} - $${data.recommendation.entry_zone[1]}</span>
                </div>
                <div>
                    <span class="text-white/80">停損價位：</span>
                    <span class="font-bold text-red-300">$${data.recommendation.stop_loss.toFixed(0)}</span>
                </div>
            </div>
        </div>
    `;
}

// 搜尋股票
function searchStock() {
    const input = document.getElementById('stockInput');
    const symbol = input.value.trim();
    
    if (!symbol) {
        alert('請輸入股票代號');
        return;
    }
    
    // 移除 .TW 後綴如果有的話
    const cleanSymbol = symbol.replace('.TW', '');
    
    // 執行分析
    analyzeStock(cleanSymbol);
}

// Enter 鍵搜尋
document.getElementById('stockInput')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchStock();
});

// 頁面載入時檢查 URL 參數
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const symbol = urlParams.get('symbol');
    
    if (symbol) {
        document.getElementById('stockInput').value = symbol.replace('.TW', '');
        analyzeStock(symbol);
    }
});