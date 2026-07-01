# phase1-3b-app-add-request-db-design

## Phase
v1.3b アプリ追加申請DB保存設計

## 状態
PARKED。

このdocsは、旧v1.3「購入者向けアプリ追加申請」のDB保存設計記録として残す。

2026-07-02の仕様見直しにより、購入者側の「アプリ追加申請」は不要と判断した。購入者は購入画面で「購入」または「利用開始」を押せばアプリを使える設計にする。

そのため、`app_add_requests` を購入者向け導線の本線テーブルとして使わない。

現在の正本は `phase1-3-purchase-start-flow-realignment.md`。

`account.html`、JS、CSS、Supabase migration、RLS SQL、実DBは変更しない。

## 背景
v1.3aでは、`account.html` 上で未利用アプリを見て追加申請できるUI mockを作成した。

v1.3aがDB保存なしだった理由:

- 既存DBにアプリ追加申請を正式保存する専用テーブルがない。
- `app_instances` は利用中アプリを表すため、申請中の相談内容や審査状態を入れる用途ではない。
- `app_data` はアプリ本体の保存データ領域であり、申請ワークフローの正本にすると責務が混ざる。
- `audit_logs` は監査ログであり、運営対応待ちの業務データを管理する場所ではない。
- DB保存にはmigration、RLS、管理側確認フローの設計が必要。

## 既存テーブルの位置づけ

| テーブル | 現在の用途 | 申請保存先としての判定 |
|---|---|---|
| `company_accounts` | 企業 / 店舗 / 教室アカウント | 申請元企業の参照元。申請本文や状態は入れない。 |
| `apps` | アプリカタログ | 申請対象アプリの参照元。申請状態は入れない。 |
| `app_instances` | 企業ごとの利用中アプリ | 申請だけで追加しない。承認後に運営操作で追加する候補。 |
| `app_data` | アプリごとの保存データ | 申請ワークフローには使わない。 |
| `audit_logs` | 変更履歴 / 監査ログ | 申請保存先に流用しない。必要なら将来、申請作成や承認操作の監査ログを別途残す。 |

## 推奨テーブル
旧方針では、申請保存専用テーブルとして以下を新規設計していた。

```text
app_add_requests
```

このテーブルは「追加したい」「相談したい」という業務上の対応待ちデータを持つ想定だった。

ただし、現在はPARKED扱いとし、購入者向けアプリ追加申請には使わない。

## column案

| column | 型候補 | 必須 | 入力者 | 用途 | RLS上の注意 |
|---|---|---:|---|---|---|
| `id` | `uuid` | 必須 | DB | 申請ID | 主キー。ユーザーが任意指定しない。 |
| `company_account_id` | `uuid` | 必須 | フロント / DB | 申請元企業 | ログイン中ユーザーが所有する自社IDのみinsert / select可能にする。 |
| `app_id` | `uuid` | 必須候補 | フロント | 申請対象アプリ | `apps.id` 参照候補。将来app_key変更に備える。 |
| `app_key_snapshot` | `text` | 任意候補 | フロント / DB | 申請時点のアプリキー | 表示・検索用。正本は `apps` 参照に寄せる。 |
| `app_name_snapshot` | `text` | 任意候補 | フロント / DB | 申請時点のアプリ名 | 後からアプリ名が変わっても申請時点の表示を残す。 |
| `request_message` | `text` | 任意 | ユーザー | 利用目的・相談内容 | 個人情報や機密情報を入れすぎない案内が必要。 |
| `contact_requested` | `boolean` | 必須 | ユーザー | 連絡希望 | 連絡先本文は持たず、既存企業情報を参照する。 |
| `status` | `text` | 必須 | DB / 運営 | 申請状態 | ユーザーが勝手に承認済みへ変更できないようにする。 |
| `admin_note` | `text` | 任意 | 運営 | 運営メモ | ユーザー側に表示するかは将来判断。MVPでは非表示推奨。 |
| `created_at` | `timestamptz` | 必須 | DB | 作成日時 | DB defaultで入れる。 |
| `updated_at` | `timestamptz` | 必須 | DB | 更新日時 | update trigger候補。 |
| `reviewed_at` | `timestamptz` | 任意 | 運営 | 審査日時 | 運営側ステータス変更時に更新。 |
| `reviewed_by` | `uuid` / `text` | 任意 | 運営 | 審査者 | 管理者権限設計ができるまでMVPでは空でもよい。 |
| `request_type` | `text` | 任意 | ユーザー / DB | 申請種別 | `add` / `consult` など。MVPではなくてもよい。 |
| `company_name_snapshot` | `text` | 任意 | フロント / DB | 申請時点の企業名 | 運営確認を楽にする。個人情報を増やしすぎない。 |
| `contact_name_snapshot` | `text` | 任意 | フロント / DB | 申請時点の担当者名 | 必要性は人間判断。最小化するなら持たない。 |

