# phase-a0-9-automerge-setup-investigation

## Phase
A0.9 自動マージセットアップ不足調査

## 状態
調査完了。GitHub側の設定確認が必要。

## 背景
v1.3a完了docs PR #23 で、以下のラベルが付いていた。

- `safe-docs-automerge`
- `auto-merge-setup-required`
- `human-required`

このため、docs-only安全判定は成功しているが、GitHub auto-mergeを有効化する前提条件が不足している可能性があった。

## PR #23 確認結果
GitHub APIで確認できた範囲:

- PR: `https://github.com/projectllld-blip/llld-works-hub/pull/23`
- state: `closed`
- merged: `true`
- base: `main`
- head: `docs/v13a-human-confirmation`
- labels:
  - `safe-docs-automerge`
  - `auto-merge-setup-required`
  - `human-required`
- checks:
  - `static-checks`: success
  - `classify-and-automerge`: success

PRコメントに残った判定:

```text
PR_STATUS: ready_to_merge
MERGE_REQUIRED: YES
MERGE_METHOD: manual
AUTO_MERGE_ELIGIBLE: YES
AUTO_MERGE_STATUS: setup_required
HUMAN_REQUIRED: YES
```

Auto-merge失敗理由:

```text
Could not enable GitHub auto-merge:
Auto merge is not allowed for this repository
```

## safe-docs-automerge の機能状況
機能している。

根拠:
- PR #23 はdocs-onlyとして安全条件を満たした。
- `safe-docs-automerge` が付与された。
- 禁止語・確認語の説明はdocs説明語として扱われ、ブロックされていない。
- `auto-merge-blocked` ではなく `auto-merge-setup-required` が付いている。

## auto-merge-setup-required が付いた理由
最有力原因は、GitHubリポジトリ設定で `Allow auto-merge` が無効であること。

根拠:
- workflowのGraphQL `enablePullRequestAutoMerge` 実行時に、GitHub APIが `Auto merge is not allowed for this repository` を返している。
- workflowはこの例外を受け、`auto-merge-setup-required` と `human-required` を付ける設計になっている。

## workflow確認結果
対象:

```text
.github/workflows/pr-safe-automerge.yml
```

確認できたこと:
- `pull_request_target` で動く。
- `actions/checkout` は使っていない。
- PRブランチのコードをcheckoutして実行していない。
- changed files と patch をGitHub APIで読む。
- docs-only、安全条件、危険ファイル、危険な追加行を判定する。
- safeな場合に `safe-docs-automerge` を付ける。
- safeな場合にGraphQL `enablePullRequestAutoMerge` を実行する。
- auto-merge有効化に失敗した場合、`auto-merge-setup-required` と `human-required` を付ける。

安全上の評価:
- `pull_request_target` を使っているが、PRコードをcheckoutして実行していないため、現時点の設計は安全寄り。
- ただし、今後workflowを変更するPR自身は必ず人間確認・人間マージが必要。

## GitHub APIで確認できたこと
- PR #23はmerged済み。
- PR #23には `safe-docs-automerge` / `auto-merge-setup-required` / `human-required` が残っている。
- Checks API上、`static-checks` と `classify-and-automerge` は成功している。
- repository rulesets APIは認証なしで空配列を返した。

## Codex側で確認できなかったこと
認証が必要なため、以下はCodex側では確認できなかった。

- Branch protection の詳細
- GitHub Actions workflow permissions
- `Allow GitHub Actions to create and approve pull requests`
- repository settings の `Allow auto-merge` 表示状態

## GitHub Settingsで人間が確認すべきこと
初心者向け手順:

1. GitHubで `projectllld-blip/llld-works-hub` を開く。
2. 上部メニューの `Settings` を押す。
3. 左メニューの `Pull Requests` を押す。
4. `Allow auto-merge` がONか確認する。
5. OFFなら、ONにしてよいか人間判断する。
6. 左メニューの `Branches` または `Rules` / `Rulesets` を押す。
7. `main` にbranch protectionまたはrulesetがあるか確認する。
8. required checks が設定されているか確認する。
9. 左メニューの `Actions` > `General` を押す。
10. `Workflow permissions` が `Read and write permissions` か確認する。
11. `Allow GitHub Actions to create and approve pull requests` がONか確認する。

## 次に安全に進める選択肢

### 案A: GitHub Settingsだけ確認・変更する
最小手順。

- `Allow auto-merge` をONにする。
- 必要に応じてbranch protection / required checks / Actions permissionsを確認する。
- workflowは変更しない。
- 次のsafe docs-only PRでauto-mergeが有効化されるか確認する。

### 案B: workflowのコメントを改善する
必要なら別Phaseで実施。

- `Auto merge is not allowed for this repository` の場合、人間向け手順をPRコメントへ直接出す。
- `.github/workflows/**` 変更になるため、自動マージ対象外。
- 人間確認・人間マージが必要。

### 案C: auto-merge運用を一旦設計止まりに戻す
安全優先。

- `safe-docs-automerge` は分類だけに使う。
- mainマージは人間が行う。
- 手作業は残るが設定事故は避けられる。

## 推奨
まず案A。

workflow自体はsafe判定とauto-merge有効化を試みており、失敗理由もGitHub側の `Allow auto-merge` 不許可に見える。

そのため、いきなりworkflowを変更せず、人間がGitHub Settingsで `Allow auto-merge` とActions権限を確認するのが最小で安全。

## STOP条件
以下が必要なため、Codexはここで実装・設定変更を行わない。

- GitHub Settings確認
- `Allow auto-merge` のON/OFF判断
- branch protection / rulesets確認
- required checks確認
- workflow permissions確認

## HUMAN_REQUIRED
YES

理由:
GitHub Settings / branch protection / workflow permissions は人間確認が必要。
