# v0.15 エラー処理・空状態

## 目的

Supabase接続、ログイン、企業アカウント取得、利用アプリ一覧、SeatFlowクラウド保存、Works Portalの `portal_state` 保存で失敗したときに、画面が無言で壊れず、次に何をすればよいか分かる状態にする。

## 今回改善したファイル

- `portal.html`
- `account.html`
- `assets/js/accountPage.js`
- `apps/seatflow/index.html`
- `docs/04_フェーズ記録/phase0-15-error-empty-states.md`

## 改善したエラー状態

### Portal

- 未ログイン時に「ログインすると会社ごとのポータル状態をクラウド保存できます」と表示
- 未ログイン時は `portal_state` 読込失敗ではなくログイン必須状態として扱う
- 未ログイン時は `login.html?redirect=portal.html` へ自動遷移する
- ログイン成功後、redirect指定が `portal.html` の場合は `portal.html` へ戻る
- localStorageキャッシュのみ表示中に「前回保存データを一時表示中」と表示
- クラウド確認失敗時に「クラウド確認に失敗しました」と表示
- `works_portal` app_instanceなしの場合に管理者確認が必要と分かる表示
- `portal_state` なしの場合に、次の編集操作で保存作成されると表示
- 保存失敗時に「保存を再試行」ボタンを表示
- 読込失敗時に「再試行」ボタンを表示
- 未保存変更があるまま閉じる場合、ブラウザ標準の確認を出す
- ファイル追加欄に、ファイル本体ではなくファイル名 / 種別 / リンクURL / 表示情報のみ保存する旨を表示

### Account

- アカウント取得例外時に、画面を空白にせず取得エラーを表示
- `account.html` に「再読込」ボタンを追加
- 企業アカウントなし、未ログイン、利用アプリ0件は既存表示を維持

### SeatFlow

- 未ログイン、企業アカウントなし、SeatFlow app_instanceなし、Supabase client未準備、未保存、保存失敗、読込失敗の表示文言を整理
- 既存の「クラウド保存」「クラウド読込」ボタンを再試行導線として維持

## 改善した空状態

- `portal_state` なし: 初期表示を維持し、編集操作後に作成
- localStorageキャッシュあり / Supabase読込失敗: キャッシュ表示を維持し、クラウド確認失敗と表示
- account利用アプリ0件: 「利用中アプリはまだ登録されていません」を表示
- SeatFlow `seat_layout` なし: 「先にクラウド保存を押してください」と表示

## localStorageキャッシュの扱い

- localStorageは体感速度改善用の一時キャッシュ
- 正本はSupabase `app_data.data_type = portal_state`
- ページ読み込み直後のキャッシュ表示だけではSupabaseへ保存しない
- 古いlocalStorageでSupabase上の新しい `portal_state` を自動上書きしない
- Supabase取得成功後にlocalStorageを最新化する

## ファイル本体保存の扱い

v0.15ではSupabase Storageへ進まない。

ファイル追加・差し替えで保存対象にするのは以下のみ。

- ファイル名
- 種別
- リンクURL
- 表示用メタデータ

PDF / 画像 / Excelなどのファイル本体保存、添付ファイル権限管理、削除履歴は未実装。

## 未対応のまま残したこと

- Supabase Storage
- ポータル専用テーブル
- 詳細なRLS実地テスト
- 他社データ混入テスト
- SeatFlow保存失敗を人工的に発生させたブラウザ確認
- login / signupの全エラーを実Supabaseで網羅確認
- app_instances 0件を実DBで作っての表示確認

## Supabase Dashboardで人間が確認すべきこと

- `apps` に `works_portal` が存在する
- 対象企業に `works_portal` app_instance がある
- `app_data.data_type = portal_state` が保存される
- 他社の `portal_state` が見えない
- RLSが無効化されていない
- SeatFlowの `seat_layout` 保存に影響がない

## v0.16で確認すること

- 自社 `company_accounts` だけ読める
- 他社 `company_accounts` が読めない
- 自社 `app_instances` だけ読める
- 他社 `app_instances` が読めない
- 自社 `app_data.portal_state` だけ読める / 更新できる
- 他社 `app_data.portal_state` が読めない / 更新できない
- 自社 `app_data.seat_layout` だけ読める / 更新できる
- 他社 `app_data.seat_layout` が読めない / 更新できない

## 次に進む候補

v0.16 RLS・他社データ混入テスト。

ただし、人間のブラウザ確認で保存失敗、読込失敗、未ログイン、キャッシュのみ表示が意図どおり見えるか確認してから進める。
