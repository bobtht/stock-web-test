// Cloudflare Pages Functions API
// 路徑: /api/stock/:symbol

export async function onRequest(context) {
  const { request, params, env } = context;
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };
  
  try {
    const symbol = params.symbol;
    
    // 這裡會連接到你的 Python 分析腳本
    // 暫時回傳假資料
    const data = {
      symbol: symbol,
      name: '台灣積體電路製造',
      price: 1865,
      change: -20,
      changePercent: -1.06,
      timestamp: new Date().toISOString()
    };
    
    return new Response(JSON.stringify(data), { headers });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers 
    });
  }
}
