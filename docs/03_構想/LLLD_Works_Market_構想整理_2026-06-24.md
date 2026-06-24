# LLLD Works Market 構想整理

作成日: 2026-06-24  
元資料: `archive/受信箱由来_2026-06-24/コンテンツポータル構想.pdf`

## 目的

現在の `LLLD Works Hub` は、社内で使う便利ツール・資料・HTMLアプリをまとめるポータルである。  
これを将来的に、外部クリエイターがコンテンツを投稿し、利用者が無料利用・買い切り・サブスク・開発依頼・交流までできるコンテンツプラットフォームへ拡張する。

ただし、最初からログイン、決済、自動投稿、売上分配まで作らない。  
まずは本番GitHub Pagesを壊さず、静的HTML/CSS/JS/JSONで「マーケット化された社内ポータル」を作る。

## 構想の芯

現場で生まれた小さな便利ツールを、必要な人へ届ける。

LLLDだけがコンテンツを出すのではなく、塾長、店長、事務員、講師、現場スタッフ、個人事業主などが、自分の現場で作った便利な資料・テンプレート・HTMLアプリを投稿できる場所にする。

将来の見せ方:

- 現場の困りごとを、現場の人が解決し、他の現場にも届けるプラットフォーム
- プログラマーだけでなく、現場の人が業務改善の成果を販売・共有できる場所
- 小規模事業者、塾、店舗、事務所向けの実務コンテンツマーケット

## 利用者像

### 消費者

- 塾の教室長・講師
- 小規模事業者
- 店舗運営者
- 事務担当者
- コンサル支援先

欲しいもの:

- すぐ使えるHTMLアプリ
- PDF・Excel・Wordテンプレート
- 業務チェックリスト
- 面談・営業・補助金支援資料
- 自社向けに調整してくれるクリエイター

### クリエイター

- LLLD公式
- 塾長・講師
- 店舗運営者
- 事務員
- 個人開発者
- AIで業務ツールを作れる現場担当者

できること:

- コンテンツを投稿する
- 無料配布する
- 買い切り販売する
- サブスク提供する
- 開発依頼を受ける
- 利用者と交流する

### 管理者

- LLLD運営担当
- 審査担当
- コンテンツ整備担当

責任範囲:

- 投稿内容の審査
- 著作権・個人情報の確認
- サムネイル・説明文・タグの整備
- 公開・非公開の管理
- 将来の購入履歴・売上・権限管理

## 段階移行

### Phase 0: ローカル検証・JSON設計

目的:

- 本番GitHub Pagesを壊さずに、ローカルでマーケット化の形を検証する
- HTMLベタ書きではなく、JSONを仮DBとして扱う
- 画面側を将来Supabase等へ差し替えやすくする

やること:

- `python3 -m http.server 5500` でローカル起動
- `data/contents.json`
- `data/authors.json`
- `data/categories.json`
- `assets/js/contentService.js`
- `assets/js/authMockService.js`
- `assets/js/storagePolicy.js`
- 既存Hubの「よく使うもの」「最終利用履歴8件」を維持

やらないこと:

- 本物のログイン
- 決済
- 自動投稿
- 売上分配
- 本番DB接続

### Phase 1: マーケット化された社内ポータル

目的:

- 社内Hubの使いやすさを残しながら、外部投稿型マーケットに見えるUIへ寄せる
- ビジコン、社内説明、営業説明に使えるプロトタイプにする

追加候補:

- `marketplace.html`
- `content-detail.html`
- `submit.html`
- `author.html`
- 投稿者カード
- 価格ラベル
- 無料、無料β、有料、社内限定、問い合わせ、準備中の表示
- コンテンツ詳細ページ
- 投稿受付導線

### Phase 2: 審査制投稿

目的:

- 外部投稿を受け付けるが、完全自動公開にはしない
- 品質、著作権、個人情報、料金トラブルを避ける

投稿フロー:

1. 投稿者がフォームから申請
2. LLLDが内容確認
3. サムネイル、説明文、タグを整備
4. Works Marketへ掲載
5. 無料配布、問い合わせ、有料販売へ誘導

最初はGoogleフォームで代用してよい。

### Phase 3: Supabase検証環境

目的:

- アカウント制、投稿者管理、コンテンツDB、投稿申請を検証する
- GitHub Pages + Supabase公式クラウドを第一候補にする

想定機能:

- ユーザー登録
- 投稿者プロフィール
- コンテンツ一覧
- コンテンツ詳細
- お気に入り
- 投稿申請
- 管理者だけが公開できる仕組み

### Phase 4: 社内・関係者β

目的:

- 外部公開前に、社内と近い関係者で運用確認する
- 決済なしで、無料公開・問い合わせ導線を中心に回す

載せるもの:

- LLLD公式コンテンツ
- 講師作成コンテンツ
- 知人事業者のサンプル投稿
- 無料公開
- 問い合わせ導線

