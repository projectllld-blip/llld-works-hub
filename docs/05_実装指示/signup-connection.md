# signup接続 実装ルール

## 対象

v0.11では `signup.html` のみ Supabase Auth 接続対象にする。

`login.html` と `account.html` はv0.12以降に回す。

## 処理の流れ

1. `data/site-config.json` を読む
2. `auth.mode` と Supabase URL / anon key を判定する
3. `mock mode` なら実登録しない
4. `supabase mode` かつ client準備済みなら `supabase.auth.signUp()` を呼ぶ
5. 登録成功 / 確認メール待ち / エラーを画面に表示する

## mock mode時

- 本番登録しない
- Supabaseへ通信しない
- 入力内容を保存しない
- パスワードを保存しない
- 画面上で登録UI確認結果だけを表示する

## supabase mode時

`supabase.auth.signUp()` に以下を渡す。

```js
{
  email,
  password,
  options: {
    data: {
      company_name,
      contact_name,
      business_type,
      selected_app_keys
    },
    emailRedirectTo
  }
}
```

パスワードはmetadataに入れない。

## 入力バリデーション

- 会社名 / 店舗名 / 教室名: 必須
- 担当者名: 必須
- メールアドレス: 必須、メール形式
- パスワード: 必須、8文字以上
- 業種: 必須
- 使いたいアプリ: 1つ以上推奨

## エラー表示

Supabaseからの詳細エラーをそのまま出しすぎない。

利用者向けには、メールアドレス、パスワード、接続設定を確認する文言にする。

## 確認メールが必要な場合

Supabase側でメール確認がONの場合、`signUp()` 成功後もsessionが返らないことがある。

その場合は「確認メールが届いている場合は、メール内のリンクを確認してください」と表示する。

## company_accountsとの紐づけ

推奨方式はAuth trigger。

```text
supabase/migrations/20260625_v011_signup_company_account_trigger.sql
```

Authユーザー作成時に `auth.users.raw_user_meta_data` から会社情報を読み取り、`public.company_accounts` を作成する。

## app_instancesをいつ作るか

v0.11では作らない。

`selected_app_keys` はmetadataとして渡す。

v0.13では、追加migrationでAuth trigger関数を拡張し、`selected_app_keys` から `app_instances` を作成する。

## v0.12への引き継ぎ

- login接続
- account画面でcompany_accountsを読む
- email confirmation後の状態表示
- RLS経由で自分のcompany_accountだけ読めることの確認
