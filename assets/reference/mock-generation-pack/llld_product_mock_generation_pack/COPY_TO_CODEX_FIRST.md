# Codexに最初に貼る指示

このフォルダ一式は、LLLD Works Hubの商品カードモック・実装を標準化するための指示書セットです。

まず以下を読んでください。

- README.md
- codex/CODEX_MASTER_REQUEST.md
- 00_master_style_guide.md
- 01_thumbnail_rules.md
- 02_content_card_schema.md
- 03_html_analysis_rules.md
- 04_mock_generation_rules.md
- 05_implementation_rules.md
- 06_quality_checklist.md

そのうえで、対象HTMLを解析し、LLLD Works Hubに追加するための以下を作成してください。

1. 商品カード用データ
2. thumbnailTypeの判断
3. サムネイルに入れるべき要素
4. 商品カードモック画像生成用プロンプト
5. 既存ポータルへ追加するための実装案
6. 必要であれば実装

絶対に守ること：
- 既存機能を壊さない
- GitHub Pagesで動く構成を維持する
- localStorage互換性を壊さない
- 検索、カテゴリ、お気に入り、利用履歴、並び替えを維持する
- カードは今後追加しやすいデータ構造にする
- thumbnailImageがない場合はthumbnailTypeに応じた疑似サムネイルを出す
- thumbnailType不明時はgenericで代替する
