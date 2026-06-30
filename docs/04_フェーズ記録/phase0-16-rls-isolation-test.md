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

## 判断

コード上は、同一企業アカウントで別ブラウザからSupabase正本を読みに行く状態へ修正した。

v0.16完了判断には、上記のブラウザ確認が必要。
