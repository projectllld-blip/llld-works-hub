# LLLD Works Hub

株式会社LLLDの社内コンテンツポータルです。GitHub Pagesで静的に公開できます。

## 構成

```text
/
├── index.html
├── AGENTS.md
├── README.md
├── assets/
│   ├── thumbnails/
│   └── icons/
├── apps/
│   ├── pdf-tool/
│   ├── seatflow/
│   ├── quiz-maker/
│   ├── exam-print/
│   └── consulting-kit/
└── data/
    └── contents.json
```

## コンテンツ追加方法

1. HTMLアプリを `apps/app-name/index.html` に置く
2. サムネイルを `assets/thumbnails/app-name.svg` または `.png` に置く
3. `data/contents.json` に1件追加する

```json
{
  "id": "app-name",
  "title": "表示名",
  "category": "教室運用",
  "type": "HTMLアプリ",
  "description": "短い説明文",
  "url": "./apps/app-name/index.html",
  "thumbnail": "./assets/thumbnails/app-name.svg",
  "tags": ["タグ"],
  "updatedAt": "2026-06-17",
  "external": false
}
```

トップページは `data/contents.json` から一覧を読み込みます。カード追加のたびに `index.html` を直接編集する必要はありません。

## ローカル確認

```bash
python3 -m http.server 8000
```

ブラウザで以下を開きます。

```text
http://localhost:8000/
```

`index.html` を直接開いた場合、ブラウザ制限で `contents.json` が読めないことがあります。その場合も初期データで表示されます。

## GitHub Pages公開

1. このフォルダをGitHubリポジトリのルートとして配置する
2. GitHubの `Settings` を開く
3. `Pages` を開く
4. `Source` を `Deploy from a branch` にする
5. `Branch` を `main`、フォルダを `/root` にする
6. `Save`

## 初期登録

- PDF編集ツール
- SeatFlow 座席管理
- 小テスト作成
- 入試問題印刷
- コンサル支援キット
