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

- 完了。
- GitHub Pages公開版の主要ページは人間確認済み。
- 未ログイン時の `portal.html` login誘導、login後の `portal.html` 復帰、`account.html` 表示は人間確認済み。
- PC / iPad相当幅 / スマホ表示で大きな崩れがないことを人間確認済み。
- `portal.html` のヘッダー非表示・大きな横崩れは `d3e0d72 fix: keep portal header visible on narrow screens` で修正済み。
- スマホ版には軽微なUI調整余地があるが、v0.18を止めるほどではないため別タスク扱い。

開始前確認:

- mainを最新化する。
- GitHub Pages公開版がmain由来であることを確認する。
- docsの現在地が v0.18 NEXT であることを確認する。
- v0.17b以降の作業ブランチ差分を混ぜない。

## v1.0までに決めること

- 社内ポータル編集データを本当にクラウド保存対象にするか
- ファイル保管庫の本体ファイルをどこに置くか
- 掲示板とメモ / ToDoを企業アカウント別に保存するか
- 販売版に社内ポータル機能を含めるか、社内運用専用に分けるか

## v1.0 アカウント別クラウド基盤MVP完成

v1.0は販売開始ではなく、アカウント別クラウド基盤MVPの完成宣言とする。

状態:

- 完了。
- v0.9.5〜v0.18で整備した、企業アカウント単位の認証、企業情報、利用アプリ、`portal_state` 保存・復元、企業間分離をMVP完成範囲とする。
- 販売機能、決済、購入履歴、権限管理、スタッフ個別ログイン、SeatFlow完全クラウド同期、バックアップ復元は含めない。

含める範囲:

- signup / login / logout。
- 未ログイン時の `portal.html` login誘導。
- `company_accounts` と `app_instances` の企業アカウント単位取得。
- `account.html` の企業情報と利用アプリ一覧。
- `works_portal` と `portal_state`。
- `portal_state` の企業アカウント単位保存・復元。
- `portal_state` の企業間分離。
- GitHub Pages公開版の主要ページ。
- PC / iPad / スマホで大きな崩れがないこと。

含めない範囲:

- 販売機能。
- 決済。
- 購入履歴。
- アプリ追加申請。
- 管理者承認画面。
- スタッフ個別ログイン。
- 権限管理。
- 複数店舗管理。
- 自動決済。
- 高度管理者ダッシュボード。
- SeatFlow完全クラウド同期。
- バックアップ復元の実装。
- Supabase Storage。
- ファイル本体保存。

## v1.0後の候補

- v1.1 簡易管理者画面。
- v1.2 企業情報編集。
- v1.3 購入前後の利用開始フロー整理。
  - 購入者側の「アプリ追加申請」は不要。
  - 無料 / β版は購入画面の確認後に利用開始でき、有料 / サブスクは正式な購入・決済または運営側の明示的な利用開始処理後に使える設計にする。
  - 旧v1.3a アプリ追加申請UI mock、旧v1.3b app_add_requests DB設計、旧v1.3c app_add_requests migration / RLS案はPARKED。
  - 旧v1.3d account.html申請DB保存は停止。本線から外す。
  - `app_add_requests` はdropせずPARKED。購入者向けアプリ追加申請には使わない。
- v1.4 実アプリの商品化方針整理。
  - 実アプリやコンテンツを「無料」「有料化予定」「β版」「準備中」「相談導線」「PARKED」に分類する。
  - 決済未実装中の有料予定アプリは、支払い済みと誤解させず `有料化予定` または `購入について相談する` として扱う。
  - SeatFlowやだこくんはβ版 + 相談導線、PDF編集ツールは無料入口、小テスト作成ツールはβ版、有料テンプレート類は有料化予定として扱う案を整理する。
- v1.5 販売用UI/UX強化。
  - Portal / Marketplace / Account系のUIUX整理、マーケットカード、購入確認入口、サポート / 開発相談 / マイページ周りを整理する。
