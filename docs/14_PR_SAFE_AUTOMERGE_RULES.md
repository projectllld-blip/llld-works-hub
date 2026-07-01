# 14 PR SAFE AUTOMERGE RULES

## 目的
- PR確認・マージ・ブランチ削除の手間を減らす。
- docs-only PRを安全に分類する。
- 危険変更は自動マージ候補にしない。
- main保護ルール、GitHub Actions、既存レビュー運用を壊さない。

このdocsは設計メモであり、現時点ではGitHub Actions実装やGitHub Settings変更を行わない。

## 基本方針
```text
docs-only PR:
  Actions成功後、自動マージ候補

docs-only以外:
  原則 HUMAN_REQUIRED

危険領域に触れるPR:
  必ず HUMAN_REQUIRED

secret / service_role / RLS無効化検出:
  必ず停止
```

自動マージは「候補」にとどめる。実際に有効化するには、branch protection、Actions権限、auto-merge設定、ラベル運用を人間が確認する。

## PR分類

### SAFE_DOCS_ONLY
自動マージ候補にできる分類。

条件:
- 変更ファイルが安全なdocs系だけ。
- QA / Actionsが成功している。
- mainとの競合がない。
- 危険ファイルパターンに一致しない。
- 危険語の新規追加がない。
- PR本文に `HUMAN_REQUIRED: NO` がある。

### HUMAN_REQUIRED
人間確認が必要な分類。

条件例:
- docs-only以外の変更がある。
- 判断に事業・UIUX・Supabase・GitHub Settingsが絡む。
- main反映判断が必要。
- STOP条件に該当する可能性がある。

### BLOCKED_SECRET_RISK
secret混入の疑いがある分類。

検出候補:
- `service_role`
- `sb_secret_`
- `SUPABASE_SERVICE_ROLE`
- `refresh_token`
- `access_token`
- `private key`
- 実tokenらしき長い文字列

### BLOCKED_RLS_RISK
RLS無効化や権限破壊の疑いがある分類。

検出候補:
- `disable row level security`
- `alter table ... disable row level security`
- RLS policyの削除・緩和
- `auth.uid()` 条件の削除

### BLOCKED_SUPABASE_RISK
Supabase / Auth / DBに影響する分類。

検出候補:
- `supabase/**`
- `supabase/migrations/**`
- `data/site-config.json`
- Auth関連JS
- `app_data`
- `app_instances`
- `company_accounts`
- Supabase URL / anon key の実値変更

### BLOCKED_ACTIONS_FAILED
GitHub Actionsまたは必須QAが失敗している分類。

条件:
- QA workflow失敗
- secret scan失敗
- syntax check失敗
- `git diff --check` 相当の空白チェック失敗
- 必須check未完了

## 自動マージ候補
以下の条件をすべて満たすPRのみ、自動マージ候補にできる。

- 変更ファイルが以下だけ。
  - `docs/**`
  - `.github/ISSUE_TEMPLATE/**`
  - `.github/PULL_REQUEST_TEMPLATE.md`
  - `README.md`
- `.github/workflows/**` を変更していない。
- 本体UI / JS / CSSを変更していない。
- Supabase / migration / site-configを変更していない。
- Auth / login / signup / account関連を変更していない。
- 危険語の新規追加がない。
- QA / Actionsがすべて成功している。
- mainとの競合がない。
- PR本文に `HUMAN_REQUIRED: NO` がある。

## 自動マージ禁止条件
以下に触れるPRは、自動マージしない。

### 本体UI / JS / CSS
- `portal.html`
- `index.html`
- `marketplace.html`
- `login.html`
- `signup.html`
- `account.html`
- `admin.html`
- `apps/**`
- `contents/**`
- `assets/js/**`
- `assets/css/**`

### Supabase / 認証 / DB
- `supabase/**`
- `supabase/migrations/**`
- `data/site-config.json`
- `authService`
- `supabaseClientService`
- `siteConfigService`
- `appInstanceService`
- `portalStateService`
- `seatflowCloudService`
- `app_data`
- `app_instances`
- `company_accounts`

### GitHub Actions / 設定
- `.github/workflows/**`
- GitHub Secrets
- GitHub Pages設定
- branch protection
- workflow permissions

A0.xの専用作業で人間が明示した場合のみ、別PRで扱う。

## 危険語scan方針
自動マージ判定では、危険語を検出したら原則 `do-not-automerge` とする。

検出候補:
- `service_role`
- `sb_secret_`
- `SUPABASE_SERVICE_ROLE`
- `refresh_token`
- `access_token`
- `private key`
- `disable row level security`
- `alter table .* disable row level security`

docs内のSTOP条件や禁止語説明として既に存在する語は、単純な全文scanだけでは誤検知しやすい。

推奨:
- PR差分の追加行だけをscanする。
- `docs/02_STOP_CONDITIONS.md` や本ファイルのような禁止語説明は、最初は自動マージ対象外にして人間確認する。
- 将来的に許可リストを作る場合も、実secretらしき値を見逃さないようにする。
- 危険語を「説明として追加」したdocs-only PRは `HUMAN_REQUIRED` に寄せる。

## GitHub Actions案
候補workflow名:

```text
.github/workflows/pr-safe-classifier.yml
```

今回はworkflowファイルを作らない。案だけをここに残す。

処理案:
1. PRのchanged filesを取得する。
2. 変更ファイルがdocs-only候補か判定する。
3. 禁止ファイルパターンを判定する。
4. PR差分の追加行に対して危険語scanを行う。
5. QA workflow / required checks の成功状態を確認する。
6. mainとの競合有無を確認する。
7. 分類ラベルを付与する。
8. `SAFE_DOCS_ONLY` かつActions成功なら `automerge-candidate` を付ける。
9. それ以外は `needs-human-review` または `blocked/*` を付ける。

ラベル付与案:
- `safe/docs-only`
- `needs-human-review`
- `blocked/secret-risk`
- `blocked/supabase-risk`
- `blocked/rls-risk`
- `blocked/actions-failed`
- `automerge-candidate`
- `do-not-automerge`

auto-merge有効化案:
- GitHub branch protectionを尊重する。
- required checksがすべて成功している場合のみ候補にする。
- Actions失敗時は絶対にmergeしない。
- 実際のauto-merge有効化は人間がGitHub Settingsと権限を確認してから行う。

## 自動マージしてはいけない理由
- データ漏洩を防ぐため。
- 他社データ混入を防ぐため。
- 認証破壊を防ぐため。
- GitHub Pages公開事故を防ぐため。
- service_role漏洩を防ぐため。
- RLS無効化事故を防ぐため。
- migrationやsite-configの誤変更を防ぐため。

## 運用ルール
- A0.6は設計のみ。workflow実装は別Phaseで扱う。
- 自動マージ対象は最初から広げない。
- docs-onlyでも、危険語や危険ファイルに触れたら `HUMAN_REQUIRED` とする。
- `automerge-candidate` は「安全候補」であり、人間が運用開始を決めるまでは実mergeを自動化しない。
- 本線PRとA0.x運用PRを混ぜない。

## STOP条件
以下に該当したら自動マージ設計・実装を止める。

- GitHub Actions実装が必要。
- GitHub Settings変更が必要。
- branch protection設定変更が必要。
- GitHub token / Secrets設定が必要。
- workflow permissions変更が必要。
- 実際の自動マージ有効化が必要。
- 本体UI / JS変更が必要。
- Supabase / Auth / RLS / migrationに触る必要がある。
- secretやservice_role keyが必要。
- main保護ルールとの整合性が判断できない。
