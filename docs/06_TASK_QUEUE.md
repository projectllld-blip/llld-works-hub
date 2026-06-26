# 06 TASK QUEUE

## 完了済み
- A0.1 Codex半自動運用基盤
- A0.2 GitHub Issue運用化
- A0.3 QA自動チェック強化
- A0.4 Codex文脈圧縮・引き継ぎ運用

## 進行中
- A0.5 PRレビュー運用

## 次の自動化キュー
- A0.6 Codex GitHub Action連携検討: 人間確認後に進める候補
- A0.7 HUMAN_REQUIREDダッシュボード化: 人間確認後に進める候補

## 本線再開候補
- v0.15 エラー処理・空状態

## 運用ルール
- 先頭の作業から順に進める。
- STOP条件に該当した作業は、完了扱いにせず `HUMAN_REQUIRED` として残す。
- 本線再開は、A0系の基盤と最低限のQA確認後に判断する。

## ステータス分類
- `DONE`: 完了済み。
- `IN_PROGRESS`: 現在進行中。
- `NEXT`: 次に進める候補。
- `BLOCKED`: 技術的・設定的に止まっている。
- `HUMAN_REQUIRED`: 人間確認が必要。
- `PARKED`: 今はやらないが後で戻る。

## 使い分け
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
- 本線へ戻るにはPROJECT_STATUSで再開条件を確認する。
- A0.6 / A0.7 はGitHub Secretsや外部連携に踏み込む可能性があるため、人間確認後に進める。
