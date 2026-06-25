# Phase 6.3 商品データ品質整理記録

作成日: 2026-06-25

## 目的

Market表示対象コンテンツを、販売・相談・ビジコンデモに使える品質へ整理する。

## 確認結果

Market表示対象11件は、以下の情報を持っている。

- `targetUsers`
- `problems`
- `features`
- `deliverables`
- `usageSteps`
- `notes`
- `deliveryType`
- `primaryCtaType`
- `primaryCtaLabel`
- `primaryCtaUrl`
- `saleStatus`

## 重複項目を増やさない判断

新しい項目を無理に増やさず、既存項目を以下のように扱う。

- `includedItems` 相当: `deliverables`
- `ctaType` 相当: `primaryCtaType`
- `priceLabel` 相当: `formatPrice()` で表示時に算出
- `marketVisible` 相当: `visibleMarketContents()` で表示時に判定

## 追加・修正したこと

- `request.html` が `item` と `slug` の両方に対応。
- `requestPage.js` に `request`、`consultation`、`customize`、`early-access`、`beta` の相談種別を追加。
- 商品データの品質ルールを `docs/05_実装指示/content-data-rules.md` に整理。
- 販売コピーの方針を `docs/05_実装指示/sales-copy-rules.md` に整理。

## 次の課題

- サムネイルの見た目を商品ごとにさらに整える。
- 有料商品の実ファイル管理場所を決める。
- 問い合わせ先を本番用に差し替える。
