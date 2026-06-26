# 14 PR REVIEW RULES

## 目的
- Codexの変更をmainへ直接入れない。
- 作業ブランチ / PR単位で確認する。
- PR本文に作業内容・確認結果・HUMAN_REQUIREDを残す。
- QA通過後にマージ判断する。
- 人間確認が必要なものを見逃さない。
- 本線開発と自動化プロジェクトを混ぜない。

## 基本方針
- mainへ直接作業しない。
- 1 PR = 1目的を原則とする。
- 大きすぎるPRを避ける。
- PR本文は `.github/PULL_REQUEST_TEMPLATE.md` に従う。
- QAが落ちているPRは原則マージしない。
- `HUMAN_REQUIRED: YES` のPRは人間確認が終わるまでマージしない。
- Supabase / GitHub Settings / 外部サービス / UIUX判断が絡むPRは人間レビュー必須。

## PR作成前チェック
- 作業ブランチがmainではない。
- git statusがclean。
- 本体UIを意図せず変更していない。
- secretを追加していない。
- `portal.html` / `marketplace.html` など禁止ファイルを触っていない。
- `docs/00_PROJECT_STATUS.md` が現在地を反映している。
- `docs/06_TASK_QUEUE.md` が次の状態を反映している。
- QAがローカルで可能な範囲で通っている。

## PRレビュー観点
- 目的と変更内容が一致しているか。
- 今回やらないことに踏み込んでいないか。
- STOP条件を無視していないか。
- `HUMAN_REQUIRED: YES/NO` が明記されているか。
- Supabase確認が必要か。
- ブラウザ確認が必要か。
- UIUX確認が必要か。
- GitHub Actions確認が必要か。
- secret混入がないか。
- GitHub Pages前提を壊していないか。
- 本線と自動化プロジェクトを混ぜていないか。

## マージ判断
以下を満たす場合のみマージ候補にする。

- `HUMAN_REQUIRED: NO`
- QAが通っている。
- secret混入なし。
- 本体UIへの意図しない変更なし。
- Supabase / ブラウザ / UIUX / GitHub Settings確認が不要、または確認完了済み。
- PROJECT_STATUS / TASK_QUEUE が更新済み。
- 人間が内容を確認した。

## マージしない条件
- `HUMAN_REQUIRED: YES`
- GitHub Actionsが落ちている。
- secret混入の疑いがある。
- Supabase実DBへの影響が未確認。
- 本体UIの目視確認が未完了。
- UIUX判断が未完了。
- GitHub Settings / Secrets / Pages設定が必要。
- main反映判断が人間側で未完了。
- 仕様が曖昧なまま変更している。

## A0系と本線の分離
- A0.xはCodex半自動運用基盤として扱う。
- v0.x / v1.xはLLLD Works Hub / Works Market本線として扱う。
- 1つのPRでA0系と本線機能開発を混ぜない。
