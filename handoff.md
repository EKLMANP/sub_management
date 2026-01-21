# 跨裝置開發交接指南

## 1. 取得程式碼

在新的電腦上執行：

```bash
git clone https://github.com/EKLMANP/sub_management.git
cd sub_management
```

## 2. 安裝依賴

```bash
npm install
```

## 3. 設定環境變數 (關鍵！)

`.env.local` 檔案不會上傳到 GitHub，你需要手動建立它。
請在專案根目錄建立 `.env.local` 檔案，並填入以下資訊：

```env
# Clerk Auth (從 Clerk Dashboard 取得)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Clerk URL 設定 (固定值)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Neon Database (從 Neon Console 取得 Connection String)
DATABASE_URL=postgresql://neondb_owner:...........@ep-.....neon.tech/neondb?sslmode=require
```

> 💡 **提示**：如果你在原本的電腦已經申請好這些服務，請直接複製原本電腦上 `.env.local` 的內容。如果是新申請，請填入新的 Key。

## 4. 同步資料庫結構 (如果是新資料庫)

如果你連接的是一個全新的 Neon 資料庫專案，需要執行以下指令來建立資料表：

```bash
npm run drizzle:push
```

## 5. 啟動開發伺服器

```bash
npm run dev
```

瀏覽器打開 [http://localhost:3000](http://localhost:3000) 即可看到成果！

---

## 常見指令

- `npm run dev`: 啟動開發伺服器
- `npm run drizzle:push`: 更新資料庫 Schema (當修改 `src/lib/db/schema.ts` 後執行)
- `npm run drizzle:generate`: 產生 SQL migration 檔案 (進階用途)
