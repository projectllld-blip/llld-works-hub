# phase1-3d-app-request-db-save

## Phase

v1.3d account.html 申請DB保存

## 状態

`account.html` のアプリ追加申請UIを、Supabase modeでは `app_add_requests` へ保存する実装に接続した。

mock modeでは従来どおり画面内状態のみで申請の流れを確認する。

## 前提

v1.3c `app_add_requests` migrationは、人間がSQL全文確認後に現行Supabase projectへ手動適用済み。

人間確認済み:

- `apps.id` / `company_accounts.id` は `uuid`。
- `set_updated_at` 関数あり。
- migration SQLに `drop table` / `truncate` / `delete from` / `disable row level security` / secret系なし。
- SQL Editorで実行成功。
- `app_add_requests` テーブル作成確認。
- RLS有効確認。
- `app_add_requests_select_own_company` policy 確認。
- `app_add_requests_insert_own_company` policy 確認。

現行Supabase projectは本番相当DBとして扱う。

## 実装内容

- Supabase modeで申請履歴を `app_add_requests` から取得する。
- 保存済み申請があるアプリは `申請済み` 表示にする。
- 未利用アプリの申請時に `app_add_requests` へinsertする。
- insert時は `company_account_id`、`app_id`、`app_key_snapshot`、`app_name_snapshot`、`request_message`、`contact_requested`、`status = pending` を送る。
- 申請作成だけでは `app_instances` を追加しない。
- 申請作成だけでは `app_data`、`company_accounts`、`plan_status` を変更しない。
- mock modeではDBへ接続せず、画面内状態だけで `申請済み` を表示する。

## 変更したファイル

- `account.html`
- `assets/js/accountPage.js`

## 保存先

```text
public.app_add_requests
```

## v1.3dでやらないこと

- `app_instances` の自動追加。
- `app_data` 保存。
- `company_accounts` 更新。
- `plan_status` 更新。
- 運営者側の承認 / 却下 / メモ更新。
- 管理者横断policy追加。
- 決済、契約、自動有効化。
- migration / RLS変更。

## 人間がブラウザで確認すること

- Supabase modeで `account.html` を開く。
- アプリ追加申請エリアが表示される。
- 未利用アプリで「追加を申請する」を押す。
- 利用目的・相談内容を入力できる。
- 連絡希望を選べる。
- 申請送信後に「申請を受け付けました。内容を確認後、運営からご連絡します。」と表示される。
- 対象アプリが `申請済み` になる。
- 再読み込み後も `申請済み` が復元される。
- 利用中アプリ一覧が壊れていない。
- 企業情報編集フォームが壊れていない。

## 人間がSupabase Dashboardで確認すること

- `app_add_requests` に申請行が作成されている。
- `company_account_id` がログイン中企業アカウントに紐づいている。
- `app_id` が申請対象アプリに紐づいている。
- `status = pending` である。
- `request_message` と `contact_requested` が保存されている。
- `app_instances` が追加されていない。
- `app_data` が変更されていない。
- `company_accounts`、`plan_status` が変更されていない。
- RLSが有効なまま。

## STOP条件

- `app_add_requests` insertに失敗する。
- 自社申請がselectできない。
- 他社申請が見える。
- 他社 `company_account_id` でinsertできる。
- `app_instances` が自動追加される。
- `app_data`、`company_accounts`、`plan_status` が変更される。
- RLS変更やmigration変更が必要。
- Supabase Dashboard操作が必要。
