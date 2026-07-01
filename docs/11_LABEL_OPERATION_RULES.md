# 11 LABEL OPERATION RULES

## 目的
- Issue / PRの状態をラベルで短く判断できるようにする。
- Codexが続行してよい作業と、人間確認が必要な作業を分ける。
- docs-only自動マージ候補と危険変更を混ぜない。

## 基本ラベル
- `codex-ready`: Codexに作業させてよいIssue。
- `safe-to-continue`: STOP条件に該当せず、次へ進めてよい。
- `human-required`: 人間確認が必要。
- `blocked`: 何らかの理由で停止中。
- `needs-chatgpt-review`: ChatGPTに戻して方針確認が必要。

## 確認待ちラベル
- `needs-browser-check`: ブラウザ目視確認が必要。
- `needs-supabase-check`: Supabase Dashboard確認が必要。
- `needs-uiux-check`: UIUX・見た目・操作感の判断が必要。
- `needs-github-actions-check`: GitHub Actions結果確認が必要。
- `needs-github-settings`: GitHub Pages / Secrets / branch protectionなど設定確認が必要。

## 種別ラベル
- `automation`: Codex半自動運用基盤関連。
- `portal`: 社内ポータル関連。
- `marketplace`: Works Market関連。
- `supabase`: Supabase関連。
- `docs`: ドキュメント整備。
- `qa`: 自動チェック・品質確認。
- `security`: secret / auth / RLS / 権限関連。
- `uiux`: UIUX関連。

## A0.6 PR安全分類ラベル
- `safe/docs-only`: docs-onlyで自動マージ候補にできる可能性がある。
- `needs-human-review`: 人間レビューが必要。
- `blocked/secret-risk`: secret混入の疑いがある。
- `blocked/supabase-risk`: Supabase / DB / Authに影響する疑いがある。
- `blocked/rls-risk`: RLS無効化や権限破壊の疑いがある。
- `blocked/actions-failed`: GitHub Actionsまたは必須QAが失敗している。
- `automerge-candidate`: 自動マージ候補。ただし運用開始までは人間確認が必要。
- `do-not-automerge`: 自動マージ禁止。

## A0.7 安全PR自動マージラベル
- `safe-docs-automerge`: docs-onlyで安全条件を満たし、GitHub auto-merge候補にできるPR。
- `human-required`: 人間確認・判断・操作が必要なPR。
- `auto-merge-blocked`: 自動マージ候補ではない、または危険条件により自動マージしないPR。
- `auto-merge-setup-required`: GitHub auto-merge、branch protection、required checksなどの設定確認が必要なPR。

## ラベル運用ルール
- `human-required` が付いたIssue / PRは、Codexが勝手に次へ進まない。
- `blocked` が付いたIssue / PRは、解除理由が明確になるまで進めない。
- `needs-supabase-check` が付いたIssue / PRは、人間がSupabase Dashboardを見る。
- `needs-browser-check` が付いたIssue / PRは、人間がブラウザで確認する。
- `needs-uiux-check` が付いたIssue / PRは、人間が見た目・体験を判断する。
- `safe-to-continue` が付いたIssueのみ、次Issueへ進める候補にする。
- `do-not-automerge` が付いたPRは、自動マージしない。
- `blocked/secret-risk`、`blocked/supabase-risk`、`blocked/rls-risk` は必ず人間確認に回す。
- `automerge-candidate` は自動マージ候補であり、GitHub Settingsやbranch protectionの確認なしに実mergeを自動化しない。
- `human-required` が付いたPRは自動マージしない。
- `auto-merge-blocked` が付いたPRは自動マージしない。
- `auto-merge-setup-required` が付いたPRは、GitHub Settings、branch protection、required checks、auto-merge設定を人間が確認する。
- `safe-docs-automerge` が付いたPRでも、GitHub auto-merge設定に失敗した場合は `human-required` に戻す。

## GitHub上でのラベル作成
このdocsはラベル設計であり、GitHub上のラベル作成・変更は行わない。

GitHub管理画面操作が必要な場合は `HUMAN_REQUIRED: YES` とする。
