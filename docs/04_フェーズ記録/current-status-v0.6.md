# Current Status v0.6

作成日: 2026-06-25

## 現在の到達点

LLLD Works Hub / Works Market は、ローカル検証版として商品棚、商品詳細、購入相談、開発相談、管理画面モックまで確認できる状態。

本番GitHub Pagesにはまだ反映しない。

## 完了済みPhase

- Phase 1・2: ローカル検証版、JSON仮DB、Service層、監査ルール整理
- Phase 4圧縮: 代表本人による疑似βチェックへ圧縮
- Phase 5: Supabase移行準備の文書化
- Phase 6: 管理画面Skeleton
- Phase 6.1: 管理画面モック改善
- Phase 6.2: 商品詳細・販売導線強化
- Phase 6.5: 中間監査
- Phase 6.3: 商品データ品質整理

## できている画面

- `index.html`: 社内Hubトップ
- `marketplace.html`: Market一覧
- `content-detail.html`: 商品詳細
- `author.html`: 投稿者ページ
- `request.html`: 購入・開発相談
- `thanks.html`: 送信後・購入後案内
- `submit.html`: 投稿募集ページ
- `admin.html`: 管理画面モック

## できている導線

- 社内HubからMarketへ移動
- Marketから商品詳細へ移動
- 商品詳細から無料利用、購入相談、開発相談、先行案内へ移動
- `request.html` で `item` と `slug` の両方に対応
- thanksページで購入、相談、β、先行案内の案内文を出し分け
- 管理画面モックで詳細、審査、編集モック、公開判定を確認

## まだモックのもの

- 管理画面
- 投稿申請一覧
- 審査チェック
- 公開判定
- 表示確認用ロール
- 購入相談、納品、決済案内

## まだ本番化しないもの

- Supabase接続
- 認証
- 決済
- 自動納品
- 購入履歴
- 売上管理
- 投稿の自動公開
- 管理画面からの実データ更新

## 次に進む候補

- 問い合わせ先メールまたはGoogleフォームURLの確定
- 有料商品の実ファイル管理場所の決定
- サムネイル品質の追加改善
- Supabase開発環境の準備
- 本番反映候補とローカル限定機能の切り分け
