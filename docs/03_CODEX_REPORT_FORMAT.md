# 03 CODEX REPORT FORMAT

Codexは作業完了時、必ずこのフォーマットで報告する。

```md
## Phase

## 変更点

## 追加・更新したファイル

## コード上の確認結果

## Supabase Dashboardで人間が確認すべきこと

## ブラウザで人間が確認すべきこと

## 未確認のまま残したこと

## 残リスク

## PR_STATUS
not_created / open / checks_running / ready_to_merge / auto_merge_enabled / merged / not_needed

## MERGE_REQUIRED
YES / NO

## MERGE_METHOD
none / manual / auto_merge

## AUTO_MERGE_ELIGIBLE
YES / NO

## AUTO_MERGE_STATUS
not_applicable / eligible / enabled / merged / blocked / setup_required / failed

## HUMAN_REQUIRED
YES / NO

## STOP_REASON
HUMAN_REQUIRED が YES の場合のみ記載

## 人間が次にやること
HUMAN_REQUIRED が YES の場合のみ記載

## 次にCodexへ投げる指示
そのまま貼れる形で記載
```

## 記入ルール
- `HUMAN_REQUIRED` は必ず `YES` か `NO` で書く。
- `HUMAN_REQUIRED` は「作業が残っているか」ではなく、「人間が実務として確認・判断・操作する必要が残っているか」で判定する。
- 人間がPR作成、レビュー、Actions確認、mainマージ、branch削除、GitHub Settings確認、Supabase確認、ブラウザ確認、UI判断、仕様判断を行う必要がある場合は `HUMAN_REQUIRED: YES` とする。
- GitHub auto-mergeが安全に設定済みで、人間が押すボタンや確認作業が残っていない場合は、mainマージ前でも `HUMAN_REQUIRED: NO` にできる。
- `MERGE_REQUIRED` と `HUMAN_REQUIRED` を混同しない。
- `YES` の場合は `STOP_REASON` と `人間が次にやること` を必ず書く。
- `NO` の場合は、次にCodexへ投げる指示をそのまま貼れる形で書く。
- 確認していないことを確認済みとして書かない。
- Supabase Dashboard、ブラウザ目視、GitHub Pages公開URL確認が必要な場合は、人間確認欄に残す。
- 詳細な判定ルールは `docs/15_HUMAN_REQUIRED_RULES.md` を正とする。
