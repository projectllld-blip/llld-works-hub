# 00 PROJECT STATUS

## 現在の最新フェーズ
v1.7c app_instances status / RLS / migration案まで完了扱い。

v1.6では、決済実装には入らず、`purchase-confirm.html` で購入 / 利用開始確認、任意サポート選択、無料 / β版だけのポータル一時追加導線を整理した。有料 / サブスクは購入確認のみで、決済未実装中はポータルや利用中アプリへ追加しないことを人間ブラウザ確認済み。あわせて、購入ページ直後の `v1.6b 商品・料金・CTA設定の整理`、`v1.6c 管理者mock画面：商品/料金/表示状態確認` をロードマップに追加し、本物管理者画面での料金・掲載・購入状態編集は v2.x 以降へ分離した。

v1.6bでは、商品名、説明、価格、料金形態、販売状態、CTA、カテゴリ、サムネイル、サポート対象、初期設定対象、表示 / 非表示、おすすめ表示、購入後に利用可能にする `app_key` を整理対象として定義した。短期的には既存 `data/contents.json` を商品・料金・CTA設定の正本候補として扱い、JS側のコード直書きを将来減らす方針にした。ただし、v1.6bでは `data/contents.json`、新規JSON、DB、RLS、migration、本体UI / JS / CSSは変更していない。

v1.6cでは、`admin.html` に実DB接続なしの固定mockとして「商品・料金・CTA確認 mock」を追加した。商品一覧、価格、無料 / β版 / 買い切り / サブスク / 開発相談 / 開発中、表示状態、CTA種別、サポート設定、初期設定サポート有無、購入後の反映先 `app_key`、価格未設定 / CTA未設定 / `app_key` なし / サムネイルなし / 商品説明なしの異常状態を確認できる。人間ブラウザ確認で、既存の企業一覧mock / 企業詳細mock、mock明示、実DB / Supabase / Auth / 保存処理なし、`data/contents.json` 未変更、Supabase migration / RLS / site-config / workflow 未変更、スマホ表示に大きな崩れなしを確認済み。

v1.7方針整理では、`sessionStorage` は一時表示、`app_instances` は正式な利用中アプリの正本として切り分けた。無料 / β版は将来的に `app_instances` 反映対象候補、有料 / サブスクは決済完了または運営側の明示的な利用開始処理後まで正式反映対象外とする。既存 `app_instances` には `company_account_id`、`app_key`、`display_name`、`status`、`settings_json` があり、`status = active / trial / paused / disabled` と一意制約 `company_account_id + app_key` があるため土台はある。ただし、現行RLSだけでは無料 / β版だけをinsert許可し、有料 / サブスクをDB側で拒否する制御が不足しているため、実装前に `v1.7b app_instances status / 利用解除DB設計` へ分割する。

v1.7bでは、`app_instances.status` は既に存在し、現行check制約は `active / trial / paused / disabled` であることを確認した。MVPでは、無料アプリは `active`、β版 / トライアルは `trial`、利用者側の利用解除は `paused`、運営側停止は `disabled` として扱う方針にする。利用解除では `app_instances` を物理削除せず、`app_data` は原則残す。`inactive` / `pending` / `cancelled` をDB上の正式statusにする場合はmigrationが必要。現行RLSは自社 `company_account_id` 分離はできるが、無料 / β版だけをinsert許可し、有料 / サブスクを拒否する商品状態判定はできないため、次は `v1.7c app_instances status / RLS / migration案` で安全な反映制御を整理する。

v1.7cでは、現行 `app_instances` schema / RLS / migration要否を整理した。status列、`active / trial / paused / disabled` のcheck制約、`company_account_id + app_key` のunique index、`updated_at` trigger、`app_data.app_instance_id on delete cascade` は既に存在するため、既存statusだけを使うならstatus追加migrationは不要。ただし、現行RLSは自社 `company_account_id` 分離には効くが、無料 / β版だけをinsert許可し、有料 / サブスクをDB側で拒否する料金形態判定はできない。さらに、update policy上は実装次第で `disabled` を利用者が `active` / `trial` へ戻せてしまうリスクがある。v1.7dへ進む場合は、無料 / β版の少数 `app_key` allowlistを人間が確認し、有料 / サブスクを対象外にし、`disabled` は利用者操作で復活させない方針を明示する必要がある。より厳密な安全制御は、RPC / Edge Function、商品・料金正本のDB化、または運営側手動反映へ送る。

