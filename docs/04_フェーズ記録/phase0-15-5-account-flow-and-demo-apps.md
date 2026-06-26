# v0.15.5 導線・アカウント表示・重複signup修正 実装記録

## 目的

v0.16 RLS・他社データ混入テストへ進む前に、アカウント基盤の導線を確認しやすくする。

今回の対象は、販売機能ではなく以下の基盤調整に限定する。

- 利用中アプリから中間ページを挟まずに実アプリへ開く
- ログイン中アカウントを画面上で分かるようにする
- 同一メールアドレスで企業アカウントを重複作成しない
- 検証用に利用アプリを追加できる最小導線を用意する

## 実装内容

### アプリ起動導線

`account.html` の利用中アプリカードは、`appInstanceService.js` のリンク定義を通って実アプリへ遷移する。

v0.15.5では以下を中間ページではなく実アプリ配下へ向けた。

- `seatflow` -> `apps/seatflow/index.html`
- `pdf_tool` -> `apps/pdf-tool/index.html`
- `quiz_maker` -> `apps/quiz-maker/index.html`
- `attendance` -> `apps/dakokun/index.html`

`meeting_support` など実アプリが未整備のものは既存コンテンツページを維持する。

### ログイン中アカウント表示

`accountHeader.js` を追加し、`account.html` と `marketplace.html` のヘッダーにログイン中アカウントを表示する。

表示は以下の優先順。

1. 企業名 / メールアドレス
2. メールアドレス
3. 未ログイン

表示専用であり、プロフィール編集や権限管理は実装していない。

### 重複signup対応

Supabase Authのsignupで既存メールに対する匿名的な成功応答が返る場合があるため、`user.identities` が空のsignup応答を登録済み扱いにする。

画面には以下を出す。

```text
このメールアドレスは既に登録されています。ログインしてください。
```

DB側は以下を追加候補とした。

```text
supabase/migrations/20260625_v0155_unique_company_email.sql
```

このSQLは既存の重複がある場合に停止し、データ削除は行わない。

### 検証用アプリ追加

`account.html` に検証用アプリ追加欄を追加した。

対象アプリ:

- SeatFlow
- PDF編集
- 小テスト作成
- 勤怠管理
- 面談支援

本番購入・決済・管理者承認ではなく、クラウド保存や利用アプリ一覧を検証するための導線。

`app_instances` にはログイン中企業アカウントの `company_account_id` で追加する。
追加前に既存行を確認し、重複作成しない。

## まだ本番化しないこと

- 本格購入ページ
- 決済
- 購入履歴
- 管理者承認
- スタッフ個別ログイン
- 権限管理
- 複数店舗管理

## 次に進む候補

v0.16 RLS・他社データ混入テスト。

特に確認すること:

- 他社 `company_accounts` が読めない
- 他社 `app_instances` が読めない
- 他社 `app_data` が読めない
- 他社 `app_instances` を追加・更新できない
- 自社の追加・保存だけが通る

## 実接続確認結果

検証用Supabaseで、既存テストユーザーを使ってAPI確認した。

確認済み:

- login成功
- session / access token取得OK
- `company_accounts` はログイン中ユーザーから1件取得
- `app_instances` は初期3件を取得
- `apps` カタログから検証対象5件を取得
- `meeting_support` を検証用trialとして追加
- 追加後の `app_instances` は4件
- 同一メールで再signupしたとき、Supabase Auth応答の `identities` が空で返ることを確認
- フロント側ではこの応答を「登録済み / ログインしてください」と扱う
- logout API成功

追加された検証用アプリ:

```text
meeting_support: trial
```

この追加は本番購入ではなく、v0.16以降のRLS・導線確認用。

## 手動適用が必要なSQL

メール重複のDB側保険として、以下をSupabase SQL Editorで手動適用する。

```text
supabase/migrations/20260625_v0155_unique_company_email.sql
```

このSQLは既存の `company_accounts.email` に重複がある場合は停止する。
停止した場合は、重複行を人間が確認してから再実行する。
