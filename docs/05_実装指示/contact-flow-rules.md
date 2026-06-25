# 問い合わせ・購入相談導線ルール

この文書は `owned-contact-form-rules.md` と同じ方針を参照する。
v0.8以降、Googleフォーム連携は使わず、自社フォームUIとして整備する。

## 現行方針

- `request.html` は自社フォームUI。
- GitHub Pages単体ではサーバー側送信処理ができない。
- 送信モードは `data/site-config.json` の `contact.mode` で管理する。
- 問い合わせ内容は localStorage に保存しない。

## 送信モード

- `demo`: 実送信せず、入力内容の確認と準備中表示のみ。
- `mailto`: 設定メールアドレスへメール作成。
- `endpoint`: 将来自社APIへPOSTするための設計。API未設定時はdemo扱い。

## 禁止事項

- Googleフォーム連携を追加しない。
- Supabase、認証、決済、自動納品、購入履歴管理はまだ実装しない。
- APIキーや秘密キーをフロントに置かない。
- 有料商品の本体をGitHub Pagesに置かない。