## app参照方針
MVPでは `app_id` で `apps.id` を参照する案を第一候補にする。

ただし、フロントUIや既存コードでは `app_key` を多く扱っているため、実装時は以下のどちらかを人間確認する。

- `app_id` を正本にし、表示用に `app_key_snapshot` / `app_name_snapshot` を残す。
- `app_key` を正本にし、`apps.app_key` を参照する。

現行の `app_instances` は `app_key` を参照しているため、v1.3cでは既存設計との一貫性を確認してからmigration案を作る。

## status案

| status | 意味 | ユーザー側表示 | 主な更新者 |
|---|---|---|---|
| `pending` | 申請受付済み / 未対応 | 申請済み | DB / ユーザー作成時 |
| `reviewing` | 運営確認中 | 確認中 | 運営 |
| `approved` | 承認済み | 承認済み / 利用準備中 | 運営 |
| `rejected` | 見送り / 却下 | 見送り | 運営 |
| `cancelled` | ユーザー取り下げ | 取り下げ済み | ユーザーまたは運営 |

MVPでは `pending` / `approved` / `rejected` だけでもよい。

ただし将来、運営側の対応状況を見やすくするため、DB設計上は `reviewing` と `cancelled` を許容候補に残す。

## RLS方針

### ユーザー側
- ログイン中ユーザーは、自社 `company_account_id` に紐づく申請のみinsertできる。
- ログイン中ユーザーは、自社の申請のみselectできる。
- ログイン中ユーザーは、他社 `company_account_id` でinsertできない。
- ログイン中ユーザーは、他社申請をselect / update / deleteできない。
- 申請後の `status`、`admin_note`、`reviewed_at`、`reviewed_by` はユーザーが直接変更できない。
- ユーザー取り下げを許可する場合も、`status = pending` の自社申請を `cancelled` にする限定updateだけにする。
- deleteは原則作らない。

### 運営側
- 運営者が全申請を確認できる仕組みは将来必要。
- 現時点ではスタッフ個別ログイン、運営者権限管理、管理者専用APIが未整備。
- フロントエンドにservice role keyを置かない。
- 企業横断select / updateが必要な場合は、v1.3e以降で管理者権限、RLS、Edge Functionsまたは安全な管理者APIを別設計する。

### 必須の安全条件
- RLSを有効にする。
- RLSを無効化しない。
- `company_account_id` を分離キーにする。
- 他社申請を読めない。
- 他社 `company_account_id` で申請できない。
- service role keyをフロントで使わない。

## app_instancesとの関係
アプリ追加申請を作成しただけでは、`app_instances` を追加しない。

```text
申請作成 = app_add_requests に pending 作成
承認 = 将来、運営側操作で app_instances を追加
```

分ける理由:

- 申請と利用開始は別状態。
- 申請だけで利用可能にすると、契約、確認、料金、準備状態が曖昧になる。
- `app_instances` に入ると利用中アプリ一覧に出るため、未承認アプリを使えるように見える危険がある。
- 承認フローや運営確認を挟むため、`app_add_requests` と `app_instances` は分ける。

## app_dataとの関係
アプリ追加申請は `app_data` に保存しない。

分ける理由:

- `app_data` はアプリ本体の保存データ領域。
- 申請状態や運営対応メモを入れると責務が混ざる。
- 管理画面で申請一覧を作るときに検索・status管理がしづらい。
- RLSや管理者側の扱いが複雑になる。

## audit_logsとの関係
`audit_logs` は申請の正本として使わない。

分ける理由:

- 監査ログは「起きた操作」を追跡するための履歴。
- アプリ追加申請は、対応待ち、承認、却下、メモ、連絡希望を持つ業務データ。
- 監査ログは通常updateしないが、申請は状態更新が必要。

将来、申請作成や承認操作の履歴を残したい場合は、`app_add_requests` を正本にしたうえで、別途 `audit_logs` に操作ログを残す。

## ユーザー側フロー案

1. `account.html` を開く。
2. 利用中アプリ一覧と未利用アプリ候補を見る。
3. 未利用アプリの「追加を申請する」を押す。
4. 利用目的・相談内容を入力する。
5. 連絡希望の有無を選ぶ。
6. 送信する。
7. `app_add_requests` に `status = pending` で保存される。
8. 画面上で対象アプリが `申請済み` になる。
9. 再読み込み後も、既存の自社申請を読んで `申請済み` 表示を復元する。

## 運営側フロー案

1. 管理者画面で申請一覧を見る。
2. 企業名、申請アプリ、申請日時、status、連絡希望を確認する。
3. 必要なら顧客へ連絡する。
4. `reviewing` / `approved` / `rejected` に変更する。
5. 承認時に、別操作として `app_instances` を追加する。
6. 必要に応じて購入ページ、決済、契約状態へつなげる。

v1.3bでは管理者画面実装は行わない。

## 今回実装しなかったこと
- Supabase migration追加。
- RLS SQL実装。
- `account.html` の変更。
- JS / CSS変更。
- `app_instances` 追加。
- `app_data` 保存。
- `company_accounts` 更新。
- `plan_status` 更新。
- 管理者承認画面。
- 決済連携。
- メール送信。
- 外部通知。

## v1.3c以降の候補

### v1.3c app_add_requests migration / RLS実装
- `app_add_requests` テーブルを追加するmigration案を作る。
- RLS policy案を作る。
- 実DB適用は人間確認後に行う。

### v1.3d account.html から実DBへ申請保存
- `account.html` のv1.3a UI mockを実DB保存へ接続する。
- 自社申請だけを保存・読込する。
- 申請済み表示をDBから復元する。

### v1.3e 管理者画面で申請一覧確認
- 管理者が申請一覧を見る方法を設計する。
- 企業横断閲覧に必要な管理者権限、RLS、APIを検討する。

### v1.3f 承認時に app_instances を追加
- 承認と利用開始を分ける。
- 承認後に運営側操作で `app_instances` を追加する。
- 決済 / 契約 / 購入ページとの関係を整理する。

## v1.3cへ進む前のSTOP条件
- migration追加が必要。
- RLS変更が必要。
- Supabase Dashboard操作が必要。
- service role keyが必要。
- 管理者権限の人間判断が必要。
- `app_id` と `app_key` の正本判断が必要。
- 運営者が企業横断で申請を読む方式の判断が必要。
- 承認時に `app_instances` を追加する範囲の判断が必要。

## HUMAN_REQUIRED判定
v1.3bのdocs整理自体は、人間がGitHub SettingsやSupabase Dashboardを操作しなくても完了できる。

ただし、次のv1.3cでmigration / RLS実装へ進む場合は、実DB適用前に人間確認が必要。