GitHub Pages公開版、認証・ポータル導線、PC / iPad / スマホ表示の大きな崩れがないことを人間確認済み。

v1.0は販売開始ではなく、企業アカウント単位のクラウド基盤MVP完成宣言。

v1.4 実アプリの商品化方針整理はmain反映済み。v1.x Portal UIUX Consolidationでは社内ポータル入口、ヘッダー、投稿一覧、アプリカード、サムネイル表示のUIUXを整理済み。v1.5ではマーケット側の表示数、確認画面、開発要望導線を整理済み。

v1.3 購入前後の利用開始フロー整理により、旧v1.3「購入者向けアプリ追加申請」を本線から外した。購入者側のアプリ追加申請は不要とし、無料 / β版は購入画面の確認後に利用開始できる設計、有料 / サブスクは正式な購入・決済または運営側の明示的な利用開始処理後に使える設計へ戻す。`account.html` の旧購入者向けアプリ追加申請UIはv1.3fで撤去。`app_add_requests` は削除せずPARKED。

v1系ロードマップは、購入前後の利用開始フロー、実アプリの商品化方針、販売用UI/UX、購入ページ、商品・料金・CTA設定整理、管理者mockでの商品 / 料金 / 表示状態確認、購入後の利用開始・利用中アプリ反映、UI再調整、販売前QAの後に決済・購入履歴へ進む順番へ見直す。

v1.3a アプリ追加申請UI mockはPR #21 / #22でmain反映済み。人間ブラウザ確認で、`account.html` 上の申請導線、申請フォーム、申請済み表示、DB保存なし、localStorage保存なし、`app_instances` / `app_data` / `company_accounts` / `plan_status` 未更新を確認済み。正式なDB保存は未実装で、専用テーブル / RLS / migration設計が必要なため別Phaseで扱う。

v1.3b アプリ追加申請DB保存設計では、正式保存先を既存 `app_instances` / `app_data` / `audit_logs` に流用せず、申請専用テーブル `app_add_requests` を新規設計する方針を整理した。申請作成と利用開始は分離し、申請作成だけでは `app_instances` を追加しない。

v1.3c app_add_requests migration / RLS実装案では、`supabase/migrations/20260701_v13c_app_add_requests.sql` を追加した。環境分離状況確認の結果、GitHub Pages公開版も現在のSupabase projectを参照しているため、2026-07-01の人間判断で「現在のSupabase project = 本番相当DB」「新しく作るSupabase project = 検証用DB」と確定した。2026-07-02に、人間がSQL全文確認後、現行Supabase projectへ手動適用済み。`app_add_requests` テーブル、RLS有効、select / insert policy確認済み。ただし、v1.3dの人間確認でDB保存が成功していないこと、さらに「購入者向け利用申請」として進める仕様が本線意図とズレていることが分かったため、v1.3dは停止し、`app_add_requests` は購入者導線には使わずPARKED扱いにする。

LLLD Works Hub / Works Market は、社内ポータル・販売マーケット・小型業務アプリ群を統合するプロジェクトです。

現在は、A0.1〜A0.5 Codex半自動運用の初期実用ラインと、本線 v1.0 アカウント別クラウド基盤MVP完成まで完了しています。

