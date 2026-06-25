# v0.14 SeatFlowクラウド保存

## 目的

SeatFlowの座席レイアウトだけを、企業アカウント単位でSupabase `app_data` に保存・読込できる最小実装を追加する。

## 保存対象をSeatFlowだけにした理由

座席レイアウトは実務価値が高く、勤怠より労務リスクが低い。

v0.14ではクラウド保存の最初の検証対象として、個人情報を含まない配置情報だけを扱う。

## 使用テーブル

```text
app_data
```

保存キー:

```text
app_key = seatflow
data_type = seat_layout
```

1企業アカウント・1 SeatFlow app_instance・1 data_typeにつき1件をupsertで上書きする。

## 追加した実装

- `assets/js/seatflowCloudService.js`
- `supabase/migrations/20260625_v014_seatflow_app_data_constraints.sql`
- `apps/seatflow/index.html` のクラウド保存・読込UI

## 保存するデータ

- レイアウト名
- 座席パネルや什器の位置
- 座席パネルや什器のサイズ
- 座席番号やパーツ名
- 床サイズ
- グリッド設定
- ズーム設定

## 保存しないデータ

- 生徒名
- 保護者名
- 講師名
- 電話番号
- メールアドレス
- 出席状況
- 予約状況
- 使用中座席
- 離席状態
- 面談メモ
- 勤怠情報

## mock mode

Supabase未設定時、または `auth.mode = mock` の場合はクラウド保存を実行しない。

既存のlocalStorage保存は維持する。

## supabase mode

以下が揃った場合のみ保存・読込する。

- Supabase URL / anon key が設定されている
- Supabase JS clientが利用できる
- ログイン中ユーザーがいる
- `company_accounts` が取得できる
- `app_instances` に `app_key = seatflow` がある

## localStorageとの関係

既存SeatFlowのlocalStorage保存は壊さない。

クラウド読込時は、読み込んだ座席レイアウトを現在のレイアウトに反映し、その後既存のlocalStorage保存にも反映される。

## 残リスク

- Supabase実プロジェクトへのmigration適用は手動確認が必要。
- 競合解決、自動同期、リアルタイム同期は未実装。
- 既存レイアウトのラベルに個人名が入っている場合に備え、クラウド保存前にラベルを保守的にサニタイズしている。

## 次の候補

v0.15では、クラウド保存のエラー表示、空状態、手動バックアップ導線、競合時の注意表示を強化する。
