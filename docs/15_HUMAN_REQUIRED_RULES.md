# 15 HUMAN REQUIRED RULES

## 目的
Codex報告で `HUMAN_REQUIRED` の意味を統一する。

`HUMAN_REQUIRED` は「作業が残っているか」ではなく、「人間が実務として確認・判断・操作する必要が残っているか」で判定する。

```text
作業が残っているが、自動化が処理する = HUMAN_REQUIRED: NO にできる
作業が残っていて、人間が処理する = HUMAN_REQUIRED: YES
```

## HUMAN_REQUIRED: YES
人間が何か1つでも確認・判断・操作する必要が残っている場合は、必ず `YES` とする。

例:
- PRを人間が作成する必要がある。
- PRを人間がレビューする必要がある。
- Files changedを人間が目視確認する必要がある。
- Actions結果を人間が確認する必要がある。
- 自動マージできず、人間がmainへマージする必要がある。
- 自動削除できず、人間がbranchを削除する必要がある。
- GitHub Settings確認・変更が必要。
- GitHub上で人間がボタンを押す必要がある。
- branch protection / required checks / auto-merge設定の人間確認が必要。
- Supabase Dashboard確認が必要。
- SQL Editorでmigration適用が必要。
- RLS確認が必要。
- `company_accounts` / `app_instances` / `app_data` の実DB確認が必要。
- ブラウザ確認が必要。
- スマホ / iPad / PC確認が必要。
- UI判断が必要。
- 仕様判断が必要。
- secret scan結果を人間が確認する必要がある。
- Codexが「人間が確認してください」と書く内容が1つでもある。
- 作業完了後、ユーザーが何かしないと次へ進めない。

## HUMAN_REQUIRED: NO
人間がもう何もしなくてよい場合だけ `NO` とする。

以下をすべて満たす場合のみ `NO`。

- PRが不要、またはPRがすでにmainへマージ済み。
- もしくは、安全な自動マージが設定済みで、人間がGitHubで押すボタンがない。
- main反映まで自動化できる、またはmain反映済み。
- branch削除まで自動化できる、または削除不要。
- 人間がGitHubで確認・操作することがない。
- 人間がSupabaseで確認・操作することがない。
- 人間がブラウザで確認することがない。
- 追加のUI判断・仕様判断がない。
- 危険ファイル変更がない。
- 作業完了後、ユーザーが何もしなくてよい。

## MERGE_REQUIREDとの分離
`MERGE_REQUIRED` はmain反映が必要かどうかを表す。

`HUMAN_REQUIRED` は、人間がmain反映や確認を手で行う必要があるかどうかを表す。

mainへのマージがまだ必要でも、GitHub auto-mergeが安全に設定済みで、人間の操作が残っていなければ `HUMAN_REQUIRED: NO` にできる。

## 報告フィールド

### PR_STATUS
- `not_created`: PR未作成。
- `open`: PR作成済み。
- `checks_running`: checks待ち。
- `ready_to_merge`: マージ可能。
- `auto_merge_enabled`: GitHub auto-merge設定済み。
- `merged`: main反映済み。
- `not_needed`: PR不要。

### MERGE_REQUIRED
- `YES`: main反映が必要。
- `NO`: main反映不要、または反映済み。

### MERGE_METHOD
- `none`: マージ不要。
- `manual`: 人間がマージする。
- `auto_merge`: GitHub auto-mergeが処理する。

### AUTO_MERGE_ELIGIBLE
- `YES`: 自動マージ候補。
- `NO`: 自動マージ候補ではない。

### AUTO_MERGE_STATUS
- `not_applicable`: 自動マージ対象外。
- `eligible`: 条件上は候補。
- `enabled`: GitHub auto-merge設定済み。
- `merged`: 自動マージ済み。
- `blocked`: 危険条件などで停止。
- `setup_required`: GitHub Settings / branch protection / required checks確認が必要。
- `failed`: 自動マージ設定に失敗。

## 判定例

### PR未作成で人間がPRを作る必要がある
```md
PR_STATUS: not_created
MERGE_REQUIRED: YES
MERGE_METHOD: manual
AUTO_MERGE_ELIGIBLE: NO
AUTO_MERGE_STATUS: not_applicable
HUMAN_REQUIRED: YES
```

### docs-onlyで安全、自動マージ設定済み
```md
PR_STATUS: auto_merge_enabled
MERGE_REQUIRED: YES
MERGE_METHOD: auto_merge
AUTO_MERGE_ELIGIBLE: YES
AUTO_MERGE_STATUS: enabled
HUMAN_REQUIRED: NO
```

### GitHub auto-merge設定不足
```md
PR_STATUS: open
MERGE_REQUIRED: YES
MERGE_METHOD: manual
AUTO_MERGE_ELIGIBLE: YES
AUTO_MERGE_STATUS: setup_required
HUMAN_REQUIRED: YES
```

## A0.7 PR自身の扱い
A0.7 PRは `.github/workflows/**` を変更するため、自動マージ対象外。

報告は以下にする。

```md
PR_STATUS: not_created または open
MERGE_REQUIRED: YES
MERGE_METHOD: manual
AUTO_MERGE_ELIGIBLE: NO
AUTO_MERGE_STATUS: blocked
HUMAN_REQUIRED: YES
```
