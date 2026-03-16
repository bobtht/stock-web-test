// Cloudflare Workers API
// 處理股價查詢、選股掃描等後端邏輯

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // CORS 標頭
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json',
    };
    
    // 處理 OPTIONS 請求
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers });
    }
    
    try {
      // 取得個股資料
      if (path.startsWith('/api/stock/')) {
        const symbol = path.split('/').pop();
        const data = await getStockData(symbol, env);
        return new Response(JSON.stringify(data), { headers });
      }
      
      // 取得大盤資料
      if (path === '/api/market/index') {
        const data = await getMarketData(env);
        return new Response(JSON.stringify(data), { headers });
      }
      
      // 執行選股掃描
      if (path === '/api/screener/run') {
        const results = await runScreener(env);
        return new Response(JSON.stringify(results), { headers });
      }
      
      // 取得熱門股票
      if (path === '/api/stocks/hot') {
        const data = await getHotStocks(env);
        return new Response(JSON.stringify(data), { headers });
      }
      
      // 取得財經新聞
      if (path === '/api/news') {
        const data = await getNews(env);
        return new Response(JSON.stringify(data), { headers });
      }
      
      return new Response(JSON.stringify({ error: 'Not Found' }), { 
        status: 404, 
        headers 
      });
      
    } catch (error) {
      console.error('API Error:', error);
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 500, 
        headers 
      });
    }
  }
};

// 取得個股資料
async function getStockData(symbol, env) {
  // 檢查快取
  const cacheKey = `stock:${symbol}`;
  const cached = await env.STOCK_CACHE?.get(cacheKey);
  
  if (cached) {
    return JSON.parse(cached);
  }
  
  // 這裡會呼叫你的 Python 分析腳本
  // 暫時回傳假資料
  const data = {
    symbol: symbol,
    name: '台灣積體電路製造',
    price: 1865,
    change: -20,
    changePercent: -1.06,
    volume: 31118,
    ma5: 1870,
    ma20: 1886,
    rsi: 46,
    macd: -0.5,
    timestamp: new Date().toISOString()
  };
  
  // 存入快取（5分鐘）
  await env.STOCK_CACHE?.put(cacheKey, JSON.stringify(data), { expirationTtl: 300 });
  
  return data;
}

// 取得大盤資料
async function getMarketData(env) {
  const cacheKey = 'market:index';
  const cached = await env.STOCK_CACHE?.get(cacheKey);
  
  if (cached) {
    return JSON.parse(cached);
  }
  
  const data = {
    index: 22456.32,
    change: 265.8,
    changePercent: 1.2,
    volume: 325600000000,
    timestamp: new Date().toISOString()
  };
  
  await env.STOCK_CACHE?.put(cacheKey, JSON.stringify(data), { expirationTtl: 60 });
  
  return data;
}

// 執行選股掃描
async function runScreener(env) {
  // 這裡會呼叫你的 Python StockScreener
  // 暫時回傳假資料
  const results = {
    timestamp: new Date().toISOString(),
    totalScanned: 1080,
    selected: [
      { symbol: '2330.TW', name: '台積電', price: 1865, score: 4.5, reasons: '均線多頭+MACD金叉' },
      { symbol: '2454.TW', name: '聯發科', price: 1720, score: 4.2, reasons: '量增價升+突破整理' },
      { symbol: '2308.TW', name: '台達電', price: 1385, score: 3.8, reasons: '均線多頭排列' },
    ]
  };
  
  return results;
}

// 取得熱門股票
async function getHotStocks(env) {
  return [
    { name: '台積電', symbol: '2330.TW', price: 1865, change: -1.06, volume: '31,118' },
    { name: '聯發科', symbol: '2454.TW', price: 1720, change: 2.35, volume: '12,456' },
    { name: '鴻海', symbol: '2317.TW', price: 214, change: 0.5, volume: '45,789' },
  ];
}

// 取得財經新聞
async function getNews(env) {
  return [
    { title: '台積電法說會即將登場，市場關注展望', time: '2小時前', source: '財經新聞', tag: '重要' },
    { title: 'Fed 暗示降息腳步近了，台股可望受惠', time: '3小時前', source: '國際財經', tag: '國際' },
    { title: 'AI 伺服器需求強勁，相關供應鏈受關注', time: '5小時前', source: '產業新聞', tag: '產業' },
  ];
}