## 完了済みフェーズ
- v0.9.5 設計
- v0.10 Supabase検証DB
- v0.10.5 mock / supabase切替土台
- v0.11 signup接続
- v0.12 login / account接続
- v0.13 利用アプリ一覧
- v0.14 SeatFlowクラウド保存
- v0.14.5 実接続確認
- v0.14.6 新ポータルHTML統合
- v0.14.12 ポータル状態の高速表示・ローカルキャッシュ対応
- v0.15 エラー処理・空状態
- v0.15追加修正 / v0.15.1相当: 未ログイン時の `portal.html` 表示改善
- v0.16 RLS・他社データ混入テスト: 限定範囲で完了。`portal_state` の甲乙分離、`works_portal` 自動付与方針、SeatFlow表示中レイアウトの限定的な保存・読込確認まで。
- v0.17a バックアップ・復元 方針整理
- v0.18 検証環境デプロイ: GitHub Pages公開版、認証・ポータル導線、PC / iPad / スマホ表示を確認済み。`portal.html` ヘッダーの大きな横崩れは修正済み。
- v1.0 アカウント別クラウド基盤MVP完成: 販売開始ではなく、企業アカウント単位の認証、企業情報、利用アプリ、`portal_state` 保存・復元、企業間分離のMVP完成。
- v1.1b mock簡易管理者画面: `admin.html` に実DB接続なしの企業管理mock UIを作成。mock企業一覧、企業詳細切替、利用アプリ一覧、`works_portal` / `portal_state` / `seatflow` / `seat_layout` の有無、異常状態mockを人間確認済み。企業横断取得、本物管理者権限、DB / RLS変更は未実装。
- v1.2 企業情報編集 方針整理: `account.html` 内で自社 `company_accounts` の基本情報を編集する方針を整理。
- v1.2b 企業情報編集フォームMVP: `account.html` で自社 `company_accounts` の `company_name` / `contact_name` / `business_type` / `phone` を編集できるMVPを実装。`email` は表示のみ。ブラウザ確認とSupabase Dashboard確認で、指定4項目のみ更新され、`email` / `owner_user_id` / `plan_status` は変更されないことを人間確認済み。
- v1.3 購入前後の利用開始フロー整理: 購入者向けアプリ追加申請を本線から外し、購入 / 利用開始 / 任意サポート申込へ整理。
- v1.3f 旧アプリ追加申請UIの撤去: `account.html` から旧購入者向けアプリ追加申請導線を撤去し、`accountPage.js` から `app_add_requests` 読み書き処理を撤去。人間ブラウザ確認済み。
- v1.4 実アプリの商品化方針整理: 実アプリやコンテンツを「無料」「有料化予定」「β版」「準備中」「相談導線」「PARKED」に分類し、販売用UI/UX強化へ渡す方針を整理。
- v1.5 Marketplace UIUX / Purchase Flow Consolidation: マーケット表示、共通ヘッダー、カード導線、確認画面入口、サポート / 開発相談 / マイページ周りを整理。無料 / β版 / 有料は直接追加せず確認画面へ通す方針にした。
- v1.6 購入ページ: `purchase-confirm.html` で無料 / β版 / 買い切り / サブスクの確認画面を整理。無料 / β版は `sessionStorage` 仮追加、有料 / サブスクは購入確認のみで利用可能状態にしないことを人間確認済み。決済、購入履歴、正式な `app_instances` 反映は未実装。
- v1.6b 商品・料金・CTA設定の整理: 商品・料金・CTA設定の対象項目、既存 `data/contents.json` へ寄せる短期方針、新規JSON案、将来DB案、v1.6c管理者mockへの引き継ぎ、本物管理者画面をv2.x以降へ分離する方針を整理。docs-onlyで、本体UI / JS / CSS、`data/contents.json`、Supabase、RLS、migrationは変更していない。
- v1.6c 管理者mock画面：商品/料金/表示状態確認: `admin.html` / `assets/js/adminMockPage.js` に固定mockの商品確認UIを追加。実DB接続なしで、商品一覧、価格、表示状態、CTA、サポート設定、購入後の反映先 `app_key`、異常状態を確認する。本物管理者画面、商品DB、料金編集、Supabase / RLS / migration変更は含めない。人間ブラウザ確認済み。
- v1.7 購入後の利用開始反映 方針整理: `sessionStorage` 仮追加と `app_instances` 正式反映を切り分け、無料 / β版、有料 / サブスク、利用解除、RLS、分割案を整理。現行RLSだけでは無料 / β版だけの安全なinsert制御が不足するため、実装前にDB / RLS要否の人間判断が必要。
- v1.7b app_instances status / 利用解除DB設計: 既存 `status = active / trial / paused / disabled` を活用し、利用解除は物理削除ではなく `paused`、運営停止は `disabled`、再利用開始は `active` / `trial` へ戻す方針を整理。`app_data` は削除しない。`inactive` / `pending` を使う場合や無料 / β版だけを安全に反映する場合は、v1.7cでmigration / RLS案を整理する。
- v1.7c app_instances status / RLS / migration案: 現行schema、status制約、unique index、RLS policy、`app_data` cascade deleteリスクを整理。既存statusだけを使うならstatus追加migrationは不要。ただし現行RLSだけでは無料 / β版のみinsert許可、有料 / サブスク拒否、`disabled` 復活禁止をDB側で完全保証できないため、v1.7d実装前に人間判断が必要。
- v1.3c適用前 Supabase本番/検証分離方針整理: GitHub Pages公開版が現在のSupabase projectを参照しているため、現在のprojectを運用上本番相当DBとして扱う方針を整理。v1.3c migrationは環境方針確定まで実DB適用停止。
- A0.1 Codex半自動運用基盤
- A0.2 GitHub Issue運用化
- A0.3 QA自動チェック強化
- A0.4 Codex文脈圧縮・引き継ぎ運用
- A0.5 PRレビュー運用
- A0.6 PR安全分類・docs-only自動マージ設計
- A0.7 HUMAN_REQUIRED判定修正・安全PR自動マージ実装
- A0.8/A0.9 docs-only自動マージ判定の厳密化
- A0.9 自動マージセットアップ不足調査: PR #23で `safe-docs-automerge` は付与され、safe docs-only判定は成功。GitHub APIエラー `Auto merge is not allowed for this repository` により `auto-merge-setup-required` / `human-required` が付いたため、GitHub Settingsの `Allow auto-merge`、branch protection / required checks、Actions workflow permissions の人間確認が必要。

