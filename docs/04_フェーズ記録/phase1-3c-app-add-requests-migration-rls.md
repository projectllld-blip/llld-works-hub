# phase1-3c-app-add-requests-migration-rls

## Phase
v1.3c app_add_requests migration / RLS実装案

## 状態
migration / RLS案を作成。2026-07-02に人間がSQL全文確認後、現行Supabase projectへ手動適用済み。

今回作成したSQLは、Supabase SQL Editorで人間が確認してから適用する前提のmigration案。

環境分離状況確認により、GitHub Pages公開版も現在のSupabase projectを参照していることが分かった。現在のSupabase projectは運用上本番相当DBとして扱う。

2026-07-02に、現行Supabase projectを本番相当DBとして扱ったうえで、人間がSQL全文確認後にSQL Editorで手動適用した。

適用確認:

- `apps.id` / `company_accounts.id` は `uuid`。
- `set_updated_at` 関数あり。
- migration SQLに `drop table` / `truncate` / `delete from` / `disable row level security` / secret系なし。
- SQL Editorで実行成功。
- `app_add_requests` テーブル作成確認。
- RLS有効確認。
- `app_add_requests_select_own_company` policy 確認。
- `app_add_requests_insert_own_company` policy 確認。

## 作成したmigration案

```text
supabase/migrations/20260701_v13c_app_add_requests.sql
```

このmigration案は以下だけを行う。

- `public.app_add_requests` テーブルを作成する。
- `updated_at` 更新triggerを設定する。
- 検索用indexを追加する。
- RLSを有効化する。
- 自社申請だけselectできるpolicyを作る。
- 自社申請だけinsertできるpolicyを作る。

以下は行わない。

- `app_instances` 追加。
- `app_data` 保存。
- `company_accounts` 更新。
- `plan_status` 更新。
- 既存データ削除。
- 既存テーブルdrop。
- 運営者横断policy追加。
- ユーザー自由update / delete policy追加。

## app_add_requests columns

| column | 型 | 用途 |
|---|---|---|
| `id` | `uuid` | 申請ID。DB側で自動採番する。 |
| `company_account_id` | `uuid` | 申請元企業。`company_accounts.id` を参照する。 |
| `app_id` | `uuid` | 申請対象アプリ。`apps.id` を参照する。 |
| `app_key_snapshot` | `text` | 申請時点のアプリキー控え。 |
| `app_name_snapshot` | `text` | 申請時点のアプリ名控え。 |
| `request_message` | `text` | 利用目的・相談内容。最大2000文字案。 |
| `contact_requested` | `boolean` | 連絡希望。 |
| `status` | `text` | 申請状態。defaultは `pending`。 |
| `admin_note` | `text` | 運営メモ。最大2000文字案。 |
| `created_at` | `timestamptz` | 作成日時。 |
| `updated_at` | `timestamptz` | 更新日時。 |
| `reviewed_at` | `timestamptz` | 運営確認日時。 |
| `reviewed_by` | `uuid` | 運営確認者ID候補。管理者権限設計までは空でよい。 |

`apps.id` は既存migration上 `uuid` のため、`app_id` も `uuid` とした。

## status

許可候補:

- `pending`: 申請受付済み / 未対応
- `reviewing`: 運営確認中
- `approved`: 承認済み
- `rejected`: 見送り / 却下
- `cancelled`: 取り下げ済み

ユーザーinsert時は `pending` のみ許可する。

## RLS policy方針

### select
ログイン中ユーザーは、自分の `company_accounts.owner_user_id = auth.uid()` に紐づく `company_account_id` の申請だけ読める。

policy:

```text
app_add_requests_select_own_company
```

### insert
ログイン中ユーザーは、自分の企業アカウントに対する申請だけ作成できる。

他社 `company_account_id` を指定したinsertは禁止する。

insert時は以下も制限する。

- `status = pending`
- `admin_note is null`
- `reviewed_at is null`
- `reviewed_by is null`

policy:

