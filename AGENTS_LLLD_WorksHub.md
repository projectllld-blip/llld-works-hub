# AGENTS.md — LLLD Works Hub 運用指示書

このリポジトリは、株式会社LLLDの社内コンテンツ・HTMLアプリ・業務ツールをまとめる社内ポータルです。

Codexは、このAGENTS.mdを最優先の運用ルールとして参照してください。

---

## 基本目的

`LLLD Works Hub` は、社内で使うHTMLアプリ、PDF、教材、テンプレート、コンサル資料、補助金資料を1つの入口から開けるようにするためのポータルです。

以下を重視してください。

- 探しやすい
- 開きやすい
- 追加しやすい
- 説明しすぎない
- iPadでも使いやすい
- GitHub Pagesで壊れない

---

## ディレクトリ構成

原則として以下の構成を維持してください。

```text
/
├── index.html
├── AGENTS.md
├── README.md
├── assets/
│   ├── thumbnails/
│   └── icons/
├── apps/
│   └── app-name/
│       └── index.html
└── data/
    └── contents.json
```

---

## 重要ルール

1. トップページは必ず `index.html`。
2. コンテンツ一覧は原則 `data/contents.json` で管理する。
3. 新しいHTMLアプリは `/apps/app-name/index.html` に置く。
4. 既存アプリを追加するとき、トップページのHTMLを直接ベタ書きで増やさない。
5. 相対パスで実装する。
6. GitHub Pagesで動くことを優先する。
7. 外部CDNは原則使わない。
8. 社内向けなのでログイン機能は不要。
9. 説明文は短くする。
10. サムネイルがない場合は、カテゴリ別のプレースホルダーで表示する。

---

## UIUXルール

- 余計な説明書きは増やさない。
- トップに検索ボックスを置く。
- カテゴリフィルターを置く。
- よく使うものは最終利用履歴から最大8件を上位表示する。
- 最近使った履歴は `localStorage` に保存する。
- お気に入りも `localStorage` に保存する。
- お気に入り一覧は左ツールバーに表示し、左ツールバーから開けるようにする。
- メイン画面にお気に入りカード欄を作らない。
- コンテンツを開く操作は内部アプリ・外部リンクを問わず新しいタブで開く。
- 各カードにはサムネイル、タイトル、カテゴリ、種別、短い説明、更新日、開くボタンを表示する。
- iPadで押しやすいボタンサイズにする。
- PC、iPad、スマホで崩れないレスポンシブ対応にする。
- 文字は読みやすいフォントにする。
- 見た目は社内ツールとしてシンプルでよいが、カードの視認性は高くする。

---

## 入れてはいけない説明文

トップページには以下の文章を入れないでください。

- `LLLD Works Hubは、PDF編集・座席管理・小テスト作成・コンサル支援資料・補助金テンプレートなどをまとめる社内ポータルです。 「どこにある？」「これは使っていい？」を減らし、現場と管理の作業を速くします。`
- `毎日使うもの・まず見てほしいものを上に固定しています。`

---

## contents.json の形式

新しいコンテンツは以下の形式で追加してください。

```json
{
  "id": "unique-content-id",
  "title": "表示名",
  "category": "PDF",
  "type": "HTMLアプリ",
  "description": "短い説明文",
  "url": "./apps/app-name/index.html",
  "thumbnail": "./assets/thumbnails/app-name.png",
  "tags": ["タグ1", "タグ2"],
  "updatedAt": "2026-06-17",
  "external": false
}
```

### category の基本候補

- PDF
- 教室運用
- 教材作成
- コンサル
- 補助金
- 管理
- その他

### type の基本候補

- HTMLアプリ
- PDF
- テンプレート
- 資料
- 外部リンク

---

## 短い命令への対応ルール

ユーザーが短い命令をした場合でも、以下のように判断して実装してください。

### 「このHTMLを追加して」

やること：

1. HTMLを `/apps/適切な名前/index.html` に配置
2. `data/contents.json` にカード情報を追加
3. サムネイル指定がなければ空またはプレースホルダー扱い
4. トップページから開けることを確認
5. READMEに必要なら追記

### 「社内ポータルに追加して」

やること：

1. コンテンツの種類を判断
2. app名、category、type、descriptionを自然に補完
3. `contents.json` に追加
4. リンク切れがないか確認

### 「名前を変えて」

やること：

1. `contents.json` の `title` を変更
2. 必要に応じてタグや説明も軽く調整
3. IDやURLは勝手に変えない

### 「カテゴリを変えて」

やること：

1. `contents.json` の `category` を変更
2. フィルターにカテゴリが存在するか確認

### 「サムネをつけて」

やること：

