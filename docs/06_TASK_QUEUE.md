# 06 TASK QUEUE

## DONE
- A0.1 Codex半自動運用基盤
- A0.2 GitHub Issue運用化
- A0.3 QA自動チェック強化
- A0.4 Codex文脈圧縮・引き継ぎ運用
- A0.5 PRレビュー運用
- A0.6 PR安全分類・docs-only自動マージ設計
- A0.7 HUMAN_REQUIRED判定修正・安全PR自動マージ実装
- A0.8/A0.9 docs-only自動マージ判定の厳密化
- v0.15 エラー処理・空状態
- v0.15追加修正 / v0.15.1相当
- v0.16 RLS・他社データ混入テスト
- v0.17a バックアップ・復元 方針整理
- v0.18 検証環境デプロイ
- v1.0 アカウント別クラウド基盤MVP完成
- v1.1b mock簡易管理者画面
- v1.2 企業情報編集 方針整理
- v1.2b 企業情報編集フォームMVP
- v1.3a アプリ追加申請UI mock
- v1.3b アプリ追加申請DB保存設計
- v1.3c app_add_requests migration / RLS実装案

## IN_PROGRESS
- A0.9 自動マージセットアップ不足調査: docs整理は完了。GitHub Settingsで `Allow auto-merge` / branch protection / required checks / workflow permissions の人間確認待ち。

## NEXT
- v1.3d account.html 申請DB保存
- v1.3e 管理者側 申請確認MVP
- v1.4 実アプリの商品化方針整理
- v1.5 販売用UI/UX強化
- v1.6 購入ページ
- v1.7 販売前QA・導入テスト
- v1.8 決済・購入履歴
- v1.9 β販売開始
- v2.0 小規模事業者向け販売版

## PARKED
- A0.8 HUMAN_REQUIREDダッシュボード化
- v0.17b バックアップJSONエクスポートMVP
- v0.17c バックアップJSON読込・検証・プレビュー
- v0.17d 限定復元設計
- SeatFlow完全クラウド同期
- SeatFlow複数レイアウト同期
- SeatFlow名簿 / QR / NFC / メモのクラウド保存
- SeatFlow全体状態の完全バックアップ・復元
- SeatFlow複数タブ競合解決
- SeatFlow正式商品化に必要な保存対象整理
- 復元実装
- 決済
- 購入履歴
- スタッフ個別ログイン
- 権限管理
- 複数店舗管理
- 自動決済
- Supabase Storage
- ファイル本体保存
- 高度管理者ダッシュボード

## 運用ルール
- 先頭の作業から順に進める。
- STOP条件に該当した作業は、完了扱いにせず `HUMAN_REQUIRED` として残す。
- A0.1〜A0.5はCodex半自動運用の初期実用ラインとして扱う。
- A0.6 / A0.7 はGitHub Secrets、GitHub Settings、外部連携に踏み込む可能性があるため、人間確認後に進める。
- A0.6ではPR安全分類とdocs-only自動マージを設計する。実際のGitHub Actions実装やauto-merge有効化は人間確認後に別作業で扱う。
- A0.7ではHUMAN_REQUIRED判定修正と安全docs-only PRのGitHub auto-merge workflowを追加した。ただしworkflow変更PR自身は人間確認・人間マージが必要。
- A0.8/A0.9ではdocs-only自動マージ判定を厳密化し、禁止語・確認語の説明だけではブロックせず、実secret値・private key block・RLS無効化SQLらしき追加だけをブロックする。ただしworkflow変更PR自身は人間確認・人間マージが必要。
- A0.9自動マージセットアップ不足調査では、PR #23でsafe docs-only判定は成功したが、`Auto merge is not allowed for this repository` によりauto-merge有効化が失敗した。GitHub Settings確認は人間作業。
- v1.1bは実DB接続なしのmock簡易管理者画面。mock企業一覧、企業詳細切替、利用アプリ一覧、保存有無、異常状態mockは人間確認済み。企業横断取得、本物の管理者権限、DB / RLS変更は含めない。
- v1.2bは `account.html` 内の自社企業情報編集MVP。`company_name` / `contact_name` / `business_type` / `phone` の編集、`email` 表示のみ、保存後のSupabase Dashboard確認、RLS有効確認は人間確認済み。
- v1.3aはDB保存なしのアプリ追加申請UI mockとして完了。正式保存には申請専用テーブル、RLS、migration設計が必要なため、v1.3bで人間確認前提の設計から扱う。
- v1.3bでは、アプリ追加申請の正式保存先として `app_add_requests` 専用テーブル案を整理した。`app_instances`、`app_data`、`audit_logs` には申請の正本を入れない。次のv1.3cでmigration / RLSへ進む場合は、人間確認を前提にする。
- v1.3cでは、`app_add_requests` 作成migration案とRLS policy案を作成した。実DBへは未適用。v1.3dへ進む前に、人間がSupabase Dashboard / SQL Editorで確認・適用・RLS確認する。
- v1系ロードマップは、v1.3c〜v1.3eでアプリ追加申請のDB保存と確認導線を固め、v1.4で実アプリの商品化方針整理、v1.5で販売用UI/UX強化、v1.6で購入ページ、v1.7で販売前QAを行い、v1.8で初めて決済・購入履歴へ進む。
- 本線へ戻るにはPROJECT_STATUSで再開条件を確認する。

## ステータス分類
- `DONE`: 完了済み。
- `IN_PROGRESS`: 現在進行中。
- `NEXT`: 次に進める候補。
- `BLOCKED`: 技術的・設定的に止まっている。
- `HUMAN_REQUIRED`: 人間確認が必要。
- `PARKED`: 今はやらないが後で戻る。

## 自動化プロジェクトと本線の分離
- A0.x はCodex半自動運用プロジェクト。
- v0.x / v1.x はLLLD Works Hub / Works Market本線。
- A0.x中は本線を勝手に進めない。
- 本線へ戻る場合も、Issueまたは短い作業票で触ってよいファイルと触ってはいけないファイルを明確にする。
