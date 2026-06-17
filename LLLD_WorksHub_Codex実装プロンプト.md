# LLLD Works Hub 実装用 Codex プロンプト

このファイルは、社内ポータル **LLLD Works Hub** を GitHub Pages 上で運用するために、Codex / VS Code にそのまま投げる実装プロンプトです。

目的は、PDF編集・座席管理・小テスト作成・コンサル支援資料・補助金テンプレートなどの社内コンテンツを、1つのポータルHTMLから迷わず開けるようにすることです。

---

## 1. Codexに最初に投げるプロンプト

以下をそのまま Codex に投げてください。

```md
あなたは、このリポジトリを GitHub Pages で公開するためのフロントエンド実装担当です。

目的：
社内ポータル「LLLD Works Hub」を作成し、既存または今後追加するHTMLコンテンツ・Webアプリ・PDF・テンプレートを一覧化して、GitHub Pages上で使えるようにしてください。

前提：
- このリポジトリは GitHub Pages で公開する想定です。
- 社内用のため、ログイン機能は今回は不要です。
- まずは静的HTML/CSS/JSのみで完結させます。
- 外部CDNは原則使わないでください。
- iPad / PC / スマホで閲覧できるレスポンシブUIにしてください。
- コンテンツ本体は HTML または Webアプリとして `/apps/` に置きます。
- ポータルのトップページは `index.html` にしてください。

作ってほしい構成：

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
│   │   └── index.html
│   ├── seatflow/
│   │   └── index.html
│   ├── quiz-maker/
│   │   └── index.html
│   ├── exam-print/
│   │   └── index.html
│   └── consulting-kit/
│       └── index.html
└── data/
    └── contents.json
```

実装方針：

1. `index.html` は社内ポータルとして作成してください。
2. タイトルは `LLLD Works Hub`。
3. ただし、以下の説明文は入れないでください。
   - 「LLLD Works Hubは、PDF編集・座席管理・小テスト作成・コンサル支援資料・補助金テンプレートなどをまとめる社内ポータルです。『どこにある？』『これは使っていい？』を減らし、現場と管理の作業を速くします。」
   - 「毎日使うもの・まず見てほしいものを上に固定しています。」
4. トップには検索ボックス、カテゴリフィルター、並び替え、カード一覧を置いてください。
5. 「よく使うもの」は、最終利用履歴を最大8個まで上位に表示してください。
6. 履歴はブラウザの `localStorage` に保存してください。
7. 各コンテンツにはサムネイルを表示してください。
8. サムネイルがない場合は、カテゴリごとのプレースホルダーを表示してください。
9. 各カードには以下を表示してください。
   - サムネイル
   - タイトル
   - カテゴリ
   - 短い説明
   - 種別（HTMLアプリ / PDF / テンプレート / 資料など）
   - 最終更新日
   - 開くボタン
10. カードをクリック、または開くボタンを押すと対象URLを開いてください。
11. 外部リンクの場合は新しいタブで開いてください。
12. 内部の `/apps/` 配下のHTMLは同一タブで開いてください。
13. `data/contents.json` からコンテンツ一覧を読み込む構造にしてください。
14. `contents.json` が読み込めない場合でも、最低限の初期データをJS内に持たせて表示してください。
15. デザインは社内ポータルとして、見やすく、軽く、直感的にしてください。
16. 不要な説明文を増やさないでください。
17. UIは「探す」「開く」「追加しやすい」を重視してください。
18. GitHub Pagesでそのまま動くように相対パスに注意してください。

初期コンテンツ例：

- PDF編集ツール
  - category: PDF
  - type: HTMLアプリ
  - url: ./apps/pdf-tool/index.html
  - description: PDFの結合、ページ入れ替え、分割、JPEG変換、容量調整を行うツール

- SeatFlow 座席管理
  - category: 教室運用
  - type: HTMLアプリ
  - url: ./apps/seatflow/index.html
  - description: 自習室、授業、面談室などの座席状況を管理するツール

- 小テスト作成
  - category: 教材作成
  - type: HTMLアプリ
  - url: ./apps/quiz-maker/index.html
  - description: 漢字、英単語、計算などの小テストを作成するツール

- 入試問題印刷
  - category: 教材作成
  - type: HTMLアプリ
  - url: ./apps/exam-print/index.html
  - description: 入試問題PDFを確認しながら印刷用に整理するツール

- コンサル支援キット
  - category: コンサル
  - type: 資料・テンプレート
  - url: ./apps/consulting-kit/index.html
  - description: 採用、集客、育成、1on1、補助金支援で使う資料をまとめる場所

追加実装してほしい機能：

- 検索：タイトル、説明、カテゴリ、タグを対象に絞り込み
- カテゴリフィルター：すべて / PDF / 教室運用 / 教材作成 / コンサル / 補助金 / 管理
- 並び替え：最近使った順 / 更新日順 / 名前順 / カテゴリ順
- お気に入り：カードのお気に入りボタンを押すと上部に固定表示
- お気に入りも `localStorage` 保存
- 最近使ったものは最大8個
- サムネイル表示
- `contents.json` を編集すればコンテンツを追加できる構造
- READMEに「コンテンツ追加方法」を書く
- AGENTS.mdに、今後Codexへ短い命令だけで追加・修正できる運用ルールを書く

