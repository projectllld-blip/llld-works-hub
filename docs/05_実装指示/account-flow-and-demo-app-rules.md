# アカウント導線・検証用アプリ追加ルール

## 位置づけ

v0.15.5の「検証用アプリ追加」は、本番購入・決済・管理者承認ではない。

目的は、RLSやクラウド保存検証のために、ログイン中企業アカウントへ最小限の `app_instances` を追加できるようにすること。

## アプリ起動ルール

利用中アプリカードの「開く」は、可能な限り実アプリへ直接遷移する。

- SeatFlow: `apps/seatflow/index.html`
- PDF編集: `apps/pdf-tool/index.html`
- 小テスト作成: `apps/quiz-maker/index.html`
- 勤怠管理: `apps/dakokun/index.html`

実アプリがないものは、準備中表示または既存コンテンツページへ向ける。

中間ページで「アプリを開く」をもう一度押させる導線は、account画面の利用中アプリからは使わない。

## ログイン中アカウント表示

`accountHeader.js` は表示専用の部品。

表示する内容:

- 企業名 / メールアドレス
- メールアドレス
- 未ログイン

この部品でプロフィール編集、権限管理、購入履歴表示は行わない。

## signup重複防止

同一メールアドレスで企業アカウントを重複作成しない。

フロント側:

- Supabase signupで既存メールらしい応答が返った場合は、登録済みとして扱う
- 画面には「このメールアドレスは既に登録されています。ログインしてください。」と出す
- パスワードや認証トークンを保存しない

DB側:

- `company_accounts.owner_user_id` はunique
- `app_instances(company_account_id, app_key)` はunique
- 追加候補SQLとして `company_accounts.email` のunique indexを用意する

```text
supabase/migrations/20260625_v0155_unique_company_email.sql
```

このSQLは既存重複がある場合に停止する。
勝手に既存行を削除・統合しない。

## 検証用アプリ追加

対象:

- SeatFlow
- PDF編集
- 小テスト作成
- 勤怠管理
- 面談支援

処理:

1. ログイン中企業アカウントを取得
2. `apps` から対象アプリを取得
3. 既存の `app_instances` を確認
4. 未登録の場合だけ `app_instances` にinsert
5. 追加後にaccount画面の利用中アプリ一覧を再読込

追加時の初期値:

```text
status = trial
settings_json = {}
```

禁止:

- 他社 `company_account_id` への追加
- app_dataの作成
- 決済・購入履歴の作成
- 管理者承認済みのような表示

## RLS前提

`app_instances` のinsert/select/updateは、ログイン中ユーザーの `company_accounts.id` に紐づく行だけ許可する。

v0.16では、他社データが見えない・書けないことを実テストする。
