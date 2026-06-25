# v0.11 signup接続 実装記録

## 目的

LLLD Works Hub / Works Market の企業アカウント登録画面について、`signup.html` だけを Supabase Auth に接続できる最小実装にした。

## 接続範囲

- `signup.html` から `supabase.auth.signUp()` を呼べる
- `login.html` はまだ本番ログイン未接続
- `account.html` はまだ本番アカウント取得未接続
- app_data / SeatFlow / 勤怠 / PDF実データ保存は未実装

## signup処理

`auth.mode = supabase` かつ Supabase URL / anon key / Supabase JS client が揃っている場合のみ、Supabase Authへ登録リクエストを送る。

`auth.mode = mock` またはSupabase未設定の場合は、従来どおりmock modeで表示確認だけを行う。

## user metadata

signup時に以下を `options.data` として渡す。

- `company_name`
- `contact_name`
- `business_type`
- `selected_app_keys`

パスワードはmetadataに入れない。

## company_accounts作成方式

第一候補として、Auth triggerで `company_accounts` を作成する方式を採用する。

追加SQL:

```text
supabase/migrations/20260625_v011_signup_company_account_trigger.sql
```

このtriggerは `auth.users` 作成時に、`raw_user_meta_data` を読み取り、`public.company_accounts.owner_user_id = auth.users.id` として企業アカウントを作成する。

`app_instances` 作成はv0.13以降に回す。

## セキュリティ

- service role keyは使っていない
- secret keyは使っていない
- `.env` は追加していない
- パスワードは保存しない
- 認証トークンをlocalStorageに独自保存しない
- 入力内容をlocalStorageに保存しない

## 残リスク

- Supabase実プロジェクトでmigration / seed / trigger SQLを手動適用する必要がある
- Supabase AuthenticationのSite URL / Redirect URLs設定が必要
- メール確認ONの場合、登録後すぐにはsessionが返らない
- company_accounts作成はtrigger適用が前提

## 次フェーズ

v0.12で login / account 接続を検討する。