### Phase 5: 販売・サブスク・開発依頼

目的:

- 買い切り、サブスク、開発依頼、売上分配を扱う

候補:

- Stripe
- Stripe Connect
- 単発決済リンク
- 手動請求
- 銀行振込
- 開発依頼フォーム

最初からStripe Connectを入れない。投稿者と売上が増えてから検討する。

## 技術方針

### 当面

- GitHub Pages
- 静的HTML/CSS/JS
- JSON仮データ
- localStorageは軽いUI状態だけ

### 次の本命

- GitHub Pages + Supabase公式クラウド

理由:

- 既存資産を活かせる
- Codexで実装しやすい
- サーバー保守が少ない
- アカウント、DB、Storageへ進みやすい
- 将来移行しやすい

### Xserver案

Xserverレンタルサーバー + WordPress:

- 資料・テンプレ販売中心なら現実的
- 会員サイト、ダウンロード販売、問い合わせ販売には向く
- 業務アプリのクラウド保存や細かい権限管理には弱い

XServer VPS + Supabase:

- 自社完結の本格プラットフォーム向き
- Auth、Postgres、Storage、管理画面まで持てる
- ただし保守、セキュリティ、バックアップ、障害対応が重い

判断:

- 最初の検証: GitHub Pages + JSON
- 次の検証: GitHub Pages + Supabase公式クラウド
- 自社完結が必要になったら: XServer VPS + Supabase

## データ管理方針

### クラウド管理するもの

- ユーザー情報
- 投稿者情報
- コンテンツ情報
- カテゴリ
- タグ
- 投稿申請
- 公開/非公開ステータス
- 審査状況
- お気に入り
- 購入履歴
- レビュー
- 管理者メモ
- 売上情報

### localStorageでもよいもの

- 最近見たコンテンツ
- 最終利用履歴8件
- UI表示設定
- 入力途中の一時下書き
- ログイン不要ツールの一時作業データ

### localStorageに保存しないもの

- アカウント情報
- 投稿者情報
- 購入履歴
- 公開/非公開の権限情報
- 投稿審査情報
- 売上情報
- 個人情報を含む業務データ

## コンテンツ本体の扱い

ポータル管理データと、各コンテンツの作業データは分ける。

例:

- PDF編集: PDFはアップロードせず、ブラウザ内処理を維持
- だこくん: 勤怠データは個人情報に近いので、当面は端末内保存とJSON/Excel出力
- 座席管理: Phase 2以降でクラウド版を別商品化できる
- 面談支援: クラウド保存に向くが、個人情報が入るため権限設計必須

基本方針:

- ポータル、アカウント、購入履歴はクラウド管理
- 各コンテンツの作業データはコンテンツごとに判断
- PDF/画像/変換系はローカル完結
- 勤怠/座席/面談/顧客管理系は将来的にクラウド版を別商品化
- 投稿・審査・販売管理はクラウド管理

## 将来DBの最小テーブル案

Supabase想定:

```text
profiles
- id
- display_name
- email
- role
- avatar_url
- created_at

authors
- id
- user_id
- name
- bio
- website_url
- status

contents
- id
- author_id
- title
- slug
- summary
- description
- category_id
- price_type
- price
- status
- thumbnail_url
- content_url
- created_at
- updated_at
- published_at

categories
- id
- name
- slug
- description

content_tags
- content_id
- tag

submissions
- id
- user_id
- title
- description
- file_url
- status
- admin_note
- created_at

favorites
- user_id
- content_id
- created_at

purchases
- id
- user_id
- content_id
- status
- amount
- created_at
```

## 最初に載せる仮コンテンツ

- だこくん
- 座席管理アプリ
- PDF編集ツール
- 小テスト作成ツール
- 面談支援ツール
- 営業トーク支援ツール
- 補助金テンプレート
- 社内運用資料

## 次にやること

1. 既存Hubをローカルで安定検証できる状態にする
2. コンテンツ情報をJSON化し、Service層から読む
3. localStorage方針を明文化する
4. マーケット化UIの前に、データ構造を固める
5. `marketplace.html`、`content-detail.html`、`submit.html`、`author.html` を段階的に追加する
6. Supabase接続前提のデータ名・関数名に寄せる
7. 社内向けの使いやすさを壊さない範囲で、外部公開向け表現を足す

## Codexへの次回指示案

```md
LLLD Works Hubを、将来的に外部投稿型コンテンツプラットフォームへ拡張できるようにしてください。

今回はUIを大きく変えず、まずはJSON仮データとService層を整えてください。

追加:
- data/contents.json
- data/authors.json
- data/categories.json
- assets/js/contentService.js
- assets/js/authMockService.js
- assets/js/storagePolicy.js

条件:
- 本番GitHub Pagesを壊さない
- 既存トップページの導線を維持
- 最終利用履歴8件を維持
- localStorage依存を増やさない
- 将来Supabaseに置き換えやすい関数名にする
```
