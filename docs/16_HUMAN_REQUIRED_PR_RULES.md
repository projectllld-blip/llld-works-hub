# 16 HUMAN REQUIRED PR RULES

## HUMAN_REQUIRED: YES のPR
以下の場合、PRはマージ待ちにし、人間確認が終わるまで進めない。

- Supabase Dashboard確認が必要。
- GitHub Actions / Settings / Secrets確認が必要。
- ブラウザ確認が必要。
- UIUX判断が必要。
- APIキーや外部サービス設定が必要。
- 本番反映判断が必要。
- 破壊的変更の可能性がある。
- secret混入の疑いがある。

## 人間が見る場所
- `STOP_REASON`
- `人間が次にやること`
- `Supabase Dashboardで人間が確認すべきこと`
- `ブラウザで人間が確認すべきこと`
- `UIUXで人間が確認すべきこと`
- `未確認のまま残したこと`
- `残リスク`

## 確認完了後の扱い
- 問題なければ `HUMAN_REQUIRED: NO` 相当として再開可能。
- ただしPR本文の履歴には、確認結果を追記する。
- 必要なら `docs/05_DECISION_LOG.md` に判断を記録する。
- 再開する場合は、短いCodex作業票で再開する。
- 古いチャットログ全文は渡さない。

## 再開時の注意
- 人間確認が終わったことをIssueまたはPRに明記する。
- 追加作業が必要な場合は、1目的の作業票に分ける。
- Supabase / GitHub Settings / 外部サービス設定が残る場合は、引き続き `HUMAN_REQUIRED: YES` として扱う。