```text
app_add_requests_insert_own_company
```

### update / delete
v1.3cでは作らない。

理由:

- ユーザーが `status`、`admin_note`、`reviewed_at`、`reviewed_by` を勝手に変更できると、申請状態の正本が崩れる。
- 取り下げ機能は将来検討できるが、まずは作成と読込だけに絞る。
- 運営者の承認 / 却下 / メモ更新には、管理者認証・管理者権限・企業横断閲覧の設計が必要。

## ユーザーができること

- 自社 `company_account_id` に紐づく申請を作成する。
- 自社申請を読む。
- 申請作成時に、利用目的・相談内容と連絡希望を送る。

## ユーザーができないこと

- 他社申請を読む。
- 他社 `company_account_id` で申請する。
- 申請後に `status` を変更する。
- `admin_note` を変更する。
- `reviewed_at` / `reviewed_by` を変更する。
- 申請行を削除する。

## 運営側policyを今回作らない理由

現時点では、運営者権限、スタッフ個別ログイン、管理者専用API、企業横断閲覧の安全設計が未整備。

企業横断select / updateをフロントから直接許可すると、他社データ混入や権限漏れの危険がある。

そのため、v1.3cでは一般ユーザーの自社申請insert / selectだけに絞る。

運営側の確認・承認・却下は、v1.3e以降で管理者画面と権限設計を整理してから扱う。

## 人間がSupabaseで確認すべきこと

CodexはSupabase Dashboardを操作しない。

人間確認手順:

1. Supabase Dashboardを開く。
2. 対象projectが検証DBか本番相当DBか確認する。
3. `docs/16_ENVIRONMENT_SEPARATION_POLICY.md` を読み、現在のSupabase projectを本番相当DBとして扱うか、別検証projectへ適用するか判断する。
4. 適用先project名を明示する。
5. Table Editorで `company_accounts.id` が `uuid` であることを確認する。
6. Table Editorで `apps.id` が `uuid` であることを確認する。
7. SQL Editorで `supabase/migrations/20260701_v13c_app_add_requests.sql` の内容を貼り付ける前に読む。
8. `app_add_requests` が新規追加のみで、既存テーブルdropや既存データ削除がないことを確認する。
9. `drop`、`truncate`、`delete`、`disable row level security` がないことを確認する。
10. RLS policyが自社申請のselect / insertだけを許可する内容か確認する。
11. 問題なければ人間判断でSQL Editorから適用する。
12. 適用後、RLSが有効なままか確認する。

## ブラウザで人間が確認すべきこと

今回のv1.3cではUI変更なし。

`account.html` から実DBへ保存するブラウザ確認は、v1.3dで行う。

## 次フェーズ v1.3d でやること

v1.3d候補:

```text
account.html 申請DB保存
```

やること:

- v1.3aの申請UI mockをSupabase保存へ接続する。
- 未利用アプリの申請時に `app_add_requests` へinsertする。
- 自社申請をselectして `申請済み` 表示を復元する。
- DB保存失敗時の表示を追加する。

v1.3dへ進む前提:

- 人間がv1.3c migrationをSupabaseへ適用済みであること: 完了。
- 適用先project名が人間により明示されていること: 現行Supabase project。
- 環境方針が確定していること: 現行Supabase projectを本番相当DBとして扱う。
- `app_add_requests` が存在すること: 確認済み。
- RLS policyが有効であること: 確認済み。
- 自社insert / selectができ、他社申請が見えないことを確認できること: v1.3dブラウザ確認で行う。

## STOP条件

- SQL Editor適用が必要。
- Supabase Dashboard確認が必要。
- 実DB適用が必要。
- 適用先projectの人間判断が必要。
- 本番相当DBへ変更してよいか人間判断が必要。
- RLS方針の人間判断が必要。
- 運営者横断policyが必要。
- 管理者権限設計が必要。
- `app_instances` 追加が必要。
- `app_data` 保存が必要。
- `company_accounts` 更新が必要。
- `plan_status` 更新が必要。
