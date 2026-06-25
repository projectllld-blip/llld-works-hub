# v0.12 login / account接続 実装記録

## 目的

LLLD Works Hub / Works Market の企業アカウントについて、`login.html` と `account.html` を Supabase Auth / `company_accounts` に接続できる最小実装にした。

## 接続範囲

- `login.html` から Supabase Auth `signInWithPassword()` を呼べる
- `account.html` で Supabase Auth `getUser()` を使い、ログイン中ユーザーを確認できる
- `company_accounts.owner_user_id = auth user id` で自分の企業アカウントを1件取得する
- `logout()` は Supabase Auth `signOut()` を呼べる

## 未接続のもの

- app_instances / apps の本格表示
- app_data保存
- SeatFlowクラウド保存
- 勤怠実データ保存
- PDF実データ保存
- 決済・購入履歴
- スタッフ個別ログイン
- 権限管理

## signupとの関係

signupはv0.11で接続済み。

v0.12では、signup triggerで作成された `company_accounts` をaccount画面で読む。

## company_accounts取得方針

Supabase Authで取得した `user.id` を使う。

```text
company_accounts.owner_user_id = user.id
```

RLSにより、自分の企業アカウントだけ読める前提。

## company_accountsがない場合

画面には以下の可能性を案内する。

- v0.11 trigger SQLが未適用
- メール確認前
- signup時metadata不足
- RLS policy不備
- 既存ユーザーでcompany_accounts未作成

v0.12では、フロントから勝手にcompany_accountsを作成しない。

## セキュリティ

- service role keyは使っていない
- secret keyは使っていない
- `.env` は追加していない
- パスワードは保存しない
- 認証トークンをlocalStorageに独自保存しない
- app_dataには保存しない

## 残リスク

- Supabase実プロジェクトでv0.10 migration / seed / v0.11 trigger SQLが適用済みである必要がある
- Supabase Auth URL設定が必要
- 実接続テストには検証用anon keyが必要

## 次フェーズ

v0.13で利用アプリ一覧の表示に進む。
