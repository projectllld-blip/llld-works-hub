# 13 CONTEXT HANDOFF RULES

## 目的
- Codexとの長い会話履歴を毎回渡さない。
- トークン消費を抑える。
- 古い仕様と新しい仕様が混ざるのを防ぐ。
- repo内ドキュメントを正とする。
- 次回以降、短い作業票だけでCodexが作業できるようにする。

## 正とする情報源の優先順位
以下の順番で優先する。

1. `AGENTS.md`
2. `docs/00_PROJECT_STATUS.md`
3. `docs/05_DECISION_LOG.md`
4. `docs/06_TASK_QUEUE.md`
5. `docs/02_STOP_CONDITIONS.md`
6. `docs/03_CODEX_REPORT_FORMAT.md`
7. `docs/04_NEXT_PROMPT_RULES.md`
8. 該当PhaseのIssue本文
9. 直近のCodex作業報告

古いチャットログ全文は正としない。

## 古い情報との矛盾がある場合
- `docs/00_PROJECT_STATUS.md` を優先する。
- 判断理由が必要な場合は `docs/05_DECISION_LOG.md` を確認する。
- それでも矛盾が残る場合は `HUMAN_REQUIRED: YES` で止まる。
- 勝手に古い仕様へ戻さない。

## Codexが毎回読むべき最小セット
通常作業では、最低限以下を参照すればよい。

- `AGENTS.md`
- `docs/00_PROJECT_STATUS.md`
- `docs/02_STOP_CONDITIONS.md`
- `docs/03_CODEX_REPORT_FORMAT.md`
- `docs/04_NEXT_PROMPT_RULES.md`
- `docs/06_TASK_QUEUE.md`
- 該当Issueまたは作業票

重要判断・仕様判断・方針変更がある場合は `docs/05_DECISION_LOG.md` も必ず参照する。

## PROJECT_STATUS更新ルール
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

## DECISION_LOG更新ルール
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

## TASK_QUEUE更新ルール
ステータス分類:
- `DONE`
- `IN_PROGRESS`
- `NEXT`
- `BLOCKED`
- `HUMAN_REQUIRED`
- `PARKED`

使い分け:
- `DONE`: 完了済み。
- `IN_PROGRESS`: 現在進行中。
- `NEXT`: 次に進める候補。
- `BLOCKED`: 技術的・設定的に止まっている。
- `HUMAN_REQUIRED`: 人間確認が必要。
- `PARKED`: 今はやらないが後で戻る。

自動化プロジェクトと本線の分離:
- A0.x はCodex半自動運用プロジェクト。
- v0.x / v1.x はLLLD Works Hub / Works Market本線。
- A0.x中は本線を勝手に進めない。
- 本線へ戻るにはPROJECT_STATUSで再開条件を確認する。

## 引き継ぎ時の原則
- 次回Codexには長い会話ログではなく、短い作業票を渡す。
- 作業票には、目的、参照ファイル、触ってよいファイル、触ってはいけないファイル、STOP条件、確認項目、報告フォーマットを書く。
- 直近の作業報告は補助情報として扱い、repo内docsと矛盾する場合はrepo内docsを優先する。
- 判断に迷う場合は `HUMAN_REQUIRED: YES` で止める。
