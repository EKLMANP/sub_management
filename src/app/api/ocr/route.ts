import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const SYSTEM_PROMPT = `你是一個專門分析訂閱服務截圖的 AI 助手。
分析用戶上傳的截圖，提取訂閱服務的相關資訊。

請以 JSON 格式回傳以下欄位（如果無法辨識則設為 null）：
{
  "name": "訂閱服務名稱，如 Netflix、Spotify",
  "vendor_name": "供應商/公司名稱",
  "vendor_contact": "聯絡方式（email 或網址）",
  "fee": "費用金額（本期實際支付金額，若為優惠價請填此欄）",
  "renewal_fee": "續約費用（優惠結束後的原價，若無優惠則與 fee 相同或為 null）",
  "currency": "幣別（TWD/USD/EUR/JPY 等 ISO 代碼）",
  "billing_cycle": "付款週期（monthly/quarterly/yearly）",
  "payment_method": "付款方式",
  "next_renewal_date": "下次續約日期（YYYY-MM-DD 格式）",
  "start_date": "開始日期（YYYY-MM-DD 格式）",
  "end_date": "結束日期（YYYY-MM-DD 格式）"
}

注意事項：
- 金額請轉換為純數字，例如 "$12.99" → "12.99"
- 日期請轉換為 YYYY-MM-DD 格式
- 如果圖片中顯示有優惠價（例如「首年優惠」），則 'fee' 填優惠價，'renewal_fee' 填原價
- 如果沒有優惠，'renewal_fee' 可以是 null
- 只回傳 JSON，不要其他說明文字`;

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: '未授權' }, { status: 401 });
        }

        const { image } = await request.json();
        if (!image) {
            return NextResponse.json({ error: '請提供圖片' }, { status: 400 });
        }

        // 解析 base64 圖片
        const base64Match = image.match(/^data:image\/(png|jpeg|jpg|webp|gif);base64,(.+)$/);
        if (!base64Match) {
            return NextResponse.json({ error: '圖片格式無效' }, { status: 400 });
        }

        const mimeType = `image/${base64Match[1]}` as 'image/png' | 'image/jpeg' | 'image/webp' | 'image/gif';
        const base64Data = base64Match[2];

        const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

        const result = await model.generateContent([
            SYSTEM_PROMPT,
            {
                inlineData: {
                    mimeType,
                    data: base64Data,
                },
            },
            '請分析這張訂閱服務截圖，提取相關資訊。只回傳 JSON。',
        ]);

        const response = result.response;
        const text = response.text();

        // 解析 JSON（可能被包在 markdown code block 中）
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            return NextResponse.json({ error: '無法辨識圖片內容' }, { status: 500 });
        }

        const parsedData = JSON.parse(jsonMatch[0]);
        return NextResponse.json(parsedData);
    } catch (error) {
        console.error('OCR Error:', error);
        const message = error instanceof Error ? error.message : '辨識失敗，請稍後再試';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
