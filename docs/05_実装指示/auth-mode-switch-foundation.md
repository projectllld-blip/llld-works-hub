# auth mode 切替土台 実装ルール

## 基本方針

`data/site-config.json` の `auth` 設定で、認証モードを切り替える。

ただし、Supabase設定が不足している状態で本番処理へ進まないよう、画面側では必ず安全判定を通す。

## site-config.json

```json
{
  "auth": {
    "mode": "mock",
    "supabaseUrl": "",
    "supabaseAnonKey": ""
  }
}
```

## getSafeAuthMode の考え方

- `mode` が `mock` または不正値なら `mock`
- `mode` が `supabase` でも `supabaseUrl` が空なら `mock`
- `mode` が `supabase` でも `supabaseAnonKey` が空なら `mock`
- `mode` が `supabase` かつ URL / anon key がある場合のみ `supabase`

## Supabase client の扱い

- anon keyのみを前提にする
- service role key は絶対にフロントへ置かない
- Supabase JSライブラリが未読込でも画面を壊さない
- client初期化に失敗しても `mock mode` 表示または未接続表示に戻す

## localStorage 禁止事項

以下はlocalStorageに保存しない。

- 認証トークン
- パスワード
- 権限情報
- 本番アカウント情報
- 問い合わせ内容
- 個人情報

## v0.11 signup接続時の注意

- Supabase Authへの登録処理を追加する前にRLSを確認する
- `company_accounts.owner_user_id = auth.uid()` の作成フローを明確にする
- 登録失敗時に中途半端な会社アカウントが残らないようにする
- service role keyをフロントで使わない

## v0.12 login / account接続時の注意

- ログイン後に読めるデータは `company_account_id` で分離する
- app_instances / app_data / audit_logs は自分の会社アカウントのものだけ読めるようにする
- RLS未設定のまま本番運用しない
- 勤怠実データは最後に慎重に扱う
