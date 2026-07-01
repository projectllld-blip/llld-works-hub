# 05 DECISION LOG

重要な判断はこのファイルに記録する。

## 記録形式
- 決定日:
- 決定内容:
- 理由:
- 影響範囲:
- 取り消し条件:

## 更新ルール
DECISION_LOGは重要な判断の記録に使う。単なる作業ログではなく、後から「なぜそうしたか」を確認するための場所とする。

記録する判断:
- 本線を止める / 再開する判断。
- Codexに任せる / 人間確認に戻す判断。
- 保存先の正式決定。
- UIUX方針の決定。
- Supabase / RLS / 権限に関する判断。
- GitHub運用方針。
- 破壊的変更を避ける判断。
- 古い仕様を破棄する判断。

推奨フォーマット:
```md
## YYYY-MM-DD: 決定タイトル

- 決定内容:
- 理由:
- 影響範囲:
- 関連Phase:
- 取り消し条件:
```

記録しないもの:
- 単なる作業ログ。
- 細かすぎる文言修正。
- 一時的な失敗ログ。
- secretやAPIキー。
- 個人情報や不要な機密情報。

## 2026-06-27 A0.1 初期決定

### 1. repo内ドキュメントを正とする
- 決定日: 2026-06-27
- 決定内容: Codex会話全文を引き継がず、repo内ドキュメントを正とする。
- 理由: 会話履歴が長くなると古い仕様と新しい仕様が混ざりやすい。
- 影響範囲: 以後のCodex作業、作業票、報告、引き継ぎ。
- 取り消し条件: repo内ドキュメントより信頼できる正式仕様管理方法を導入した場合。

### 2. ChatGPTの役割を設計・監督・レビューへ寄せる
- 決定日: 2026-06-27
- 決定内容: ChatGPTは毎回の中継役ではなく、設計・監督・レビュー役にする。
- 理由: 毎回の往復を減らし、Codexが安全に継続できる運用にするため。
- 影響範囲: 次プロンプト生成、HUMAN_REQUIRED判断、レビュー導線。
- 取り消し条件: Codex単独運用で品質が落ち、毎回の設計確認が必要になった場合。

### 3. Codexは実装と検査を担当する
- 決定日: 2026-06-27
- 決定内容: Codexは実装と検査を担当する。
- 理由: repo内の差分作成、構文確認、secret scan、GitHub反映まで一貫して処理しやすい。
- 影響範囲: AGENTS、Issueテンプレート、PRテンプレート、QA workflow。
- 取り消し条件: 外部サービス設定や本番判断まで自動化する別体制を作った場合。

### 4. HUMAN_REQUIREDで人間確認の要否を分ける
- 決定日: 2026-06-27
- 決定内容: `HUMAN_REQUIRED: YES/NO` で人間確認の要否を分ける。
- 理由: 人間が全文を読まずに止めるべき作業を判断できるようにするため。
- 影響範囲: Codex報告、PRテンプレート、Issue運用、将来のダッシュボード。
- 取り消し条件: GitHubラベルや専用ダッシュボードで同等以上に管理できる場合。

### 5. 本線停止と自動化基盤優先
- 決定日: 2026-06-27
- 決定内容: ポータル・マーケット本線は一旦停止し、自動化基盤を優先する。
- 理由: 本線開発を進める前に、Codexが危険な領域で止まれる運用を作るため。
- 影響範囲: v0.15以降の本線、A0系タスク。
- 取り消し条件: A0.1の最低限の基盤が整い、人間レビューで本線再開可と判断した場合。

## 2026-06-27 v0.15 main反映状況の確認

- 決定内容: mainにv0.14.12、v0.15、v0.15追加修正 / v0.15.1相当が反映済みであることを前提に、docs上の現在地をv0.16 NEXTへ揃える。
- 理由: mainにはポータル状態保存、エラー処理・空状態、未ログイン時のportal表示改善が含まれており、docsだけがv0.15未着手の状態で残っていたため。
- 影響範囲: `docs/00_PROJECT_STATUS.md`、`docs/06_TASK_QUEUE.md`、v0.16開始前の作業判断。
- 関連Phase: v0.14.12、v0.15、v0.15追加修正 / v0.15.1相当、v0.16。
- 取り消し条件: main上でv0.15相当の実装不足が見つかった場合。

