# 00 PROJECT STATUS

## 現在の最新フェーズ
v0.18 検証環境デプロイのCodex確認まで完了。GitHub Pages主要URLとsite-configは確認済み。公開版のブラウザ操作、Supabase Auth URL設定、RLS最終確認は人間確認待ち。

LLLD Works Hub / Works Market は、社内ポータル・販売マーケット・小型業務アプリ群を統合するプロジェクトです。

現在は、A0.1〜A0.5 Codex半自動運用の初期実用ラインが完了し、本線 v0.18 検証環境デプロイの公開URL確認まで進んでいます。

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
- v0.18 検証環境デプロイ: Codex確認範囲まで。GitHub Pages主要URL HTTP 200、`site-config` JSON parse、Supabase public設定、secret混入なしを確認。
- A0.1 Codex半自動運用基盤
- A0.2 GitHub Issue運用化
- A0.3 QA自動チェック強化
- A0.4 Codex文脈圧縮・引き継ぎ運用
- A0.5 PRレビュー運用

## 一時停止中の本線
- `portal.html` の新規機能開発。ただし次の本線候補は v0.18 検証環境デプロイ。
- `marketplace.html` の新規機能開発。ただし次の本線候補は v0.18 検証環境デプロイ。
- 本体HTMLアプリの機能追加
- Supabase migration本体の実装・実DB適用
- GitHub Pages設定変更
- SeatFlow完全クラウド同期。複数レイアウト、名簿、QR、NFC、メモ、履歴、競合解決、同時編集はPARKED。
- v0.17b バックアップJSONエクスポートMVP。作業ブランチに実装はあるがmain未反映のためPARKED。
- v0.17c バックアップJSON読込・検証・プレビュー。作業ブランチに実装はあるがmain未反映のためPARKED。
- v0.17d 限定復元設計。作業ブランチに設計docsはあるがmain未反映のためPARKED。

## 進行中の自動化プロジェクト
- なし

## 今回の寄り道プロジェクト
- A0.1 Codex半自動運用基盤: 完了
- A0.2 GitHub Issue運用化: 完了
- A0.3 QA自動チェック強化: 完了
- A0.4 Codex文脈圧縮・引き継ぎ運用: 完了
- A0.5 PRレビュー運用: 完了
- A0.6 Codex GitHub Action連携検討: 保留
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
- v1.0 アカウント別クラウド基盤MVP完成: v0.18の人間確認完了後に判断する。

## PARKED中の本線候補
- v0.17b バックアップJSONエクスポートMVP: `fix/v016-seatflow-cloud-load` には実装があるが、main / GitHub Pages公開版には未反映。現時点では本線に入れない。
- v0.17c バックアップJSON読込・検証・プレビュー: `fix/v016-seatflow-cloud-load` には実装があるが、main / GitHub Pages公開版には未反映。現時点では本線に入れない。
- v0.17d 限定復元設計: `fix/v016-seatflow-cloud-load` には設計docsがあるが、main未反映。復元は未実装のままにする。
- SeatFlow完全クラウド同期: 複数レイアウト同期、名簿 / QR / NFC / メモ保存、全体状態の完全バックアップ・復元、複数タブ競合解決、正式商品化に必要な保存対象整理は将来タスク。

## 保留中の自動化候補
- A0.6 Codex GitHub Action連携検討: GitHub Secrets、GitHub Settings、外部連携が絡む可能性があるため人間判断後に進める。
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
- GitHub Pages公開版でのsignup / login / logout確認
- 公開版での `portal_state` 保存・復元確認
- 甲乙など別企業アカウントでのデータ分離確認
- v1.0へ進むかの最終判断

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

A0.6 / A0.7へ進むかは、人間確認後に判断する。現時点の次候補は本線 v0.18 検証環境デプロイ。

## v0.18開始前確認
- mainを最新化する。
- GitHub Pages公開版がmain由来であることを確認する。
- `docs/00_PROJECT_STATUS.md` と `docs/06_TASK_QUEUE.md` が v0.18 NEXT になっていることを確認する。
- v0.17b / v0.17c / v0.17d の作業ブランチ実装を本線へ混ぜない。
- 本体UI / JS / Supabase設定 / migration の不要な差分がないことを確認する。

## v0.18確認結果
- GitHub Pages主要URLはHTTP 200確認済み。
- `data/site-config.json` はJSON parse可能。
- `auth.mode = supabase`。
- Supabase URL / anon keyは存在する。
- secretらしき文字列は `data/site-config.json` に含まれていない。
- v0.17b / v0.17c / v0.17d、復元、SeatFlow完全クラウド同期は引き続きPARKED。
- v1.0へ進むには、人間による公開版ブラウザ確認、Supabase Auth URL設定確認、RLS最終確認が必要。
