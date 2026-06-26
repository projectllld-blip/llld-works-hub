# 01 AUTOMATION ROADMAP

## A0.1 Codex半自動運用基盤
状態:
完了。

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
状態:
完了。

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

完了条件:
- Issue運用ルールがある
- ラベル運用ルールがある
- Codex作業Issueテンプレートが改善されている
- HUMAN_REQUIRED用Issueテンプレートがある
- TASK_QUEUEとPROJECT_STATUSが更新されている
- GitHub上のラベル作成は人間作業として残している

## A0.3 QA自動チェック強化
状態:
完了。

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

完了条件:
- QA workflowが強化されている
- secret scanがdocs内の禁止語説明で誤検知しにくい
- JSON parseチェックがある
- JS構文チェックがある
- 主要HTML存在確認がある
- 主要HTML内のローカルリンク確認がある
- QA運用ルールが文書化されている
- GitHub Actionsのリモート実行確認は人間作業として残している

## A0.4 Codex文脈圧縮・引き継ぎ運用
状態:
完了。

目的:
Codex会話履歴を溜めず、圧縮された作業票だけで進行する。

やること:
- PROJECT_STATUS更新ルール
- DECISION_LOG更新ルール
- TASK_QUEUE更新ルール
- HANDOFF_TEMPLATE運用
- NEXT_PROMPT_RULES改善

完了条件:
- `docs/13_CONTEXT_HANDOFF_RULES.md` がある
- PROJECT_STATUS更新ルールが明確
- DECISION_LOG更新ルールが明確
- TASK_QUEUE更新ルールが明確
- HANDOFF_TEMPLATEが短い作業票として改善されている
- NEXT_PROMPT_RULESが長い会話ログに依存しない形に改善されている
- 本体機能を変更していない

## A0.5 PRレビュー運用
状態:
進行中。

目的:
Codexの変更をPR単位で確認できるようにする。

やること:
- PRテンプレート
- 作業ブランチ運用
- QA通過後にマージ
- 重要変更は人間レビュー必須

完了条件:
- `docs/14_PR_REVIEW_RULES.md` がある
- `docs/15_BRANCH_OPERATION_RULES.md` がある
- `docs/16_HUMAN_REQUIRED_PR_RULES.md` がある
- PRテンプレートが改善されている
- PRレビュー観点が明文化されている
- マージ前チェックリストがある
- HUMAN_REQUIRED時のPR扱いが明確
- A0.6 / A0.7は人間確認後に進める扱いになっている
- 本体機能を変更していない

## A0.6 Codex GitHub Action連携検討
状態:
人間確認後に進める候補。

目的:
Codex GitHub Actionを使って、レビューやパッチ提案をCI/CD上で実行できるか検討する。

注意:
この段階では、APIキーやGitHub Secretsが必要になる可能性があります。実際の設定は人間確認が必要なので、勝手に進めないでください。

## A0.7 HUMAN_REQUIREDダッシュボード化
状態:
人間確認後に進める候補。

目的:
人間が見るべき作業だけを一覧化する。

分類:
- Supabase確認待ち
- ブラウザ確認待ち
- UIUX確認待ち
- GitHub Pages確認待ち
- 外部サービス設定待ち
- 本番判断待ち