- v1.6 購入ページ。
  - 決済なしで、無料 / β版 / 買い切り / サブスクの購入・利用開始確認画面を作る。
  - 無料 / β版は確認後に `sessionStorage` によるポータル一時追加を許可する。
  - 有料 / サブスクは購入確認のみで、決済未実装中はポータルや利用中アプリへ追加しない。
  - 購入履歴や正式な `app_instances` 反映はまだ行わない。
- v1.6b 商品・料金・CTA設定の整理。
  - 購入ページ、マーケットページ、アプリカードで使う商品情報を、静的JSONまたは既存データ構造に寄せる。
  - アプリ名、説明文、価格、無料 / 有料 / β版 / 開発相談、CTA、カテゴリ、サムネイル、サポート対象、初期設定対象、表示 / 非表示、おすすめ表示、購入後に利用可能にする `app_key` を整理する。
  - 短期的には既存 `data/contents.json` を正本候補とし、商品ごとの差分文言やCTAをデータ側へ寄せる。
  - 新規JSON、商品DB、料金DB、本物管理者画面はこの段階では作らない。
  - 本物の料金編集DBは作らない。
- v1.6c 管理者mock画面：商品/料金/表示状態確認。
  - `admin.html` / `assets/js/adminMockPage.js` で、実DB接続なしの固定mockとして商品一覧、価格、状態、CTA、サポート設定、購入後の反映先 `app_key`、異常状態を確認する。
  - 価格未設定、CTA未設定、`app_key` なし、サムネイルなし、商品説明なしなどをmockで見えるようにする。
  - 状態: 完了。商品・料金・CTA確認mockを `admin.html` に追加済み。本物DB編集、商品DB、料金DB、Supabase / RLS / migration変更は含めない。
- v1.7 購入後の利用開始・利用中アプリ反映。
  - 状態: 方針整理完了。
  - `sessionStorage` は一時表示、`app_instances` は正式な利用中アプリの正本として切り分ける。
  - 無料 / β版は将来的な正式反映候補、有料 / サブスクは決済完了または運営側の明示的な利用開始処理後まで正式反映しない。
  - 現行RLSだけでは無料 / β版だけを安全にinsert許可し、有料 / サブスクを拒否する制御が不足するため、実装前にDB / RLS要否を整理する。
- v1.7b app_instances status / 利用解除DB設計。
  - 状態: 完了。現行 `app_instances.status` の `active` / `trial` / `paused` / `disabled` を使うMVP方針を整理済み。
  - 利用解除は物理削除ではなく `paused`、運営側停止は `disabled`、再利用開始は `active` / `trial` に戻す。
  - `app_data` は削除しない。`inactive` / `pending` を正式statusにする場合はmigrationが必要。
- v1.7c app_instances status / RLS / migration案。
  - 状態: 完了。現行schema、status制約、unique index、RLS policy、`app_data` cascade deleteリスクを整理済み。
  - 既存 `active` / `trial` / `paused` / `disabled` だけを使うならstatus追加migrationは不要。
  - 現行RLSは自社 `company_account_id` 分離には効くが、無料 / β版だけをinsert許可し、有料 / サブスクをDB側で拒否する料金形態判定はできない。
  - `disabled` を利用者が `active` / `trial` へ戻せないようにするstatus遷移制御も不足する。
  - v1.7dへ進む場合は、無料 / β版の少数 `app_key` allowlist、対象商品の `priceType`、有料 / サブスク対象外、`disabled` 復活禁止を人間が確認する。
- v1.7d 無料 / β版 app_instances反映MVP。
  - v1.7cの人間判断条件が満たされた場合のみ実装候補にする。
- v1.7e account / portal / my-apps 表示整合。
  - `active` / `trial` を通常利用中として表示し、`paused` / `disabled` を通常一覧から除外または停止済み表示に分離する。
