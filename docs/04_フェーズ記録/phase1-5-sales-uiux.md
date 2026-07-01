# phase1-5-sales-uiux

## Phase

v1.5 販売用UI/UX強化

## 状態

実装中。

v1.4で整理した商品化方針を、Works Marketの一覧と商品詳細の見え方へ反映する。

## 強化した画面

- `marketplace.html`
- `content-detail.html`

実装は主に `assets/js/marketPages.js` と `assets/css/style.css` で行う。

## CTA方針

v1.3 / v1.4の方針に合わせ、画面上のCTAは以下を基本にする。

| 状態 | CTA | 備考 |
|---|---|---|
| 無料 | 利用開始 | DB更新はまだ行わず、既存アプリURLへ進む。 |
| β版 | β版を試す | 未完成範囲は詳細ページの注意事項で確認する。 |
| 有料化予定 | 購入について相談する | 決済未実装のため、購入完了とは扱わない。 |
| 準備中 | 準備中 | 利用開始や購入はまだできない。 |
| 相談導線 | 開発相談 / 導入相談 | 通常商品カードから分離する。 |

## 商品状態表示

販売画面では以下を見分けられるようにする。

- 無料
- 有料化予定
- β版
- 準備中
- 相談導線

商品詳細では、提供状態、価格、今押せるCTA、状態メモを表示する。

## 通常カードと相談導線の分離

`priceType = consultation`、`saleStatus = inquiry-only`、`primaryCtaType = consultation` のコンテンツは、通常の商品一覧から外し、`導入相談・カスタマイズ相談` セクションへ分離する。

この分離により、購入者が「相談しないと通常アプリを使えない」と誤解しにくくする。

## PARKED項目の扱い

以下は通常販売面に出さない。

- `priceType = internal`
- `saleStatus = internal-only`
- `visibility = internal`
- PARKED中の旧購入者向けアプリ追加申請
- `app_add_requests` を使う購入者向け利用申請
- SeatFlow完全クラウド同期など、未完了の深掘り範囲

## v1.6購入ページへの引き継ぎ

v1.6では、商品詳細から購入ページへ進む導線を検討する。

ただし、以下はv1.5では実装しない。

- 決済。
- 購入履歴。
- `app_instances` 追加・更新。
- 利用開始DB処理。
- 利用解除処理。
- 管理者画面での価格編集。
- Supabase migration / RLS変更。

## 人間確認項目

- `marketplace.html` で無料 / 有料化予定 / β版 / 準備中が見分けられる。
- CTAが `利用開始` / `購入について相談する` / `β版を試す` / `準備中` の方針に合っている。
- 相談型アプリが通常の商品カードに混ざっていない。
- `content-detail.html` でも状態とCTAが分かる。
- スマホ表示で大きな崩れがない。

## STOP条件

- 決済実装が必要。
- 購入履歴実装が必要。
- Supabase migration / RLS変更が必要。
- DB保存処理が必要。
- `app_instances` / `app_data` / `company_accounts` / `plan_status` 変更が必要。
- `app_add_requests` 導線復活が必要。
- 価格確定が必要。