## 一時停止中の本線
- `portal.html` の新規機能開発。
- `marketplace.html` の新規機能開発。
- 本体HTMLアプリの機能追加
- Supabase migration本体の実装・実DB適用
- GitHub Pages設定変更
- SeatFlow完全クラウド同期。複数レイアウト、名簿、QR、NFC、メモ、履歴、競合解決、同時編集はPARKED。
- v0.17b バックアップJSONエクスポートMVP。作業ブランチに実装はあるがmain未反映のためPARKED。
- v0.17c バックアップJSON読込・検証・プレビュー。作業ブランチに実装はあるがmain未反映のためPARKED。
- v0.17d 限定復元設計。作業ブランチに設計docsはあるがmain未反映のためPARKED。

## 進行中の自動化プロジェクト
- A0.9 自動マージセットアップ不足調査: docs整理は完了。GitHub Settings人間確認待ち。

## 進行中の本線
- なし。次の本線候補は `v1.7d 無料 / β版 app_instances反映MVP`。ただし、フロントallowlist方式で進めるか、対象 `app_key`、無料 / β版分類、`disabled` 復活禁止方針について人間判断が必要。

## 今回の寄り道プロジェクト
- A0.1 Codex半自動運用基盤: 完了
- A0.2 GitHub Issue運用化: 完了
- A0.3 QA自動チェック強化: 完了
- A0.4 Codex文脈圧縮・引き継ぎ運用: 完了
- A0.5 PRレビュー運用: 完了
- A0.6 PR安全分類・docs-only自動マージ設計: 完了
- A0.7 HUMAN_REQUIRED判定修正・安全PR自動マージ実装: 完了
- A0.8/A0.9 docs-only自動マージ判定の厳密化: 完了
- A0.9 自動マージセットアップ不足調査: GitHub Settings人間確認待ち

## 絶対に壊してはいけないもの
- `portal.html`
- `index.html`
- `account.html`
- `marketplace.html`
- `login.html`
- `signup.html`
- 既存HTMLアプリへのリンク
- Supabase auth
- `company_accounts`
- `app_instances`
- `app_data`
- `app_data.data_type = portal_state` の保存方針
- GitHub Pages公開前提の構成

## 正式な保存先
- 社内ポータル状態のクラウド保存方針: Supabase `app_data`
- ポータル状態の種別: `app_data.data_type = portal_state`
- ページ初期表示の高速化: localStorageキャッシュ
- 重要データの正式な逃げ道: JSONエクスポート / インポート、必要に応じてCSV

## Supabaseに関する注意
- Supabase Dashboard操作は人間確認が必要。
- RLSやmigrationの実DB適用はCodexが勝手に行わない。
- GitHub Pages公開版は `data/site-config.json` を参照しており、現在のSupabase projectを見ている。2026-07-01の人間判断で、現在のSupabase projectは本番相当DBとして扱うことに確定した。
- 新しく作るSupabase projectを検証用DBとする。
- 現在のSupabase projectへのmigration / RLS / schema変更 / `app_data` / `app_instances` / Auth関連変更は、本番相当DBへの変更として必ず `HUMAN_REQUIRED: YES` とする。
- v1.3c `app_add_requests` migrationを現行Supabase projectへ適用する場合、人間がSQL全文確認後にSQL Editorで手動適用する。
- 検証用Supabase projectができるまでは、DB変更の検証も本番相当DBで行うことになるため、既存データ削除、RLS無効化、Auth破壊につながる変更は禁止する。
- service_role key、DB password、private key、GitHub token、OpenAI API key、Stripe secret key、その他secretはrepoへ入れない。
- フロントに置いてよいのは公開前提のSupabase anon / public / publishable keyのみ。
- 既存のSupabase設定を勝手に書き換えない。