## 2026-07-01 v0.17b以降をPARKED化しv0.18へ戻る

- 決定内容: v0.17a バックアップ・復元 方針整理は完了扱いにし、v0.17b / v0.17c / v0.17d はmain未反映のためPARKEDへ戻す。次の本線候補は v0.18 検証環境デプロイとする。
- 理由: `942e479 feat: add company backup JSON export` 以降のバックアップ導線は `fix/v016-seatflow-cloud-load` にのみ存在し、main / origin/main / GitHub Pages公開版には未反映だったため。公開版にボタンがない原因は表示条件ではなくmain未反映である。
- 影響範囲: `docs/00_PROJECT_STATUS.md`、`docs/06_TASK_QUEUE.md`、v0.18開始判断、バックアップ・復元タスクの再開判断。
- 関連Phase: v0.17a、v0.17b、v0.17c、v0.17d、v0.18。
- 取り消し条件: 人間判断により、v0.17b以降のバックアップ実装をmainへ取り込むPRを作成・レビュー・マージする場合。

## 2026-07-01 v0.18 検証環境デプロイ完了

- 決定内容: v0.18 検証環境デプロイを完了扱いにし、次の候補を v1.0 アカウント別クラウド基盤MVP完成とする。
- 理由: GitHub Pages公開版の主要ページ、認証・ポータル導線、PC / iPad / スマホ表示について人間確認が完了し、`portal.html` ヘッダーの大きな横崩れも `d3e0d72` で修正済みのため。スマホ版の軽微なUI調整余地は残るが、v0.18を止めるほどの重大な崩れではない。
- 影響範囲: `docs/04_フェーズ記録/phase0-18-verification-deploy.md`、`docs/00_PROJECT_STATUS.md`、`docs/06_TASK_QUEUE.md`、v1.0開始判断。
- 関連Phase: v0.18、v1.0。
- 取り消し条件: 公開版で認証導線、`portal_state` 保存・復元、RLS、またはPC / iPad / スマホ表示にv1.0前に止めるべき重大問題が見つかった場合。

## 2026-07-01 v1.0はアカウント別クラウド基盤MVPとする

- 決定内容: v1.0は販売開始や決済開始ではなく、企業アカウント単位の認証、企業情報、利用アプリ、`portal_state` 保存・復元、企業間分離が成立していることを確認するMVP完成宣言とする。
- 理由: 決済、購入履歴、権限管理、スタッフ個別ログイン、複数店舗管理、SeatFlow完全クラウド同期、バックアップ復元などを含めるとスコープが広がりすぎ、現在成立しているクラウド基盤の完了判断が曖昧になるため。
- 影響範囲: `docs/04_フェーズ記録/phase1-0-cloud-mvp-complete.md`、`docs/00_PROJECT_STATUS.md`、`docs/06_TASK_QUEUE.md`、v1.1以降のロードマップ。
- 関連Phase: v1.0、v1.1、v1.2、v1.3、v1.4、v1.5、v2.x。
- 取り消し条件: 人間判断により、販売機能や決済機能をv1.0へ前倒しで含める方針に変更する場合。

## 2026-07-01 v1.0 アカウント別クラウド基盤MVP完成

- 決定内容: v1.0 アカウント別クラウド基盤MVP完成を完了扱いにし、次の候補を v1.1 簡易管理者画面とする。
- 理由: v0.9.5〜v0.18で、企業アカウント単位のsignup / login / logout、`company_accounts`、`app_instances`、`works_portal`、`portal_state` 保存・復元、企業間分離、GitHub Pages検証環境、PC / iPad / スマホ表示確認まで揃ったため。販売機能や決済機能はv1.0に含めない方針が明確になっている。
- 影響範囲: `docs/04_フェーズ記録/phase1-0-cloud-mvp-complete.md`、`docs/00_PROJECT_STATUS.md`、`docs/06_TASK_QUEUE.md`、`docs/03_構想/roadmap-after-portal-uiux-change.md`、v1.1開始判断。
- 関連Phase: v1.0、v1.1。
- 取り消し条件: v1.0範囲内の認証、`portal_state` 保存・復元、企業間分離、RLS、または公開環境に重大な欠陥が見つかった場合。

