# ポータルUI/UX拡張後ロードマップ案

## 背景

v0.14.6以降、`portal.html` は社内アプリ入口から、メモ / ToDo、掲示板、ファイル保管庫、編集モードを持つ社内作業ポータルへ拡張された。

この変更により、v0.15以降のエラー処理・空状態では、Supabase接続系だけでなく、ポータル編集系の未保存状態も扱う必要が出ている。

## 再整理後のPhase 0

### v0.14.10 ポータルUI/UX再ベースライン

現在のポータル機能、保存状態、mock範囲を棚卸しする。

完了条件:

- 実リンク、編集機能、mock機能が分類されている
- どの機能が保存され、どの機能が未保存か分かる
- v0.15へ進む前の条件が整理されている

### v0.14.11 ポータル編集機能の保存方針整理

メモ / ToDo、掲示板、ファイル保管庫をどこまで保存するか決める。

検討対象:

- localStorageで十分なもの
- Supabase保存が必要なもの
- Google DriveやSupabase Storageが必要なもの
- mockのまま残すもの
- リロードで消えることを明記すればよいもの

結論:

- ポータル編集データはSupabase保存対象にする
- MVPでは `app_data.data_type = portal_state` のJSONB保存を採用する
- `apps.app_key = works_portal` と企業ごとの `app_instances` を持たせる
- ファイル本体保存とSupabase Storageは後続フェーズへ回す

### v0.14.12 ポータル編集データ Supabase保存MVP

状態: main反映済み。

`portal.html` の編集データを、ログイン中企業アカウントに紐づく `app_data.portal_state` へ保存・読込できるようにする。

対象:

- メモ / ToDo
- 掲示板投稿
- 保管庫ツリー構造
- 保管庫リンク情報
- お気に入り
- 最近使ったもの
- ポータル表示設定

対象外:

- 実ファイル本体
- Supabase Storage
- 専用テーブル化
- スタッフ個別ログイン
- 権限管理

実装メモ:

- `PortalStateService` を追加する
- `portal.html` から `portal_state` を読込 / 保存する
- 保存状態を画面に表示する
- `works_portal` app_instanceがない場合はmigration適用を案内する

### v0.15 エラー処理・空状態

状態: main反映済み。

対象を以下に広げる。

- 認証・アカウント系
- Supabase保存系
- SeatFlowクラウド保存系
- ポータル `app_data.portal_state` 保存系
- ポータル編集系
- mock / 未保存状態

完了条件:

- 未ログイン、保存失敗、読込失敗、空状態で画面が無言にならない
- ユーザーが次に何をすればよいか分かる
- 未保存 / mockの操作が実保存と誤解されない

### v0.16 RLS・他社データ混入テスト

Supabase保存対象に限定してRLSを確認する。

対象:

- company_accounts
- app_instances
- app_dataのSeatFlow `seat_layout`
- app_dataのWorks Portal `portal_state`

ポータル編集データは `company_account_id` で分離し、他社の `portal_state` が読めない・更新できないことを確認する。

### v0.17 バックアップ・復元

SeatFlowのapp_dataだけでなく、ポータル編集データを保存対象にする場合は、バックアップ対象にも含める。

候補:

- SeatFlowレイアウトJSON
- ポータル保管庫ツリーJSON
- メモ / ToDo JSON
- 掲示板JSON

状態:

- v0.17a 方針整理は完了。
- v0.17b バックアップJSONエクスポートMVP、v0.17c バックアップJSON読込・検証・プレビュー、v0.17d 限定復元設計は作業ブランチにのみ存在し、main / GitHub Pages公開版には未反映。
- バックアップ実装と復元設計は一旦PARKEDに戻し、v0.18 検証環境デプロイを優先する。
- 復元は未実装のままにする。

### v0.18 検証環境デプロイ

GitHub Pages上で、実リンク、mock表示、Supabase接続、未保存注意表示を確認する。

状態:

- Codex確認範囲は完了。
- GitHub Pages主要URLはHTTP 200確認済み。
- `data/site-config.json` はJSON parse可能。
- `auth.mode = supabase`、Supabase URL / anon keyあり、secret混入なし。
- 公開版ブラウザ操作、Supabase Auth URL Configuration、RLS最終確認、実機表示は人間確認待ち。
- v1.0へ進むかは人間確認後に判断する。

開始前確認:

- mainを最新化する。
- GitHub Pages公開版がmain由来であることを確認する。
- docsの現在地が v0.18 NEXT であることを確認する。
- v0.17b以降の作業ブランチ差分を混ぜない。

v0.18で確認する公開URL:

- `/`
- `/portal.html`
- `/login.html`
- `/signup.html`
- `/account.html`
- `/marketplace.html`
- `apps/quiz-maker/index.html`
- `apps/exam-print/index.html`
- `apps/pdf-tool/index.html`
- `apps/seatflow/index.html`
- `apps/dakokun/index.html`
- `contents/meeting-support/index.html`

## v1.0までに決めること

- 社内ポータル編集データを本当にクラウド保存対象にするか
- ファイル保管庫の本体ファイルをどこに置くか
- 掲示板とメモ / ToDoを企業アカウント別に保存するか
- 販売版に社内ポータル機能を含めるか、社内運用専用に分けるか
- GitHub Pages公開版でsignup / login / logoutが通るか
- Supabase Auth URL Configurationが公開URLに合っているか
- RLS最終確認で他社データ混入がないか
- iPad / スマホ / PC実機で主要導線が破綻しないか

## 現時点の推奨

v0.14.12、v0.15、v0.16、v0.17aは完了扱い。v0.17b以降はmain未反映のためPARKEDに戻す。v0.18はCodex確認範囲まで完了し、現在は人間による公開版ブラウザ確認、Supabase Auth URL設定確認、RLS最終確認を待つ。

理由:

- v0.14.11で保存方針は `app_data.portal_state` に決まった
- v0.14.12で `portal_state` の保存実装が入った
- v0.15で保存失敗・読込失敗・空状態の表示が入った
- v0.16ではSupabase保存対象のRLSと他社データ混入テストに集中した
- v0.17aでバックアップ・復元方針を整理した
- v0.17b以降の実装は作業ブランチのみで、公開版には未反映
- v0.18ではGitHub Pages公開状態、実リンク、mock表示、Supabase接続、未保存注意表示を確認する
- v1.0へ進むかは、人間確認後に判断する
