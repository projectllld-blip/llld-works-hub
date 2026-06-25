# Supabase検証DB セットアップ手順

## 目的

v0.10で追加したSQLをSupabaseの検証プロジェクトへ流し、企業アカウント単位のDB土台を確認する。

この手順は検証用。まだフロント画面から本番登録・本番ログイン・実データ保存はしない。

## 1. Supabaseプロジェクトを作成する

Supabaseで新しい検証プロジェクトを作成する。

プロジェクト名は分かりやすく、例として以下のようにする。

```text
llld-works-market-test
```

## 2. migration SQLを流す

SupabaseのSQL Editorを開き、以下のファイル内容を貼り付けて実行する。

```text
supabase/migrations/20260625_v010_company_account_foundation.sql
```

このSQLで以下が作られる。

- `company_accounts`
- `apps`
- `app_instances`
- `app_data`
- `audit_logs`
- RLS policy
- updated_at trigger
- index

v0.11でsignup接続を使う場合は、続けて以下のtrigger SQLも実行する。

```text
supabase/migrations/20260625_v011_signup_company_account_trigger.sql
```

このtriggerは、Supabase Authでユーザーが作成されたときに `company_accounts` を作成する。
フロントからservice role keyで強制作成する方式は使わない。

## 3. seed.sqlを流す

次にSQL Editorで以下を実行する。

```text
supabase/seed.sql
```

`apps` テーブルに以下の初期データが入る。

- 勤怠管理
- 座席管理 SeatFlow
- PDF編集
- 小テスト作成
- 面談支援
- 営業トーク支援

## 4. Table Editorで確認する

Table Editorで以下を確認する。

- `company_accounts` が存在する。
- `apps` が存在し、seedデータが入っている。
- `app_instances` が存在する。
- `app_data` が存在する。
- `audit_logs` が存在する。

## 5. RLSを確認する

各テーブルのRLSが有効になっているか確認する。

対象:

- `company_accounts`
- `apps`
- `app_instances`
- `app_data`
- `audit_logs`

特に、`company_accounts.owner_user_id = auth.uid()` が基本になっていることを確認する。

## 6. demo企業アカウントについて

`company_accounts.owner_user_id` は `auth.users(id)` を参照する。

そのため、demo企業アカウントを作る場合は、先にSupabase Authで検証ユーザーを作成し、そのユーザーIDを使って `company_accounts` にinsertする。

v0.10では、auth.usersに直接依存するdemoデータはseedに入れない。

## 7. フロント設定

v0.10時点では、まだフロント接続しない。

将来接続する場合は、`data/site-config.json` にanon keyのみを設定する。

```json
{
  "auth": {
    "mode": "supabase",
    "supabaseUrl": "https://example.supabase.co",
    "supabaseAnonKey": "public-anon-key"
  }
}
```

ただし、RLS確認が終わるまでは設定しない。
`auth.mode` を `supabase` にしても、URLまたはanon keyが空ならフロントは `mock mode` に戻す。
URL / anon key が設定されている場合でも、v0.10.5時点では本番signup / loginは実行しない。

## 8. 絶対にやらないこと

- service role keyをフロントに置かない。
- `.env` をGitHubに置かない。
- 実キーを書いたサンプルをcommitしない。
- 認証トークンをlocalStorageに独自保存しない。
- パスワードを保存しない。
- 個人情報のサンプルデータを入れない。
- RLS未設定のテーブルを本番運用しない。
- admin.htmlを本番操作可能にしない。
- 勤怠実データをDB化しない。
- 座席実データをDB化しない。

## 9. v0.10時点の状態

```text
Supabase接続状態: 未接続
フロント登録: 未実装
フロントログイン: 未実装
実データ保存: 未実装
SQL準備: 完了
```
