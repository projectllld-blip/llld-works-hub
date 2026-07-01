# 00 PROJECT STATUS

## 現在の最新フェーズ
v1.0 アカウント別クラウド基盤MVP完成まで完了。

GitHub Pages公開版、認証・ポータル導線、PC / iPad / スマホ表示の大きな崩れがないことを人間確認済み。

v1.0は販売開始ではなく、企業アカウント単位のクラウド基盤MVP完成宣言。

現在はv1.1b mock簡易管理者画面まで完了。次の本線候補は v1.2 企業情報編集。

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
- A0.1 Codex半自動運用基盤
- A0.2 GitHub Issue運用化
- A0.3 QA自動チェック強化
- A0.4 Codex文脈圧縮・引き継ぎ運用
- A0.5 PRレビュー運用

## 一時停止中の本線
- `portal.html` の新規機能開発。ただし次の本線候補は v1.2 企業情報編集。
- `marketplace.html` の新規機能開発。ただし次の本線候補は v1.2 企業情報編集。
- 本体HTMLアプリの機能追加
- Supabase migration本体の実装・実DB適用
- GitHub Pages設定変更
- SeatFlow完全クラウド同期。複数レイアウト、名簿、QR、NFC、メモ、履歴、競合解決、同時編集はPARKED。
- v0.17b バックアップJSONエクスポートMVP。作業ブランチに実装はあるがmain未反映のためPARKED。
- v0.17c バックアップJSON読込・検証・プレビュー。作業ブランチに実装はあるがmain未反映のためPARKED。
- v0.17d 限定復元設計。作業ブランチに設計docsはあるがmain未反映のためPARKED。

## 進行中の自動化プロジェクト
- なし

## 進行中の本線
- なし。

## 今回の寄り道プロジェクト
- A0.1 Codex半自動運用基盤: 完了
- A0.2 GitHub Issue運用化: 完了
- A0.3 QA自動チェック強化: 完了
- A0.4 Codex文脈圧縮・引き継ぎ運用: 完了
- A0.5 PRレビュー運用: 完了
- A0.6 PR安全分類・docs-only自動マージ設計: 完了
- A0.7 HUMAN_REQUIREDダッシュボード化: 保留

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
- service_role key、DB password、private key、GitHub token、OpenAI API key、Stripe secret key、その他secretはrepoへ入れない。
- フロントに置いてよいのは公開前提のSupabase anon / public / publishable keyのみ。
- 既存のSupabase設定を勝手に書き換えない。

## 次の本線候補
- v1.2 企業情報編集
- v1.3 アプリ追加申請
- v1.4 購入ページ
- v1.5 決済・購入履歴
- v1.6 実アプリの商品化
- v1.7 販売用UI/UX強化
- v1.8 販売前QA・導入テスト
- v1.9 β販売開始
- v2.0 小規模事業者向け販売版

## PARKED中の本線候補
- v0.17b バックアップJSONエクスポートMVP: `fix/v016-seatflow-cloud-load` には実装があるが、main / GitHub Pages公開版には未反映。現時点では本線に入れない。
- v0.17c バックアップJSON読込・検証・プレビュー: `fix/v016-seatflow-cloud-load` には実装があるが、main / GitHub Pages公開版には未反映。現時点では本線に入れない。
- v0.17d 限定復元設計: `fix/v016-seatflow-cloud-load` には設計docsがあるが、main未反映。復元は未実装のままにする。
- SeatFlow完全クラウド同期: 複数レイアウト同期、名簿 / QR / NFC / メモ保存、全体状態の完全バックアップ・復元、複数タブ競合解決、正式商品化に必要な保存対象整理は将来タスク。
- 決済、購入履歴、スタッフ個別ログイン、権限管理、複数店舗管理、自動決済はv1.0には含めない。
- Supabase Storage、ファイル本体保存、バックアップ復元の実装はv1.0には含めない。

## 保留中の自動化候補
- A0.6の実装段階: GitHub Actions実装、GitHub Settings、branch protection、auto-merge有効化は人間判断後に進める。
- A0.7 HUMAN_REQUIREDダッシュボード化: 運用対象が増えてから人間判断後に進める。

## 人間確認が必要な領域
- Supabase Dashboard操作
- APIキーやsecretの発行・入力
- GitHub Secrets / Pages / branch protection設定
- RLSやmigrationの実DB適用
- UIUX最終判断
- iPad / スマホ / PCでの目視確認
- 本番データ削除
- main反映判断

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