1. 指定画像を `assets/thumbnails/` に配置
2. `contents.json` の `thumbnail` を更新
3. 画像がなくてもページが壊れないようにする

### 「公開して」または「GitHubに反映して」

やること：

1. `git status` を確認
2. 変更内容を確認
3. 破損しそうな差分がないか確認
4. コミット
5. push

コミットメッセージは内容に応じて簡潔にする。

例：

```text
Add pdf tool to Works Hub
Update Works Hub content list
Fix Works Hub card layout
```

---

## 初期登録するコンテンツ

初期状態では、最低限以下を登録してください。

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
  },
  {
    "id": "seatflow",
    "title": "座席管理",
    "category": "教室運用",
    "type": "HTMLアプリ",
    "description": "自習室、授業、面談室などの座席状況を管理するツール",
    "url": "./apps/seatflow/index.html",
    "thumbnail": "./assets/thumbnails/seatflow.png",
    "tags": ["座席", "自習室", "教室", "予約", "利用者"],
    "updatedAt": "2026-06-17",
    "external": false
  },
  {
    "id": "quiz-maker",
    "title": "小テスト作成",
    "category": "教材作成",
    "type": "HTMLアプリ",
    "description": "漢字、英単語、計算などの小テストを作成するツール",
    "url": "./apps/quiz-maker/index.html",
    "thumbnail": "./assets/thumbnails/quiz-maker.png",
    "tags": ["小テスト", "漢字", "英単語", "計算", "教材"],
    "updatedAt": "2026-06-17",
    "external": false
  },
  {
    "id": "exam-print",
    "title": "入試問題印刷",
    "category": "教材作成",
    "type": "HTMLアプリ",
    "description": "入試問題PDFを確認しながら印刷用に整理するツール",
    "url": "./apps/exam-print/index.html",
    "thumbnail": "./assets/thumbnails/exam-print.png",
    "tags": ["入試", "印刷", "PDF", "教材", "確認"],
    "updatedAt": "2026-06-17",
    "external": false
  },
  {
    "id": "consulting-kit",
    "title": "コンサル支援キット",
    "category": "コンサル",
    "type": "資料・テンプレート",
    "description": "採用、集客、育成、1on1、補助金支援で使う資料をまとめる場所",
    "url": "./apps/consulting-kit/index.html",
    "thumbnail": "./assets/thumbnails/consulting-kit.png",
    "tags": ["採用", "集客", "育成", "1on1", "補助金"],
    "updatedAt": "2026-06-17",
    "external": false
  }
]
```

---

## 実装後の確認項目

変更後は必ず以下を確認してください。

- トップページが表示される
- `contents.json` が読み込まれる
- 読み込み失敗時も初期データで表示される
- カードをクリックしてアプリが開く
- 検索が動く
- カテゴリフィルターが動く
- 最近使ったものが最大8件で保存される
- お気に入りが保存され、左ツールバーに表示される
- コンテンツを開く操作が新しいタブで開く
- iPad幅でも崩れない
- GitHub Pagesで相対パスが壊れない

## 変更後監査ルール

UIや動作を変更した後は、必ず `AUDIT.md` のチェック項目に沿って監査してください。

特に以下は毎回確認してください。

- コンテンツを開く操作が新しいタブで開く
- お気に入りが左ツールバーに表示され、左ツールバーから開ける
- メイン画面に不要なお気に入りカード欄を出さない
- 最終利用履歴の削除ボタンはホバー時に表示される
- GitHub Pages公開URLで反映済みである

---

## やってはいけないこと

- 不要な説明文を大量に追加しない
- 既存アプリの機能を勝手に大きく変更しない
- `contents.json` を使わずにカードをHTMLへ直書きで増やさない
- GitHub Pagesで使えない絶対パスを使わない
- 外部CDN前提にしない
- ユーザー確認なしにリポジトリ構成を大きく変えない
- ログイン機能やDB連携を勝手に追加しない

---

## 将来拡張の余地

今は静的HTMLで運用します。
将来的には以下を検討できますが、現時点では実装しないでください。

- Firebase / Supabase連携
- ログイン機能
- ユーザー別利用履歴
- 権限管理
- コンテンツ投稿フォーム
- 管理画面
- SaaS化

---

## 最短命令テンプレート

ユーザーは今後、以下の短い命令だけで運用できるようにしてください。

```md
このHTMLを社内ポータルに追加して。カテゴリはPDF。
```

```md
このアプリをWorks Hubに追加して。名前はSeatFlow。
```

```md
PDF編集ツールの名前をPDF編集・結合ツールに変えて。
```

```md
この画像をPDF編集ツールのサムネにして。
```

```md
変更をGitHubに反映して。
```

```md
リンク切れがないか確認して修正して。
```
