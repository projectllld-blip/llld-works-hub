# v0.16 RLS・他社データ混入テスト

## 目的

企業アカウントAでログインしたときに、企業アカウントBのデータが見えない、読めない、書けない、上書きできないことを確認する。

対象:

- `company_accounts`
- `app_instances`
- `app_data`
- `app_data.data_type = portal_state`
- `app_data.data_type = seat_layout`

## 実施状況

状態: HUMAN_REQUIREDで停止。

理由:

- 実DB上でRLS分離を確認するには、少なくとも2つのログイン可能な企業アカウントが必要。
- 現在のrepo内には、A社 / B社としてログインして検証できる認証情報は置かれていない。
- Supabase Dashboard操作、テストアカウント作成、既存データ確認、RLS適用状態の確認は人間確認領域。
- service role keyやsecretを使わずに検証する方針のため、Codex側で勝手にRLSを迂回した確認はしない。

## repo内で確認できたこと

`supabase/migrations/20260625_v010_company_account_foundation.sql` では、以下のRLS有効化が定義されている。

- `company_accounts`
- `apps`
- `app_instances`
- `app_data`
- `audit_logs`

`company_accounts` は `owner_user_id = auth.uid()` で本人所有分のみselect / insert / updateできる方針。

`app_instances` は `company_account_id` 経由で、ログイン中ユーザーが所有する `company_accounts.id` と一致する行のみselect / insert / updateできる方針。

`app_data` は `company_account_id` 経由で、ログイン中ユーザーが所有する `company_accounts.id` と一致する行のみselect / insert / updateできる方針。

`supabase/migrations/20260625_v014_seatflow_app_data_constraints.sql` では、SeatFlow保存用に `app_data(app_instance_id, data_type)` のunique indexが定義されている。

`supabase/migrations/20260627_v01411_portal_app_instance.sql` では、`works_portal` と `portal_state` 初期行の作成案が定義されている。ただし、このmigrationの実DB適用状況はrepo内だけでは確認できない。

## 未確認のRLSテスト項目

以下は実DBと2社分のログイン可能な企業アカウントが必要なため、未確認。

- 自社 `company_accounts` だけ取得できる
- 他社 `company_accounts` が見えない
- 自社 `app_instances` だけ取得できる
- 他社 `app_instances` が見えない
- 自社 `portal_state` だけ読める
- 他社 `portal_state` が読めない
- 他社 `portal_state` を更新できない
- 自社 `seat_layout` だけ読める
- 他社 `seat_layout` が読めない
- 他社 `seat_layout` を更新できない
- 実DBでRLSが有効である
- `works_portal` の `app_instances` と `portal_state` 初期行が各企業にある

## 人間が確認すること

Supabase Dashboardまたは人間が管理する検証環境で、以下を確認する。

1. RLSが `company_accounts` / `app_instances` / `app_data` で有効であること。
2. A社 / B社のテスト用ログインアカウントが用意されていること。
3. A社 / B社それぞれに `company_accounts` があること。
4. A社 / B社それぞれに `seatflow` と `works_portal` の `app_instances` があること。
5. A社 / B社それぞれに `seat_layout` と `portal_state` の検証用 `app_data` があること。
6. A社ログイン時にB社データがselect / updateできないこと。
7. B社ログイン時にA社データがselect / updateできないこと。

## ローカル確認結果

- `node --check assets/js/*.js`: OK
- `data/site-config.json` JSON parse: OK
- `portal.html` inline JS syntax check: OK
- `apps/seatflow/index.html` inline JS syntax check: OK
- `git diff --check`: OK
- secret scan: 禁止語としてdocs内に記載されているもののみ。実secret値の追加なし。

## 判断

v0.16は未完了。

RLS方針とmigration案はrepo内で確認できたが、完了条件である「他社データが取得できない」「他社データを更新できない」「RLSが有効である」は実DBで未確認。

次へ進むには、人間がSupabase検証環境と2社分のテストアカウントを確認し、その結果をCodexへ渡す必要がある。