## 2026-07-01 A0.6はdocs-only自動マージの安全分類から始める

- 決定内容: A0.6は、実際のGitHub Actions実装やauto-merge有効化ではなく、PR安全分類・docs-only自動マージ設計から始める。
- 理由: docs-only PRのマージ負担を減らしたい一方で、Supabase、RLS、Auth、migration、site-config、本体UI / JS、secretに関わる変更を自動マージするとデータ漏洩・認証破壊・他社データ混入の危険があるため。
- 影響範囲: `docs/14_PR_SAFE_AUTOMERGE_RULES.md`、`docs/11_LABEL_OPERATION_RULES.md`、`docs/01_AUTOMATION_ROADMAP.md`、`docs/02_STOP_CONDITIONS.md`、`docs/06_TASK_QUEUE.md`、GitHub PR運用。
- 関連Phase: A0.6。
- 取り消し条件: 人間判断により、GitHub Settings、branch protection、workflow permissions、auto-merge運用の安全条件が確定し、実装Phaseへ進む場合。

## 2026-07-01 v1.2企業情報編集はaccount.html内の自社基本情報に限定する

- 決定内容: v1.2企業情報編集は、まず `account.html` 内でログイン中企業アカウント自身の基本情報を編集する方針とする。対象候補は `company_name`、`contact_name`、`business_type`、`phone` に限定し、Auth user情報、`owner_user_id`、`plan_status`、`app_instances`、`app_data`、決済 / 契約 / 権限情報は扱わない。
- 理由: 既存RLSは `company_accounts.owner_user_id = auth.uid()` の自社行updateを想定しており、account画面が既に企業情報表示を担当しているため。メールや契約状態、利用アプリを編集対象にすると認証・決済・権限領域へ広がるため。
- 影響範囲: `docs/04_フェーズ記録/phase1-2-company-info-edit.md`、`docs/00_PROJECT_STATUS.md`、`docs/06_TASK_QUEUE.md`、v1.2b実装判断。
- 関連Phase: v1.2、v1.2b。
- 取り消し条件: 人間判断により、メール編集、住所 / メモ / 表示名のDBカラム追加、契約状態編集、管理者横断編集をv1.2へ含める方針に変更する場合。

## 2026-07-01 HUMAN_REQUIREDは人間の実務確認・操作有無で判定する

- 決定内容: `HUMAN_REQUIRED` は「作業が残っているか」ではなく、「人間が実務として確認・判断・操作する必要が残っているか」で判定する。
- 理由: `HUMAN_REQUIRED: NO` と報告されても、実際にはPR作成、レビュー、Actions確認、mainマージ、branch削除、ブラウザ確認などが残るズレをなくすため。
- 影響範囲: `docs/03_CODEX_REPORT_FORMAT.md`、`docs/15_HUMAN_REQUIRED_RULES.md`、Codex完了報告、PR運用、A0.7 workflow。
- 関連Phase: A0.7。
- 取り消し条件: GitHub側の自動化状態と人間確認状態を別システムでより正確に追跡できるようになった場合。

## 2026-07-01 safe docs-only PRはGitHub auto-merge候補にする

- 決定内容: `docs/**` と `README.md` だけを変更し、危険ファイル・危険語・fork・draft・workflow変更を含まないPRは、GitHub auto-merge候補にする。
- 理由: docs-only PRの確認・マージ・branch削除の手作業を減らしつつ、Supabase、RLS、Auth、migration、site-config、本体UI / JS、secret関連の危険変更を自動マージしないため。
- 影響範囲: `.github/workflows/pr-safe-automerge.yml`、`docs/14_PR_SAFE_AUTOMERGE_RULES.md`、`docs/11_LABEL_OPERATION_RULES.md`、GitHub PR運用。
- 関連Phase: A0.7。
- 取り消し条件: GitHub auto-merge、branch protection、required checks、ラベル運用で安全性を担保できないと分かった場合。

