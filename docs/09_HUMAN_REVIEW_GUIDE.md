# 09 HUMAN REVIEW GUIDE

目的:
人間がCodex結果を見るとき、全文を読まずに判断できるようにすること。

## まず見る場所
1. `HUMAN_REQUIRED` を見る。
2. `YES` なら `STOP_REASON` と `人間が次にやること` を見る。
3. `NO` なら `追加・更新したファイル` と `コード上の確認結果` を見る。

## 次に見る場所
- GitHub Actionsが落ちていたら次に進まない。
- Supabase / ブラウザ / UIUX確認が残っていれば本線再開しない。
- 怪しい時だけChatGPTに貼る。

## 確認ポイント
- Codexが本体機能を勝手に進めていないか。
- `portal.html` / `marketplace.html` / `index.html` / `login.html` / `signup.html` / `account.html` を不要に変更していないか。
- secretやservice_roleが混入していないか。
- GitHub Pages前提を壊していないか。
- Supabase Dashboard操作を勝手に進めていないか。
- STOP条件に該当しているのに `HUMAN_REQUIRED: NO` としていないか。

## HUMAN_REQUIREDがYESの場合
- Codexに続きを任せる前に、人間が設定・確認・判断を済ませる。
- Supabase、GitHub Secrets、Pages、外部サービス、本番データに関わるものは特に慎重に見る。

## HUMAN_REQUIREDがNOの場合
- 変更ファイルと確認結果を見て問題なければ次のCodex指示へ進む。
- ただし、GitHub Actions失敗、secret疑い、UIUX未確認があれば止める。

## PRレビュー時に見る順番
1. `HUMAN_REQUIRED` を見る。
2. `YES` なら `STOP_REASON` と `人間が次にやること` を見る。
3. GitHub Actions / QA結果を見る。
4. 追加・更新したファイルを見る。
5. 本体UIを意図せず触っていないか見る。
6. Supabase / ブラウザ / UIUX確認が必要か見る。
7. 問題なければマージ候補にする。
8. 怪しければChatGPTに貼って相談する。

## PRをマージ候補にする前の確認
- `HUMAN_REQUIRED: NO` になっている。
- GitHub Actions / QAが通っている。
- secretやservice_roleの混入がない。
- `portal.html` / `marketplace.html` など本体UIを意図せず変更していない。
- Supabase / ブラウザ / UIUX / GitHub Settings確認が不要、または確認済み。
- PROJECT_STATUS / TASK_QUEUE が必要に応じて更新されている。
