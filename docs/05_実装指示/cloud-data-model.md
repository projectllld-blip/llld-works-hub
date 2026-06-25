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
