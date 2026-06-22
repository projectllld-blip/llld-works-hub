# CODEX MASTER REQUEST
# LLLD Works Hub 商品カードモック・実装 自動化指示

## あなたの役割

あなたは、LLLD Works Hubの

- UIデザイナー
- 情報整理担当
- フロントエンド実装担当
- 商品カード設計担当

として動いてください。

## 最終目的

対象HTMLを渡されたときに、以下を自動で実行できるようにしてください。

1. HTMLの内容を読む
2. アプリの主機能を判断する
3. 商品カード用のタイトル・説明・カテゴリを整理する
4. thumbnailTypeを決める
5. サムネイルで何を見せるか決める
6. LLLD Works Hubのカードデザインに合わせる
7. 必要なら商品カード用モック画像の生成指示も作る
8. ポータルに実装できるカードデータを作る
9. 既存機能を壊さずに追加する

## 必ず読むファイル

- README.md
- 00_master_style_guide.md
- 01_thumbnail_rules.md
- 02_content_card_schema.md
- 03_html_analysis_rules.md
- 04_mock_generation_rules.md
- 05_implementation_rules.md
- 06_quality_checklist.md
- schemas/content_card.schema.json
- schemas/thumbnail_types.json
- schemas/sample_cards.json

## 重要方針

- 既存機能を壊さない
- GitHub Pagesで動く構成を維持する
- 外部DB・サーバー・重いフレームワークは使わない
- 商品カードはデータで管理し、今後追加しやすくする
- サムネイルは実画像があれば画像を使い、なければthumbnailTypeに応じた疑似サムネイルを表示する
- thumbnailTypeが不明な場合はgenericで代替する
- 日本の中小企業・塾・現場スタッフでもわかるUIにする
- 「誰でもプログラマー」案件として、現場発アプリのプラットフォーム感を出す

## 処理フロー

### Step 1: 既存確認
- ファイル構成を確認
- AGENTS.mdがあれば読む
- index.html, CSS, JS, dataファイルを確認
- 既存の検索・カテゴリ・お気に入り・利用履歴・並び替え機能を把握

### Step 2: 対象HTML解析
- title, h1, h2, button, table, form, localStorage, JS関数名を見る
- 主機能を特定
- カテゴリを推定
- thumbnailTypeを決める
- サムネイルで見せる要素を決める

### Step 3: カードデータ作成
`02_content_card_schema.md` に従ってカードデータを作る。

### Step 4: サムネイル方針
- 実画像がある場合：thumbnailImageを指定
- 実画像がない場合：thumbnailTypeの疑似サムネイルを使う
- 必要ならモック画像生成用プロンプトを作る

### Step 5: 実装
- 既存のカードレンダリング構造に合わせて追加
- もしカード構造が直書きなら、今後追加しやすいように配列化を検討
- ただし大規模改修で壊れるリスクがある場合は最小変更にする

### Step 6: 確認
`06_quality_checklist.md` に従って確認する。

## 完了報告フォーマット

```md
## 完了報告

### 変更ファイル
- 

### 追加したカード
```json
{}
```

### thumbnailType
- 採用：
- 理由：

### 既存機能確認
- 検索：
- カテゴリ：
- お気に入り：
- 利用履歴：
- 並び替え：
- 開くリンク：

### 今後の追加方法
- 

### 注意点
- 
```
