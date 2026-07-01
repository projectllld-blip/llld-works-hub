# phase1-3f-remove-buyer-app-request-ui

## Phase

v1.3f 旧アプリ追加申請UIの撤去

## 状態

完了。

v1.3 購入前後の利用開始フロー整理により、購入者側の「アプリ追加申請」は本線から外した。

購入者は、購入画面で「購入」または「利用開始」を押せばアプリを使える設計にする。

## 実装内容

- `account.html` から「アプリ追加申請を見る」導線を撤去。
- `account.html` から旧 `appRequestPanel` を撤去。
- 旧アプリ追加申請フォーム、旧申請済み表示、旧「申請内容はまだ送られていません。」表示を撤去。
- `assets/js/accountPage.js` から旧 `app_add_requests` select / insert 処理を撤去。
- `assets/js/accountPage.js` から旧申請フォーム初期化、申請送信イベント、申請済み状態描画を撤去。
- `assets/css/style.css` から旧申請UI専用 `.account-request-*` CSSを撤去。

## 残したもの

- ログイン状態確認。
- 企業情報表示。
- 企業情報編集フォーム。
- 利用中アプリ一覧。
- ログアウト導線。
- 既存の `app_instances` 表示。
- 検証用アプリ追加パネル。

## app_add_requests の扱い

`app_add_requests` はdropしていない。

Supabase migration、RLS、DB schemaは変更していない。

`app_add_requests` は本線では使わずPARKED扱いのままにする。

将来、導入相談、サポート申込、クリエイター投稿などに転用する場合は、別Phaseで再設計する。

## 今回やらないこと

- 購入ページ実装。
- 利用開始処理の実装。
- `app_instances` 追加・更新。
- `app_data` 変更。
- `company_accounts` 変更。
- `plan_status` 変更。
- `app_add_requests` drop。
- Supabase migration変更。
- RLS変更。
- Auth / login / signup変更。
- 決済実装。
- クリエイター投稿機能実装。
- 管理者画面実装。

## 人間ブラウザ確認項目

2026-07-02に人間確認済み。

- `account.html` に「アプリ追加申請を見る」が表示されない: OK。
- 旧「アプリ追加申請」セクションが表示されない: OK。
- 旧申請フォームが表示されない: OK。
- 利用中アプリ一覧が表示される: OK。
- 企業情報編集フォームが表示される: OK。
- ログアウトできる: OK。
- スマホ表示で大きな崩れがない: OK。
- `app_add_requests` はdropしていない: OK。
- Supabase / RLS / migration は変更していない: OK。

## STOP条件

- `app_add_requests` dropが必要。
- Supabase migration / RLS変更が必要。
- `app_instances` / `app_data` / `company_accounts` / `plan_status` 変更が必要。
- 購入ページ、決済、クリエイター投稿機能に踏み込みそう。
