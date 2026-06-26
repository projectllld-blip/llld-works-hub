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

追加候補:

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
7. 取得できない場合は初期状態を表示し、保存時に作成する

## 保存フロー

1. 画面状態を `serializePortalState()` でJSON化
2. ファイル本体、危険なメタデータ、不要な一時状態を除外
3. `app_data` へupsert
4. `onConflict: app_instance_id,data_type` を使う
5. 保存成功 / 保存失敗を画面上に表示

## エラー表示

最低限、以下を出す。

- 未ログイン: 企業アカウントでログインしてください
- works_portal未登録: ポータル利用設定が見つかりません
- 読込失敗: ポータル情報の読込に失敗しました
- 保存失敗: ポータル情報の保存に失敗しました
- Supabase未設定: mock modeで表示しています
- ファイル本体: このフェーズではファイル本体は保存しません

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
