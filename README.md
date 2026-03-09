# MIP-Calculator-midland

按揭保險費計算器（React + Vite + Tailwind）。

## 本機啟動

```bash
npm install
npm run dev
```

預設會在 `http://localhost:5173` 開啟。

## 打包部署

```bash
npm run build
```

輸出會在 `dist/`，可部署到任何靜態網站服務。

## 推薦部署方式

### Vercel

1. 把此 repo 推到 GitHub。
2. 在 Vercel 匯入專案。
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Deploy 後取得網址，例如：`https://your-site.vercel.app`

### Netlify

1. 在 Netlify 連接此 repo。
2. Build command 設為 `npm run build`
3. Publish directory 設為 `dist`
4. 部署後取得網址，例如：`https://your-site.netlify.app`

### GitHub Pages（已內置 Actions）

Repo 已加入自動部署檔案：`.github/workflows/deploy-pages.yml`。

你只需要：

1. 把本地變更 push 到 `main`
2. 到 GitHub 專案 `Settings` -> `Pages`
3. `Source` 設為 `GitHub Actions`
4. 等待 Actions 跑完

完成後網址會是：

`https://<你的 GitHub 帳號>.github.io/MIP-Calculator-midland/`

## 加到 Blog（iframe）

部署後，把以下 HTML 放到你的 blog 文章或頁面（可嵌入 HTML 的區塊）：

```html
<iframe
	src="https://<你的 GitHub 帳號>.github.io/MIP-Calculator-midland/"
	title="按揭保險費計算器"
	width="100%"
	height="1400"
	style="border:0;border-radius:12px;overflow:hidden"
	loading="lazy"
></iframe>
```

如果 blog 欄位較窄，可把 `height` 調大到 `1600` 以避免捲動。