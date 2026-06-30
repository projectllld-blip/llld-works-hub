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

状態: v0.16は限定範囲で完了扱い。

`portal_state` は、works_portal app_instance自動付与migration適用後に保存・復元できる状態まで確認済み。甲乙の検証アカウント間で、他社 `portal_state` が混ざる問題は確認されていない。

`seat_layout` は、SeatFlowの表示中レイアウトについて限定的なクラウド保存・読込確認までをv0.16の対象とする。複数レイアウト、名簿、QR、NFC、メモ、履歴、競合解決、同時編集などを含むSeatFlow完全クラウド同期は、v0.16内では完了させずPARKED扱いにする。

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

## v0.16当初のRLSテスト項目

以下はv0.16開始時点でブラウザ確認対象としていた項目。

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

この時点では、SeatFlow app_instance確認待ちのためv0.16は未完了としていた。最終整理では、SeatFlow完全クラウド同期をv0.16完了条件から外し、表示中レイアウトの限定確認までをv0.16範囲とする。

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

したがって、v0.16のRLS検証では、甲・乙など検証対象アカウントにだけ人間が確認して `seatflow` app_instanceを付与する。

### seatflow付与方針の見直し

`works_portal` は全企業アカウント必須の基盤アプリ。

`seatflow` は利用アプリであり、全企業アカウント必須ではない。業種や利用形態によって不要な企業もあるため、全企業への標準配布・自動付与はしない。

v0.16 RLS検証では `seat_layout` の企業分離確認に必要なため、甲・乙の検証アカウントにだけ `seatflow` app_instanceを用意する。この付与は全社標準配布ではなく、検証用付与として扱う。

不採用にしたmigration案:

```text
supabase/migrations/20260627_v016_ensure_default_app_instances.sql
```

このmigration案は、既存の全 `company_accounts` と新規signupに `seatflow` を付与する内容だったため、本番向けmigrationとしては残さない。誤適用を防ぐため、PR差分から削除した。

将来的には、`v1.3 アプリ追加申請` / `v1.4 購入ページ` / 管理者画面で `app_instances` を付与する。

### v0.16検証用SQL案

Codexは実DBへ適用しない。Supabase Dashboard / SQL Editorで人間が対象企業IDを確認してから実行する。

