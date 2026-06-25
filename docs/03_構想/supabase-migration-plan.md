# Supabase Migration Plan

LLLD Works Market を静的JSON MVPからSupabaseへ移行するための下書き。

## 基本方針

- いきなり本番接続しない。
- まず開発用Supabaseで検証する。
- フロントに秘密キーを置かない。
- サービスロールキーはGitHub Pages、HTML、JS、JSONに絶対に置かない。
- 画面側は `ContentService` を呼び続ける。
- DB差し替えは `assets/js/contentService.js` または将来のAPI層に閉じ込める。

## テーブル候補

### contents

- id
- slug
- title
- summary
- description
- category_id
- author_id
- price_type
- price
- currency
- sale_status
- status
- visibility
- delivery_type
- payment_url
- inquiry_url
- primary_cta_label
- primary_cta_type
- primary_cta_url
- secondary_cta_label
- secondary_cta_type
- secondary_cta_url
- target_users
- tags
- thumbnail
- content_url
- detail_url
- deliverables
- notes
- updated_at
- featured

### authors

- id
- name
- type
- summary
- avatar
- profile_url
- status

### categories

- id
- name
- slug
- description
- display_order
- is_active

### content_submissions

- id
- submitter_name
- submitter_email
- title
- summary
- content_type
- file_location
- copyright_checked
- personal_info_checked
- review_status
- reviewer_note
- created_at
- updated_at

### inquiries

- id
- type
- content_id
- name
- email
- organization
- message
- status
- created_at

### orders

- id
- content_id
- customer_id
- amount
- currency
- payment_status
- delivery_status
- delivery_note
- created_at
- updated_at

## RLS方針

- 公開コンテンツは `visibility = public` のみ匿名閲覧可。
- internal、private、draft、review は匿名公開しない。
- 投稿者は自分の投稿申請だけ閲覧可。
- 管理者だけが審査状態、公開状態、販売状態を更新できる。
- 購入履歴、問い合わせ、売上は本人または管理者のみ。

## 移行順

1. 現在の `data/*.json` をスキーマの正本として整理する。
2. 開発用Supabaseでテーブルを作る。
3. JSONをインポートする。
4. `ContentService` にDB版取得関数を追加する。
5. ローカル検証版でDB版とJSON版を切り替えて検証する。
6. RLSを設定する。
7. 管理画面モックをDB読み取り版へ進める。
8. 本番反映前に監査チェックを通す。

## まだ決めないこと

- 決済システム
- 自動納品
- クリエイター売上分配
- 投稿者向け本番管理画面
- サブスク課金
