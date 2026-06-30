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

状態: HUMAN_REQUIREDで停止中。

2026-07-01時点で、乙アカウントの `works_portal` 有効化補正後、`portal_state` の甲乙分離は人間のブラウザ確認で通過した。

一方、`seat_layout` の甲乙分離は、repo内コード上の保存・読込条件は確認できたが、甲乙それぞれで保存・読込・相互不可視を実DB上で確認した結果がまだない。

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

`assets/js/seatflowCloudService.js` では、SeatFlowの保存・読込時に以下の条件を使う。

```text
app_key = seatflow
data_type = seat_layout
company_account_id = ログイン中企業アカウントID
app_instance_id = ログイン中企業のseatflow app_instances.id
```

`assets/js/portalStateService.js` では、Works Portalの保存・読込時に以下の条件を使う。

```text
app_key = works_portal
data_type = portal_state
company_account_id = ログイン中企業アカウントID
app_instance_id = ログイン中企業のworks_portal app_instances.id
```

## 2026-07-01 乙アカウント補正後の確認

人間側で以下を確認済み。

- 乙の `company_accounts.owner_user_id` は乙のAuth user idと一致。
- 乙の `app_instances` に `works_portal` が存在。
- 乙の `app_instances` に `seatflow` が存在。
- 必要な補正SQLは人間が適用済み。
- Supabase Dashboard上でRLSを無効化していない。
- service role keyは使用していない。

ブラウザ確認済みの `portal_state` 項目:

- 乙アカウントで `portal.html` にログインできる。
- 乙アカウントで「ポータル保存がまだ有効化されていません」が消える。
- 乙アカウントで `乙_RLS確認_ポータルメモ` を追加できる。
- 乙アカウントで保存済み表示が出る。
- 乙アカウントでリロード後もメモが残る。
- 甲アカウントで乙のメモが見えない。
- 甲アカウントで `甲_RLS確認_ポータルメモ` を追加できる。
- 乙アカウントで甲のメモが見えない。

## 現時点の判定

### portal_state

判定: 甲乙分離を確認済み。

根拠:

- 乙の `works_portal` app_instance補正後、乙のポータル保存が有効化された。
- 甲乙それぞれで別メモを保存し、相互に見えないことを人間がブラウザ確認した。
- コード上も `company_account_id` と `app_instance_id` を条件に `app_data.data_type = portal_state` を読込・保存している。

### seat_layout

判定: 未完了。

根拠:

- 乙の `seatflow` app_instance が存在することは人間確認済み。
- コード上は `company_account_id` と `app_instance_id` を条件に `app_data.data_type = seat_layout` を読込・保存している。
- ただし、甲乙それぞれでSeatFlowレイアウトを保存し、相互に見えないことのブラウザ確認結果はまだない。

## 未確認のRLSテスト項目

以下はまだ未確認。

- 甲アカウントで `甲_RLS確認_SeatFlowレイアウト` を保存できる。
- 乙アカウントで `乙_RLS確認_SeatFlowレイアウト` を保存できる。
- 甲アカウントで乙の `seat_layout` が見えない。
- 乙アカウントで甲の `seat_layout` が見えない。
- 甲アカウントで乙の `seat_layout` を更新できない。
- 乙アカウントで甲の `seat_layout` を更新できない。

## 人間が確認すること

SeatFlow画面で以下を確認する。

1. 甲アカウントでログインし、`apps/seatflow/index.html` を開く。
2. 甲だけの識別名を持つレイアウトを作成し、クラウド保存する。
3. 乙アカウントでログインし、`apps/seatflow/index.html` を開く。
4. 乙だけの識別名を持つレイアウトを作成し、クラウド保存する。
5. 甲で再ログインし、乙のレイアウトが見えないことを確認する。
6. 乙で再ログインし、甲のレイアウトが見えないことを確認する。

## ローカル確認結果

- `node --check assets/js/*.js`: OK
- `data/site-config.json` JSON parse: OK
- `portal.html` inline JS syntax check: OK
- `apps/seatflow/index.html` inline JS syntax check: OK
- `git diff --check`: OK
- secret scan: 禁止語としてdocs内に記載されているもののみ。実secret値の追加なし。

## 判断

v0.16は未完了。

`portal_state` の甲乙分離は確認済み。`seat_layout` の甲乙分離は、コード上の条件は妥当だが実DB・ブラウザ確認が未完了。

v0.17へ進む前に、SeatFlowの甲乙分離確認が必要。
