# 00 PROJECT STATUS

## 現在の最新フェーズ
v1.0 アカウント別クラウド基盤MVP完成まで完了。

GitHub Pages公開版、認証・ポータル導線、PC / iPad / スマホ表示の大きな崩れがないことを人間確認済み。

v1.0は販売開始ではなく、企業アカウント単位のクラウド基盤MVP完成宣言。

現在はv1.3c app_add_requests migration / RLS実装案まで作成済み。A0.9 自動マージセットアップ不足調査では、GitHub側の `Allow auto-merge` 設定確認が必要と判定し、その後人間側でONにしたが、PR #25 / #26では `Pull request is in unstable status` により `AUTO_MERGE_STATUS: setup_required` が継続した。次の本線候補は、人間がv1.3c migrationをSupabaseへ適用・確認した後の v1.3d account.html 申請DB保存。

v1系ロードマップは、決済を急がず、アプリ追加申請のDB保存、実アプリの商品化方針、販売用UI/UX、購入ページ、販売前QAの後に決済・購入履歴へ進む順番へ見直した。

v1.3a アプリ追加申請UI mockはPR #21 / #22でmain反映済み。人間ブラウザ確認で、`account.html` 上の申請導線、申請フォーム、申請済み表示、DB保存なし、localStorage保存なし、`app_instances` / `app_data` / `company_accounts` / `plan_status` 未更新を確認済み。正式なDB保存は未実装で、専用テーブル / RLS / migration設計が必要なため別Phaseで扱う。

v1.3b アプリ追加申請DB保存設計では、正式保存先を既存 `app_instances` / `app_data` / `audit_logs` に流用せず、申請専用テーブル `app_add_requests` を新規設計する方針を整理した。申請作成と利用開始は分離し、申請作成だけでは `app_instances` を追加しない。

v1.3c app_add_requests migration / RLS実装案では、`supabase/migrations/20260701_v13c_app_add_requests.sql` を追加した。実DBには未適用。環境分離状況確認の結果、GitHub Pages公開版も現在のSupabase projectを参照しているため、現在のSupabase projectは運用上本番相当DBとして扱う。環境方針が人間判断で確定するまで、v1.3c migration適用とv1.3d DB保存実装は停止する。

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
- v1.3a アプリ追加申請UI mock: `account.html` で未利用アプリを見て追加申請の操作感を確認できるUI mockを実装。DB保存、localStorage保存、`app_instances` 追加、`app_data` 保存、`company_accounts` / `plan_status` 更新は行わないことを人間確認済み。
- v1.3b アプリ追加申請DB保存設計: 正式保存用の `app_add_requests` テーブル案、columns案、status案、RLS方針、`app_instances` / `app_data` / `audit_logs` と分ける理由、ユーザー側 / 運営側フロー、v1.3c以降の候補を整理。
- v1.3c app_add_requests migration / RLS実装案: `app_add_requests` 作成migration案と、自社申請のみselect / insertできるRLS policy案を作成。実DB適用は未実施。
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
- `portal.html` の新規機能開発。ただし次の本線候補は v1.3c app_add_requests migration / RLS実装。
- `marketplace.html` の新規機能開発。ただし次の本線候補は v1.3c app_add_requests migration / RLS実装。
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
- なし。

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
- GitHub Pages公開版は `data/site-config.json` を参照しており、現在のSupabase projectを見ている。docs上「検証用」と呼ばれていても、運用上は本番相当DBとして扱う。
- v1.3c `app_add_requests` migrationは、環境方針が人間判断で確定するまで実DBへ適用しない。
- service_role key、DB password、private key、GitHub token、OpenAI API key、Stripe secret key、その他secretはrepoへ入れない。
- フロントに置いてよいのは公開前提のSupabase anon / public / publishable keyのみ。
- 既存のSupabase設定を勝手に書き換えない。

