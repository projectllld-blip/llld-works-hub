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

## 2026-07-01 app_instances整合性・初期付与ルール確認

今回の確認では、RLSテストを進める前に `account.html` の利用アプリ一覧とSeatFlow本体の登録判定を比較した。

### account.htmlの利用アプリ一覧

`account.html` は `assets/js/accountPage.js` から `AppInstanceService.getMyAppInstances(account.id)` を呼び出す。

mock mode:

- `AppInstanceService.getMockAppInstances()` の固定データを表示する。
- mockの固定データには `seatflow` / `pdf_tool` / `quiz_maker` が含まれる。
- mock表示は実DBの `app_instances` が存在することを意味しない。

supabase mode:

- `app_instances.company_account_id = ログイン中企業アカウントID` の行を取得する。
- 取得した `app_key` をもとに `apps` カタログを参照し、フロント側で表示情報を補う。
- SeatFlowが表示される条件は、対象企業に `app_instances.app_key = seatflow` の行が見えること。

### SeatFlow本体の登録判定

SeatFlow本体は `assets/js/seatflowCloudService.js` で以下を条件にする。

```text
company_account_id = ログイン中企業アカウントID
app_key = seatflow
```

`status` / `enabled` / `is_active` / `deleted_at` などの追加条件は使っていない。

そのため、supabase modeで同一ログイン・同一企業アカウントを見ている場合、`account.html` でSeatFlowが表示されるのにSeatFlow本体で未登録になる主な原因は以下に絞られる。

- `account.html` がmock mode表示で、実DB由来ではない。
- `account.html` とSeatFlowを別origin、別ブラウザプロファイル、別ログイン状態で見ている。
- RLSによりSeatFlow側から自社 `app_instances` が読めていない。
- 実DBの `app_instances` に `seatflow` がない。

app_key名の確認結果:

- 実装上のSeatFlow app_keyは `seatflow` で統一されている。
- `seat_flow` / `seatFlow` をapp_keyとして使う本体実装は見当たらない。

### 甲アカウントのSeatFlow付与導線

現時点で存在する導線:

- signup画面でSeatFlowを選択した場合、`selected_app_keys` 経由で `app_instances` が作られる。
- account画面に、RLS検証用の「検証用アプリ追加」導線がある。

まだ存在しない導線:

- Market購入画面
- アプリ追加申請
- 管理者付与画面
- 決済・購入履歴に基づく正式付与

したがって、v0.xのRLS検証では、人間が検証アカウントごとに手動追加する運用ではなく、管理されたmigration案で `seatflow` app_instanceを初期配布するのが安全。

### v0.x初期配布の扱い

`works_portal` は全企業アカウント必須の基盤アプリ。

`seatflow` は本来は利用アプリ・購入アプリだが、v0.16のRLS検証では `seat_layout` の分離確認に必須のため、v0.x検証用の初期配布アプリとして扱う。

`pdf_tool` / `quiz_maker` は現行MVPの初期配布候補だが、今回のmigration案では自動付与しない。v1.3 アプリ追加申請 / v1.4 購入ページ以降で、購入・申請・管理者付与により `app_instances` を制御する。

追加したmigration案:

```text
supabase/migrations/20260627_v016_ensure_default_app_instances.sql
```

このmigration案は以下を行う。

- `apps.app_key = seatflow` を保証する。
- 既存の全 `company_accounts` に `seatflow` app_instanceを追加する。
- 新規signup時、`selected_app_keys` に依存せず `works_portal` と `seatflow` を付与する。
- `app_instances(company_account_id, app_key)` のunique indexと `on conflict do nothing` で重複を防ぐ。

Codexはこのmigrationを実DBへ適用しない。Supabase Dashboard / SQL Editorでの適用は人間確認が必要。

## v0.16再開条件

`seat_layout` のRLS確認を再開する前に、以下を人間が確認する。

- Supabase上で `20260627_v016_ensure_default_app_instances.sql` を確認・適用する。
- 甲・乙それぞれの `company_accounts` に `app_instances.app_key = seatflow` が存在する。
- account.htmlがsupabase modeで、甲・乙それぞれにSeatFlowを表示する。
- 甲・乙それぞれでSeatFlow本体のクラウド状態が未登録ではなくready相当になる。
- RLSは無効化していない。
- service role keyは使っていない。

上記が確認できるまで、v0.16は `seatflow app_instance確認待ち` として未完了扱いにする。