## 次の本線候補
- 検証用Supabase project新規作成
- v1.7d 無料 / β版 app_instances反映MVP: 進む場合は、無料 / β版の少数 `app_key` allowlistを人間が確認し、有料 / サブスクを対象外にし、`disabled` を利用者操作で復活させない。
- v1.7e account / portal / my-apps 表示整合
- v1.7f 利用解除UI / paused化
- v1.7g 有料 / サブスク反映は決済後へPARKED
- v1.7.5 UI再調整・導線磨き込み
- v1.8 販売前QA・導入テスト
- v1.9 決済・購入履歴
- v2.0 β販売開始
- v2.1 小規模事業者向け販売版

決済・購入履歴は、商品化方針、販売用UI/UX、購入ページ、商品・料金・CTA設定、管理者mock確認、購入後の利用開始・利用中アプリ反映、UI再調整、販売前QAが固まった後に進める。

## PARKED中の本線候補
- v0.17b バックアップJSONエクスポートMVP: `fix/v016-seatflow-cloud-load` には実装があるが、main / GitHub Pages公開版には未反映。現時点では本線に入れない。
- v0.17c バックアップJSON読込・検証・プレビュー: `fix/v016-seatflow-cloud-load` には実装があるが、main / GitHub Pages公開版には未反映。現時点では本線に入れない。
- v0.17d 限定復元設計: `fix/v016-seatflow-cloud-load` には設計docsがあるが、main未反映。復元は未実装のままにする。
- SeatFlow完全クラウド同期: 複数レイアウト同期、名簿 / QR / NFC / メモ保存、全体状態の完全バックアップ・復元、複数タブ競合解決、正式商品化に必要な保存対象整理は将来タスク。
- 決済、購入履歴、スタッフ個別ログイン、権限管理、複数店舗管理、自動決済はv1.0には含めない。
- Supabase Storage、ファイル本体保存、バックアップ復元の実装はv1.0には含めない。
- 旧v1.3a アプリ追加申請UI mock: `account.html` で未利用アプリを見て追加申請の操作感を確認できるUI mockを実装したが、購入者向け導線としてはPARKED。
- 旧v1.3b app_add_requests DB設計: `app_add_requests` テーブル案、RLS方針、運営側フローを整理したが、購入者向け導線としてはPARKED。
- 旧v1.3c app_add_requests migration / RLS案: 現行Supabase projectへ人間が手動適用済み。ただし、購入者向け利用申請としてはPARKED / dropしない。

## v1.3b アプリ追加申請DB保存設計
- `v1.3a` はDB保存なしのUI mockとして完了。
- 当初は、正式保存には申請専用テーブル `app_add_requests` を使う方針だった。
- `app_instances` は利用中アプリの正本であり、申請作成だけでは追加しない。
- `app_data` はアプリ本体の保存データであり、申請ワークフローには使わない。
- `audit_logs` は監査ログであり、申請の対応待ちデータとして流用しない。
- RLSは `company_account_id` を分離キーにし、自社申請だけをinsert / selectできる方針。
- 運営者の企業横断確認、承認、却下、`app_instances` 追加はv1.3e以降または管理者画面拡張で扱う。
- ただし、2026-07-02の仕様見直しにより、購入者向けアプリ追加申請としては本線から外す。

## v1.3c app_add_requests migration / RLS実装案
- migration案: `supabase/migrations/20260701_v13c_app_add_requests.sql`
- `app_add_requests` は `company_account_id` と `app_id` を持つ申請専用テーブル。
- `apps.id` と `company_accounts.id` は既存schemaに合わせて `uuid` 参照にした。
- RLSは自社申請のselect / insertのみ許可する。
- insert時は `status = pending`、`admin_note` / `reviewed_at` / `reviewed_by` は空に制限する。
- ユーザーupdate / delete policy、運営者横断policyは今回作らない。
- 現行Supabase projectへ人間が手動適用済み。
- GitHub Pages公開版が現在のSupabase projectを参照しているため、現在のprojectは本番相当DBとして扱う。
- 現行Supabase projectへ適用する場合は、本番相当DBへのschema変更として扱う。
- 当初はv1.3dで `account.html` から `app_add_requests` への申請保存、申請済み表示の復元を実装する予定だったが、現在は停止。

