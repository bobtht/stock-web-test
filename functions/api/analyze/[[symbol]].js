// Cloudflare Function - 轉發股票分析請求到 RPi Tunnel

const RPI_TUNNEL_URL = 'https://prisoner-nevada-lived-cherry.trycloudflare.com';

export async function onRequestGet(context) {
    const { request, params, env } = context;
    const symbol = params.symbol;
    
    console.log(`[CF Function] 分析股票: ${symbol}`);
    
    try {
        // 轉發請求到 RPi Tunnel (不使用 API Key，因為 Tunnel 已經加密)
        const response = await fetch(`${RPI_TUNNEL_URL}/api/analyze/${symbol}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`RPi API error: ${response.status} - ${errorText}`);
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
        
        // 如果 RPi 不可用，回傳錯誤資訊
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