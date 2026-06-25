# data フォルダ

このフォルダは、LLLD Works Market の仮DBです。

現在はSupabaseなどの実DBには接続していません。静的サイトとして動かすために、JSONファイルを `fetch()` で読み込んでいます。

## ファイル

- `contents.json`: コンテンツ情報
- `authors.json`: 投稿者情報
- `categories.json`: カテゴリ情報

## 将来DB化するとき

将来SupabaseやAPIに移行するときは、画面から直接JSONを読ませず、`assets/js/contentService.js` の取得処理を差し替える方針です。

HTML側や画面描画側がDBの細かい仕様に依存しないようにします。

## 置かないもの

- APIキー
- パスワード
- 個人情報
- 購入履歴
- 売上情報
- 権限情報
- 審査状況

これらは将来、本物の認証・DB・管理画面で扱う情報です。