## 次の本線候補
- v1.3c app_add_requests migration適用先の人間判断
- v1.3d account.html 申請DB保存
- v1.3e 管理者側 申請確認MVP
- v1.4 実アプリの商品化方針整理
- v1.5 販売用UI/UX強化
- v1.6 購入ページ
- v1.7 販売前QA・導入テスト
- v1.8 決済・購入履歴
- v1.9 β販売開始
- v2.0 小規模事業者向け販売版

決済・購入履歴は、商品化方針、販売用UI/UX、購入ページ、販売前QAが固まった後に進める。

## PARKED中の本線候補
- v0.17b バックアップJSONエクスポートMVP: `fix/v016-seatflow-cloud-load` には実装があるが、main / GitHub Pages公開版には未反映。現時点では本線に入れない。
- v0.17c バックアップJSON読込・検証・プレビュー: `fix/v016-seatflow-cloud-load` には実装があるが、main / GitHub Pages公開版には未反映。現時点では本線に入れない。
- v0.17d 限定復元設計: `fix/v016-seatflow-cloud-load` には設計docsがあるが、main未反映。復元は未実装のままにする。
- SeatFlow完全クラウド同期: 複数レイアウト同期、名簿 / QR / NFC / メモ保存、全体状態の完全バックアップ・復元、複数タブ競合解決、正式商品化に必要な保存対象整理は将来タスク。
- 決済、購入履歴、スタッフ個別ログイン、権限管理、複数店舗管理、自動決済はv1.0には含めない。
- Supabase Storage、ファイル本体保存、バックアップ復元の実装はv1.0には含めない。

## v1.3b アプリ追加申請DB保存設計
- `v1.3a` はDB保存なしのUI mockとして完了。
- 正式保存には申請専用テーブル `app_add_requests` を使う方針。
- `app_instances` は利用中アプリの正本であり、申請作成だけでは追加しない。
- `app_data` はアプリ本体の保存データであり、申請ワークフローには使わない。
- `audit_logs` は監査ログであり、申請の対応待ちデータとして流用しない。
- RLSは `company_account_id` を分離キーにし、自社申請だけをinsert / selectできる方針。
- 運営者の企業横断確認、承認、却下、`app_instances` 追加はv1.3e以降または管理者画面拡張で扱う。
- 次に進む場合は `v1.3c app_add_requests migration / RLS実装` とし、migration / RLS / 実DB適用は人間確認が必要。

## v1.3c app_add_requests migration / RLS実装案
- migration案: `supabase/migrations/20260701_v13c_app_add_requests.sql`
- `app_add_requests` は `company_account_id` と `app_id` を持つ申請専用テーブル。
- `apps.id` と `company_accounts.id` は既存schemaに合わせて `uuid` 参照にした。
- RLSは自社申請のselect / insertのみ許可する。
- insert時は `status = pending`、`admin_note` / `reviewed_at` / `reviewed_by` は空に制限する。
- ユーザーupdate / delete policy、運営者横断policyは今回作らない。
- 実DBへは未適用。
- GitHub Pages公開版が現在のSupabase projectを参照しているため、現在のprojectは本番相当DBとして扱う。
- 環境方針が確定するまで、Supabase SQL Editorで適用しない。
- v1.3dへ進む前に、人間が適用先projectを明示し、migration SQL全文確認、SQL Editor適用、RLS確認を行う必要がある。

## Supabase本番/検証分離方針
- 正本: `docs/16_ENVIRONMENT_SEPARATION_POLICY.md`
- 現在のrepoには production / staging / test 用の別configがない。
- GitHub Pages公開版とローカル検証環境は、基本的に同じ `data/site-config.json` を読む。
- 推奨候補はA案: 現在のSupabase projectを本番相当DBとして扱い、別途検証用Supabase projectを新規作成する。
- B案: 現在のprojectを検証用のまま扱い、別途本番用Supabase projectを作ってGitHub Pages公開版を切り替える。ただし、既存データ移行と設定切替の負担が大きい。
- 最終判断は人間が行う。

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