```sql
-- v0.16 RLS検証用
-- 全企業ではなく、甲・乙など検証対象アカウントだけに付与する。
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

## v0.16再開条件履歴

`seat_layout` のRLS確認を再開する前に、以下を人間が確認する。

- `seatflow` 全社自動付与migrationを適用しない。
- Supabase Dashboardで甲・乙など検証対象アカウントの `company_account_id` を確認する。
- 上記のv0.16検証用SQL案を、検証対象アカウントだけに適用する。
- 甲・乙それぞれの `company_accounts` に `app_instances.app_key = seatflow` が存在する。
- account.htmlがsupabase modeで、甲・乙それぞれにSeatFlowを表示する。
- 甲・乙それぞれでSeatFlow本体のクラウド状態が未登録ではなくready相当になる。
- RLSは無効化していない。
- service role keyは使っていない。

上記は、SeatFlowの表示中レイアウト確認へ進む前の再開条件として記録する。最終的にはSeatFlow完全クラウド同期をv0.16の完了条件から外し、PARKEDへ移す。

## 2026-07-01 SeatFlow起動時クラウド読込失敗の再調査

状況:

- 甲アカウントでSeatFlowはSupabase modeになる。
- クラウド保存は成功しているように見える。
- 別ブラウザで同じ甲アカウントにログインしても、保存したSeatFlowレイアウトが復元されない。

コード上の確認:

- 保存処理は `app_data` に `app_key = seatflow` / `data_type = seat_layout` でupsertする。
- 保存対象はログイン中企業アカウントの `seatflow` app_instance。
- 起動時は `refreshSeatFlowCloudStatus().then(autoLoadSeatFlowCloudLayout)` でSupabase mode確認後に自動読込する。
- `cloudLoadBtn` はHTML上に存在するが、画面幅や表示位置によって見落とされる可能性があるため、ステータス行にも `クラウド再読込` を追加した。

原因候補:

- Auth session / company account / app_instance の復元が初回表示直後に間に合わず、自動読込が早すぎる。
- 読込導線が上部ボタンだけだと、見つけられない場合に復旧できない。
- 保存時の座席ラベルサニタイズが厳しく、検証用ラベルが読込後に消えて「復元されていない」ように見える可能性がある。

修正:

- 起動時自動読込と手動読込を `runSeatFlowCloudLoad()` に共通化した。
- ページload後に、まだクラウド読込済みでなければ一度だけ自動読込を再試行する。
- ステータス行に `クラウド再読込` ボタンを追加した。
- クラウド保存時に `fontSize` / `textVertical` を保持する。
- 座席ラベルのサニタイズを、連絡先らしい文字列や明示的な個人情報プレフィックスだけを除外する形に調整した。

追加修正:

- `seat_layout` 読込時は `maybeSingle()` の1件前提ではなく、`updated_at` の新しい順に最新1件を取得する。
- 既存検証で同じ `app_instance_id` / `data_type` の重複行がある場合でも、最新行を読みに行けるようにする。
- 保存・読込結果にパーツ数を表示し、保存対象が空なのか、読込自体が失敗しているのかを切り分けやすくした。
- load後の自動読込再試行を短い間隔で複数回行い、別ブラウザでのsession復元待ちを吸収する。

再確認が必要:

- 甲アカウントでSeatFlowレイアウトをクラウド保存する。
- 別Chrome / 別ブラウザで同じ甲アカウントにログインし、起動時に自動復元されること。
- 自動復元されない場合、ステータス行の `クラウド再読込` で復元できること。
- Supabase Dashboardで、甲の `app_data.data_type = seat_layout` が作成・更新されていること。
- `app_instance_id` が甲の `seatflow` app_instance と一致していること。

この時点では、上記のブラウザ確認と甲乙相互不可視確認が終わるまで未完了としていた。最終整理では、SeatFlow完全クラウド同期をv0.16外の将来タスクとしてPARKEDへ移す。

## 2026-07-01 SeatFlow全体状態のクラウド同期対応

追加で、SeatFlow内の複数レイアウト一覧が別ブラウザで復元されない問題が見つかった。

原因:

- これまでの `seat_layout` JSONは、現在表示中の1レイアウトだけを保存する構造だった。
- localStorage上のSeatFlow全体構造には `layouts[]` と `activeLayoutId` があるが、クラウド保存JSONには含めていなかった。

修正:

- `app_data.data_type = seat_layout` の `data_json` をSeatFlow全体状態へ拡張した。
- `layouts[]` / `activeLayoutId` / `uiSettings` / `schemaVersion` / `revision` / `updatedAt` / `updatedByClientId` を保存する。
- 既存の単一レイアウト形式も読める互換を残した。
- Supabase読込成功時は、複数レイアウト一覧と選択中レイアウトを画面へ反映し、localStorageにもキャッシュする。
- クラウド読込完了前は自動保存しない。
- ユーザー操作後はlocalStorage保存に続けてdebounce付きでクラウド自動保存する。
- 保存前にクラウド側の `revision` を確認し、別タブ/別端末で新しいrevisionがある場合は自動上書きしない。
- 衝突時は `クラウド再読込` と `この内容で上書き保存` を表示する。

クラウド保存対象外:

- `people` 名簿データ
- QR / バーコード / NFC
- メモ
- Undo / Redo履歴
- 一時選択状態

確認が必要:

- 甲アカウントで複数レイアウトを作成し、自動保存または手動クラウド保存する。
- 別Chrome / 別ブラウザの同じ甲アカウントで、起動時に複数レイアウト一覧が復元される。
- レイアウト切替ができる。
- 乙アカウントでは甲のレイアウト一覧が見えない。
- 乙で保存したレイアウト一覧が甲に見えない。

## 2026-07-01 v0.16完了整理

SeatFlowクラウド同期の深掘りは、本線ロードマップ復帰のためv0.16内では一旦停止する。

v0.16で確認済みとして扱う範囲:

- `portal_state` の甲乙分離。
- `works_portal` app_instance自動付与方針。
- `works_portal` は全企業アカウント必須の基盤アプリであること。
- `seatflow` は利用アプリであり、全企業標準配布ではないこと。
- v0.16検証用にのみ甲乙へ `seatflow` app_instanceを付与する方針。
- SeatFlowの表示中レイアウトについての限定的なクラウド保存・読込確認。
- 上記確認済み範囲では、他社データ混入は確認されていない。

PARKEDにする範囲:

- SeatFlow複数レイアウトの完全クラウド同期。
- SeatFlow名簿 / QR / NFC / メモのクラウド保存。
- SeatFlow全体状態の完全バックアップ・復元。
- SeatFlow複数タブ競合解決。
- SeatFlow正式商品化に必要な保存対象整理。
- 本格的な同時編集対応。

判断:

- v0.16 RLS・他社データ混入テストは、`portal_state` を中心とした確認済み範囲に限定して完了扱いにする。
- SeatFlowは表示中レイアウトの限定確認までとし、完全クラウド化ではないことを明記する。
- 次の本線候補は v0.17 バックアップ・復元。
