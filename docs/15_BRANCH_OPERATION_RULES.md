# 15 BRANCH OPERATION RULES

## 基本方針
- mainは安定版として扱う。
- Codex作業は原則として作業ブランチで行う。
- mainに直接作業しない。
- ブランチ名で作業内容が分かるようにする。
- 1ブランチに複数の大きな目的を混ぜない。

## ブランチ名ルール
例:

```text
automation/codex-semi-auto-v01
automation/qa-rules
automation/pr-review-rules
feature/v015-error-empty-state
fix/portal-login-required
docs/issue-operation-rules
```

## 使い分け
- `automation/`: Codex半自動運用基盤。
- `feature/`: 新機能。
- `fix/`: 修正。
- `docs/`: ドキュメント。
- `qa/`: 自動チェック。
- `supabase/`: Supabase関連。ただし実DB適用は人間確認必須。

## 禁止・注意
- mainへ直接pushしない。
- secretやAPIキーをbranchに含めない。
- Supabase migrationを含む場合は人間確認必須。
- GitHub Settings / Secrets / Pages設定はbranchでは完結しないため人間確認必須。

## Codex作業時の確認
- 作業前に現在ブランチを確認する。
- mainの場合は作業を始めず、作業ブランチを作るか `HUMAN_REQUIRED: YES` で止まる。
- 作業後は今回分だけをstageし、無関係な変更を混ぜない。
- remoteがある場合は、認証や競合で失敗しない限り作業ブランチへpushする。
