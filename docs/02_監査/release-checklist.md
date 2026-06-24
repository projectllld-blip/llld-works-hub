# Release Checklist

本番GitHub Pagesへ反映する前の確認リスト。

## 技術確認

- `python3 -m http.server 5500` で起動できる。
- `/` が表示される。
- `/marketplace.html` が表示される。
- `/content-detail.html?slug=monthly-operations-checklist` が表示される。
- `/request.html` が表示される。
- `/thanks.html?type=purchase` が表示される。
- CSS、JS、JSON、画像が読み込める。
- Chrome console error がない。
- スマホ幅で大きく崩れない。

## データ確認

- `data/contents.json` が正しいJSONである。
- `data/authors.json` が正しいJSONである。
- `data/categories.json` が正しいJSONである。
- `authorId` と `categoryId` が対応している。
- 価格、販売状態、提供方法、CTAが矛盾していない。
- `internal` / `internal-only` がMarket側に出ていない。
- 有料商品の `paymentUrl` が空の場合、購入CTAは `request.html` に逃げている。

## セキュリティ確認

- APIキーや秘密情報がHTML/JS/JSONにない。
- 個人情報、顧客情報、勤怠実データがない。
- 教材PDFや著作権物がない。
- 契約書、見積書、請求書、財務資料がない。
- 有料商品の本体ファイルがGitHub Pages上にない。

## Git確認

- 変更対象が今回の目的に絞られている。
- 未追跡ファイルを誤って混ぜていない。
- `git diff --check` が通る。
- 本番リポジトリへ移す差分が明確である。

