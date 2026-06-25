# Content Data Rules

LLLD Works Market の商品データ整理ルール。

## Market表示対象コンテンツの基本項目

- `id`
- `slug`
- `title`
- `summary`
- `description`
- `categoryId`
- `authorId`
- `priceType`
- `saleStatus`
- `status`
- `visibility`
- `targetUsers`
- `problems`
- `features`
- `deliverables`
- `usageSteps`
- `notes`
- `deliveryType`
- `primaryCtaLabel`
- `primaryCtaType`
- `primaryCtaUrl`
- `secondaryCtaLabel`
- `secondaryCtaType`
- `secondaryCtaUrl`
- `thumbnail`
- `detailUrl`
- `updatedAt`

## 重複させない項目

- `includedItems` は増やさず、`deliverables` を使う。
- `ctaType` は増やさず、`primaryCtaType` を使う。
- `priceLabel` は増やさず、表示時に `formatPrice()` で作る。
- `marketVisible` は増やさず、表示時に `visibleMarketContents()` で判定する。

## 商品詳細ページで表示する情報

- タイトル
- サムネイル
- カテゴリ
- 投稿者
- 公開状態
- 販売状態
- 価格
- 提供方法
- 対象ユーザー
- 解決する悩み
- 主な機能
- 内容物
- 使い方
- 注意事項
- 更新日
- タグ
- CTAボタン

空項目は無理に表示しない。

## CTA表示ルール

- `free`: 無料で使う
- `free-beta`: β版を試す
- `paid + on-sale + paymentUrlあり`: 購入する
- `paid + on-sale + paymentUrlなし`: 購入について相談する
- `paid + preparing`: 先行案内を受ける
- `consultation`: 開発を相談する
- `coming-soon`: 先行案内を受ける
- `internal`: Market側には表示しない

## item / slug パラメータ互換方針

`request.html` は以下の両方に対応する。

- `item`
- `slug`

優先順位:

1. `item`
2. `slug`

## internal / internal_only 非表示ルール

Market側では以下を非表示にする。

- `priceType: "internal"`
- `saleStatus: "internal-only"`
- `visibility: "internal"`

`internal_only` 表記を使う場合も、将来DB化時に同じ非表示対象として扱う。

## 有料商品の扱い

- 有料商品の本体ファイルはGitHub Pagesに置かない。
- `contentUrl` は空、または説明ページに留める。
- 納品はメール添付、Google Drive限定リンク、手動共有を前提にする。

## まだ扱わないもの

- 決済処理
- 購入履歴
- 自動納品
- 売上管理
- 投稿の自動公開

## Supabase本番化前に必要なこと

- Authの設計
- RLSの設計
- 管理者権限の設計
- 投稿者権限の設計
- 操作ログ
- 秘密キーをフロントへ置かない構成
