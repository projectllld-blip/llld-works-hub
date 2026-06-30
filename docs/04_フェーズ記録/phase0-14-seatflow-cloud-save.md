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

RLS検証では、甲・乙それぞれの企業アカウントに `seatflow` app_instance が必要。SeatFlow画面で「この企業アカウントにはSeatFlowが登録されていません」と出る場合は、まず `account.html` の利用アプリ一覧とSupabase Dashboard上の `app_instances.app_key = seatflow` を確認する。

## localStorageとの関係

既存SeatFlowのlocalStorage保存は壊さない。

Supabase modeでクラウド保存済みの `seat_layout` がある場合は、起動時にSupabaseから読込を試みる。Supabaseを正本とし、localStorageは未ログイン時の保存先またはクラウド読込後の端末内キャッシュとして扱う。

クラウド読込時は、読み込んだ座席レイアウトを現在のレイアウトに反映し、その後既存のlocalStorage保存にも反映される。古いlocalStorageを理由にSupabase読込をスキップしない。

v0.16再確認で、起動時自動読込と手動読込を共通化した。Supabase mode確認直後の読込に加え、ページload後にも一度だけ再試行する。読込導線として上部の `クラウド読込` に加え、ステータス行にも `クラウド再読込` を置く。

保存データは座席レイアウトを復元できるように、位置・サイズ・回転・色・枠線・フォントサイズ・縦書き設定を保持する。ラベルは連絡先らしい文字列や明示的な個人情報プレフィックスを除外しつつ、検証用ラベルが消えすぎないようにする。

## 残リスク

- Supabase実プロジェクトへのmigration適用は手動確認が必要。
- 競合解決、自動同期、リアルタイム同期は未実装。
- 既存レイアウトのラベルに個人名が入っている場合に備え、クラウド保存前にラベルを保守的にサニタイズしている。
- 起動時自動読込は、クラウド上に1企業1SeatFlowレイアウトがある前提。複数レイアウト同期や競合解決は後続フェーズで扱う。

## 次の候補

v0.15では、クラウド保存のエラー表示、空状態、手動バックアップ導線、競合時の注意表示を強化する。
