# v0.6 GitHub Pages確認用 stage計画

作成日: 2026-06-25
対象: LLLD Works Hub / Works Market v0.6

## 目的

GitHub Pages上でUI、導線、管理画面モック、docsを確認できる v0.6 確認用パッケージを作る。

この文書は stage 候補を整理するための計画であり、この時点では `git add`、commit、push は行わない。

## 今回の方針

前回は `admin.html` と `docs/` を本番反映候補から外す想定だったが、Phase 6.6 では GitHub Pages確認用パッケージに含めてよい。

ただし、以下の扱いを守る。

- `admin.html` は本番運用機能ではなく、検証・確認用のモック。
- `docs/` は運用確認・監査確認・構想確認用。
- Supabase本番接続、認証、決済、自動納品、実データ書き込みは含めない。
- 有料商品の本体ファイル、個人情報、顧客情報、勤怠実データ、教材PDF、契約書、見積書は含めない。

## stage候補コマンド

```bash
git add index.html marketplace.html content-detail.html author.html request.html thanks.html admin.html
git add assets/css/style.css
git add assets/js/contentService.js assets/js/marketPages.js assets/js/requestPage.js assets/js/adminMockPage.js
git add data/contents.json data/authors.json data/categories.json
git add docs/
git add README.md .gitignore
```

## 必要に応じて追加する公開用アセット

実在し、公開して問題ない画像・サムネイルだけを追加する。

```bash
git add assets/thumbs/
git add assets/images/
```

## stage候補に含めないもの

```text
アーカイブ.zip
*.zip
.env
.env.local
*.env
archive/
有料商品の本体ファイル
教材PDF
入試問題PDF
個人情報
顧客情報
勤怠実データ
契約書
見積書
秘密キー
APIキー
Supabase service role key
Stripe secret key
```

## archive/ の扱い

- GitHub Pages確認用パッケージに含めない。
- Phase 6.6 で `git rm --cached -r archive` を実行し、ファイル本体はローカルに残したままGit管理対象から外す準備をした。
- `.gitignore` でも `archive/` を除外済み。
- 必要であれば、commit前に `archive/` 自体もリポジトリ外へ移動する。

## admin.html 確認項目

- 本番操作不可のモックであることが明記されている。
- 本番DBに書き込まない。
- 公開/非公開の変更を実データに反映しない。
- 決済処理をしない。
- 購入履歴を扱わない。
- Supabaseに接続しない。
- 権限情報をlocalStorageに保存しない。
- トップページやMarketから目立つ導線を貼らない。

## docs/ 確認項目

- 個人情報が含まれていない。
- 顧客情報が含まれていない。
- 勤怠実データが含まれていない。
- 教材PDFや入試問題PDFが含まれていない。
- 契約書や見積書が含まれていない。
- APIキーや秘密キーが含まれていない。
- 有料商品の本体ファイルが含まれていない。
- 外部に見られて困る内部情報がない。

## アーカイブ.zip の扱い

- 中身は開かない。
- GitHub Pages確認用パッケージに含めない。
- Phase 6.6 で `../llld-works-hub-local-archives/` へ移動済み。
- `.gitignore` でも `*.zip` を除外済み。

## 本番反映前の最終確認

```bash
git status --short
git status --short --ignored
git diff --name-only
git diff --check
node -e "JSON.parse(require('fs').readFileSync('data/contents.json','utf8')); console.log('contents.json OK')"
node -e "JSON.parse(require('fs').readFileSync('data/authors.json','utf8')); console.log('authors.json OK')"
node -e "JSON.parse(require('fs').readFileSync('data/categories.json','utf8')); console.log('categories.json OK')"
node --check assets/js/contentService.js
node --check assets/js/marketPages.js
node --check assets/js/requestPage.js
node --check assets/js/adminMockPage.js
```

## 注意

この計画は GitHub Pages確認用であり、完全な本番運用開始を意味しない。
購入、納品、開発相談、投稿審査は引き続き手動運用・モック運用を前提にする。