## v1.3d account.html 申請DB保存
- 停止。
- 人間確認で、申請操作後に `app_add_requests` へ新しい行が追加されず、再読み込み後に申請状態が戻ることを確認。
- さらに、購入者向け利用申請として進める仕様が本線意図とズレているため、完了扱いにしない。
- 購入者側の「アプリ追加申請」は不要。無料 / β版は購入画面の確認後に利用開始できる設計、有料 / サブスクは正式な購入・決済または運営側の明示的な利用開始処理後に使える設計にする。
- `app_add_requests` はdropせずPARKED。購入者向け導線には使わない。
- account.htmlの該当UIは、別PRで一時停止表示に戻すか、購入者向けサポート申込として再設計する。

## v1.3仕様再整理
- 購入者向け: 購入後に即時利用開始し、必要に応じて初期設定サポート、使い方説明、カスタマイズ相談、導入代行を申し込む。
- クリエイター / 開発者向け: Works Marketへアプリ投稿 / 掲載申請する。
- 購入者向け利用申請と、クリエイター向けアプリ投稿申請を混ぜない。

## v1.3 購入前後の利用開始フロー整理
- 購入者側の「アプリ追加申請」は不要。
- 無料アプリは「利用開始」、有料アプリは「購入する」、β版アプリは「β版を試す」、準備中アプリは「準備中」、利用中アプリは「開く」とする。
- 相談型アプリは通常の商品カードには表示せず、問い合わせ、導入相談、カスタマイズ相談、開発相談の導線に分離する。
- 決済未実装中の有料予定アプリは、「有料化予定」または「購入確認」と表示しつつ、決済完了前には利用可能にしない。有料化前に無料で使わせたいものは、無料 / β版 / 無料トライアルとして分類する。
- 利用解除は物理削除ではなく、`app_instances` の `inactive` / `disabled` のような利用停止状態として扱い、再利用開始で戻せる方針にする。
- 任意サポートは、初期設定サポート、使い方説明、カスタマイズ相談、導入代行として購入前後に導線を置く。
- `account.html` の旧アプリ追加申請UIは、非表示または撤去方針にする。
- `app_add_requests` はdropせずPARKED。本線では使わず、購入者向けアプリ追加申請には使わない。
- クリエイター / 開発者向けアプリ投稿・掲載申請は将来フェーズに分離する。

## v1.3f 旧アプリ追加申請UIの撤去
- `account.html` から「アプリ追加申請を見る」、旧 `appRequestPanel`、旧申請フォーム、旧申請済み表示を撤去。
- `assets/js/accountPage.js` から旧 `app_add_requests` select / insert 処理、旧申請フォーム初期化、申請送信イベントを撤去。
- `assets/css/style.css` から旧申請UI専用 `.account-request-*` CSSを撤去。
- `app_add_requests` はdropしていない。
- Supabase migration、RLS、`app_instances`、`app_data`、`company_accounts`、`plan_status` は変更していない。
- 人間確認で、旧申請導線・旧申請セクション・旧申請フォームが表示されず、利用中アプリ一覧、企業情報編集フォーム、ログアウト導線、スマホ表示に大きな崩れがないことを確認済み。
- 購入 / 利用開始導線の実装は後続フェーズで扱う。

## v1.4 実アプリの商品化方針整理
- v1.4では、実アプリやコンテンツを「無料」「有料化予定」「β版」「準備中」「相談導線」「PARKED」に分類する。
- 無料アプリは `利用開始`、有料アプリは将来 `購入する`、β版は `β版を試す`、準備中は `準備中`、利用中は `開く` を基本CTAにする。
- 決済未実装中の有料予定アプリは、`有料化予定` と表示しつつ、支払い済みと誤解させない。必要に応じて `購入について相談する` を使う。
- 相談型アプリやカスタマイズ商品は通常購入カードから分離し、問い合わせ、導入相談、カスタマイズ相談、開発相談へ寄せる。
- SeatFlowはβ版 + 教室用相談導線として扱い、完全クラウド同期や複数レイアウト同期はPARKEDのままにする。
- `data/contents.json`、本体HTML / JS / CSS、Supabase migration、RLS、DB、GitHub Actionsは変更しない。

