# v0.10.5 mock / supabase 切替土台 実装記録

## 目的

LLLD Works Hub / Works Market の企業アカウント画面について、Supabase本番接続へ進む前に、`mock mode` と `supabase mode` を安全に判定できる土台を作った。

このフェーズでは、本番登録・本番ログイン・実データ保存は行わない。

## 追加・更新したもの

- `assets/js/supabaseClientService.js` を追加
- `assets/js/siteConfigService.js` に安全なauth mode判定を追加
- `assets/js/authService.js` を mock / supabase 切替前提に整理
- `assets/js/accountPage.js` に現在の接続モード表示を追加
- `login.html` / `signup.html` / `account.html` に接続モード判定用JSを追加

## 切替方針

- `auth.mode = mock` の場合は `mock mode`
- `auth.mode = supabase` でも `supabaseUrl` または `supabaseAnonKey` が空なら `mock mode` に戻す
- `auth.mode = supabase` かつ URL / anon key がある場合は `supabase mode` と判定する
- ただし、このフェーズではSupabase Authの signup / login は実行しない

## Supabase未設定時

画面には、Supabase設定が未完了のため `mock mode` で動作していることを表示する。

## Supabase設定済み時

URL / anon key が設定されている場合は、Supabase設定を検出したことを表示する。

ただし、実登録・実ログイン・実データ保存はまだ行わない。

## セキュリティ方針

- service role key は使わない
- `.env` や秘密キーはGitHubに置かない
- 認証トークンをlocalStorageに独自保存しない
- パスワードを保存しない
- 入力内容をlocalStorageに保存しない

## 次に進む候補

v0.11で、Supabase Authのsignup接続を検討する。

その前に、Supabaseプロジェクト、RLS、anon keyの扱い、会社アカウント作成フローを再確認する。
