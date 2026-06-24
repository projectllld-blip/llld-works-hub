# LLLD Product Mock Generation Pack

このフォルダは、LLLD Works Hub に掲載する **商品カードモック画像** を安定して作るための指示書セットです。

目的は、HTMLアプリ・テンプレート・資料をCodexやChatGPTに渡したときに、

- HTMLの主機能を読み取る
- どの画面をサムネ化すべきか判断する
- 商品カードとして必要な情報を整理する
- LLLD Works Hubの世界観に合った高品質なカードモックを作る
- その後、ポータルHTMLへ実装しやすいデータ構造へ落とす

という流れを標準化することです。

---

## 使い方

Codexに丸投げする場合は、まず以下のファイルを読ませてください。

1. `codex/CODEX_MASTER_REQUEST.md`
2. `00_master_style_guide.md`
3. `01_thumbnail_rules.md`
4. `02_content_card_schema.md`
5. `03_html_analysis_rules.md`
6. `04_mock_generation_rules.md`
7. `05_implementation_rules.md`
8. `06_quality_checklist.md`

そのうえで、対象HTMLを渡して、

```txt
このHTMLを読み取り、LLLD Works Hub向けの商品カードモック画像と、ポータル実装用のカードデータを作成してください。
```

と指示してください。

---

## このパックの役割

### 00_master_style_guide.md
LLLD Works Hubの商品カード全体のデザインルールです。

### 01_thumbnail_rules.md
HTMLを読んだときに、何をサムネイル化すべきか判断するルールです。

### 02_content_card_schema.md
商品カードに必要な項目定義です。

### 03_html_analysis_rules.md
HTMLからアプリ情報を抜き出すための解析ルールです。

### 04_mock_generation_rules.md
画像生成・モック作成時の具体的な指示です。

### 05_implementation_rules.md
生成したカード情報をHTML/CSS/JSへ実装するためのルールです。

### 06_quality_checklist.md
提出前の確認項目です。

### schemas/
JSON形式の定義データです。Codexがデータ構造を扱いやすいようにしています。

### prompts/
実際にCodexやChatGPTへ投げるコピペ用プロンプトです。

### templates/
新規アプリ追加時に使うテンプレートです。

### references/
今回作成した商品カードモックの参考画像を格納するフォルダです。

---

## 最終目標

最終的には、以下のような指示だけで動く状態を目指します。

```txt
このHTMLをLLLD Works Hubに追加してください。
商品カード用のモックも作成し、既存デザインルールに合わせて実装してください。
```

そのために、このパックでは「判断基準」「カード構造」「サムネイル化ルール」「実装ルール」を明文化しています。
