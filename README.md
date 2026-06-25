# LLLD Works Hub / Market ローカル検証版

このフォルダは、本番GitHub Pagesを壊さずに LLLD Works Hub のマーケット化を検証するためのローカルパッケージです。

## まず使う人へ

このフォルダごと渡せば、ローカルPC上で動作確認できます。

```bash
cd "/Users/tetsuya/川岡哲也専用　AI軍団/04_社内運営/02_案件管理/コンテンツ販売（ローカル検証版）"
python3 -m http.server 5500
```

確認URL:

```text
http://localhost:5500/
http://localhost:5500/marketplace.html
http://localhost:5500/content-detail.html?slug=monthly-operations-checklist
http://localhost:5500/request.html
http://localhost:5500/login.html
http://localhost:5500/signup.html
http://localhost:5500/account.html
http://localhost:5500/thanks.html?type=purchase
http://localhost:5500/thanks.html?type=request
http://localhost:5500/admin.html
```

HTMLファイルを直接ダブルクリックせず、必ず `localhost` で確認してください。JSONを `fetch()` で読むためです。

## フォルダの役割

```text
/
├── index.html                 # 社内Hubトップ
├── marketplace.html           # マーケット一覧
├── content-detail.html        # コンテンツ詳細
├── author.html                # 投稿者ページ
├── request.html               # 購入・開発相談
├── login.html                 # 企業アカウントログインUIモック
├── signup.html                # 企業アカウント登録UIモック
├── account.html               # 企業アカウント画面モック
├── thanks.html                # 送信後・購入後案内
├── submit.html                # 投稿募集ページ
├── admin.html                 # 管理画面モック。本番操作不可
├── assets/                    # CSS / JS / 画像 / サムネイル
├── data/                      # 仮DB。将来Supabase等へ置換予定
├── apps/                      # 実際に開くHTMLアプリ本体
├── contents/                  # マーケット側コンテンツ入口
├── docs/                      # ルール、構想、監査、フェーズ記録
├── archive/                   # 元資料や整理済み素材
├── AGENTS.md                  # このパッケージでAIが守る作業ルール
└── README.md                  # このファイル
```

## 動作に必要な主なファイル

- `index.html`
- `marketplace.html`
- `content-detail.html`
- `author.html`
- `request.html`
- `login.html`
- `signup.html`
- `account.html`
- `thanks.html`
- `submit.html`
- `admin.html`
- `assets/css/style.css`
- `assets/js/app.js`
- `assets/js/contentService.js`
- `assets/js/marketPages.js`
- `assets/js/requestPage.js`
- `assets/js/siteConfigService.js`
- `assets/js/authService.js`
- `assets/js/accountPage.js`
- `assets/js/thanksPage.js`
- `assets/js/adminMockPage.js`
- `assets/js/authMockService.js`
- `assets/js/storagePolicy.js`
- `data/contents.json`
- `data/authors.json`
- `data/categories.json`
- `apps/`
- `contents/`
- `assets/thumbs/`
- `assets/thumbnails/`

## データ管理

現在は本物のDBを使っていません。`data/` 配下のJSONを仮DBとして使っています。

- コンテンツ: `data/contents.json`
- 投稿者: `data/authors.json`
- カテゴリ: `data/categories.json`
- サイト設定: `data/site-config.json`

画面側は `assets/js/contentService.js` 経由でデータを読みます。将来Supabaseなどに移行するときは、まずこのService層を差し替える方針です。

企業アカウント関連は、現在 `mock mode` のUI検証です。本番ログイン、本番登録、パスワード保存、実データ同期はまだ行いません。

## ルール・構想・監査

Markdown資料は `docs/` に整理しています。

- パッケージ構造: `docs/00_パッケージ構造/`
- ローカル起動: `docs/01_セットアップ/`
- 監査チェック: `docs/02_監査/`
- 構想・進行方針: `docs/03_構想/`
- フェーズ記録: `docs/04_フェーズ記録/`
- 実装指示・過去プロンプト: `docs/05_実装指示/`

## 本番反映について

このローカル検証版にはGitHub remoteを設定していません。

本番へ反映するときは、このフォルダをそのままpushするのではなく、必要な差分だけ本番リポジトリへ移植して確認します。

本番反映前には、必ず `docs/02_監査/release-checklist.md` を確認してください。