## Supabase本番/検証分離方針
- 正本: `docs/16_ENVIRONMENT_SEPARATION_POLICY.md`
- 現在のrepoには production / staging / test 用の別configがない。
- GitHub Pages公開版とローカル検証環境は、基本的に同じ `data/site-config.json` を読む。
- 2026-07-01の人間判断により、A案を採用する。
- 現在のSupabase projectを本番相当DBとして扱い、別途検証用Supabase projectを新規作成する。
- B案: 現在のprojectを検証用のまま扱い、別途本番用Supabase projectを作ってGitHub Pages公開版を切り替える。ただし、既存データ移行と設定切替の負担が大きい。
- 現行Supabase projectへのSQL適用は必ず `HUMAN_REQUIRED: YES` とする。

## 保留中の自動化候補
- A0.8 HUMAN_REQUIREDダッシュボード化: 運用対象が増えてから人間判断後に進める。

## 人間確認が必要な領域
- Supabase Dashboard操作
- APIキーやsecretの発行・入力
- GitHub Secrets / Pages / branch protection設定
- RLSやmigrationの実DB適用
- UIUX最終判断
- iPad / スマホ / PCでの目視確認
- 本番データ削除
- main反映判断

## A0.7 HUMAN_REQUIRED判定修正・安全PR自動マージ実装
- `HUMAN_REQUIRED` は「作業が残っているか」ではなく、「人間が実務として確認・判断・操作する必要があるか」で判定する。
- 人間がPR作成、レビュー、Actions確認、mainマージ、branch削除、GitHub Settings確認、Supabase確認、ブラウザ確認、UI判断、仕様判断を行う必要があれば `HUMAN_REQUIRED: YES`。
- GitHub auto-mergeが安全に設定済みで、人間が押すボタンや確認作業が残っていなければ `HUMAN_REQUIRED: NO` にできる。
- `.github/workflows/pr-safe-automerge.yml` を追加し、safeなdocs-only PRだけ自動マージ候補にする。
- fork PR、draft PR、workflow変更PR、HTML / JS / Supabase / migration / site-config変更PR、危険語追加PRは自動マージ対象外。
- A0.7 PR自身は `.github/workflows/**` を変更するため、自動マージ対象外。人間確認・人間マージが必要。

## A0.8/A0.9 docs-only自動マージ判定の厳密化
- docs-only PRでは、`service_role`、`sb_secret_`、`secret`、`disable row level security`、`RLS`、`migration` などが禁止語・確認語の説明として追加されるだけなら、自動マージ対象外にしない。
- 実secret値、private key block、RLS無効化SQL、Supabase設定値変更らしき追加は引き続き自動マージ禁止。
- `.github/workflows/pr-safe-automerge.yml` の判定は、単純な危険語出現ではなく、値代入や破壊的SQLらしき追加をブロックする。
- A0.8/A0.9 PR自身は `.github/workflows/**` を変更するため、自動マージ対象外。人間確認・人間マージが必要。

## PROJECT_STATUS更新ルール
このファイルは現在地の圧縮メモとして扱う。長い会話ログではなく、次作業に必要な状態だけを書く。

更新するタイミング:
- Phaseが完了したとき。
- 現在の作業対象が変わったとき。
- 本線を一時停止 / 再開したとき。
- STOP条件により人間確認待ちになったとき。
- 重要な保存先や前提が変わったとき。
- 既存仕様の優先順位が変わったとき。

書く内容:
- 現在の作業Phase。
- 完了済みPhase。
- 一時停止中の作業。
- 次の優先候補。
- 絶対に壊してはいけないもの。
- 人間確認が必要なもの。
- 本線再開条件。

書かない内容:
- 長い会話ログ。
- Codexの作業過程の全文。
- 古い試行錯誤。
- 個別エラーの長文ログ。
- APIキーやsecret。
- Supabase service_roleなどの秘密情報。

## 本線再開条件
- A0系の運用基盤が最低限整っている。
- GitHub ActionsまたはローカルQAで重大な失敗が残っていない。
- Supabase / UIUX / ブラウザ確認など、人間確認が必要な項目が整理されている。
- 本線再開Issueまたは作業票で、触ってよいファイルと触ってはいけないファイルが明確になっている。

## 半自動運用の初期実用ライン
A0.1〜A0.5までをCodex半自動運用の初期実用ラインとして扱う。

初期実用ラインに含むもの:
- STOP条件
- 報告フォーマット
- Issue運用
- ラベル運用
- QA workflow
- 文脈圧縮・引き継ぎ
- PRレビュー運用

