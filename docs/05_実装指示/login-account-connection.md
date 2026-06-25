# login / account接続 実装ルール

## 対象

v0.12では以下だけを接続する。

- `login.html`
- `account.html`
- Supabase Auth login / logout
- `company_accounts` の自分の行の取得

## login処理

1. `data/site-config.json` を読む
2. `auth.mode` と Supabase URL / anon key を判定する
3. mock modeなら実ログインしない
4. supabase modeかつclient準備済みなら `supabase.auth.signInWithPassword()` を呼ぶ
5. 成功時は `account.html` へ進む
6. 失敗時は、メールアドレスまたはパスワード確認の文言を出す

## mock mode時

- 本番ログインしない
- Supabaseへ通信しない
- 入力内容を保存しない
- パスワードを保存しない

## supabase mode時

```js
await client.auth.signInWithPassword({
  email,
  password
});
```

Supabase client標準のセッション管理に任せる。

認証トークンをlocalStorageへ独自保存しない。

## account取得

1. `client.auth.getUser()` でログイン中ユーザーを確認する
2. 未ログインならlogin / signup導線を表示する
3. ログイン中なら `company_accounts` を読む

```js
client
  .from("company_accounts")
  .select("id,email,company_name,contact_name,business_type,phone,plan_status,created_at,updated_at")
  .eq("owner_user_id", user.id)
  .maybeSingle();
```

## company_accountsがない場合

以下を疑う。

- v0.11 trigger SQL未適用
- メール確認前
- signup時metadata不足
- RLS policy不備
- 既存ユーザーでcompany_accounts未作成

v0.12では、フロントから自動作成しない。

## logout処理

supabase modeでは `client.auth.signOut()` を呼ぶ。

成功後は `login.html` へ戻す。

## RLS前提

`company_accounts.owner_user_id = auth.uid()` の行だけ読めることを前提にする。

RLS未設定のまま本番運用しない。

## v0.13への引き継ぎ

- app_instancesの表示
- appsカタログとの紐づけ
- 利用中アプリ一覧の本格表示
- app_data保存はまだ後続
