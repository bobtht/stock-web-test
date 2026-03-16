// Cloudflare Pages Worker
// 處理所有 API 請求

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    };
    
    // API 路由
    if (path.startsWith('/api/stock/')) {
      const symbol = path.split('/').pop();
      
      // 回傳假資料（之後連接你的 Python）
      const data = {
        symbol: symbol,
        name: '台灣積體電路製造',
        price: 1865 + Math.floor(Math.random() * 100 - 50),
        change: Math.floor(Math.random() * 40 - 20),
        changePercent: (Math.random() * 4 - 2).toFixed(2),
        timestamp: new Date().toISOString()
      };
      
      return new Response(JSON.stringify(data), { headers });
    }
    
    if (path === '/api/market') {
      const data = {
        index: 22456 + Math.floor(Math.random() * 200 - 100),
        change: Math.floor(Math.random() * 300 - 150),
        changePercent: (Math.random() * 2 - 1).toFixed(2),
        volume: '3,256億'
      };
      return new Response(JSON.stringify(data), { headers });
    }
    
    if (path === '/api/screener') {
      const stocks = [
        { symbol: '2330.TW', name: '台積電', price: 1865, score: 4.5, reasons: '均線多頭+MACD金叉' },
        { symbol: '2454.TW', name: '聯發科', price: 1720, score: 4.2, reasons: '量增價升+突破整理' },
        { symbol: '2308.TW', name: '台達電', price: 1385, score: 3.8, reasons: '均線多頭排列' },
      ];
      return new Response(JSON.stringify(stocks), { headers });
    }
    
    // 靜態資源由 Pages 自動處理
    return env.ASSETS.fetch(request);
  }
};