## 2026-07-01 v1.2b企業情報編集フォームMVPを完了扱いにする

- 決定内容: v1.2b 企業情報編集フォームMVPを完了扱いにし、次の本線候補を v1.3 アプリ追加申請とする。
- 理由: `account.html` 上で企業名 / 担当者名 / 業種 / 電話番号の編集、メールアドレス表示のみ、保存完了、再読み込み後の保持、変更取り消し導線が人間確認済み。Supabase Dashboardでも指定4項目のみ変更され、`email` / `owner_user_id` / `plan_status` が変わっていないことを確認済みのため。
- 影響範囲: `docs/04_フェーズ記録/phase1-2-company-info-edit.md`、`docs/00_PROJECT_STATUS.md`、`docs/06_TASK_QUEUE.md`、v1.3開始判断。
- 関連Phase: v1.2、v1.2b、v1.3。
- 取り消し条件: 企業情報保存で他社データ混入、RLS無効化、Auth user情報変更、または編集対象外カラム変更が見つかった場合。

## 2026-07-01 docs-only禁止語説明は自動マージブロック対象から外す

- 決定内容: docs-only PRでは、`service_role`、`sb_secret_`、`secret`、`disable row level security`、`RLS`、`migration` などを禁止語・確認語として説明するだけなら自動マージ対象外にしない。実secret値、private key block、RLS無効化SQLらしき追加は引き続きブロックする。
- 理由: STOP条件や安全ルールをdocsに書くたびに人間マージ必須になると、A0系の目的である安全な自動化が機能しにくくなるため。一方で実secret値やRLS無効化SQLは見逃せないため、値代入・秘密鍵ブロック・破壊的SQLを重点的に検出する。
- 影響範囲: `.github/workflows/pr-safe-automerge.yml`、`docs/14_PR_SAFE_AUTOMERGE_RULES.md`、`docs/15_HUMAN_REQUIRED_RULES.md`、`docs/02_STOP_CONDITIONS.md`、PR自動マージ運用。
- 関連Phase: A0.8/A0.9。
- 取り消し条件: docs説明語の許容により実secret値やRLS無効化SQLを見逃すリスクが高いと分かった場合。

## 2026-07-01 v1.3aアプリ追加申請はDB保存なしのUI mockから始める

- 決定内容: v1.3aでは、`account.html` 上に未利用アプリの追加申請導線を作るが、申請内容はDBへ保存しない。画面内状態だけで「申請を受け付けました」と表示する。
- 理由: 既存DB構造には申請内容を正式保存する専用テーブルがなく、`app_instances` は利用中アプリ、`app_data` はアプリ内データ保存用であり、申請ワークフローの正本として使うと意味が混ざるため。
- 影響範囲: `account.html`、`assets/js/accountPage.js`、`docs/04_フェーズ記録/phase1-3-app-add-request.md`、v1.3b以降のDB保存設計。
- 関連Phase: v1.3、v1.3a、v1.3b。
- 取り消し条件: 人間判断により、申請専用テーブル、RLS、migration、管理者確認画面の設計を行い、正式保存へ進む場合。

## 2026-07-01 v1.3aアプリ追加申請UI mockを完了扱いにする

- 決定内容: v1.3a アプリ追加申請UI mockを完了扱いにし、次の候補を v1.3b アプリ追加申請DB保存設計とする。
- 理由: 人間ブラウザ確認で、`account.html` 上の申請導線、フォーム表示、申請済み表示、利用中アプリ一覧と企業情報編集フォームへの影響なし、DB保存なし、localStorage保存なし、`app_instances` / `app_data` / `company_accounts` / `plan_status` 未更新が確認できたため。
- 影響範囲: `docs/04_フェーズ記録/phase1-3-app-add-request.md`、`docs/00_PROJECT_STATUS.md`、`docs/06_TASK_QUEUE.md`、v1.3b開始判断。
- 関連Phase: v1.3a、v1.3b。
- 取り消し条件: v1.3aの公開版で申請導線が表示されない、申請済み表示が動かない、またはDB / localStorage / `app_instances` などへの保存が見つかった場合。

