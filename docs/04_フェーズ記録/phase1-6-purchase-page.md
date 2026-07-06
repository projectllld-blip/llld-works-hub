# v1.6 購入ページ

## 目的

決済実装に入る前に、マーケットの商品を「確認してから利用開始 / 購入確認する」ための購入ページMVPを整える。

今回のv1.6は、支払い処理、購入履歴、正式な利用権限付与ではない。

## 実装範囲

- `purchase-confirm.html` を、無料 / β版 / 買い切り / サブスクの確認ページとして使う。
- 無料アプリは「利用開始確認」から進む。
- β版は「β版利用確認」から進む。
- 買い切り / サブスクは「購入確認」から進む。
- 準備中 / 開発中の商品は、購入・利用開始させず先行案内や相談導線へ流す。
- 開発相談商品は、購入ではなく開発相談導線へ流す。
- 確認完了後は、同じブラウザセッション内で `portal.html` に一時追加する。
- 任意サポートとして、初期設定サポート、使い方説明、カスタマイズ相談、導入代行の希望を選べる。

## 今回やっていないこと

- 決済実装
- 購入履歴実装
- 正式な契約状態管理
- `app_instances` への正式追加
- `app_data` 変更
- `company_accounts` 変更
- `plan_status` 変更
- Supabase migration / RLS変更
- Supabase Dashboard操作

## 注意

確認後のポータル追加は `sessionStorage` による一時表示MVPである。

正式な購入後の利用開始、利用中アプリ反映、購入履歴、決済連携は後続フェーズで扱う。

## 人間確認項目

- `marketplace.html` の無料 / β版 / 有料カードから `purchase-confirm.html` へ進むこと。
- 詳細ページでも、確認前に直接アプリやコンテンツを開けないこと。
- `purchase-confirm.html?item=pdf-tool` で「利用開始確認」と表示されること。
- `purchase-confirm.html?item=quiz-maker` で「β版利用確認」と表示されること。
- `purchase-confirm.html?item=meeting-support` など有料商品で「購入確認」と表示されること。
- `purchase-confirm.html?item=sales-talk-support` で購入・利用開始ではなく準備中 / 先行案内になること。
- 任意サポートを選択できること。
- 確認完了後、同一ブラウザセッションの `portal.html` に一時追加されること。
- 決済処理や購入履歴が実行されないこと。
- Supabase / RLS / migration / DBに変更がないこと。

## 次フェーズ候補

`v1.7 購入後の利用開始・利用中アプリ反映`

このフェーズでは、`app_instances` への正式反映、利用開始状態、解除 / 停止状態、RLS / DB設計の要否を整理する。
