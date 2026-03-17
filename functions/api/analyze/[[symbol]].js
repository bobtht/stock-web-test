// Cloudflare Function - 轉發股票分析請求到 RPi Tunnel

const RPI_TUNNEL_URL = 'https://prisoner-nevada-lived-cherry.trycloudflare.com';
const API_KEY = 'dev-key-change-in-production'; // 應該使用環境變數

export async function onRequestGet(context) {
    const { request, params } = context;
    const symbol = params.symbol;
    
    console.log(`[CF Function] 分析股票: ${symbol}`);
    
    try {
        // 轉發請求到 RPi Tunnel
        const response = await fetch(`${RPI_TUNNEL_URL}/api/analyze/${symbol}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) {
            throw new Error(`RPi API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // 回傳結果
        return new Response(JSON.stringify(data), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });
        
    } catch (error) {
        console.error('[CF Function Error]', error);
        
        // 如果 RPi 不可用，回傳模擬資料
        return new Response(JSON.stringify({
            error: 'RPi API unavailable',
            message: error.message,
            symbol: symbol,
            note: '請確認 RPi Tunnel 和 API Server 正在運行'
        }), {
            status: 503,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });
    }
}