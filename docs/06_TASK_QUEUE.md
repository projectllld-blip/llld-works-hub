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
- v1.3c適用前 Supabase本番/検証分離方針整理
- v1.3c app_add_requests migrationの本番相当DBへの人間手動適用

## IN_PROGRESS
- A0.9 自動マージセットアップ不足調査: docs整理は完了。GitHub Settingsで `Allow auto-merge` / branch protection / required checks / workflow permissions の人間確認待ち。
- v1.3 購入前後の利用開始フロー整理

## NEXT
- 検証用Supabase project新規作成
- account.html の未完了申請DB保存UIを一時停止表示へ戻す修正
- v1.4 実アプリの商品化方針整理
- v1.5 販売用UI/UX強化
- v1.6 購入ページ
- v1.7 購入後の利用開始・利用中アプリ反映
- v1.8 販売前QA・導入テスト
- v1.9 決済・購入履歴
- v2.0 β販売開始
- v2.1 小規模事業者向け販売版

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
- v1.3d account.html 申請DB保存
- app_add_requests を購入者向け利用申請テーブルとして使う案
- 旧v1.3a アプリ追加申請UI mock
- 旧v1.3b app_add_requests DB設計
- 旧v1.3c app_add_requests migration / RLS案
- v2.x クリエイター向けアプリ投稿・掲載申請

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
- v1.3aはDB保存なしのアプリ追加申請UI mockとして完了。ただし、2026-07-02の仕様見直しにより、購入者向けの「アプリ追加申請」は不要とする。
- v1.3bでは、アプリ追加申請の正式保存先として `app_add_requests` 専用テーブル案を整理した。ただし、この購入者向け利用申請方針は本線から外し、`app_add_requests` はPARKED扱いにする。
- v1.3cでは、`app_add_requests` 作成migration案とRLS policy案を作成した。GitHub Pages公開版が現在のSupabase projectを参照しているため、2026-07-01の人間判断で現在のprojectは本番相当DBとして扱うことに確定した。2026-07-02に、人間がSQL全文確認後、現行Supabase projectへ手動適用済み。
- Supabase本番/検証分離方針では、A案「現在のSupabase projectを本番相当DB、別projectを検証用DB」を採用する。現行Supabase projectへのSQL適用は本番相当DB変更として必ず `HUMAN_REQUIRED: YES` とし、人間がSQL全文確認後にSQL Editorで手動適用する。
- 検証用Supabase projectができるまでは、DB変更の検証も本番相当DBで行うことになるため、既存データ削除、RLS無効化、Auth破壊につながる変更は禁止する。
- v1.3dでは、`account.html` のアプリ追加申請UIを `app_add_requests` 保存へ接続したが、人間確認でDB保存が成功していないことを確認。さらに購入者向け利用申請として進める仕様が本線意図とズレていたため、完了扱いにせずPARKED。`app_add_requests` はdropせず、購入者導線には使わない。
- 購入者は購入画面で「購入」または「利用開始」すればアプリを使える設計にする。必要に応じて、初期設定サポート、使い方説明、カスタマイズ相談、導入代行を任意で申し込む。
- クリエイター / 開発者がアプリを追加・投稿する機能は、購入者導線とは別物として将来フェーズへ分離する。
- v1.3では、購入者側の「アプリ追加申請」を不要とし、購入画面の「購入」または「利用開始」からアプリを使える状態にする方針へ整理する。
- 無料アプリは「利用開始」、有料アプリは「購入する」、β版アプリは「β版を試す」、準備中アプリは「準備中」、利用中アプリは「開く」とする。
- 相談型アプリは通常の商品カードから分離し、問い合わせ、導入相談、カスタマイズ相談、開発相談の導線で扱う。
- 決済未実装中の有料予定アプリは「有料化予定」と表示しつつ、当面は無料アプリと同じように利用可能にする。
- 利用解除は `app_instances` の物理削除ではなく、`inactive` / `disabled` のような利用停止状態にする。
- v1系ロードマップは、v1.3で購入前後の利用開始フロー整理、v1.4で実アプリの商品化方針整理、v1.5で販売用UI/UX強化、v1.6で購入ページ、v1.7で購入後の利用開始・利用中アプリ反映、v1.8で販売前QAを行い、v1.9で初めて決済・購入履歴へ進む。
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
