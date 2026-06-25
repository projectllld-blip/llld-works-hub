# v0.13 利用アプリ一覧 実装記録

## 目的

企業アカウントごとの利用アプリ一覧を表示できる土台を作る。

## 実装範囲

- account.html の「利用中アプリ」をカード表示に変更
- mock modeではサンプル利用アプリを表示
- supabase modeでは `app_instances` を読み、`apps` と組み合わせて表示
- `app_instances.company_account_id` でログイン中企業アカウントのデータだけを対象にする
- app_instancesが0件の場合の空状態を表示
- 取得エラー時のメッセージを表示

## 使うテーブル

- `company_accounts`
- `app_instances`
- `apps`

## まだ使わないもの

- `app_data`
- SeatFlowクラウド保存
- 勤怠実データ保存
- PDF実データ保存
- 購入履歴

## app_instances作成方針

v0.13 migrationで、v0.11のAuth trigger関数を拡張する。

```text
supabase/migrations/20260625_v013_app_instances_from_signup_metadata.sql
```

signup metadata の `selected_app_keys` を使い、`apps` に存在するapp_keyだけ `app_instances` に作成する。

同一 `company_account_id + app_key` はunique indexで重複作成を防ぐ。

## mock mode時

以下のサンプルを表示する。

- 座席管理 SeatFlow
- PDF編集
- 小テスト作成

DB保存・app_data保存は行わない。

## supabase mode時

ログイン中企業アカウントの `company_accounts.id` を使い、`app_instances` を取得する。

`apps` からname / description / statusを取得して表示用に結合する。

## 残リスク

- v0.13 migrationをSupabase実プロジェクトへ手動適用する必要がある
- 既存app_instancesに重複がある場合、unique index追加前に整理が必要
- 実接続テストには検証用anon keyとテストアカウントが必要

## 次フェーズ

v0.14でSeatFlowクラウド保存の検討に進む。

勤怠クラウド保存は労務リスクが重いため、v1.8以降で慎重に扱う。
