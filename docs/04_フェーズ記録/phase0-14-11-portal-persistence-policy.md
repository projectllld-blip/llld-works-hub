# v0.14.11 ポータル編集機能のSupabase保存方針

## 目的

`portal.html` を、同じ企業アカウントでログインすれば同じ情報が表示される「会社ごとの作業ポータル」へ育てるため、メモ / ToDo、掲示板、ファイル保管庫、お気に入り、最近使ったもの、表示設定の保存方針を整理する。

今回は実装ではなく、既存DBと既存JSを確認したうえで、v0.14.12で着手するSupabase保存MVPの範囲を決める。

## 既存DB / JS確認

### 既存DB

| テーブル | 役割 | ポータル保存への使い方 |
| --- | --- | --- |
| `company_accounts` | 企業 / 店舗 / 教室アカウント | `owner_user_id = auth.uid()` でログインユーザーと紐づく |
| `apps` | 利用可能アプリカタログ | `works_portal` を追加する |
| `app_instances` | 企業ごとの利用アプリ設定 | 企業ごとに `app_key = works_portal` を持たせる |
| `app_data` | アプリごとのJSONB保存 | `data_type = portal_state` にポータル編集データを保存する |
| `audit_logs` | 将来の変更履歴 | v0.14.12では使わない。後続で検討 |

`app_data` は `company_account_id` と `app_instance_id` を持ち、RLSも `company_account_id` 経由で分離されている。SeatFlowはこの仕組みで `app_key = seatflow` / `data_type = seat_layout` をupsertしている。

### 既存JS

- `SupabaseClientService` は `data/site-config.json` からSupabase設定を読み、未設定時はmockへ戻す。
- `AuthService.getCurrentAccount()` はログイン中ユーザーの `company_accounts` を取得できる。
- `AppInstanceService` はログイン中企業アカウントの `app_instances` と `apps` を組み合わせて表示できる。
- `SeatFlowCloudService` は `app_instances` から対象アプリを探し、`app_data` にJSONBをupsertする実装例になっている。
- `portal.html` は現時点でSupabaseクライアントを直接使っていない。v0.14.12では専用サービスJSを追加し、既存サービスを流用するのが安全。

## 保存方式比較

### 案A: 既存 `app_data` に portal用JSONとして保存

保存イメージ:

```json
{
  "portalVersion": 1,
  "memos": [],
  "todos": [],
  "boardPosts": [],
  "storageTree": [],
  "favorites": [],
  "recentItems": [],
  "portalSettings": {},
  "updatedAt": "2026-06-27T00:00:00.000Z"
}
```

必要なDB要素:

- `apps.app_key = works_portal`
- `app_instances.app_key = works_portal`
- `app_data.app_key = works_portal`
- `app_data.data_type = portal_state`

メリット:

- SeatFlowクラウド保存の構造を流用できる
- DB変更が少ない
- 企業アカウント単位のRLSを既存設計で使える
- 小規模MVPとして早く確認できる
- v1.0までの「同じ企業アカウントなら同じポータル状態」を満たしやすい

デメリット:

- JSONが大きくなると差分更新しづらい
- 投稿単位、メモ単位の検索や権限管理には弱い
- 将来スタッフ個別ログインを入れる場合、投稿者や更新者の正規化が必要になる

### 案B: ポータル専用テーブルを作る

候補:

- `portal_memos`
- `portal_todos`
- `portal_board_posts`
- `portal_storage_nodes`
- `portal_favorites`
- `portal_recent_items`
- `portal_settings`

メリット:

- 将来の販売版やスタッフ別権限に強い
- 投稿者、更新者、削除履歴、検索、並び替えを扱いやすい
- 差分更新しやすい

デメリット:

- 初期実装が重い
- RLS設計が大きく増える
- 現在の小規模MVPには過剰
- v0.15 / v0.16へ進む前の検証範囲が広がりすぎる

## 推奨案

当面は案Aを採用する。

