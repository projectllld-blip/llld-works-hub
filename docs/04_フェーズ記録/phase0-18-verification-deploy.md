# v0.18 検証環境デプロイ

## 状態

Codexで確認できる範囲の公開URL確認、設定ファイル確認、PARKED範囲確認は完了。

v0.18は販売開始や本番運用ではなく、GitHub Pages上の公開環境をv1.0前の検証環境として使えるか確認するPhase。

v1.0へ進む前に、人間によるブラウザ操作確認、Supabase Auth URL設定確認、RLS最終確認が必要。

## 公開URL確認

2026-07-01時点で、以下のGitHub Pages公開URLはHTTP 200を確認済み。

```text
/                                      200
/portal.html                           200
/login.html                            200
/signup.html                           200
/account.html                          200
/marketplace.html                      200
/apps/quiz-maker/index.html            200
/apps/exam-print/index.html            200
/apps/pdf-tool/index.html              200
/apps/seatflow/index.html              200
/apps/dakokun/index.html               200
/contents/meeting-support/index.html   200
```

公開URL:

```text
https://projectllld-blip.github.io/llld-works-hub/
```

## site-config確認

`data/site-config.json` について、以下を確認済み。

- JSON parse可能。
- `auth.mode = supabase`。
- Supabase URLが存在する。
- Supabase anon keyが存在する。
- `service_role` / `sb_secret_` / `SUPABASE_SERVICE_ROLE` / `DATABASE_URL` / `PRIVATE KEY` / `OPENAI_API_KEY` / `STRIPE_SECRET` / `GITHUB_TOKEN` などのsecretらしき文字列は含まれていない。

フロントに置いてよいのは公開前提のSupabase anon / public / publishable keyのみ。

## 公開版で人間が確認すること

以下はCodexだけでは完了扱いにせず、人間がGitHub Pages公開版で確認する。

- signupできるか。
- loginできるか。
- logoutできるか。
- 未ログインで `portal.html` を開くとloginに誘導されるか。
- login後に `portal.html` へ戻れるか。
- `account.html` に企業情報が表示されるか。
- `account.html` に利用アプリ一覧が表示されるか。
- `portal.html` が開けるか。
- `portal_state` が保存・復元されるか。
- 甲乙など別企業アカウントでデータが混ざらないか。
- iPad / スマホ / PCで主要導線が破綻しないか。

## Supabase Dashboardで人間が確認すること

CodexはSupabase Dashboard操作を行わない。

v1.0へ進む前に、人間が必要に応じて以下を確認する。

- Supabase Auth URL ConfigurationがGitHub Pages公開URLに対応しているか。
- RLSが有効なままか。
- `company_accounts` / `app_instances` / `app_data` のRLS前提が崩れていないか。
- `works_portal` app_instanceが新規企業アカウントに付与される状態か。
- 公開版で `portal_state` 保存・復元が通るか。

## PARKED範囲

以下はv0.18では実装しない。

- v0.17b バックアップJSONエクスポートMVP。
- v0.17c バックアップJSON読込・検証・プレビュー。
- v0.17d 限定復元設計。
- 復元実装。
- SeatFlow完全クラウド同期。
- SeatFlow複数レイアウト同期。
- SeatFlow名簿 / QR / NFC / メモのクラウド保存。
- SeatFlow全体状態の完全バックアップ・復元。
- SeatFlow複数タブ競合解決。
- 本格的な同時編集対応。

バックアップ導線はmain未反映のため、GitHub Pages公開版には表示されない状態を正とする。

## v1.0前の残タスク

v1.0 アカウント別クラウド基盤MVP完成へ進む前に、以下を確認する。

- GitHub Pages公開版で主要ページを目視確認する。
- signup / login / logoutを確認する。
- login後の `account.html` と `portal.html` の導線を確認する。
- `portal_state` の保存・復元を確認する。
- 甲乙など別企業アカウントで `portal_state` が混ざらないことを確認する。
- Supabase Auth URL Configurationを確認する。
- RLS最終確認を行う。
- iPad / スマホ実機で主要導線を確認する。
- PARKED範囲をv1.0に含めないことを再確認する。
- v1.0へ進めるか人間が判断する。

## v0.18の判断

Codex確認範囲では、GitHub Pages公開環境の静的配信と設定ファイルは検証環境として成立している。

ただし、ログイン、保存、RLS、実機表示は人間確認が必要。

そのため、v0.18は「Codex確認完了 / 人間確認待ち」とする。