A0.6はPR安全分類・docs-only自動マージ設計として進める。ただし、実際のGitHub Actions実装やauto-merge有効化は人間確認後に別作業で扱う。A0.6完了後は本線 v1.1b mock簡易管理者画面へ戻る。

## A0.6 PR安全分類・docs-only自動マージ設計
- 設計docsは完了。
- docs-only PRは自動マージ候補にできるが、実際の自動マージ有効化はまだ行わない。
- 本体UI / JS / CSS、Supabase、Auth、RLS、migration、site-config、GitHub workflowsに触れるPRは自動マージ禁止。
- secret / service_role / RLS無効化 / Supabase設定変更の疑いがあるPRは必ず `HUMAN_REQUIRED` とする。
- GitHub Actions案はdocsに残すだけで、workflowファイルは作らない。
- GitHub Settings、branch protection、Secrets、workflow permissions変更が必要になったら停止する。

## v0.18開始前確認（完了済み）
- mainを最新化した。
- GitHub Pages公開版がmain由来であることを確認した。
- `docs/00_PROJECT_STATUS.md` と `docs/06_TASK_QUEUE.md` が v0.18 NEXT になっていることを確認した。
- v0.17b / v0.17c / v0.17d の作業ブランチ実装を本線へ混ぜていない。
- 本体UI / JS / Supabase設定 / migration の不要な差分がないことを確認した。

## v0.18完了確認
- `fix/v018-portal-responsive-header` / `d3e0d72 fix: keep portal header visible on narrow screens` はmain反映済み。
- `/`、`/portal.html`、`/login.html`、`/signup.html`、`/account.html`、`/marketplace.html` は人間確認済み。
- 未ログイン時の `portal.html` login誘導、login後の `portal.html` 復帰、`account.html` 表示は人間確認済み。
- PC表示、スマホ表示、iPad相当幅で大きな崩れがないことを人間確認済み。
- `portal.html` のヘッダー非表示・大きな横崩れは解消済み。
- スマホ版の軽微なUI修正余地は別タスクとして扱う。
- v0.17b / v0.17c / v0.17d、復元実装、SeatFlow完全クラウド同期は引き続きPARKED。

## v1.0完成条件の整理（完了済み）
- signup / login / logoutが成立していること。
- 未ログイン時の `portal.html` login誘導とlogin後復帰が成立していること。
- `company_accounts` と `app_instances` をログイン中企業アカウント単位で取得できること。
- `account.html` に企業情報と利用アプリ一覧が表示されること。
- `works_portal` / `portal_state` が企業アカウント単位で保存・復元できること。
- 別企業アカウントと `portal_state` が混ざらないこと。
- GitHub Pages公開版で主要ページが開けること。
- Supabase設定、RLS、secret混入に重大問題がないこと。
- PARKED範囲がv1.0に混ざっていないこと。

## v1.1開始前の注意
- v1.1b mock簡易管理者画面は完了。
- `admin.html` は実データではなくmock企業データのみを表示する。
- mock企業一覧、企業詳細切替、企業ごとの利用アプリ一覧、`works_portal` / `portal_state` / `seatflow` / `seat_layout` の有無、異常状態mockは人間確認済み。
- 実DB接続、企業横断取得、管理用秘密キー、Supabase Dashboard操作、DB / RLS / migration変更は行っていない。
- 本物管理者画面へ進む場合は、管理者認証・管理者権限・企業横断データ閲覧・RLS・管理者API設計について人間判断が必要。
- service_role keyをフロントへ入れない。
- RLSを無効化しない。

## v1.2企業情報編集 方針整理
- 推奨画面は `account.html`。
- v1.2bの編集対象候補は `company_name`、`contact_name`、`business_type`、`phone`。
- `email` はAuthメールと混同しやすいため、v1.2bでは表示のみ推奨。編集する場合は人間判断が必要。
- `owner_user_id`、Auth user情報、`plan_status`、`app_instances`、`app_data`、`portal_state`、契約 / 決済 / 権限情報は編集しない。
- 住所、メモ、表示名は現行DBカラムにないためPARKED。
- v1.2bは完了。`account.html` に企業情報編集フォームを追加し、保存・取り消し・メール編集不可を人間確認済み。
- Supabase Dashboardで `company_name` / `contact_name` / `business_type` / `phone` のみ変更され、`email` / `owner_user_id` / `plan_status` は変更されていないことを人間確認済み。
- `company_accounts_update_own` policy は有効なまま、RLS無効化なし、service_role / sb_secret_ / secret不使用を人間確認済み。
