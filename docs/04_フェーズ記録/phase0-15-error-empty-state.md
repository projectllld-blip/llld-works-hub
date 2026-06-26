# v0.15 エラー処理・空状態

## 目的
主要画面で、未ログイン、データなし、読み込み失敗、保存失敗、処理中、再試行案内が無言にならないようにする。

## 改善した状態表示
- 共通表示: `.status-message`、`.empty-state`、`.loading-state` を追加
- `marketplace.html`: 読み込み中、商品データ取得失敗、公開商品0件、検索結果0件を区別
- `content-detail.html`: 該当商品がない場合に、公開中の商品ではない可能性とマーケット一覧への導線を表示
- `marketplace.html` / `content-detail.html`: 商品データ取得失敗時に再読み込みボタンを表示
- `content-detail.html`: internal / internal-only など非公開扱いの商品を直接slugで表示しない
- `login.html` / `signup.html`: 入力不足時にブラウザ標準のrequired表示に加えて画面内メッセージを表示

## 既存方針を維持したこと
- `portal_state` の正式保存先は Supabase `app_data.data_type = portal_state`
- localStorageは体感速度改善用の一時キャッシュ
- Supabase migration、RLS、本番設定、GitHub Pages設定は変更しない
- 購入、決済、Stripe連携は実装しない
- service_roleやsecretは使わない

## 触ったファイル
- `assets/css/style.css`
- `assets/js/accountPage.js`
- `assets/js/marketPages.js`
- `docs/00_PROJECT_STATUS.md`
- `docs/06_TASK_QUEUE.md`
- `docs/04_フェーズ記録/phase0-15-error-empty-state.md`
- `docs/05_実装指示/error-empty-state.md`

## 確認したこと
- JS構文チェック
- JSON parse
- 主要HTML存在確認
- 主要HTMLリンク確認
- secret pattern scan
- `git diff --check`

## 未確認のこと
- GitHub Actionsのリモート実行結果
- ブラウザ上での実データ取得失敗の人工再現
- Supabase実接続での未ログイン、保存失敗、RLS失敗の網羅確認

## 人間がブラウザで確認すべきこと
- `marketplace.html` が通常データで表示される
- `content-detail.html?slug=存在しないslug` で該当なし表示が出る
- `login.html` / `signup.html` で入力不足時に画面内メッセージが出る
- `portal.html` の未ログイン・キャッシュ表示・保存失敗導線が既存どおり動く
- `account.html` の未ログイン・利用中アプリなし・取得失敗表示が意味の通る文言になっている

## Supabase Dashboardで人間が確認すべきこと
今回の実装だけではなし。

v0.16では、`company_accounts`、`app_instances`、`app_data.portal_state`、`app_data.seat_layout` のRLSと他社データ混入テストを確認する。
