# 11 LABEL OPERATION RULES

このファイルはGitHub Issueラベル設計の文書です。今回、GitHub上のラベルを実際に作成・変更しません。GitHub管理画面操作が必要な場合は `HUMAN_REQUIRED: YES` で止まる。

## 基本ラベル
- `codex-ready`
  - Codexに作業させてよいIssue。
- `safe-to-continue`
  - STOP条件に該当せず、次へ進めてよい。
- `human-required`
  - 人間確認が必要。
- `blocked`
  - 何らかの理由で停止中。
- `needs-chatgpt-review`
  - ChatGPTに戻して方針確認が必要。

## 確認待ちラベル
- `needs-browser-check`
  - ブラウザ目視確認が必要。
- `needs-supabase-check`
  - Supabase Dashboard確認が必要。
- `needs-uiux-check`
  - UIUX・見た目・操作感の判断が必要。
- `needs-github-actions-check`
  - GitHub Actions結果確認が必要。
- `needs-github-settings`
  - GitHub Pages / Secrets / branch protection など設定確認が必要。

## 種別ラベル
- `automation`
  - Codex半自動運用基盤関連。
- `portal`
  - 社内ポータル関連。
- `marketplace`
  - Works Market関連。
- `supabase`
  - Supabase関連。
- `docs`
  - ドキュメント整備。
- `qa`
  - 自動チェック・品質確認。
- `security`
  - secret / auth / RLS / 権限関連。
- `uiux`
  - UIUX関連。

## ラベル運用ルール
- `human-required` が付いたIssueは、Codexが勝手に次へ進まない。
- `blocked` が付いたIssueは、解除理由が明確になるまで進めない。
- `needs-supabase-check` が付いたIssueは、人間がSupabase Dashboardを見る。
- `needs-browser-check` が付いたIssueは、人間がブラウザで確認する。
- `needs-uiux-check` が付いたIssueは、人間が見た目・体験を判断する。
- `safe-to-continue` が付いたIssueのみ、次Issueへ進める候補にする。

## よく使う組み合わせ
- A0系ドキュメント整備: `codex-ready`, `automation`, `docs`
- QA改善: `codex-ready`, `automation`, `qa`
- Supabase設計案: `codex-ready`, `supabase`, `docs`, `needs-supabase-check`
- UIUX確認: `human-required`, `needs-uiux-check`, `uiux`
- GitHub設定確認: `human-required`, `needs-github-settings`

## 人間作業として残すこと
- GitHub上でのラベル作成。
- ラベル色の設定。
- Issueへの既存ラベル適用。
- branch protection、Secrets、PagesなどGitHub Settings操作。
