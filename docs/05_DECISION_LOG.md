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
