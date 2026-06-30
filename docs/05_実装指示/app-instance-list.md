# 利用アプリ一覧 実装ルール

## app_instances の役割

企業アカウントごとに、どのアプリを利用中かを表す。

```text
company_account_id
app_key
display_name
status
settings_json
```

v0.13では表示だけに使う。

## apps の役割

アプリカタログ。

```text
app_key
name
description
status
```

フロントから自由にinsert / updateしない。

## account.htmlでの表示方針

account画面の「利用中アプリ」に、以下を表示する。

- アプリ名
- 説明
- 利用状態
- app_key
- 最終更新日
- 開く / 準備中
- クラウド保存予定

## app_instances取得

supabase modeでは以下の流れにする。

1. `company_accounts` を取得
2. `company_accounts.id` を使う
3. `app_instances.company_account_id = company_accounts.id` の行を取得
4. `apps` をapp_keyで取得
5. フロント側で結合して表示する

app_dataは取得しない。

## app_instances作成方針

v0.13 migrationでAuth trigger関数を拡張する。

```text
supabase/migrations/20260625_v013_app_instances_from_signup_metadata.sql
```

`raw_user_meta_data.selected_app_keys` に含まれるapp_keyをもとに、`apps` に存在するものだけ `app_instances` を作成する。

v0.16では、この方針に例外を追加する。

- `works_portal` は全企業アカウント必須の基盤アプリとして、選択アプリに含まれなくても付与する。
- `seatflow` はv0.xのRLS検証用初期配布アプリとして、`seat_layout` 検証に必要な企業アカウントへ付与する。

対応migration案:

```text
supabase/migrations/20260627_v016_ensure_works_portal_app_instance.sql
supabase/migrations/20260627_v016_ensure_default_app_instances.sql
```

`pdf_tool` / `quiz_maker` は初期配布候補だが、v0.16の自動付与対象には含めない。購入・申請・管理者付与の正式ルールは後続フェーズで決める。

## 空状態

app_instancesが0件の場合は、以下を案内する。

```text
利用中アプリはまだ登録されていません。
signup時の selected_app_keys、app_instances作成SQL、またはv0.13 migrationの適用状況を確認してください。
```

この状態でフロントから勝手にapp_instancesを作らない。

## RLS前提

`app_instances` は `company_account_id` 経由で自分の企業アカウントのものだけ読めること。

他社のapp_instancesを読める実装にしない。

## v0.14への引き継ぎ

- SeatFlowクラウド保存
- settings_jsonの活用
- app_data保存の設計

勤怠データはv1.8以降で慎重に扱う。

## v0.14での利用

SeatFlowクラウド保存では、ログイン中の企業アカウントに紐づく `app_instances` から `app_key = seatflow` の行を取得する。

取得できない場合は保存・読込を行わない。

この状態でフロントから勝手に `app_instances` を作らない。重複作成や権限混在を避けるため、作成はsignup triggerまたは管理されたSQLで行う。

account.htmlがmock modeの場合、固定のサンプル利用アプリとしてSeatFlowが表示されることがある。この表示は実DBの `app_instances.app_key = seatflow` が存在することを意味しない。

supabase modeでaccount.htmlにSeatFlowが表示される条件は、ログイン中企業アカウントの `app_instances.app_key = seatflow` が読めること。SeatFlow本体も同じ `company_account_id` と `app_key = seatflow` を使う。

SeatFlow保存時は以下の関係を守る。

```text
company_accounts.id
-> app_instances.company_account_id
-> app_data.company_account_id / app_data.app_instance_id
```

`app_data` へ保存するのは `seat_layout` のみ。名簿、利用者名、座席利用状態、勤怠情報は保存しない。
