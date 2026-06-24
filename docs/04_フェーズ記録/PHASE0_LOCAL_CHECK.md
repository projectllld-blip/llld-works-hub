# Phase 0 ローカル検証メモ

作成日: 2026-06-24

このメモは、本番GitHub Pagesへ反映する前に、ローカル検証版で確認したPhase 0差分だけを整理するためのもの。

## 今回の目的

- LLLD Works Hubを壊さず、将来のWorks Market化に向けたJSON管理の土台を確認する。
- いきなりGitHubへ反映せず、ローカルコピーで表示・リンク・404を確認する。
- UIの大幅変更や本格的なマーケット機能はまだ入れない。

## ローカル検証版で追加・確認したPhase 0差分

- `data/contents.json`
- `data/authors.json`
- `data/categories.json`
- `assets/js/contentService.js`
- `assets/js/authMockService.js`
- `assets/js/storagePolicy.js`
- `contents/dakokun/index.html`
- `contents/seatflow/index.html`
- `contents/pdf-tool/index.html`
- `contents/quiz-maker/index.html`
- `contents/meeting-support/index.html`
- `contents/sales-talk-support/index.html`
- `contents/subsidy-templates/index.html`
- `contents/internal-operations/index.html`
- `assets/thumbs/*.png`
- `assets/images/author-llld.png`
- `favicon.ico`
- `content-detail.html`
- `author.html`

## 確認済み

- `python3 -m json.tool` でJSON構文OK。
- `node --check` でJS構文OK。
- JSON内の `thumbnail` / `contentUrl` / `detailUrl` / `url` / `avatar` / `profileUrl` の参照先OK。
- `python3 -m http.server 5500` で起動OK。
- `http://localhost:5500/`、CSS、JS、JSON、サムネイル、各コンテンツURLがHTTP 200。
- ブラウザが自動取得する `favicon.ico` もHTTP 200。
- 404は検出なし。

## 本番反映時の方針

本番反映時は、以下だけを対象にする。

- Phase 0のJSON / Service層
- 404回避に必要な仮サムネイル
- 詳細ページ・投稿者ページの最小プレースホルダー
- faviconの仮ファイル
- 既存Hubの表示に必要な `index.html` / `assets/js/app.js` の変更

本番反映時に混ぜないもの。

- 既存ファイルの削除差分
- archive配下の整理差分
- Phase 0と関係しないアプリ本体の変更
- marketplace.htmlなど本格的なマーケット実装
- ログイン、決済、DB接続

## 次の判断

ローカル検証版で問題なければ、本番リポジトリでは「今回分だけ」をstageしてcommitする。

push前には再度以下を確認する。

- トップページが表示されるか
- JSON / JS構文が通るか
- 主要リンクが404にならないか
- 既存の「よく使うもの」「最終利用履歴8件」の導線が壊れていないか
