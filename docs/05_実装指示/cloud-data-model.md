# クラウド保存データモデル

## 目的

将来、LLLD Works Hub / Works Marketの各アプリをクラウド保存へ移行できるように、企業アカウント単位のデータ構造を整理する。

今回の前提:

```text
アカウント = 企業 / 店舗 / 教室
```

## company_accounts

企業・店舗・教室アカウント。

| column | 説明 |
|---|---|
| id | 企業アカウントID |
| owner_user_id | Supabase AuthのユーザーID。`auth.users(id)` を参照 |
| email | ログイン用メール |
| company_name | 会社名 / 店舗名 / 教室名 |
| contact_name | 担当者名 |
| business_type | 業種 |
| phone | 電話番号 |
| plan_status | 契約状態 |
| created_at | 作成日時 |
| updated_at | 更新日時 |

business_type候補:

- `school`
- `store`
- `restaurant`
- `small_business`
- `consulting`
- `personal`
- `demo`

plan_status候補:

- `demo`
- `free`
- `trial`
- `paid`
- `paused`
- `cancelled`

v0.10時点では、`owner_user_id = auth.uid()` を基本にして1企業アカウントと1ログインユーザーを紐づける。

複数メンバー管理はまだ作らない。将来必要になった場合は `company_users` や `account_members` のようなテーブルをv1.7以降で追加検討する。

## apps

利用できるアプリ一覧。

| column | 説明 |
|---|---|
| id | アプリID |
| app_key | アプリ識別キー |
| name | 表示名 |
| description | 説明 |
| status | 公開状態 |
| created_at | 作成日時 |
| updated_at | 更新日時 |

app_key候補:

- `works_portal`
- `attendance`
- `seatflow`
- `pdf_tool`
- `quiz_maker`
- `meeting_support`
- `sales_talk_support`

## app_instances

企業アカウントごとのアプリ設定。

| column | 説明 |
|---|---|
| id | アプリ利用単位ID |
| company_account_id | 企業アカウントID |
| app_key | アプリ識別キー |
| display_name | 企業内での表示名 |
| status | 利用状態 |
| settings_json | アプリ設定JSON |
| created_at | 作成日時 |
| updated_at | 更新日時 |

例:

```text
LLLDアカウント
-> 勤怠アプリ
-> 締日20日、定時19:00、部署あり
```

## app_data

アプリごとの保存データ。

| column | 説明 |
|---|---|
| id | データID |
| company_account_id | 企業アカウントID |
| app_instance_id | アプリ利用単位ID |
| app_key | アプリ識別キー |
| data_type | データ種別 |
| data_json | 保存データJSON |
| created_at | 作成日時 |
| updated_at | 更新日時 |

data_type候補:

- `seat_layout`
- `attendance_log`
- `staff_master`
- `quiz_set`
- `pdf_work`
- `meeting_note`
- `settings`

## v0.14 SeatFlow seat_layout

v0.14では、最初のクラウド保存対象としてSeatFlowの座席レイアウトだけを `app_data` に保存する。

保存キー:

```text
app_key = seatflow
data_type = seat_layout
```

1つの `app_instance_id` と `data_type` につき1件を上書き保存する方針にする。

```text
company_account_id
app_instance_id
app_key
data_type
data_json
```

`data_json` に保存してよいもの:

- レイアウト名
- 座席や什器の位置
- 座席や什器のサイズ
- 座席番号やパーツ名
- 床サイズ、グリッド、ズームなどの表示設定

`data_json` に保存しないもの:

- 生徒名
- 保護者名
- 講師名
- 電話番号
- メールアドレス
- 出席状況
- 予約状況
- 使用中座席
- 面談メモ
- 勤怠情報

SeatFlowの既存localStorage保存は維持し、クラウド保存は追加機能として扱う。

## audit_logs

変更履歴。

| column | 説明 |
|---|---|
| id | ログID |
| company_account_id | 企業アカウントID |
| app_key | アプリ識別キー |
| action | 操作内容 |
| target_type | 対象種別 |
| target_id | 対象ID |
| before_json | 変更前 |
| after_json | 変更後 |
| created_at | 作成日時 |

## v1.0候補

推奨優先順位:

1. 座席管理のクラウド保存
2. PDFツールの設定同期
3. 小テスト作成データの保存
4. 勤怠データのクラウド保存検討

## 理由

座席管理は実務価値がありつつ、勤怠より労務リスクが低い。

PDFツールの設定同期は、実データを扱いすぎずにクラウド保存の検証がしやすい。

勤怠は修正履歴、労務リスク、実データ保護が重いため、最後に慎重に扱う。

## v0.10で追加したSQL

```text
supabase/migrations/20260625_v010_company_account_foundation.sql
supabase/seed.sql
```

v0.10ではテーブル、RLS、seedのみを用意する。

フロントから本番登録、本番ログイン、SeatFlow実データ保存、勤怠実データ保存はまだ行わない。

v0.14ではSeatFlowの座席レイアウトのみ `app_data` に保存する。生徒名、利用状態、勤怠データは保存対象外。

## v0.14.12 Works Portal portal_state

v0.14.12では、`portal.html` の編集データを企業アカウント単位で `app_data` に保存するMVPを追加する想定。

```text
app_key = works_portal
data_type = portal_state
```

保存対象:

- メモ / ToDo
- 掲示板投稿
- 保管庫ツリー構造
- 保管庫リンク情報
- お気に入り
- 最近使ったもの
- ポータル表示設定

保存しないもの:

- Undo / Redo履歴
- ドラッグ中状態
- モーダル開閉状態
- 一時選択状態
- ダウンロード形式の一時選択
- ファイル本体
- 個人情報、顧客情報、教材PDF本体、契約書、見積書

MVPでは専用テーブルを増やさず、既存 `app_data` のJSONB保存を使う。将来スタッフ個別ログインや投稿者管理が必要になった段階で、`portal_memos` や `portal_storage_nodes` などの専用テーブル化を検討する。

`works_portal` はユーザーが選ぶ個別アプリではなく、企業アカウントごとに必要なポータル基盤として扱う。新規登録時は `selected_app_keys` に明示選択がなくても `works_portal` の `app_instances` が作成される必要がある。

この保証はフロントのsignup metadataだけに依存しない。`supabase/migrations/20260627_v016_ensure_works_portal_app_instance.sql` で、既存企業への一括付与と `handle_new_company_account()` 内の必須付与を行う。

## v0.x 初期配布アプリ

v0.xではMarket購入画面、アプリ追加申請、管理者付与、決済・購入履歴がまだ未実装。

そのため、検証と社内運用に必要な最小限のアプリは、購入済みアプリではなく「初期配布アプリ」として扱う。

初期配布として確定:

- `works_portal`: 全企業アカウント必須の基盤アプリ。
- `seatflow`: v0.16 RLS検証で `seat_layout` の企業分離を確認するために必要な検証用初期配布アプリ。

初期配布候補:

- `pdf_tool`
- `quiz_maker`

`pdf_tool` / `quiz_maker` は現行MVPの候補だが、v0.16のmigration案では自動付与しない。付与範囲は、v1.3 アプリ追加申請 / v1.4 購入ページ以降で購入・申請・管理者付与のルールに移す。

v0.16のSeatFlow初期配布案:

```text
supabase/migrations/20260627_v016_ensure_default_app_instances.sql
```

このmigration案は、既存企業アカウントと新規signupの両方に `seatflow` app_instanceを用意する。実DBへの適用は人間がSupabase Dashboard / SQL Editorで確認して行う。
