# HTMLをLLLD Works Hubへ追加実装するプロンプト

あなたはLLLD Works Hubの実装担当です。

対象HTMLを読み取り、以下を実施してください。

## 参照ファイル

- 00_master_style_guide.md
- 01_thumbnail_rules.md
- 02_content_card_schema.md
- 03_html_analysis_rules.md
- 05_implementation_rules.md
- 06_quality_checklist.md

## やること

1. 対象HTMLの主機能を解析する
2. 商品カード用データを作成する
3. thumbnailTypeを決める
4. thumbnailImageがある場合はそれを使う
5. 画像がない場合はCSS/HTMLの疑似サムネイルを表示する
6. LLLD Works Hubのコンテンツ一覧にカードを追加する
7. 検索・カテゴリ・お気に入り・利用履歴・並び替えが壊れていないか確認する

## 守ること

- 既存機能を壊さない
- 既存リンクを壊さない
- GitHub Pagesで動く
- 外部DBは使わない
- localStorage互換性を保つ
- カードは今後追加しやすい構造にする

## 完了後に報告すること

1. 変更ファイル一覧
2. 追加したカードデータ
3. thumbnailTypeの判断理由
4. 既存機能の確認結果
5. 今後モック画像に差し替える場合の方法
