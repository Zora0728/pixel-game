# Pixel Quiz Game (像素風格問答遊戲)

這是一個使用 React + Vite 開發的像素風格問答遊戲，後端使用 Google Sheets 和 Google Apps Script (GAS) 來管理題目與紀錄成績。

## 🔥 最新功能 (v1.2 更新)
- **進度條 (Progress Bar)**：遊戲中即時顯示當前題號進度。
- **錯題複習 (Review Mode)**：遊戲結束後，可查看答錯題目的正確答案與完整選項文字。
- **排行榜 (Leaderboard)**：顯示前 3 名最高分玩家 (ID 與分數)。
- **及格門檻自動調整**：根據設定的百分比（如 0.6 代表 60%）動態計算及格題數。
    - **一般通關 (Mission Cleared)**：及格判斷自動化。
    - **完美通關 (Perfect Clear)**：答對 100% 題目。
- **動態欄位對應**：後端自動辨識 Google Sheet 欄位名稱，不怕欄位順序更動。

## 🚀 快速開始

### 1. 安裝專案

首先，請確保您的電腦已安裝 [Node.js](https://nodejs.org/)。

```bash
# 安裝依賴套件
npm install
```

### 1.5 自動部署 (GitHub Pages)

本專案已設定好 GitHub Actions，只要您將程式碼上傳 (Push) 到 GitHub，系統就會自動部署到 GitHub Pages。

**前置設定 (只需做一次)：**

1.  將此專案上傳到 GitHub Repository。
2.  進入 GitHub Repo 頁面，點選 `Settings` > `Secrets and variables` > `Actions`。
3.  點擊 `New repository secret`。建立以下三個 Secrets：
    -   **Name**: `VITE_GOOGLE_APP_SCRIPT_URL` / **Value**: 您的 GAS Web App 網址。
    -   **Name**: `VITE_QUESTION_COUNT` / **Value**: 每局題數 (例如 `5`)。
    -   **Name**: `VITE_PASS_THRESHOLD` / **Value**: 及格門檻百分比 (例如 `0.6` 代表 60%)。
6.  完成後，每次您 Push 程式碼到 `main` 分支，GitHub Actions 就會自動打包並更新網站！

### 2. Google Sheets & Apps Script 設定

本專案需要配合 Google Sheets 運作，請依照以下步驟設定：

#### 步驟 2.1：建立 Google Sheets
1. 建立一個新的 Google Sheet。
2. 將試算表名稱改為 `Pixel Game Database` (或您喜歡的名稱)。
3. 建立兩個工作表 (Tabs)，分別命名為：`題目` 和 `回答`。

**工作表 1：`題目` (用於存放題庫)**
請在第一列設定以下欄位名稱 (順序很重要)：
| A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|
| **題號** | **題目** | **A** | **B** | **C** | **D** | **解答** |

**工作表 2：`回答` (用於紀錄玩家成績)**
請在第一列設定以下欄位名稱 (順序不拘，程式會自動對應標題)：
- **ID**
- **闖關次數** (Play Count): 總遊玩次數
- **總分** (Total Score): 歷次遊玩分數加總
- **最高分** (Max Score): 單次遊玩最高分
- **第一次通關分數** (First Clear Score): 首次通關時的分數
- **花了幾次通關** (Attempts to Clear): 第一次通關時是第幾次嘗試
- **最近遊玩時間** (Last Play Time)
- **完美通關次數** (Perfect Clear Count): 答對率 100% 的次數

#### 步驟 2.2：設定 & 部署 Google Apps Script
1. 在 Google Sheets 中，點選選單 `擴充功能` > `Apps Script`。
2. 將專案中 `backend/Code.js` 的 **完整最新程式碼** 複製並貼上到編輯器。
3. 部署步驟：
    - 點擊右上角 `部署` > `管理部署作業` (若是第一次則選 `新增部署作業`)。
    - 點擊 `編輯` (鉛筆圖示)。
    - **版本：選擇「建立新版本」** (每次修改 Code.js 都必須做這一步)。
    - 點擊 `部署`。
4. 複製產生的 **網頁應用程式網址 (Web App URL)**。

### 3. 環境變數設定

1. 在專案根目錄找到 `.env` 檔案。
2. 修改 `VITE_GOOGLE_APP_SCRIPT_URL`，填入上一步驟取得的網址。

```ini
VITE_GOOGLE_APP_SCRIPT_URL=https://script.google.com/macros/s/您的部署ID/exec
VITE_PASS_THRESHOLD=0.6 # 及格門檻百分比 (0.6 代表 60%)
VITE_QUESTION_COUNT=5
```

### 4. 啟動遊戲

```bash
npm run dev
```
打開瀏覽器訪問顯示的網址 (通常是 `http://localhost:5173`) 即可開始遊玩！

---

## 題庫範例：台灣地理基礎知識

您可以直接複製以下表格內容貼上到 Google Sheets 的 **`題目`** 工作表 (從 A1 儲存格開始貼上)。

| 題號 | 題目 | A | B | C | D | 解答 |
|:---:|---|---|---|---|---|:---:|
| 1 | 台灣最高的山脈是哪一座？ | 玉山山脈 | 雪山山脈 | 中央山脈 | 阿里山山脈 | A |
| 2 | 台灣最大的天然湖泊是？ | 澄清湖 | 蓮池潭 | 日月潭 | 鯉魚潭 | C |
| 3 | 台灣本島最南端的岬角是？ | 富貴角 | 鵝鑾鼻 | 貓鼻頭 | 三貂角 | B |
| 4 | 被稱為「台灣矽谷」的科學園區位於哪個城市？ | 台北市 | 新竹市 | 台中市 | 台南市 | B |
| 5 | 台灣唯一不靠海的縣市是？ | 嘉義縣 | 花蓮縣 | 南投縣 | 雲林縣 | C |
| 6 | 有「雨港」之稱的城市是？ | 高雄 | 台南 | 基隆 | 宜蘭 | C |
| 7 | 北回歸線兩千三百度半經過台灣哪兩個縣市？ | 嘉義、花蓮 | 台南、台東 | 高雄、屏東 | 台中、宜蘭 | A |
| 8 | 台灣全台最長的河流是？ | 淡水河 | 高屏溪 | 濁水溪 | 曾文溪 | C |
| 9 | 「太魯閣國家公園」以什麼地形景觀聞名？ | 火山地形 | 峽谷地形 | 珊瑚礁地形 | 沙岸地形 | B |
| 10 | 下列哪個離島以「雙心石滬」聞名？ | 綠島 | 蘭嶼 | 澎湖 (七美) | 金門 | C |