## 2026-07-01 A0.9 safe docs-only判定は成功、auto-mergeはGitHub設定確認待ち

- 決定内容: PR #23では `safe-docs-automerge` 判定は成功している。auto-mergeが有効化されなかった主因は、GitHub APIの `Auto merge is not allowed for this repository` であり、GitHub Settingsの `Allow auto-merge` が無効または関連設定が不足している可能性が高い。
- 理由: PR #23のworkflowコメントに `AUTO_MERGE_ELIGIBLE: YES` / `AUTO_MERGE_STATUS: setup_required` と、GraphQL `enablePullRequestAutoMerge` の失敗理由が記録されていたため。Checks API上、`static-checks` と `classify-and-automerge` は成功している。
- 影響範囲: `.github/workflows/pr-safe-automerge.yml`、docs-only PR自動マージ運用、`docs/04_フェーズ記録/phase-a0-9-automerge-setup-investigation.md`。
- 関連Phase: A0.9。
- 取り消し条件: GitHub Settingsで `Allow auto-merge` がONであるにもかかわらず同じエラーが再現し、別原因が特定された場合。

## 2026-07-01 v1.3bアプリ追加申請は専用テーブルを正本にする

- 決定内容: アプリ追加申請の正式保存先は、既存の `app_instances`、`app_data`、`audit_logs` ではなく、専用テーブル `app_add_requests` として設計する。
- 理由: `app_instances` は利用中アプリの正本、`app_data` はアプリ本体の保存データ、`audit_logs` は監査ログであり、申請中 / 対応中 / 承認 / 却下などの業務状態を管理する用途と責務が違うため。申請作成と利用開始を分けないと、契約、確認、料金、準備状態が曖昧になる。
- 影響範囲: `docs/04_フェーズ記録/phase1-3b-app-add-request-db-design.md`、`docs/00_PROJECT_STATUS.md`、`docs/06_TASK_QUEUE.md`、v1.3c以降のmigration / RLS / 管理者確認フロー。
- 関連Phase: v1.3a、v1.3b、v1.3c。
- 取り消し条件: 人間判断により、既存テーブルで安全に申請ワークフローを表現できる別設計を採用する場合。

## 2026-07-01 v1系ロードマップは決済を後ろへ送る

- 決定内容: 当時の判断として、v1系は、v1.3c〜v1.3eでアプリ追加申請のDB保存と管理側確認を固めた後、v1.4 実アプリの商品化方針整理、v1.5 販売用UI/UX強化、v1.6 購入ページ、v1.7 販売前QA・導入テスト、v1.8 決済・購入履歴の順に進めるとしていた。2026-07-02の「v1.3 購入前後の利用開始フロー整理」決定により、この順番は上書きされた。
- 理由: 決済実装を先に進めると、何を商品として見せるか、販売UIでどう説明するか、購入ページで何を約束するかが曖昧なまま支払い導線だけが先行するため。小さい会社向けには、買いやすさと説明の分かりやすさを固めてから決済に進む方が安全。
- 影響範囲: `docs/00_PROJECT_STATUS.md`、`docs/06_TASK_QUEUE.md`、`docs/03_構想/roadmap-after-portal-uiux-change.md`、`docs/04_フェーズ記録/phase1-0-cloud-mvp-complete.md`。
- 関連Phase: v1.3c、v1.3d、v1.3e、v1.4、v1.5、v1.6、v1.7、v1.8。
- 取り消し条件: 人間判断により、決済・購入履歴を販売UIや購入ページより前に実装する必要が明確になった場合。

## 2026-07-01 v1.3c app_add_requestsは自社申請作成・読込だけに絞る

