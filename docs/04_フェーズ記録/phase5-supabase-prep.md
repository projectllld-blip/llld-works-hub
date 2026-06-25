# Phase 5 Supabase移行準備記録

作成日: 2026-06-25

## 目的

本番DB接続をまだ行わず、将来Supabaseへ移行しやすい状態を作る。

## 今回の範囲

- `data/` を仮DBとして維持する。
- 画面側は `assets/js/contentService.js` 経由でデータ取得する。
- Supabaseのテーブル候補、権限、RLS、移行手順をMarkdownで整理する。
- APIキー、Supabase秘密キー、サービスロールキーは置かない。
- 本番接続コードは追加しない。

## 移行時の中心ファイル

- `assets/js/contentService.js`
- `data/contents.json`
- `data/authors.json`
- `data/categories.json`

## 将来置き換える箇所

現在:

```js
fetch("./data/contents.json")
```

将来:

```txt
Supabase client またはサーバー側APIから取得
```

差し替え対象はService層に限定する。
HTMLやカード描画側がDBのテーブル名に直接依存しないようにする。

## 実装しないこと

- Supabase接続
- 認証
- RLS実装
- 投稿保存
- 審査状態の更新
- 購入履歴保存
- 売上管理

## 次に必要な作業

- Supabaseプロジェクトを作るか判断する。
- 開発用と本番用を分ける。
- `contents`、`authors`、`categories` のスキーマを確定する。
- `content_submissions`、`orders`、`inquiries` をいつ作るか決める。
- 公開用anon keyと秘密キーの扱いを分ける。
