# ポータル編集データ Supabase保存MVP 実装方針

## 目的

`portal.html` の編集データを、企業アカウント単位でSupabaseへ保存するMVPを作る。

v0.14.12では、既存 `app_data` を使い、`data_type = portal_state` の1 JSONBとして保存する。

## 保存キー

```text
app_key: works_portal
data_type: portal_state
company_account_id: ログイン中企業アカウントID
app_instance_id: works_portal の app_instances.id
```

`works_portal` はポータル保存の基盤であり、signup画面でユーザーが選ぶ個別アプリではない。新規企業アカウントには、選択アプリとは別に `works_portal` の `app_instances` を必ず作成する。

## JSON構造案

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

各配列の要素には、将来専用テーブルへ移行しやすいように `id`、`title`、`detail`、`createdAt`、`updatedAt` を持たせる。

## 保存するもの

- メモ / ToDo
- 掲示板投稿
- 保管庫ツリー構造
- 保管庫リンク情報
- お気に入り
- 最近使ったもの
- ポータル表示設定

## 保存しないもの

- Undo / Redo履歴
- ドラッグ中の状態
- モーダル開閉状態
- チェック中の一時選択
- ダウンロード形式の一時選択
- トースト
- ページ遷移確認モーダルの状態
- ファイル本体
- 個人情報、顧客情報、教材PDF本体、契約書、見積書

## 実ファイルの扱い

v0.14.12では、ファイル本体をSupabase Storageへ保存しない。

保存してよいのはメタデータのみ。

```json
{
  "id": "node-001",
  "type": "link",
  "name": "小テスト作成アプリ",
  "url": "apps/quiz-maker/index.html",
  "folderPath": "業務効率化 / 保管管理 / HTMLアプリ",
  "updatedAt": "2026-06-27T00:00:00.000Z"
}
```

PDFや画像などの本体保存は、Supabase Storage、Google Drive、または外部URL管理の方針を別フェーズで決める。

## 推奨サービスJS

追加済み:

```text
assets/js/portalStateService.js
```

想定関数:

```text
getPortalCloudStatus()
getPortalAppInstance()
loadPortalState()
savePortalState(state)
serializePortalState()
applyPortalState(state)
normalizePortalState(state)
sanitizePortalStorageTree(tree)
```

## 読込フロー

1. `AuthService.getAuthStatus()` でmock / supabaseを判定
2. supabase modeでなければ、固定HTMLまたはmock表示を維持
3. `AuthService.getCurrentAccount()` で企業アカウントを取得
4. `app_instances` から `app_key = works_portal` を取得
5. `app_data` から `data_type = portal_state` を取得
6. 取得できたJSONを `portal.html` に反映
7. 取得できない場合は初期状態を表示し、ユーザーの次の編集操作後に保存作成する

## 高速表示キャッシュ

リロード直後の体感速度改善として、Supabase保存成功時の `portal_state` をlocalStorageにも保存する。

localStorageは一時キャッシュであり、正式保存先ではない。別端末同期の正本は必ずSupabase `app_data` とする。

キー:

```text
llld_works_portal_state_{company_account_id}_{app_instance_id}
llld_works_portal_state_last_key
```

起動時:

1. まず `llld_works_portal_state_last_key` から前回キャッシュを読込
2. キャッシュがあれば即時描画し、`前回保存データを表示中` と表示
3. 続けてSupabaseを確認し、`クラウド確認中` と表示
4. Supabase `updated_at` がキャッシュより新しければSupabaseの内容で上書き描画
5. Supabase取得成功後はlocalStorageも更新
6. Supabase取得失敗時はキャッシュ表示を維持し、`クラウド保存失敗` と表示
7. 未ログイン時は `クラウド保存済み` と表示しない
8. ページ読み込み直後のlocalStorage表示だけではSupabaseへ保存しない
9. 古いlocalStorageでSupabase上の新しい `portal_state` を自動上書きしない

## 保存フロー

1. 画面状態を `serializePortalState()` でJSON化
2. ファイル本体、危険なメタデータ、不要な一時状態を除外
3. `app_data` へupsert
4. `onConflict: app_instance_id,data_type` を使う
5. 保存成功時、同じ内容をlocalStorageキャッシュにも保存
6. 保存成功 / 保存失敗を画面上に表示

## エラー表示

最低限、以下を出す。

- 未ログイン: 企業アカウントでログインしてください
- works_portal未登録: ポータル利用設定が見つかりません
- 読込失敗: ポータル情報の読込に失敗しました
- 保存失敗: ポータル情報の保存に失敗しました
- Supabase未設定: mock modeで表示しています
- ファイル本体: このフェーズではファイル本体は保存しません

`works_portal` 未登録が出た場合は、`app_key` の名前揺れよりも、対象企業の `app_instances` に `works_portal` が作られていない可能性を優先して確認する。

## RLS前提

- `app_data.company_account_id` はログイン中ユーザーの `company_accounts.id` と一致する必要がある
- 他社の `portal_state` はselect / updateできない
- service role keyはフロントに置かない
- RLS未確認のまま本番運用しない

## v0.14.12でやらないこと

- Supabase Storage接続
- ポータル専用テーブル作成
- スタッフ個別ログイン
- 権限管理
- ファイル本体アップロード
- 添付ファイル削除履歴
- 監査ログ本格実装

## v0.14.12実装メモ

- `portal.html` は `siteConfigService.js` / `supabaseClientService.js` / `authService.js` / `portalStateService.js` を読み込む。
- 保存状態はヘッダー右側の小さなステータスで表示する。
- mock / 未ログイン時は既存静的表示を維持する。
- `works_portal` app_instanceがない場合は保存設定未完了として表示する。
- `portal_state` が空の場合は初期表示を消さず、ページ読込だけでは保存しない。メモ追加、ToDo変更、保管庫変更など、ユーザー編集操作後に現在表示を保存する。

## 追加確認項目

- ページ読み込み直後に古いlocalStorageでSupabaseを上書きしていない
- Supabase側が新しい場合、Supabaseの内容が優先される
- localStorage側が表示されても、クラウド確認後に正しい最新状態へ更新される
