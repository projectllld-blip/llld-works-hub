# Supabase Auth URL設定手順

## 目的

Supabase Authの確認メールやリダイレクトが、localhostとGitHub Pagesの両方で壊れないようにする。

## 設定場所

Supabase Dashboardで対象プロジェクトを開き、Authentication設定を確認する。

## Site URL

GitHub Pages確認版を使う場合は、以下を基本にする。

```text
https://projectllld-blip.github.io/llld-works-hub/
```

ローカル検証だけを行う場合は、必要に応じて以下も確認する。

```text
http://localhost:5500/
```

## Redirect URLs

以下を追加する。

```text
http://localhost:5500/**
https://projectllld-blip.github.io/llld-works-hub/**
```

## signup時のemailRedirectTo

v0.11では、現在のページURLを基準に以下へ戻す。

```text
login.html?signup=confirmed
```

GitHub Pagesとlocalhostのどちらでも、相対URLから生成する。

## v0.12 login / account接続

login後はSupabase client標準のセッション管理を使う。

`account.html` は `auth.getUser()` でログイン中ユーザーを確認し、`company_accounts.owner_user_id = user.id` の行だけを取得する。

## password reset

パスワード再設定はまだ本実装しない。

v0.12でlogin / account接続を行うときに、再度URL設定を確認する。

## 注意

- service role keyはフロントに置かない
- secret keyはHTML / JS / JSON / docsに書かない
- 検証用anon keyを使う場合も、実運用前に扱いを再確認する
- RLS未設定のまま本番運用しない
