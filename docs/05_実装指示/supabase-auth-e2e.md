# Supabase Auth / Account E2E確認手順

## 目的

Supabase接続後、企業アカウント作成からSeatFlowクラウド保存までの実動作を確認する。

## 絶対に守ること

- service role keyをフロントに置かない。
- secret keyをフロントに置かない。
- `.env` をGitHubに置かない。
- anon/public keyのみを `data/site-config.json` に設定する。
- 実在顧客情報を使わない。
- パスワードを記録しない。
- 勤怠実データ、生徒名簿、個人情報を登録しない。

## 1. site-config設定

検証用Supabaseへ接続する場合、`data/site-config.json` を以下の形にする。

```json
{
  "auth": {
    "mode": "supabase",
    "supabaseUrl": "https://xxxxx.supabase.co",
    "supabaseAnonKey": "検証用anon/public key"
  },
  "contact": {
    "mode": "demo",
    "email": "",
    "endpointUrl": "",
    "ownerName": "LLLD Works Hub"
  }
}
```

URLまたはanon keyが空の場合、フロントはmock modeへ戻る。

## 2. Supabase SQL適用

Supabase SQL Editorで以下を順番に適用する。

```text
supabase/migrations/20260625_v010_company_account_foundation.sql
supabase/seed.sql
supabase/migrations/20260625_v011_signup_company_account_trigger.sql
supabase/migrations/20260625_v013_app_instances_from_signup_metadata.sql
supabase/migrations/20260625_v014_seatflow_app_data_constraints.sql
```

確認すること:

- `apps` に初期データがある。
- `company_accounts` のRLSが有効。
- `app_instances` のRLSが有効。
- `app_data` のRLSが有効。
- Auth trigger `on_auth_user_created_company_account` が存在する。

## 2.5 新Supabaseプロジェクト接続時の事前確認

古いSupabaseプロジェクトを削除し、新しいプロジェクトへ接続し直した場合は、signupの前に必ずテーブル存在確認を行う。

確認対象:

```text
apps
company_accounts
app_instances
app_data
```

REST APIで `PGRST205: Could not find the table` が返る場合、その新プロジェクトにはmigrationが未適用である。

この状態ではsignupへ進まない。

理由:

- Auth userだけ作成される可能性がある。
- `company_accounts` が作成されない。
- `app_instances` が作成されない。
- その後のlogin / account / SeatFlowクラウド保存確認が正しくできない。

publishable key / anon keyだけではSQL migrationを適用できない。

新プロジェクトでは、Supabase DashboardのSQL Editorで以下を手動適用してからE2E確認へ進む。

```text
1. supabase/migrations/20260625_v010_company_account_foundation.sql
2. supabase/seed.sql
3. supabase/migrations/20260625_v011_signup_company_account_trigger.sql
4. supabase/migrations/20260625_v013_app_instances_from_signup_metadata.sql
5. supabase/migrations/20260625_v014_seatflow_app_data_constraints.sql
```

service role keyやdatabase passwordをフロントへ置いてmigration適用する方法は禁止。

## 3. signup確認

`signup.html` でテスト企業アカウントを作成する。

推奨入力:

- 会社名: `E2Eテスト教室`
- 担当者名: `テスト担当`
- メール: テスト用メール
- 業種: `school`
- 使いたいアプリ: `seatflow`, `pdf_tool`, `quiz_maker`

確認:

- `auth.users` にユーザーが作成される。
- `company_accounts.owner_user_id` がAuth user idと一致する。
- `app_instances` に選択アプリが作成される。

signup後に `confirmation_sent_at` が返り、session / access tokenが返らない場合は、メール確認必須設定で止まっている。

この場合は、`company_accounts` / `app_instances` のRLS付き確認へ進まない。

次のどちらかを行う。

- テストメールの確認リンクを開いてメール確認を完了する。
- 検証中のみSupabase Dashboardで Email confirmation をOFFにする。

## 4. login確認

`login.html` からテストメールとパスワードでログインする。

確認:

- ログイン成功メッセージが出る。
- `account.html` に遷移する。
- パスワードはlocalStorageに保存されない。
- 認証トークンを独自localStorage保存していない。

## 5. account確認

`account.html` で確認する。

- 企業名
- 担当者名
- メールアドレス
- 業種
- プラン状態
- 利用アプリ一覧

`app_instances` が0件の場合は、v0.13 migrationまたはsignup metadataを確認する。

## 6. logout確認

logoutボタンでログアウトする。

確認:

- `login.html?logged_out=1` に戻る。
- logout後に `account.html` へ直接アクセスすると `login.html?redirect=account` へ戻る。

## 7. SeatFlowクラウド保存確認

Auth/accountが通った後に行う。

1. `apps/seatflow/index.html` を開く。
2. 接続状態がsupabase modeであることを確認する。
3. 座席やパーツを配置する。
4. クラウド保存する。
5. `app_data` に以下の行ができることを確認する。

```text
app_key = seatflow
data_type = seat_layout
```

6. `data_json` に生徒名、電話番号、メール、勤怠情報、利用状態が入っていないことを確認する。
7. リロード後にクラウド読込できることを確認する。
8. 別ブラウザまたはシークレットウィンドウでも同じアカウントなら読込できることを確認する。
9. ログアウト状態では保存・読込できないことを確認する。

## 8. 失敗時の分類

失敗したら以下に分類する。

- Supabase URL / anon key設定ミス
- migration未適用
- seed未適用
- signup.html側エラー
- Auth作成エラー
- メール確認未完了
- company_accounts作成エラー
- app_instances作成エラー
- RLSによるinsert/select拒否
- account.html取得エラー
- app_data保存エラー
- app_data読込エラー

## 9. 検証後

検証用Supabase設定をcommitするかどうかは慎重に判断する。

公開してよいanon/public keyであっても、検証プロジェクトと本番プロジェクトを分ける。

本番運用前にはRLS、Auth URL、メール確認、ログアウト動作、他社データ非表示を再確認する。
