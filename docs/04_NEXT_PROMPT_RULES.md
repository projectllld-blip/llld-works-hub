# 04 NEXT PROMPT RULES

Codexは作業完了時、次にCodexへ投げる指示を作る。

## 必ず守ること
- 過去会話全文を前提にしない。
- 参照すべきrepo内ドキュメントを書く。
- 今回の変更点を短く含める。
- 次の作業目的を明確にする。
- 触ってよいファイルを書く。
- 触ってはいけないファイルを書く。
- STOP条件に従うことを書く。
- 報告フォーマットに従うことを書く。
- `HUMAN_REQUIRED: YES` の場合は、次Codex指示よりも人間がやることを優先して書く。
- 古い未採用案や不要な過去ログを混ぜない。
- secretやAPIキーを含めない。

## 次プロンプトに含めるもの
- 今回の作業。
- 目的。
- 必ず参照するファイル。
- 前回の変更点。
- 触ってよいファイル。
- 触ってはいけないファイル。
- STOP条件。
- 確認項目。
- 報告フォーマット。

## 次プロンプトに含めないもの
- 長い会話ログ。
- Codexの内部作業過程。
- 古い未採用案。
- secretやAPIキー。
- 不要な過去ログ。

## 次プロンプトの基本形
```md
# LLLD Works Hub / Works Market

## 今回の作業

## 目的

## 必ず参照するファイル
- AGENTS.md
- docs/00_PROJECT_STATUS.md
- docs/02_STOP_CONDITIONS.md
- docs/03_CODEX_REPORT_FORMAT.md
- docs/04_NEXT_PROMPT_RULES.md
- docs/06_TASK_QUEUE.md

## 前回の変更点

## 触ってよいファイル

## 触ってはいけないファイル

## STOP条件
docs/02_STOP_CONDITIONS.md に該当した場合は、それ以上進めず HUMAN_REQUIRED: YES で報告すること。

## 確認項目

## 報告フォーマット
docs/03_CODEX_REPORT_FORMAT.md に従うこと。
```

## HUMAN_REQUIRED時の優先順
1. 人間が止めるべき理由を書く。
2. 人間が次に確認・設定・判断することを書く。
3. 確認完了後に再開するための最小プロンプトを書く。

## HUMAN_REQUIRED時に優先するもの
- `STOP_REASON`
- 人間が次にやること
- 確認完了後に再開するための最小プロンプト
