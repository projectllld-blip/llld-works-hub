# v0.18 検証環境デプロイ

## 状態

完了。

GitHub Pages公開版について、Codex確認と人間確認の両方で、v1.0前の検証環境として使える状態であることを確認済み。

v0.18は販売開始や本番運用ではなく、GitHub Pages上の公開環境をv1.0前の検証環境として確認するPhase。

## Codex確認結果

2026-07-01時点で、以下を確認済み。

- GitHub Pages主要URL HTTP 200。
- `data/site-config.json` はJSON parse可能。
- `auth.mode = supabase`。
- Supabase URLが存在する。
- Supabase anon keyが存在する。
- `service_role` / `sb_secret_` / `SUPABASE_SERVICE_ROLE` / `DATABASE_URL` / `PRIVATE KEY` / `OPENAI_API_KEY` / `STRIPE_SECRET` / `GITHUB_TOKEN` などのsecretらしき文字列は `data/site-config.json` に含まれていない。
- v0.17b / v0.17c / v0.17d はPARKED。
- SeatFlow完全クラウド同期はPARKED。

## 公開URL確認

以下のGitHub Pages公開URLは、人間確認済み。

```text
/portal.html      YES
/login.html       YES
/signup.html      YES
/account.html     YES
/marketplace.html YES
```

ルート `/` も人間確認済み。

公開URL:

```text
https://projectllld-blip.github.io/llld-works-hub/
```

## 認証・ポータル導線の人間確認結果

以下を人間確認済み。

- 未ログインで `portal.html` を開くとloginに誘導される: YES。
- login後に `portal.html` へ戻れる: YES。
- `account.html` が開ける: YES。
- `portal.html` がログイン後に開ける: YES。

## 表示確認結果

以下を人間確認済み。

- PC表示で通常利用できる: YES。
- スマホ表示で大きな横崩れがない: YES。
- iPad相当幅で大きな崩れがない: YES。
- `portal.html` のヘッダー非表示・大きな横崩れは解消: YES。

スマホ版には軽微なUI修正余地が残るが、v0.18を止めるほどの大きな崩れではない。

残る軽微なUI調整は別タスクとして扱う。

## レスポンシブヘッダー修正

以下の修正はmainへ反映済み。

- branch: `fix/v018-portal-responsive-header`
- commit: `d3e0d72 fix: keep portal header visible on narrow screens`

修正内容:

- `portal.html` のヘッダーが狭幅で横崩れ・非表示になりやすい問題を修正。
- 1180px以下で検索欄を2段目へ移動。
- 900px以下 / 520px以下で段階的に縦積み・縮小・折り返し。
- Supabase設定、RLS、migration、DBには変更なし。
- secret混入なし。

## PARKED範囲

以下は引き続きPARKED。

- SeatFlow完全クラウド同期。
- SeatFlow複数レイアウト同期。
- SeatFlow名簿 / QR / NFC / メモのクラウド保存。
- SeatFlow全体状態の完全バックアップ・復元。
- 複数タブ競合解決。
- v0.17b バックアップJSONエクスポートMVP。
- v0.17c バックアップJSON読込・検証・プレビュー。
- v0.17d 限定復元設計。
- 復元実装。

## v0.18の判断

v0.18 検証環境デプロイは完了扱いにする。

次の候補は `v1.0 アカウント別クラウド基盤MVP完成`。

v1.0では、v0.18までに完了した以下を前提に、MVP完成条件の最終整理を行う。

- signup / login / account / portal の公開版導線確認。
- `portal_state` 保存・復元方針。
- RLS・他社データ混入テストの限定範囲確認。
- `works_portal` 基盤アプリ付与方針。
- PARKED範囲をv1.0に含めない判断。
