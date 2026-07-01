# 06 TASK QUEUE

## DONE
- A0.1 Codex半自動運用基盤
- A0.2 GitHub Issue運用化
- A0.3 QA自動チェック強化
- A0.4 Codex文脈圧縮・引き継ぎ運用
- A0.5 PRレビュー運用
- v0.15 エラー処理・空状態
- v0.15追加修正 / v0.15.1相当
- v0.16 RLS・他社データ混入テスト
- v0.17a バックアップ・復元 方針整理
- v0.17b バックアップJSONエクスポートMVP
- v0.17c バックアップJSON読込・検証・プレビュー
- v0.17d 限定復元設計

## IN_PROGRESS
- なし

## NEXT
- v0.17e portal_state限定復元MVP

## PARKED
- A0.6 Codex GitHub Action連携検討
- A0.7 HUMAN_REQUIREDダッシュボード化
- SeatFlow完全クラウド同期
- SeatFlow複数レイアウト同期
- SeatFlow名簿 / QR / NFC / メモのクラウド保存
- SeatFlow全体状態の完全バックアップ・復元
- SeatFlow複数タブ競合解決
- SeatFlow正式商品化に必要な保存対象整理

## 運用ルール
- 先頭の作業から順に進める。
- STOP条件に該当した作業は、完了扱いにせず `HUMAN_REQUIRED` として残す。
- A0.1〜A0.5はCodex半自動運用の初期実用ラインとして扱う。
- A0.6 / A0.7 はGitHub Secrets、GitHub Settings、外部連携に踏み込む可能性があるため、人間確認後に進める。
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
