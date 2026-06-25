# LLLD Works Market v0.6 リリース境界監査

作成日: 2026-06-25
対象: ローカル検証版 v0.6

## 目的

本番 GitHub Pages へ反映する前に、現在の差分を以下の3区分に分ける。

- 本番反映候補
- ローカル検証限定候補
- 本番反映禁止候補

この文書は commit / push の判断資料であり、この時点では本番反映しない。

## 本番反映候補

GitHub Pages に公開してもよい可能性が高いもの。ただし、本番反映前に最終表示確認とリンク確認を行う。

- `index.html`
- `marketplace.html`
- `content-detail.html`
- `author.html`
- `request.html`
- `thanks.html`
- `submit.html`
- `README.md`
- `assets/css/style.css`
- `assets/js/app.js`
- `assets/js/contentService.js`
- `assets/js/marketPages.js`
- `assets/js/requestPage.js`
- `assets/js/thanksPage.js`
- `assets/js/storagePolicy.js`
- `data/contents.json`
- `data/authors.json`
- `data/categories.json`
- `assets/thumbs/` の公開用サムネイル
- `assets/images/` の公開用画像
- 公開前提の無料ツール本体

## GitHub Pages確認用パッケージに含めてよい候補

2026-06-25 の Phase 6.6 で方針を更新した。
実際のUI確認、運用確認、管理モック確認のため、以下は GitHub Pages確認用パッケージに含めてよい。

- `admin.html`
- `assets/js/adminMockPage.js`
- `docs/`

ただし、これらは本番運用機能ではなく検証・確認用である。
`admin.html` は本番DBへの書き込み、公開状態変更、決済処理、購入履歴管理を行わないモックとして扱う。
`docs/` は公開確認用に含めてもよいが、内部情報・個人情報・秘密情報が混ざっていないことを確認する。

## 本番反映前に要判断の候補

公開しても動作上は問題ない可能性があるが、運用・説明・公開範囲の観点で確認してから判断する。

- `assets/js/authMockService.js`
  - 表示確認用のモックロールのみを扱うため、公開リスクは低い。
  - ただし、本番でログイン機能に見える表現がないか確認する。
- `submit.html`
  - 外部投稿募集を本格化する前は、文言と申請先を慎重に確認する。
- `docs/` の一部
  - 運用共有用として有用だが、内部事情が含まれる文書は本番公開しない。

## ローカル検証限定候補

便利だが、本番 GitHub Pages にそのまま出すべきではないもの。
Phase 6.6 では確認用パッケージとして `admin.html` / `assets/js/adminMockPage.js` / `docs/` を含めてよい方針に変更したが、本番運用機能として扱ってはいけない。

- `docs/context/CURRENT_TASK.md`
- Phase 記録 Markdown
- 監査 Markdown
- Supabase 移行設計 Markdown
- `archive/`

## 本番反映禁止候補

GitHub Pages に置かない。必要な場合はリポジトリ外、Google Drive、限定共有、または将来の認証付きストレージで扱う。

- `アーカイブ.zip`
- `*.zip`
- `.env`
- `.env.local`
- `*.env`
- APIキー
- Supabase の秘密キー
- Stripe の秘密キー
- トークン
- 生徒名簿
- 顧客情報
- 講師・従業員情報
- 勤怠実データ
- 購入履歴
- 審査状況
- 売上情報
- 有料商品の本体ファイル
- 教材PDF
- 入試問題PDF
- 契約書
- 見積書
- 補助金申請書類の実データ
- 顧客相談内容
- 録音・文字起こしデータ
- `archive/受信箱由来_2026-06-24/コンテンツポータル構想.pdf`

## アーカイブ.zip の扱い

- 中身は今回触らない。
- 本番反映対象に含めない。
- commit 前にリポジトリ外へ移動するか、少なくとも `.gitignore` で除外する。
- Phase 6.4 で `.gitignore` に `*.zip` を追加し、未追跡 zip が混ざりにくい状態にした。
- Phase 6.6 で `../llld-works-hub-local-archives/` へ移動した。

## archive/ の扱い

- 本番反映対象に含めない。
- Phase 6.6 で `git rm --cached -r archive` を実行し、ファイル本体はローカルに残したままGit管理対象から外す準備をした。
- `.gitignore` に `archive/` を追加済み。
- `archive/` 配下のPDFや旧HTMLは、必要ならリポジトリ外で保管する。

## admin.html の扱い

- GitHub Pages確認用パッケージには含めてよい。
- 本番運用機能ではなく、検証・確認用のモックとして扱う。
- 本番DBへの書き込み、公開状態変更、決済処理、購入履歴管理は行わないモックである。
- 本番公開する場合でも、管理画面として見える導線は社外向けページから外す。

## docs/ の扱い

- `docs/` は検証・運用・監査のための確認資料として扱う。
- Phase 6.6 では GitHub Pages確認用パッケージに含めてよい。
- 外部共有する場合は、秘密情報、内部判断、未公開方針、個人情報の混入がないか確認する。

## 本番反映前の最終確認項目

- `git status --short` で反映対象を再確認する。
- `git diff --check` が通る。
- JSON構文チェックが通る。
- JS構文チェックが通る。
- `python3 -m http.server 5500` で主要ページが表示できる。
- `marketplace.html` に `internal` / `internal_only` が表示されていない。
- `admin.html` を本番公開対象から外す。
- `アーカイブ.zip` とPDF等のアーカイブ資料を本番公開対象から外す。
- APIキー、秘密キー、トークンがない。
- 決済処理、認証処理、Supabase本番接続がない。
- 有料商品の本体ファイルを GitHub Pages に置いていない。
- 既存の社内Hub導線が壊れていない。
