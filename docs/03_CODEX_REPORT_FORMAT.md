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
- `YES` の場合は `STOP_REASON` と `人間が次にやること` を必ず書く。
- `NO` の場合は、次にCodexへ投げる指示をそのまま貼れる形で書く。
- 確認していないことを確認済みとして書かない。
- Supabase Dashboard、ブラウザ目視、GitHub Pages公開URL確認が必要な場合は、人間確認欄に残す。
