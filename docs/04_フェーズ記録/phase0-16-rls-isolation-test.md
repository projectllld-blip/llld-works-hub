# v0.16 RLS・他社データ混入テスト

## 目的

企業アカウントAでログインしたときに、企業アカウントBのデータが見えない、読めない、書けない、上書きできないことを確認する。

対象:

- `company_accounts`
- `app_instances`
- `app_data`
- `app_data.data_type = portal_state`
- `app_data.data_type = seat_layout`

## 現在の状況

状態: `seat_layout` のクラウド保存・読込再確認中。

`portal_state` は、works_portal app_instance自動付与migration適用後に保存・復元できる状態まで確認済み。

`seat_layout` は、同一アカウントの別ブラウザでレイアウトが復元されない問題が見つかったため、v0.16完了前に修正・再確認する。

## app_key / data_type

SeatFlowの保存キーは以下で統一する。

```text
app_key = seatflow
data_type = seat_layout
```

`assets/js/seatflowCloudService.js` では、保存・読込ともに以下を条件にする。

- `company_account_id = ログイン中企業アカウントID`
- `app_instance_id = ログイン中企業のseatflow app_instances.id`
- `app_key = seatflow`
- `data_type = seat_layout`

## 2026-07-01 SeatFlowクラウド読込修正

問題:

- 手動の「クラウド保存」「クラウド読込」はあるが、SeatFlow起動時にSupabaseの `seat_layout` を自動反映していなかった。
- 別ブラウザではlocalStorageに甲のレイアウトがないため、同じ甲アカウントでログインしても初期/ローカル状態が表示される可能性があった。

修正:

- Supabase modeでSeatFlow利用設定が確認できる場合、起動時に `loadSeatLayoutFromCloud()` を実行する。
- クラウド上に `seat_layout` があれば、画面のレイアウトへ反映する。
- 読み込んだクラウドレイアウトは既存localStorageにも反映される。
- `savedAt` を読込結果に含め、UI上の最終保存表示に使えるようにした。

方針:

```text
Supabase = 正本
localStorage = 未ログイン時の保存先 / 端末内キャッシュ
```

古いlocalStorageを理由にSupabase読込をスキップしない。

## 未確認のRLSテスト項目

以下はブラウザで人間確認が必要。

- 甲アカウントでSeatFlowレイアウトをクラウド保存できる。
- 別Chrome / 別ブラウザで同じ甲アカウントにログインし、甲のSeatFlowレイアウトが復元される。
- 乙アカウントでは甲のSeatFlowレイアウトが見えない。
- 乙アカウントで乙専用レイアウトを保存できる。
- 甲アカウントでは乙のSeatFlowレイアウトが見えない。

## 2026-07-01 SeatFlow app_instance確認待ち

SeatFlowクラウド起動時読込修正後、ブラウザ上で以下の表示が出た。

```text
この企業アカウントにはSeatFlowが登録されていません。account.htmlの利用アプリ一覧を確認してください。
```

この表示は `assets/js/seatflowCloudService.js` が、ログイン中企業アカウントの `app_instances` から `app_key = seatflow` を取得できなかった場合に出る。

調査結果:

- SeatFlow側が探している app_key は `seatflow`。
- `supabase/seed.sql` の `apps.app_key` も `seatflow`。
- signup画面の選択値も `seatflow`。
- `assets/js/appInstanceService.js` のリンク・検証用追加キーも `seatflow`。
- `docs/05_実装指示/cloud-data-model.md` / `docs/05_実装指示/supabase-rls-policy.md` も `seatflow` / `seat_layout`。
- `seat_flow` / `seatFlow` をapp_keyとして使う実装は見当たらない。

現時点の最有力原因:

- 甲または乙の検証企業アカウントに `app_instances.app_key = seatflow` が存在しない。
- またはRLS上、ログイン中ユーザーから自社の `seatflow` app_instance が読めていない。

account.htmlの見え方:

- `account.html` の利用アプリ一覧は `AppInstanceService.getMyAppInstances(account.id)` を使い、ログイン中企業の `app_instances` を表示する。
- account.htmlでSeatFlowが表示されない場合は、対象企業に `seatflow` app_instance がない、またはRLSで読めていない可能性が高い。
- account.htmlでSeatFlowが表示されるのにSeatFlow画面で未登録になる場合は、同一ログイン状態・同一企業アカウントIDで見ているかを確認する。

RLS検証の前提:

- 甲・乙それぞれの検証アカウントに `seatflow` app_instance が必要。
- `seat_layout` のRLS確認は、甲乙それぞれが自社の `seatflow` app_instanceを読める状態になってから行う。

## SeatFlow app_instance追加SQL案

Codexは実DBへ適用しない。Supabase Dashboardで人間が確認・適用する。

実行前確認:

- `apps` に `app_key = seatflow` があること。
- `<甲_COMPANY_ACCOUNT_ID>` と `<乙_COMPANY_ACCOUNT_ID>` が正しいこと。
- 甲乙の `company_accounts.owner_user_id` が、それぞれのSupabase Auth user idと一致していること。
- `app_instances(company_account_id, app_key)` のunique indexがあること。

```sql
-- <甲_COMPANY_ACCOUNT_ID> / <乙_COMPANY_ACCOUNT_ID> を実際の company_account_id に置き換えること。
-- 実行前に、対象が検証用アカウントであることを必ず確認すること。

insert into public.apps (app_key, name, description, status)
values (
  'seatflow',
  '座席管理 SeatFlow',
  '教室や店舗の座席配置を管理するアプリ。クラウド保存の初回候補です。',
  'active'
)
on conflict (app_key) do update
set
  name = excluded.name,
  description = excluded.description,
  status = excluded.status,
  updated_at = now();

insert into public.app_instances (
  company_account_id,
  app_key,
  display_name,
  status,
  settings_json
)
values
  ('<甲_COMPANY_ACCOUNT_ID>', 'seatflow', '座席管理 SeatFlow', 'active', '{}'::jsonb),
  ('<乙_COMPANY_ACCOUNT_ID>', 'seatflow', '座席管理 SeatFlow', 'active', '{}'::jsonb)
on conflict (company_account_id, app_key) do nothing;
```

人間確認後に再開すること:

- account.htmlで甲・乙それぞれにSeatFlowが表示される。
- 甲・乙それぞれで `apps/seatflow/index.html` のクラウド状態が `supabase` / ready相当になる。
- その後、甲乙の `seat_layout` 保存・復元・相互不可視を確認する。

## 判断

コード上は、同一企業アカウントで別ブラウザからSupabase正本を読みに行く状態へ修正した。

ただし、SeatFlow app_instance確認待ちのためv0.16は未完了。v0.16完了判断には、甲乙それぞれの `seatflow` app_instance確認と、上記のブラウザ確認が必要。
