# v0.10 Supabase検証DB

作成日: 2026-06-25

## 目的

LLLD Works Hub / Works Marketを将来クラウド化する前に、Supabase検証DBとして使えるSQL、RLS、seed、手順書を整備する。

v0.10では、まだフロント画面から本番登録・本番ログイン・実データ保存は行わない。

## 追加したSQL

```text
supabase/migrations/20260625_v010_company_account_foundation.sql
supabase/seed.sql
```

## 追加したテーブル

- `company_accounts`
- `apps`
- `app_instances`
- `app_data`
- `audit_logs`

## Authとの紐づけ

`company_accounts` に以下を追加した。

```text
owner_user_id uuid references auth.users(id)
```

基本設計:

```text
1つの企業 / 店舗 / 教室アカウント
= Supabase Auth上の1ユーザー
= company_accounts.owner_user_id = auth.uid()
```

## RLS方針

- `company_accounts` は `owner_user_id = auth.uid()` のものだけselect / insert / update可能。
- `apps` はカタログとしてselect可能。insert / update / deleteはフロントに許可しない。
- `app_instances` は `company_account_id` 経由で所有確認する。
- `app_data` は `company_account_id` 経由で所有確認する。
- `audit_logs` は `company_account_id` 経由でselect / insertのみ許可する。

## seed内容

`supabase/seed.sql` で `apps` に以下を追加する。

- `attendance`
- `seatflow`
- `pdf_tool`
- `quiz_maker`
- `meeting_support`
- `sales_talk_support`

demo企業アカウントはAuthユーザーに依存するため、seedには入れていない。

## まだフロント接続しないこと

- signup.html からSupabase Authに本番登録しない。
- login.html からSupabase Authに本番ログインしない。
- account.html で本番アカウント情報を取得しない。
- SeatFlow実データを保存しない。
- 勤怠実データを保存しない。
- PDF実データを保存しない。
- 決済・購入履歴・自動納品は実装しない。

## 次フェーズ

v0.10.5では、mock / supabase切替土台を強化する。

具体的には、Supabase URLとanon keyを設定した場合でも、RLS確認が終わるまで本番保存を有効化しない安全な接続手順を検討する。
