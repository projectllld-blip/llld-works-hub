# Phase 1・2 完了記録

作成日: 2026-06-25

## 対象

LLLD Works Hub / Works Market ローカル検証版。

## Phase 1: ローカル検証版の完成度

確認したこと:

- トップページ表示
- marketplace.html 表示
- content-detail.html 表示
- request.html 表示
- thanks.html 表示
- JSON構文
- JS構文
- 主要リンク
- サムネイル参照
- 価格、販売状態、提供方法、CTAの整合性
- internal / internal-only がMarket側に出ないこと
- 最終利用履歴8件、お気に入り、検索、カテゴリ絞り込みの基本動作

## Phase 2: セキュリティ・運用ルール

追加した文書:

- `docs/02_監査/security-policy.md`
- `docs/02_監査/localStorage-policy.md`
- `docs/02_監査/github-pages-risk.md`
- `docs/02_監査/release-checklist.md`
- `docs/02_監査/market-content-review-checklist.md`
- `docs/03_構想/roadmap-to-marketplace.md`
- `docs/03_構想/submission-review-flow.md`
- `docs/03_構想/sales-operation-flow.md`

## 現在の運用判断

- 本番GitHub Pagesにはまだ反映しない。
- 有料商品の本体ファイルはGitHub Pagesに置かない。
- 問い合わせ、購入相談、納品は手動で行う。
- 外部投稿は審査制を前提にする。
- 将来DB化する場合は `assets/js/contentService.js` の取得層を差し替える。

## 残課題

- 本番問い合わせ先メールまたはGoogleフォームURLの確定
- Stripe Payment Links等の決済リンク設定
- 限定公開時の確認者リスト
- 有料商品の実ファイル管理場所の決定

