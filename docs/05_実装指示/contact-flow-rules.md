# 問い合わせ・購入相談導線ルール

## 目的

GitHub Pages上の静的サイトでも、問い合わせ・購入相談の導線をすぐ差し替えられるようにする。

## 設定ファイル

問い合わせ先は `data/site-config.json` で管理する。

```json
{
  "forms": {
    "purchase": "",
    "request": "",
    "consultation": "",
    "customize": "",
    "earlyAccess": "",
    "beta": "",
    "submit": "",
    "support": ""
  },
  "contact": {
    "email": "",
    "ownerName": "LLLD Works Hub"
  }
}
```

## 接続優先順位

1. 該当typeのGoogleフォームURLへ遷移
2. フォーム未設定でメールアドレスがあれば `mailto:` を開く
3. どちらも未設定なら準備中表示にする

未設定時は、thanks.htmlへ偽遷移させない。

## 対応type

- `purchase`
- `request`
- `consultation`
- `customize`
- `early-access`
- `beta`
- `submit`
- `support`
- `development`
- `estimate`

## item / slug 互換

request.html は `item` と `slug` の両方に対応する。

- `item` があれば `item` を優先する。
- `item` がなければ `slug` を使う。
- 商品データ上のCTA URLは、できるだけ実在するslugまたはidを指定する。

## thanks.html の扱い

`thanks.html` はローカル検証用・導線確認用の完了画面。

Googleフォームやメールを使う場合、実際の送信完了は外部フォームまたはメール運用に合わせる。

## まだ実装しないこと

- 決済
- 認証
- DB接続
- 自動納品
- 購入履歴管理

## 禁止事項

- 有料商品の本体をGitHub Pagesに置かない。
- 個人情報や顧客情報をJSONに入れない。
- Supabase service role key や Stripe secret key を置かない。
- `internal` / `internal_only` をMarket側に出さない。
