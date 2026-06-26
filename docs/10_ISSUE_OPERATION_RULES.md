# 10 ISSUE OPERATION RULES

## Issue運用の目的
- Codexへの依頼をチャットではなくIssue単位にする。
- 長い会話履歴に依存しない。
- Codexが必要な情報だけを読んで作業できるようにする。
- `HUMAN_REQUIRED: YES/NO` で人間確認の要否を分ける。
- 本線開発と自動化プロジェクトを混ぜない。

## Issueの基本単位
1 Issue = 1作業単位とする。

良いIssue例:
- A0.3 QA自動チェック強化
- v0.15 エラー処理・空状態
- `portal.html` 未ログイン時表示の追加修正
- SeatFlow保存エラー時の表示改善

悪いIssue例:
- 全部やる
- いい感じに直す
- ポータル改善まとめて
- SupabaseもUIもマーケットも全部進める

## Issueに必ず含める項目
- Phase
- 目的
- 作業内容
- 必ず参照するファイル
- 触ってよいファイル
- 触ってはいけないファイル
- STOP条件
- 確認項目
- 完了条件
- HUMAN_REQUIREDの扱い

## Issueの進め方
```text
Issue作成
↓
codex-ready ラベルを付ける
↓
Codexが作業
↓
作業結果をPRまたはcommitで返す
↓
HUMAN_REQUIREDを確認
↓
NOならQA確認へ
↓
YESなら人間確認へ
↓
必要ならChatGPTに返答を貼って相談
↓
問題なければ次Issueへ
```

## Codexに渡す前の確認
- Issueが1作業単位に収まっている。
- 触ってよいファイルと触ってはいけないファイルが分かれている。
- STOP条件が `docs/02_STOP_CONDITIONS.md` と矛盾していない。
- secretやAPIキーがIssue本文に貼られていない。
- Supabase Dashboard操作、GitHub Settings操作、UIUX判断が必要な場合は明記されている。

## Codex作業後の確認
- `HUMAN_REQUIRED` を最初に確認する。
- `YES` の場合は、次Issueへ進まず人間確認を行う。
- `NO` の場合も、GitHub Actions、変更ファイル、secret混入、本体UIの不要変更を確認する。
- 必要なら `.github/ISSUE_TEMPLATE/human-check.md` で人間確認Issueを作る。

## 本線と自動化の分離
- A0系はCodex半自動運用基盤の作業として扱う。
- v0系 / v1系はポータル・マーケット本線として扱う。
- 1つのIssueでA0系と本線開発を混ぜない。
