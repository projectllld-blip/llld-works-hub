# 01 AUTOMATION ROADMAP

## A0.1 Codex半自動運用基盤
目的:
Codexが安全に作業し、人間確認が必要なときだけ止まる基盤を作る。

完了条件:
- `AGENTS.md` がある
- STOP条件がある
- 報告フォーマットがある
- 次プロンプト生成ルールがある
- PROJECT_STATUS がある
- TASK_QUEUE がある
- HANDOFF_TEMPLATE がある
- PROMPT_QUALITY_RULES がある
- HUMAN_REVIEW_GUIDE がある

## A0.2 GitHub Issue運用化
目的:
Codexへの依頼をチャットではなくIssue単位にする。

やること:
- Issueテンプレート整備
- ラベル案作成
- `codex-ready`
- `human-required`
- `blocked`
- `needs-browser-check`
- `needs-supabase-check`
- `needs-uiux-check`
- `safe-to-continue`

## A0.3 QA自動チェック強化
目的:
人間が読む前に最低限のチェックを自動化する。

やること:
- HTML構文チェック
- JS構文チェック
- JSON parse
- `git diff --check`
- secret scan
- 既存リンクチェック
- GitHub Pages対象確認

## A0.4 Codex文脈圧縮・引き継ぎ運用
目的:
Codex会話履歴を溜めず、圧縮された作業票だけで進行する。

やること:
- PROJECT_STATUS更新ルール
- DECISION_LOG更新ルール
- TASK_QUEUE更新ルール
- HANDOFF_TEMPLATE運用

## A0.5 PRレビュー運用
目的:
Codexの変更をPR単位で確認できるようにする。

やること:
- PRテンプレート
- 作業ブランチ運用
- QA通過後にマージ
- 重要変更は人間レビュー必須

## A0.6 Codex GitHub Action連携検討
目的:
Codex GitHub Actionを使って、レビューやパッチ提案をCI/CD上で実行できるか検討する。

注意:
この段階では、APIキーやGitHub Secretsが必要になる可能性があります。実際の設定は人間確認が必要なので、勝手に進めないでください。

## A0.7 HUMAN_REQUIREDダッシュボード化
目的:
人間が見るべき作業だけを一覧化する。

分類:
- Supabase確認待ち
- ブラウザ確認待ち
- UIUX確認待ち
- GitHub Pages確認待ち
- 外部サービス設定待ち
- 本番判断待ち
