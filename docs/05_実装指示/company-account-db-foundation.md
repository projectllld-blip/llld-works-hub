# 企業アカウント・DB基盤 実装方針

## 基本前提

LLLD Works Hub / Works Marketのアカウントは、当面以下の単位で扱う。

```text
アカウント = 企業 / 店舗 / 教室
```

個人ユーザー、所属組織、複数スタッフログイン、権限分岐は現時点では実装しない。

## site-config

`data/site-config.json` の `auth` で認証モードを管理する。

```json
{
  "auth": {
    "mode": "mock",
    "supabaseUrl": "",
    "supabaseAnonKey": ""
  }
}
```

- `mode: "mock"` を基本にする。
- `supabaseUrl` と `supabaseAnonKey` が空ならmock扱いにする。
- service role keyは絶対に置かない。
- `.env` や秘密キーをGitHubに置かない。

## 追加画面

- `login.html`: 企業アカウント用ログインUI。
- `signup.html`: 企業アカウント登録UI。
- `account.html`: 企業アカウントのマイページ風UI。

すべてmock modeの検証画面であり、本番登録・本番ログイン・実データ保存は行わない。

## 追加JS

- `siteConfigService.js`: `data/site-config.json` を読み、安全なデフォルトを返す。
- `authService.js`: mock / supabase modeを判定する。Supabase未設定ならmock扱いにする。
- `accountPage.js`: 画面表示、入力バリデーション、mock mode注意表示を行う。

## 保存禁止

- パスワードを保存しない。
- 認証トークンをlocalStorageで独自管理しない。
- 問い合わせ内容や個人情報をlocalStorageに保存しない。
- Supabase service role keyをフロントに置かない。
- Stripe secret keyを置かない。

## 本番化前の条件

- Supabase Authの利用範囲を決める。
- RLSを有効化する。
- `company_accounts.owner_user_id = auth.uid()` を基本にする。
- `company_account_id` で必ずデータ分離する。
- 本番前に監査チェックリストを通す。

## v0.10 検証DB

v0.10では、以下のSQLを追加した。

```text
supabase/migrations/20260625_v010_company_account_foundation.sql
supabase/seed.sql
```

`company_accounts` には、Supabase Authと紐づけるために以下を持たせる。

```text
owner_user_id uuid references auth.users(id)
```

考え方:

```text
1つの企業 / 店舗 / 教室アカウント
= Supabase Auth上の1ユーザー
= company_accounts.owner_user_id = auth.uid()
```

現時点では、複数スタッフログインや `organization_members` は作らない。
