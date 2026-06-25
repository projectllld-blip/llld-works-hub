# v0.14.5 Supabase Auth / Account E2E確認

## 目的

v0.15へ進む前に、Supabase接続設定を行い、企業アカウント作成、ログイン、account表示、利用アプリ一覧、SeatFlowクラウド保存までを実動作確認する。

## 現在の停止理由

2026-06-26時点では、古いSupabaseプロジェクトを使わず、新しく作成した検証用Supabaseプロジェクトへ `data/site-config.json` を接続し直した。

接続先:

```text
supabaseUrl: https://ywcymnnlhyhjqmmxirug.supabase.co
supabaseAnonKey: sb_publishable...241F
```

service role key / secret key は未使用。

## 2026-06-26 新Supabaseプロジェクト確認結果

### 成功

- `data/site-config.json` が `auth.mode = supabase` になっている。
- Supabase URLが空ではない。
- anon/public keyが空ではない。
- service role / `sb_secret_` / secret keyの混入なし。
- 新Supabase REST endpointへ到達できた。
- `apps` / `company_accounts` / `app_instances` / `app_data` のREST endpointが存在する。
- `apps` seedとして以下が確認できた。
  - `attendance`
  - `meeting_support`
  - `pdf_tool`
  - `quiz_maker`
  - `sales_talk_support`
  - `seatflow`
- `signup` APIは200で応答した。
- Auth user IDが返った。
- `confirmation_sent_at` が返り、確認メール送信状態になった。

### 2026-06-26 再開確認

対象テストユーザーのメール確認完了後、v0.14.5の実接続確認を再開した。

対象ユーザー:

```text
email: llld.e2e.test+20260625183052@gmail.com
password: 記録しない
```

確認結果:

- `login` APIでsession / access tokenが返った。
- `company_accounts` が1件取得できた。
- `company_accounts.owner_user_id` がAuth user idと一致した。
- RLS越しに見える `company_accounts` は自分の1件のみだった。
- `app_instances` が3件取得できた。
  - `seatflow`
  - `pdf_tool`
  - `quiz_maker`
- `apps` 参照と組み合わせて利用中アプリ一覧に必要な情報を取得できた。
- SeatFlow用 `app_instance_id` が取得できた。
- `app_data` に `app_key = seatflow` / `data_type = seat_layout` で保存できた。
- 保存後、同じログインユーザーで `app_data` から読込できた。
- 保存データに生徒名・講師名・電話番号・メール・予約状態・勤怠情報などの禁止フィールドは検出されなかった。
- anon / logged out相当では `app_data` は0件で、保存データは見えなかった。
- logout APIは成功した。
- logout後のtokenでは `auth/v1/user` が拒否された。

### v0.14.5 完了判断

コード/API上の確認は完了。

ブラウザ上の目視確認は、GitHub Pagesまたはローカル画面で人間が最終確認する。

### 未確認

- ブラウザで `account.html` に企業情報と利用アプリカードが見えることの目視確認
- ブラウザで `apps/seatflow/index.html` のクラウド保存 / 読込ボタン表示と操作感
- 別ブラウザまたはシークレットウィンドウでの同一アカウント読込の目視確認

## 次に必要な作業

次はブラウザでの見た目確認と、v0.15の空状態・エラー処理整理へ進む。

重要:

- migration / seed は新プロジェクトで適用済みと確認できた。
- publishable key / anon keyのみを使う。
- service role keyやdatabase passwordをフロントへ置く方法では絶対に対応しない。
- 今回作成したテストユーザー・テスト `app_data` は、必要に応じてSupabase Dashboard上で削除してよい。

## 接続前に必要な設定

検証時のみ、`data/site-config.json` を以下の形にする。

```json
{
  "auth": {
    "mode": "supabase",
    "supabaseUrl": "https://xxxxx.supabase.co",
    "supabaseAnonKey": "検証用anon/public key"
  }
}
```

注意:

- anon/public keyのみを使う。
- service role keyは絶対に入れない。
- Stripe secret keyやその他秘密キーも入れない。
- 検証後にmockへ戻すか、検証用設定であることを明記する。

## Supabase側で適用が必要なSQL

以下をSupabase SQL Editorで適用する。

1. `supabase/migrations/20260625_v010_company_account_foundation.sql`
2. `supabase/seed.sql`
3. `supabase/migrations/20260625_v011_signup_company_account_trigger.sql`
4. `supabase/migrations/20260625_v013_app_instances_from_signup_metadata.sql`
5. `supabase/migrations/20260625_v014_seatflow_app_data_constraints.sql`

## 確認対象テーブル

- `auth.users`
- `company_accounts`
- `apps`
- `app_instances`
- `app_data`
- RLS policy

## 最優先E2E確認

SeatFlowクラウド保存より前に、以下を確認する。

1. `signup.html` から新規企業アカウントを作成できる。
2. Supabase Authの `auth.users` にユーザーが作成される。
3. `company_accounts` に企業アカウント情報が作成される。
4. `app_instances` に初期利用アプリが作成される。
5. 作成したメールアドレスとパスワードで `login.html` からログインできる。
6. ログイン後 `account.html` に遷移できる。
7. `account.html` に企業情報が表示される。
8. `account.html` に利用中アプリ一覧が表示される。
9. logoutできる。
10. logout後、`account.html` へ直接アクセスした場合は `login.html` に戻される。

## SeatFlow確認へ進む条件

上記10項目が通るまで、SeatFlowクラウド保存の実接続確認には進まない。

## SeatFlow実接続確認

アカウント作成から利用アプリ一覧まで通った後に確認する。

1. `apps/seatflow/index.html` を開く。
2. mockではなくsupabase modeで動作していることを確認する。
3. レイアウトを編集する。
4. クラウド保存する。
5. `app_data` に `app_key = seatflow` / `data_type = seat_layout` のデータが保存される。
6. 同じアカウントでクラウド読込できる。
7. 別ブラウザまたはシークレットウィンドウでも同じアカウントなら読込できる。
8. ログアウト状態ではクラウド保存・読込できない。

## 失敗時の分類

失敗した場合は、以下のどこで止まったかを分けて記録する。

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

## v0.14.5で行った補足修正

Supabase modeで未ログインのまま `account.html` に直接アクセスした場合、画面に案内を出した後 `login.html?redirect=account` へ戻す。

mock modeでは従来通りサンプルアカウントを表示する。