- 決定内容: v1.3cのmigration / RLS案では、`app_add_requests` に対してログイン中ユーザーの自社申請select / insertだけを許可し、ユーザーupdate / delete policyと運営者横断policyは作らない。
- 理由: ユーザーが `status`、`admin_note`、`reviewed_at`、`reviewed_by` を自由に変更できると申請状態の正本が崩れるため。運営者横断確認には、管理者認証・管理者権限・企業横断閲覧の安全設計が必要で、v1.3cで急いで入れると他社データ混入リスクがあるため。
- 影響範囲: `supabase/migrations/20260701_v13c_app_add_requests.sql`、`docs/04_フェーズ記録/phase1-3c-app-add-requests-migration-rls.md`、v1.3d / v1.3e。
- 関連Phase: v1.3c、v1.3d、v1.3e。
- 取り消し条件: 人間判断により、ユーザー取り下げupdateや運営者横断policyを安全に設計・実装するPhaseへ進む場合。

## 2026-07-01 現在のSupabase projectは運用上本番相当DBとして扱う

- 決定内容: GitHub Pages公開版が `data/site-config.json` を参照し、現在のSupabase projectへ接続しているため、docs上は検証用として始まったprojectであっても、運用上は本番相当DBとして扱う。新しく作るSupabase projectを検証用DBとする。現行Supabase projectへのmigration / RLS / schema変更 / `app_data` / `app_instances` / Auth関連変更は本番相当DBへの変更として扱い、SQL適用は必ず `HUMAN_REQUIRED: YES` とする。
- 理由: production / staging / test 用の別configがrepo内になく、GitHub Pages公開版とローカル検証が同じSupabase設定を見ている可能性があるため。検証作業のつもりでSQLを適用すると、公開環境が参照するDB schemaへ反映されるリスクがある。
- 影響範囲: `docs/16_ENVIRONMENT_SEPARATION_POLICY.md`、`docs/04_フェーズ記録/phase1-3c-environment-separation-policy.md`、`docs/04_フェーズ記録/phase1-3c-app-add-requests-migration-rls.md`、`docs/00_PROJECT_STATUS.md`、`docs/06_TASK_QUEUE.md`、v1.3c / v1.3d。
- 関連Phase: v1.3c、v1.3d、Supabase本番/検証分離方針整理。
- 取り消し条件: 人間判断により別の本番Supabase projectを作成し、GitHub Pages公開版をそちらへ切り替え、現在のprojectを検証用として扱う方針に変更した場合。

## 2026-07-02 v1.3c app_add_requests migrationを本番相当DBへ手動適用済み

- 決定内容: 現行Supabase projectを本番相当DBとして扱ったうえで、人間が `supabase/migrations/20260701_v13c_app_add_requests.sql` をSQL全文確認後にSQL Editorで手動適用した。`app_add_requests` テーブル、RLS有効、select / insert policyを確認済み。
- 理由: v1.3dで `account.html` からアプリ追加申請を正式保存するには、申請専用テーブル `app_add_requests` が必要なため。
- 影響範囲: `account.html`、`assets/js/accountPage.js`、`docs/04_フェーズ記録/phase1-3d-app-request-db-save.md`、v1.3d / v1.3e。
- 関連Phase: v1.3c、v1.3d。
- 取り消し条件: `app_add_requests` のRLS不備、他社申請閲覧、他社 `company_account_id` でのinsert、または既存データへの想定外影響が見つかった場合。

## 2026-07-02 v1.3d購入者向けアプリ利用申請は停止する

- 決定内容: v1.3d account.html 申請DB保存は完了扱いにしない。`app_add_requests` は削除せずPARKED扱いにし、購入者向け導線には使わない。購入者向け導線は「購入 / 利用開始 -> 任意サポート申込」として再整理し、クリエイター / 開発者向けの「アプリ追加」はアプリ投稿 / 掲載申請機能として別フェーズに分離する。
- 理由: 人間確認で `account.html` からの申請が `app_add_requests` に保存されていないことが分かったため。また、本来の「アプリ追加」は購入者が既存アプリ利用申請を出す意味ではなく、クリエイター / 開発者がWorks Marketにアプリを追加する意味だったため。
- 影響範囲: `account.html`、`assets/js/accountPage.js`、`app_add_requests`、`docs/04_フェーズ記録/phase1-3-spec-realignment.md`、v1.3以降のロードマップ。
- 関連Phase: v1.3a、v1.3b、v1.3c、v1.3d、v1.4以降。
- 取り消し条件: 人間判断により、購入者向け利用申請を本線機能として復活させる場合。

