# 自社フォームUIルール

## 目的

`request.html` を、LLLD Works Market の問い合わせ・購入相談用の自社フォームUIとして扱う。

GitHub Pages単体ではサーバー側送信ができないため、今は送信モードを分けて将来拡張に備える。

## Googleフォームは使わない

v0.8修正版以降、Googleフォーム連携は使わない。

問い合わせ導線は以下の3モードで扱う。

## data/site-config.json

```json
{
  "contact": {
    "mode": "demo",
    "email": "",
    "endpointUrl": "",
    "ownerName": "LLLD Works Hub"
  }
}
```

## demo mode

- 実送信しない。
- 送信ボタンを押すと入力内容の確認パネルを表示する。
- 「現在、問い合わせ送信機能は準備中です」と表示する。
- thanks.html に送信完了として遷移しない。
- 問い合わせ内容を localStorage に保存しない。

## mailto mode

- `contact.mode` を `mailto` にする。
- `contact.email` に公開用メールアドレスを設定する。
- 送信ボタンでメールアプリを開く。
- 件名と本文にフォーム内容を入れる。
- サイト側に問い合わせ内容を保存しない。

## endpoint mode

- `contact.mode` を `endpoint` にする。
- `contact.endpointUrl` に将来自社APIのURLを設定する。
- fetchでPOSTできる設計にする。
- APIキーや秘密キーは使わない。
- endpointUrlが未設定ならdemo扱いにする。
- 送信エラー時は画面上に分かりやすく表示する。

## フォーム項目

必須:

- 相談種別
- 担当者名
- メールアドレス
- 相談内容

任意:

- 対象商品
- 会社名 / 店舗名 / 教室名
- 電話番号
- 希望内容
- 希望時期
- 予算感

## URLパラメータ

対応:

- `type`
- `item`
- `slug`

優先順位:

1. `item`
2. `slug`

商品詳細ページから来た場合、フォーム上部に対象商品の情報を表示する。

## thanks.html の扱い

`thanks.html` はローカル検証用・導線確認用の完了画面。

自社フォームが未接続の場合、偽の送信完了として扱わない。

## 禁止事項

- Supabase接続はしない。
- 認証はしない。
- 決済はしない。
- 自動納品はしない。
- 購入履歴管理はしない。
- 問い合わせ内容を localStorage に保存しない。
- 有料商品の本体ファイルをGitHubに置かない。
- 個人情報・顧客情報・勤怠実データを追加しない。
