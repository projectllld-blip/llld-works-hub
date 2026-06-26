# v0.14.12 ポータル編集データ Supabase保存MVP

## 目的

`portal.html` 内の編集データを、企業アカウント単位でSupabase `app_data` に保存・読込できるMVPを追加する。

今回のゴールは、同じ企業アカウントでログインしたときに、同じポータル状態を表示できる土台を作ること。ファイル本体保存、Supabase Storage、添付ファイル管理には進まない。

## 実装したファイル

- `assets/js/portalStateService.js`
- `portal.html`

## portal_state JSON構造

```json
{
  "schemaVersion": 1,
  "memos": [],
  "todos": [],
  "boardPosts": [],
  "storageTree": [],
  "favorites": [],
  "recentItems": [],
  "portalSettings": {
    "storageFoldersOpen": {},
    "lastSelectedStorageId": null,
    "activeTodoDay": "today"
  },
  "updatedAt": null
}
```

## 保存キー

```text
app_key = works_portal
data_type = portal_state
company_account_id = ログイン中企業アカウントID
app_instance_id = works_portal の app_instances.id
```

## 実装した保存対象

- メモ / ToDo追加
- メモ / ToDo削除
- メモ / ToDoチェック状態
- 掲示板投稿削除
- 保管庫ツリー構造
- 保管庫リンク情報
- 保管庫の名前変更
- 保管庫のリンク変更
- 保管庫のファイル種別変更
- 保管庫のドラッグ移動
- 保管庫の削除
- Undo / Redo後の最終状態
- お気に入りカードのピン状態
- 最近使ったもの
- ToDo表示日の選択
- 保管庫フォルダ開閉状態
- 最後に選択した保管庫項目

## 未実装の保存対象

- 実ファイル本体
- Supabase Storage
- 添付ファイルの権限管理
- ファイル削除履歴
- ダウンロードの実ファイル出力
- Undo / Redo履歴そのもの
- ドラッグ中状態
- モーダル開閉状態
- 一時選択状態

## 読込フロー

1. `PortalStateService.loadPortalState()` を呼ぶ
2. `AuthService.getCurrentAccount()` で企業アカウントを確認
3. `app_instances` から `app_key = works_portal` を取得
4. `app_data` から `data_type = portal_state` を取得
5. データがあれば `portal.html` のDOMへ反映
6. データがなければ既存の静的初期表示を維持し、次の編集操作で作成
7. 未ログインまたはmock modeでは「ログインすると保存」と表示

## 保存フロー

1. 操作後に `schedulePortalSave()` を呼ぶ
2. 連続操作に備えてdebounceする
3. `serializePortalState()` で現在のDOM状態をJSON化
4. `PortalStateService.savePortalState()` で `app_data` にupsert
5. `onConflict: app_instance_id,data_type` を使う
6. 保存成功時に同じ `portal_state` をlocalStorageの一時キャッシュへ保存する
7. 保存中 / 保存済み / 保存失敗をヘッダー右側に表示

## 高速表示用localStorageキャッシュ

v0.14.12追加対応として、`portal.html` のリロード直後にメモ / ToDo / 保管庫が一瞬空に見える問題を避けるため、localStorageへ前回保存済み `portal_state` をキャッシュする。

localStorageは正式保存先ではない。別端末同期・正本・RLS確認の対象は引き続きSupabase `app_data.data_type = portal_state` とする。

キャッシュキー:

```text
llld_works_portal_state_{company_account_id}_{app_instance_id}
```

直近キャッシュ参照用:

```text
llld_works_portal_state_last_key
```

起動時の流れ:

1. `loadLastCachedPortalState()` で前回キャッシュを即時読込
2. キャッシュがあれば `前回保存データを表示中` として先に描画
3. その後、Supabaseから `portal_state` を取得
4. Supabase `updated_at` がキャッシュの `cloudUpdatedAt` より新しければクラウド内容で再描画
5. Supabase取得成功後、localStorageも最新化
6. Supabase取得失敗時はキャッシュ表示を維持し、`クラウド保存失敗` を表示
7. ページ読み込み直後のキャッシュ表示だけではSupabaseへ保存しない
8. Supabaseへの保存は、メモ追加、ToDo変更、保管庫変更などユーザーの編集操作後だけ行う

ヘッダー右側の保存状態:

- `前回保存データを表示中`
- `クラウド確認中`
- `クラウド保存済み`
- `クラウド保存失敗`
- 未ログイン時は `クラウド保存済み` と表示しない
- 古いlocalStorageでSupabase上の新しい `portal_state` を自動上書きしない

## 追加確認項目

- ページ読み込み直後に古いlocalStorageでSupabaseを上書きしていない
- Supabase側が新しい場合、Supabaseの内容が優先される
- localStorage側が表示されても、クラウド確認後に正しい最新状態へ更新される

## migration適用

v0.14.11で追加した以下のmigration案が前提。

```text
supabase/migrations/20260627_v01411_portal_app_instance.sql
```

今回CodexからSupabase実DBへは適用していない。

Supabase Dashboard / SQL Editorで人間が確認・適用する必要がある。

## Supabase Dashboardで確認すること

- `apps` に `works_portal` が存在する
- 対象企業アカウントに `works_portal` の `app_instances` が存在する
- `app_data` に `app_key = works_portal` / `data_type = portal_state` が保存される
- `data_json` にメモ / ToDo、掲示板、保管庫ツリーが入る
- 別企業の `portal_state` が見えない
- RLSが無効化されていない
- 既存SeatFlowの `seat_layout` 保存に影響がない

## v0.15で扱うべきエラー・空状態

- `works_portal` app_instanceなし
- `portal_state` 読込失敗
- `portal_state` 保存失敗
- 未ログイン時の保存案内
- Supabase未設定時のmock案内
- 初回データなし
- ファイル本体は保存していないことの注意
- 保存失敗後の再試行導線

## v0.16で扱うべきRLS確認

- 自社の `portal_state` だけselectできる
- 自社の `portal_state` だけinsert / updateできる
- 他社の `portal_state` をselectできない
- 他社の `portal_state` をupdateできない
- anon / logged out相当では `portal_state` が読めない

## 残リスク

- 実DBにv0.14.11 migrationを適用しないと、`works_portal` app_instanceが見つからず保存できない
- `portal.html` はまだ1ファイル内のinline JSが大きいため、後続で `portalPage.js` への分離を検討したい
- 保管庫ツリーをJSON化して保存するMVPのため、大量データや差分更新には弱い
- 実ファイル本体は保存しないため、ファイル追加はリンク情報 / メタデータ保存に限定される

## 次に進む候補

v0.15 エラー処理・空状態。

ただし、その前にSupabase SQL Editorでv0.14.11 migrationを適用し、`works_portal` / `portal_state` が保存できるかブラウザで確認する必要がある。
