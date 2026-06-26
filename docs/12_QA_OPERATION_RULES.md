# 12 QA OPERATION RULES

## QAの目的
- Codex作業後、人間レビュー前に最低限の事故を検出する。
- secret混入を防ぐ。
- JS / JSONの単純な構文エラーを防ぐ。
- 主要HTMLの欠落を防ぐ。
- ローカルリンク切れを早めに見つける。
- GitHub Pages前提を壊さない。

## QAで検出するもの
- whitespace error
- JSON parse error
- JS syntax error
- 主要HTML欠落
- ローカルリンク先欠落
- secretらしき文字列

## QAで検出しないもの
- UIUXの良し悪し。
- ブラウザ上の実動作。
- Supabaseの実接続。
- RLSの正しさ。
- GitHub Pages公開後の表示確認。
- iPad / スマホ / PCでの見え方。
- 人間の好み判断。

## QAが落ちた場合の扱い
- 原則、次の作業へ進まない。
- Codexが修正可能な場合は修正する。
- GitHub Actions設定や権限が原因の場合は `HUMAN_REQUIRED: YES`。
- secret混入の疑いがある場合は `HUMAN_REQUIRED: YES`。
- 本番設定や外部サービス設定が必要な場合は `HUMAN_REQUIRED: YES`。

## 現在の自動チェック
- `git diff --check`
- 主要HTMLファイル存在確認
- repo内JSON parse
- repo内JS構文チェック
- 実装・設定ファイル中心のsecret pattern scan
- 主要HTML内のローカル `href` / `src` 存在確認

## secret scanの考え方
- `docs/`、`AGENTS.md`、Issueテンプレート、PRテンプレート、Markdownドキュメントは説明目的で禁止語を書くため、scan対象から外す。
- `.html`、`.js`、`.css`、`.json`、`.yml`、`.yaml`、`.env`、設定ファイル、実装ファイルを中心に見る。
- `service_role`、`sb_secret_`、APIキー名、secret名の疑いが出た場合は、実値でなくても慎重に確認する。

## 人間確認として残すこと
- GitHub Actionsのリモート実行結果。
- GitHub Actions権限やSettingsの確認。
- GitHub Pages公開URLでの表示確認。
- ブラウザ、iPad、スマホ、PCでの目視確認。
- Supabase Dashboard、RLS、実DB接続確認。