- v1.7f 利用解除UI / paused化。
  - 無料 / β版の利用解除UI、誤操作防止、再利用開始導線を整理する。
- v1.7g 有料 / サブスク反映は決済後へPARKED。
  - 決済完了または運営側の明示的な利用開始処理ができるまで正式反映しない。
- v1.7.5 UI再調整・導線磨き込み。
  - DB側・購入後反映側がある程度進んだ後、Portal / Marketplace / Account / My Apps周りの細かなUIを再調整する。
- v1.8 販売前QA・導入テスト。
- v1.9 決済・購入履歴。
- v2.0 β販売開始。
- v2.1 小規模事業者向け販売版。
- v2.x 本物管理者画面：料金・掲載・購入状態編集。
  - 管理者権限、管理者ロール、RLS設計、変更履歴、誤操作防止、価格変更履歴、公開前確認、本番 / 検証分離、管理者のみ編集可能なDB policyが整ってから扱う。
- v2.x クリエイター向けアプリ投稿・掲載申請。
- v2.x スタッフ個別ログイン。
- v2.x 権限管理。
- v2.x 複数店舗管理。
- v2.x 自動決済。
- v2.x 利用状況分析。
- v2.x テンプレートマーケット化。
- v2.x 高度管理者ダッシュボード。

## 現時点の推奨

v0.14.12、v0.15、v0.16、v0.17a、v0.18、v1.0、v1.1b、v1.2、v1.2b、v1.3、v1.3f、v1.4、v1.5、v1.6、v1.6b、v1.6c、v1.7方針整理、v1.7b、v1.7cは完了扱い。v0.17b以降のバックアップ実装、SeatFlow完全クラウド同期、購入者向け `app_add_requests` 利用申請はPARKEDに戻したまま、次は条件付きで v1.7d 無料 / β版 app_instances反映MVPへ進む。

決済・購入履歴は、実アプリの商品化方針、販売用UI/UX、購入ページ、商品・料金・CTA設定、管理者mock確認、購入後の利用開始・利用中アプリ反映、UI再調整、販売前QAが固まった後の v1.9 で扱う。独自ドメイン公開準備、レンタルサーバー移行はロードマップに追加しない。

理由:

- v0.14.11で保存方針は `app_data.portal_state` に決まった
- v0.14.12で `portal_state` の保存実装が入った
- v0.15で保存失敗・読込失敗・空状態の表示が入った
- v0.16ではSupabase保存対象のRLSと他社データ混入テストに集中した
- v0.17aでバックアップ・復元方針を整理した
- v0.17b以降の実装は作業ブランチのみで、公開版には未反映
- v0.18ではGitHub Pages公開状態、実リンク、mock表示、Supabase接続、未保存注意表示を確認する
- v1.2bでは `account.html` で自社企業情報を編集できるMVPを実装し、人間確認で保存・再読み込み・Supabase更新対象・RLS有効を確認した
- v0.18でPC / iPad / スマホ表示の大きな崩れは解消済み
- v1.0では、PARKED範囲を含めず、アカウント別クラウド基盤MVPとして完了扱いにした
- v1.1bでは、実DB接続なしのmock簡易管理者画面で管理画面の確認項目を整理した
- v1.2では、企業情報編集の方針を整理した
- v1.2bでは、`account.html` 内で自社 `company_accounts` の基本情報編集MVPを検討する
- 旧v1.3aでは、`account.html` 上でDB保存なしのアプリ追加申請UI mockを確認したが、現在はPARKED
- 旧v1.3bでは、申請専用テーブル `app_add_requests` のDB保存設計を整理したが、現在はPARKED
- v1.3では、購入者向けアプリ追加申請を本線から外し、購入 / 利用開始 / 任意サポート申込へ整理する
- v1.4では、購入ページや決済へ進む前に実アプリの商品化分類、CTA、相談導線、PARKED範囲を整理する