重要なUIUX要件：

- 説明文を長くしない
- 文字は読みやすく
- カードはビジュアルで判断しやすく
- iPadで押しやすいボタンサイズ
- スマホでも崩れない
- 社内メンバーが迷わず使える
- コンテンツ追加時に `index.html` を毎回直接編集しなくてよい

GitHub Pages対応：

- 相対パスで実装してください。
- `fetch('./data/contents.json')` がGitHub Pages上で動くようにしてください。
- 可能であれば、ローカル直開きでも初期データで動くようにしてください。

最後にやってほしいこと：

1. 必要ファイルを作成または更新
2. 既存のHTMLアプリがある場合は、適切な `/apps/アプリ名/index.html` に配置する前提でリンクできるようにする
3. README.mdを整備
4. AGENTS.mdを整備
5. 実装後、ローカル確認方法とGitHub Pages公開手順をREADMEに記載
6. 変更内容を簡単にまとめる
```

---

## 2. 既存HTMLやアプリを追加するときのCodex命令

既存のHTMLファイルを社内ポータルに紐づけるときは、以下の短い命令でOKです。

```md
このHTMLアプリを `/apps/アプリ名/index.html` に配置し、`data/contents.json` にカード情報を追加して、LLLD Works Hubのトップから開けるようにしてください。サムネイルがなければカテゴリ用プレースホルダーで表示してください。
```

例：PDF編集ツールを追加する場合

```md
PDF編集ツールのHTMLを `/apps/pdf-tool/index.html` に配置し、`data/contents.json` に追加して、LLLD Works Hubのトップから開けるようにしてください。カテゴリはPDF、種別はHTMLアプリ、説明は「PDFの結合、ページ入れ替え、分割、JPEG変換、容量調整を行うツール」にしてください。
```

例：座席管理を追加する場合

```md
SeatFlowのHTMLを `/apps/seatflow/index.html` に配置し、`data/contents.json` に追加して、LLLD Works Hubのトップから開けるようにしてください。カテゴリは教室運用、種別はHTMLアプリ、説明は「自習室、授業、面談室などの座席状況を管理するツール」にしてください。
```

---

## 3. GitHubにアップロードして公開するまでのCodex命令

```md
現在のリポジトリをGitHub Pagesで公開できる状態に整えてください。

やってほしいこと：
1. `index.html` がルートにあるか確認
2. `/apps/` `/assets/` `/data/` の構成を確認
3. `data/contents.json` のリンク切れを確認
4. 相対パスの崩れを修正
5. README.mdにGitHub Pages公開手順を追記
6. `git status` で変更点を確認
7. 問題なければコミットしてください

コミットメッセージ：
`Add LLLD Works Hub portal`

プッシュは、現在のブランチがmainであることを確認してから実行してください。
```

---

## 4. GitHub Pagesの公開設定

GitHub側で1回だけ行います。

1. GitHubで対象リポジトリを開く
2. `Settings` を開く
3. 左メニューの `Pages` を開く
4. `Build and deployment` の `Source` を `Deploy from a branch` にする
5. `Branch` を `main` にする
6. フォルダは `/root` を選ぶ
7. `Save`
8. 数分後に表示されるURLへアクセス

---

## 5. 今後の運用イメージ

### 新しいアプリを追加したいとき

```md
このHTMLを社内ポータルに追加して。カテゴリは教材作成、名前は「英単語テスト作成」、説明は「英単語の小テストをすばやく作成するツール」。
```

### 表示名だけ変えたいとき

```md
LLLD Works Hubの「PDF編集ツール」の表示名を「PDF編集・結合ツール」に変更して。
```

### サムネイルを追加したいとき

```md
PDF編集ツールのサムネイルを `assets/thumbnails/pdf-tool.png` に設定して。
```

### カテゴリを変更したいとき

```md
SeatFlowのカテゴリを「教室運用」に変更して。
```

### GitHub Pagesに反映したいとき

```md
変更内容を確認して、問題なければコミットしてGitHubにプッシュして。
```

---

## 6. 推奨データ形式 `data/contents.json`

```json
[
  {
    "id": "pdf-tool",
    "title": "PDF編集ツール",
    "category": "PDF",
    "type": "HTMLアプリ",
    "description": "PDFの結合、ページ入れ替え、分割、JPEG変換、容量調整を行うツール",
    "url": "./apps/pdf-tool/index.html",
    "thumbnail": "./assets/thumbnails/pdf-tool.png",
    "tags": ["PDF", "結合", "分割", "ページ入れ替え", "JPEG"],
    "updatedAt": "2026-06-17",
    "external": false
  }
]
```

---

## 7. 完成基準

- `index.html` を開くと社内ポータルが表示される
- コンテンツカードが表示される
- 検索できる
- カテゴリで絞り込める
- 最近使った8件が上位表示される
- お気に入り固定できる
- 各カードからアプリを開ける
- `contents.json` だけでコンテンツ追加できる
- GitHub Pagesで表示できる
- iPadで見やすい
- 説明文が多すぎず、現場が迷わない
