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
完了。

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

## A0.6 PR安全分類・docs-only自動マージ設計
状態:
完了。

目的:
docs-only PRを安全に分類し、危険変更を自動マージ対象から外す運用を設計する。

やること:
- PR分類ルールを作る
- docs-only自動マージ候補の条件を整理する
- secret / RLS / Supabase / Auth / migration riskの停止条件を整理する
- GitHub Actions案をdocsに残す
- ラベル運用案を整理する

完了条件:
- `docs/14_PR_SAFE_AUTOMERGE_RULES.md` がある
- docs-only自動マージ候補の条件がある
- 自動マージ禁止条件がある
- GitHub Actions案がdocsにある
- 実際のworkflow実装はしていない
- GitHub Settings / branch protection / Secrets変更は人間作業として残している

注意:
この段階では設計のみ。GitHub Actions実装、GitHub Settings変更、branch protection変更、auto-merge有効化は勝手に進めない。

## A0.7 HUMAN_REQUIRED判定修正・安全PR自動マージ実装
状態:
完了。

目的:
HUMAN_REQUIREDを「人間が実務として確認・判断・操作する必要があるか」で判定するように修正し、安全なdocs-only PRだけGitHub auto-merge候補にする。

やること:
- HUMAN_REQUIREDの新定義をdocs化
- PR_STATUS / MERGE_REQUIRED / MERGE_METHOD / AUTO_MERGE_ELIGIBLE / AUTO_MERGE_STATUSを報告フォーマットへ追加
- `docs/**` と `README.md` だけの安全PRを分類
- 危険ファイル、危険語、fork PR、draft PR、workflow変更PRを自動マージ対象外にする
- safeなdocs-only PRだけGitHub auto-mergeを有効化
- 判定結果をPRコメントへ残す

完了条件:
- `.github/workflows/pr-safe-automerge.yml` がある
- `docs/15_HUMAN_REQUIRED_RULES.md` がある
- GitHub auto-merge設定不足時は `human-required` に戻る
- 今回のA0.7 PR自身は `.github/workflows/**` 変更を含むため自動マージ対象外として扱う

## A0.8/A0.9 docs-only自動マージ判定の厳密化
状態:
完了。

目的:
docs-only PRに含まれる禁止語・確認語の説明を、実secret値やRLS無効化SQLと区別し、安全なdocs-only PRの自動マージ候補化を維持する。

やること:
- 単純な危険語出現だけでブロックしない
- `service_role`、`sb_secret_`、`secret`、`disable row level security`、`RLS`、`migration` などの説明語をdocsでは許容する
- 実secret値、private key block、RLS無効化SQLらしき追加は引き続きブロックする
- `docs/14_PR_SAFE_AUTOMERGE_RULES.md` と `docs/15_HUMAN_REQUIRED_RULES.md` を更新する

完了条件:
- `.github/workflows/pr-safe-automerge.yml` が実secret値と説明語を区別する
- STOP条件docsに説明語だけでは停止しないことが明記されている
- 実secret値・RLS無効化SQLは引き続き停止条件になっている
- 今回のA0.8/A0.9 PR自身は `.github/workflows/**` 変更を含むため自動マージ対象外として扱う
