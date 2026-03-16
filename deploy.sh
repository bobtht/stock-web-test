#!/bin/bash
# 台股 AI 分析網部署腳本

echo "🚀 台股 AI 分析網部署腳本"
echo "=========================="
echo ""

# 檢查是否已登入
if ! npx wrangler whoami &>/dev/null; then
    echo "❌ 請先登入 Cloudflare"
    echo "執行: npx wrangler login"
    exit 1
fi

echo "✅ 已登入 Cloudflare"
echo ""

# 建立 KV 命名空間
echo "📦 建立 KV 命名空間..."
KV_OUTPUT=$(npx wrangler kv namespace create "STOCK_CACHE" 2>&1)

# 提取 KV ID
KV_ID=$(echo "$KV_OUTPUT" | grep -oP 'id = "\K[^"]+')

if [ -z "$KV_ID" ]; then
    echo "⚠️ KV 可能已存在，嘗試取得現有 ID..."
    KV_ID=$(npx wrangler kv namespace list | grep STOCK_CACHE | grep -oP '"id": "\K[^"]+' | head -1)
fi

if [ -z "$KV_ID" ]; then
    echo "❌ 無法取得 KV ID，請手動建立:"
    echo "   npx wrangler kv namespace create STOCK_CACHE"
    exit 1
fi

echo "✅ KV ID: $KV_ID"
echo ""

# 更新 wrangler.toml
echo "📝 更新設定檔..."
cat > wrangler.toml << EOF
name = "taiwan-stock-web"
main = "src/api/stock.js"
compatibility_date = "2024-01-01"

[site]
bucket = "./public"

[[kv_namespaces]]
binding = "STOCK_CACHE"
id = "$KV_ID"

[vars]
API_VERSION = "v1"
ENVIRONMENT = "production"
EOF

echo "✅ 設定檔已更新"
echo ""

# 部署
echo "🚀 開始部署..."
npx wrangler deploy

echo ""
echo "=========================="
echo "✅ 部署完成！"
echo ""
echo "你的網站網址:"
echo "https://taiwan-stock-web.pages.dev"
echo ""
echo "=========================="