```text
works_portal app_instance
-> app_data.data_type = portal_state
-> portal用JSONBを企業アカウント単位でupsert
```

理由:

- 既存のSeatFlow保存構造と揃う
- `company_account_id` による分離を既存RLSで使える
- スタッフ個別ログインはPhase 2以降なので、現時点では企業アカウント単位の1 JSONで足りる
- v1.0までのクラウド基盤MVPを優先できる
- 将来、JSON内の `id` や `updatedAt` をもとに専用テーブルへ移行しやすい

## 保存対象の分類

### Supabase保存対象

v0.14.12またはv0.15までに `portal_state` へ保存したいもの。

- メモ / ToDo
- 掲示板投稿
- 保管庫ツリー構造
- 保管庫リンク情報
- お気に入り
- 最近使ったもの
- ポータル表示設定

### 当面保存しないもの

- Undo / Redo履歴
- ドラッグ中状態
- モーダル開閉状態
- 一時選択状態
- ダウンロード形式の一時選択
- トースト表示
- ページ遷移確認モーダルの状態

### 保留・別設計が必要なもの

- 実ファイル本体
- PDF / 画像 / Excelなどの添付ファイル保存
- ファイル差し替え時の本体アップロード
- Supabase Storage
- 添付ファイルの権限管理
- ファイル削除履歴
- 容量制限、復元、監査ログ

## ファイル本体の扱い

v1.0までは、ファイル本体保存を急がない。

優先するのは以下。

- リンクURL
- ファイル名
- 種別
- 追加先フォルダ
- 表示順
- 更新日時

理由:

- Supabase Storageを入れると、RLS、容量、公開範囲、削除、復元の設計が増える
- 現場MVPでは、まずURLリンクや既存HTMLアプリへの導線保存で効果が出る
- 教材PDFや個人情報を誤ってアップロードするリスクを避けられる

## migration案

以下を追加した。

```text
supabase/migrations/20260627_v01411_portal_app_instance.sql
```

内容:

- `apps` に `works_portal` を追加
- 既存 `company_accounts` それぞれに `works_portal` の `app_instances` を追加
- `app_data` に空の `portal_state` を作成
- RLSは既存 `app_instances` / `app_data` の `company_account_id` 分離方針を使う

このSQLは案であり、今回CodexからSupabase実DBへは適用していない。

## v0.14.12 実装範囲案

`v0.14.12 ポータル編集データ Supabase保存MVP` を挟む。

最小実装候補:

- `portal.html` に必要なSupabase関連JSを読み込む
- `assets/js/portalStateService.js` を追加
- ログイン中企業アカウントを取得
- `works_portal` の `app_instance` を取得
- `app_data.data_type = portal_state` を読込
- メモ / ToDoをJSON化して保存
- 掲示板投稿をJSON化して保存
- 保管庫ツリーとリンク情報をJSON化して保存
- お気に入り、最近使ったもの、表示設定を保存
- 保存中 / 保存済み / 保存失敗を画面に表示
- 未ログイン時はローカル表示またはmock表示に戻す
- 実ファイル本体は保存しない

## v0.15 再定義

v0.15は以下を対象に含める。

- login / signup / account
- company_accounts
- app_instances
- SeatFlow app_data
- portal app_data
- ポータル編集データの保存失敗
- ポータル編集データの読込失敗
- データなし状態
- Supabase未接続状態
- mock / 未保存状態の注意表示

## v0.16へ進む前の条件

- `works_portal` の `app_instances` が企業ごとに作成される
- `app_data.portal_state` が自社分だけ読める
- `app_data.portal_state` が自社分だけ更新できる
- 他社の `portal_state` が読めない
- 実ファイル本体はまだ保存対象外であることを画面とdocsに明記する

## 判断

`v0.14.12 ポータル編集データ Supabase保存MVP` へ進んでよい。

ただし、v0.14.12では実ファイル本体、Supabase Storage、専用テーブル化には進まない。まずは `app_data.portal_state` の読込 / 保存だけに絞る。