## 2026-07-02 v1.3は購入前後の利用開始フロー整理に改名する

- 決定内容: v1.3の正本名称を「購入前後の利用開始フロー整理」に変更する。購入者側のアプリ追加申請は不要とし、購入画面で「購入」または「利用開始」を押すとアプリを使える設計にする。無料アプリは「利用開始」、有料アプリは「購入する」、β版アプリは「β版を試す」、相談型アプリは通常カードから分離、準備中アプリは「準備中」、利用中アプリは「開く」とする。
- 理由: 購入者が既存アプリの利用申請を出す導線は、販売マーケットの自然な購入体験とズレるため。購入者には即時利用と任意サポート導線を用意し、クリエイター / 開発者によるアプリ投稿・掲載申請は別フェーズで扱う方が安全で分かりやすい。
- 影響範囲: `docs/04_フェーズ記録/phase1-3-purchase-start-flow-realignment.md`、`docs/04_フェーズ記録/phase1-3-app-add-request.md`、`docs/04_フェーズ記録/phase1-3b-app-add-request-db-design.md`、`docs/04_フェーズ記録/phase1-3c-app-add-requests-migration-rls.md`、`docs/00_PROJECT_STATUS.md`、`docs/06_TASK_QUEUE.md`、`docs/03_構想/roadmap-after-portal-uiux-change.md`。
- 関連Phase: v1.3、v1.4、v1.5、v1.6、v1.7、v1.8、v1.9、v2.x。
- 取り消し条件: 人間判断により、購入者向けの既存アプリ利用申請を本線へ戻す場合。

## 2026-07-02 旧購入者向けアプリ追加申請UIを撤去する

- 決定内容: `account.html` から旧購入者向け「アプリ追加申請」UIを撤去する。`assets/js/accountPage.js` から `app_add_requests` のselect / insertを含む旧申請処理を撤去する。`app_add_requests` はdropせずPARKED扱いのまま残す。
- 理由: 旧UIを残すと、購入者が「申請しないとアプリを使えない」と誤解するため。購入者は購入画面で「購入」または「利用開始」を押すことでアプリを使える設計にする。
- 影響範囲: `account.html`、`assets/js/accountPage.js`、`assets/css/style.css`、`docs/04_フェーズ記録/phase1-3f-remove-buyer-app-request-ui.md`。
- 関連Phase: v1.3、v1.3f、v1.4、v1.6、v1.7。
- 取り消し条件: 人間判断により、購入者向けの既存アプリ利用申請を本線へ戻す場合。

## 2026-07-02 v1.4は購入ページ前の商品化方針整理に限定する

- 決定内容: v1.4では、実アプリやコンテンツを「無料」「有料化予定」「β版」「準備中」「相談導線」「PARKED」に分類し、購入ページや決済より前に商品カードでどう見せるかを整理する。`data/contents.json`、本体UI、Supabase、RLS、migration、決済は変更しない。
- 理由: 購入者向けアプリ追加申請を本線から外したため、次に必要なのはDB保存や決済ではなく、既存アプリを商品としてどう説明し、何を今すぐ使えるもの / 相談が必要なもの / 準備中のものとして見せるかを決めること。これを決めずに購入ページへ進むと、購入、利用開始、相談、β利用の意味が混ざるため。
- 影響範囲: `docs/04_フェーズ記録/phase1-4-productization-policy.md`、`docs/00_PROJECT_STATUS.md`、`docs/06_TASK_QUEUE.md`、`docs/03_構想/roadmap-after-portal-uiux-change.md`、v1.5 / v1.6。
- 関連Phase: v1.4、v1.5、v1.6、v1.7、v1.8、v1.9。
- 取り消し条件: 人間判断により、先に価格、購入ページ、決済、または `data/contents.json` の商品データ変更へ進む方針に変更する場合。
