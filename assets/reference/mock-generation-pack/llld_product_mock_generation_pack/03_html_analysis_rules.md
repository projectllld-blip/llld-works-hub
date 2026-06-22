# 03 HTML Analysis Rules

## 目的

対象HTMLを読み取り、商品カード化に必要な情報を抽出する。

CodexやAIは、HTMLの見た目だけでなく、  
タグ、クラス名、テキスト、ボタン、画面構造、スクリプト内のデータを確認して、  
アプリの主機能を判断する。

---

## 解析手順

### 1. HTML全体を読む
以下を確認する。

- title
- h1 / h2 / h3
- nav / header / sidebar
- button
- input
- table
- form
- canvas
- svg
- section
- main
- data配列
- localStorageキー
- script内の関数名
- コメント

---

### 2. アプリ名候補を抽出する

優先順位：
1. titleタグ
2. h1
3. ヘッダーの主要テキスト
4. ファイル名
5. ボタンやメニューから推定

出力：
- appNameCandidate
- finalTitle

---

### 3. 主機能を推定する

以下から判断する。

- どのUI要素が一番多いか
- どの機能ボタンが中心か
- ユーザーが何を入力するか
- 何を出力するか
- 表示されるデータは何か
- localStorageに保存されるものは何か

出力：
- mainFunction
- userGoal
- keyActions

---

### 4. thumbnailTypeを決める

`01_thumbnail_rules.md` に従って判定する。

複数候補がある場合は、以下で決める。

1. 視覚的にわかりやすい
2. ユーザーの主目的に近い
3. 商品カードで魅力が伝わる
4. 既存カードと並べたときに違いが出る

出力：
- thumbnailType
- thumbnailTypeReason

---

### 5. サムネイルに使う代表画面を決める

以下を抽出する。

- thumbnailFocus
- visibleElements
- simplifiedMockElements

例：
```json
{
  "thumbnailFocus": "勤怠一覧表とステータスチップ",
  "visibleElements": ["氏名", "出勤時間", "退勤時間", "ステータス"],
  "simplifiedMockElements": ["7行程度の勤怠表", "緑/黄色/赤のチップ", "上部のエクスポート・フィルター"]
}
```

---

### 6. 商品カード文言を整理する

出力する項目：

- title
- category
- type
- description
- badge
- tags
- status
- audience
- summary

### descriptionの作り方
1行で用途が伝わるようにする。

例：
- PDFの結合・編集・変換を簡単に
- 教室の座席配置と出欠を一元管理
- 小テストを作成・出力
- 出退勤の記録・集計を効率化
- 申請書作成を効率化
- 提案・相談資料を簡単に作成

---

## カテゴリ推定ルール

### 塾事業
- 生徒
- 教室
- 座席
- 授業
- 小テスト
- 入試
- 講師
- 面談
- 教材

### コンサル事業
- 補助金
- 提案
- 相談資料
- 経営
- 採用
- 集客
- 1on1
- 研修
- 支援資料

### 社内運営
- 勤怠
- 申請
- PDF
- 社員
- 出力
- 管理
- 業務
- 申請フォーム
- テンプレート

### HTMLアプリ
- 独立したHTMLツール
- ブラウザ上で動く業務アプリ
- localStorageやJSで処理するもの

### テンプレート
- 書類雛形
- 文章テンプレ
- フォーマット
- 提案書、申請書、所見文など

---

## 出力形式

HTML解析後、まず以下のJSONを出す。

```json
{
  "analysis": {
    "appNameCandidate": "",
    "finalTitle": "",
    "mainFunction": "",
    "userGoal": "",
    "keyActions": [],
    "detectedKeywords": [],
    "categoryCandidate": "",
    "typeCandidate": "",
    "thumbnailType": "",
    "thumbnailTypeReason": "",
    "thumbnailFocus": "",
    "visibleElements": [],
    "simplifiedMockElements": []
  },
  "card": {
    "id": "",
    "title": "",
    "category": "",
    "type": "",
    "description": "",
    "url": "",
    "thumbnailType": "",
    "thumbnailImage": "",
    "iconType": "",
    "badge": "",
    "tags": [],
    "status": "公開中",
    "featured": false,
    "favoriteEnabled": true,
    "detailEnabled": true,
    "primaryActionLabel": "開く",
    "audience": "",
    "summary": "",
    "thumbnailFocus": "",
    "sourceHtml": "",
    "mockImage": ""
  }
}
```

---

## 注意

- HTMLに書かれていない情報を断定しない
- 不明な場合は「推定」と明記する
- カテゴリが迷う場合は、主利用シーンで判断する
- 複数カテゴリにまたがる場合は、primaryCategory と tags で分ける
- 実装時に既存リンクや既存機能を壊さない
