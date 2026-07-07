# v1.7c app_instances status / RLS / migration案

## Phase

v1.7c app_instances status / RLS / migration案

## 状態

設計整理完了。

今回はdocs整理のみで、`app_instances` insert / update実装、利用開始DB処理、利用解除DB処理、Supabase migration、RLS、RPC、Edge Function、本体HTML / JS / CSS、`data/contents.json` は変更しない。

## 目的

無料 / β版の正式利用開始反映を実装する前に、`app_instances` を安全に使えるかを整理する。

特に以下を確認する。

- 現行 `app_instances` schema で足りるか。
- status列やstatus制約の追加migrationが必要か。
- 現行RLSで自社データ分離ができているか。
- 現行RLSだけで無料 / β版のみinsertを保証できるか。
- 有料 / サブスクを利用者が勝手に `app_instances` へ追加できるリスクがあるか。
- `disabled` を利用者が `active` / `trial` へ戻せてしまうリスクがあるか。
- v1.7dへ進む場合の最小安全条件は何か。

## 確認したファイル

- `supabase/migrations/20260625_v010_company_account_foundation.sql`
- `supabase/migrations/20260625_v013_app_instances_from_signup_metadata.sql`
- `supabase/migrations/20260627_v016_ensure_works_portal_app_instance.sql`
- `assets/js/appInstanceService.js`
- `assets/js/purchaseConfirmPage.js`
- `docs/05_実装指示/app-instance-list.md`
- `docs/05_実装指示/supabase-rls-policy.md`
- `docs/04_フェーズ記録/phase1-7-post-purchase-app-instance-reflection.md`
- `docs/04_フェーズ記録/phase1-7b-app-instances-status-design.md`
- `docs/04_フェーズ記録/phase1-6-purchase-page.md`
- `docs/04_フェーズ記録/phase1-6b-product-pricing-cta-settings.md`

## 現在の app_instances schema

`20260625_v010_company_account_foundation.sql` 上の `app_instances` は以下の列を持つ。

```text
id
company_account_id
app_key
display_name
status
settings_json
created_at
updated_at
```

`app_id` 列や `app_slug` 列は現行schemaにはない。`apps` とは `app_key` で紐づく。

### company_account_id / app_key

`app_instances.company_account_id` は `company_accounts.id` を参照する。

`app_instances.app_key` は `apps.app_key` を参照する。

`20260625_v013_app_instances_from_signup_metadata.sql` と `20260627_v016_ensure_works_portal_app_instance.sql` では、以下の一意indexが作成されている。

```text
app_instances(company_account_id, app_key)
```

このため、同じ企業アカウントに同じ `app_key` を重複作成しない土台はある。

### status列 / status値

`status` 列は既に存在し、defaultは `active`。

現行check制約は以下。

```text
active
trial
paused
disabled
```

v1.7bで整理したMVP方針は以下。

| status | 意味 |
| --- | --- |
| `active` | 利用中 |
| `trial` | β版 / 試用 |
| `paused` | 利用者側の利用解除 / 一時停止 |
| `disabled` | 運営側停止 / 安全停止 |

`inactive`、`pending`、`cancelled`、`beta` を `app_instances.status` に保存するにはmigrationが必要。

v1.7dで既存statusだけを使うなら、status追加migrationは不要。

### updated_at

`set_app_instances_updated_at` trigger があり、`app_instances` update時に `updated_at` が更新される。

### app_dataとの外部キー関係

`app_data.app_instance_id` は `app_instances.id` を参照し、`on delete cascade` が設定されている。

そのため、`app_instances` を物理削除すると、関連する `app_data` も削除される可能性がある。

v1.7系では、利用解除時に `app_instances` を物理削除しない。利用解除は `status = paused` で表す。

## 現行RLSの整理

`20260625_v010_company_account_foundation.sql` では、`app_instances` にRLSが有効化されている。

```text
alter table public.app_instances enable row level security;
```

### select policy

policy名:

```text
app_instances_select_own_company
```

内容:

ログイン中ユーザーが所有する `company_accounts.id` と、`app_instances.company_account_id` が一致する場合だけselectできる。

### insert policy

policy名:

```text
app_instances_insert_own_company
```

内容:

insert対象の `company_account_id` が、ログイン中ユーザー所有の `company_accounts.id` の場合だけinsertできる。

### update policy

policy名:

```text
app_instances_update_own_company
```

内容:

更新対象と更新後の `company_account_id` が、ログイン中ユーザー所有の `company_accounts.id` の場合だけupdateできる。

### delete policy

repo上のmigrationには、`app_instances` のdelete policyは確認できない。

delete policyを作らない方針は、`app_data` cascade deleteリスクを避ける点でも妥当。

## 現行RLSで守れること

現行RLSで守れることは以下。

- 自社 `app_instances` だけselectできる。
- 他社 `company_account_id` を指定したinsertは拒否される。
- 他社 `app_instances` のupdateは拒否される。
- `company_account_id` を他社へ書き換えるupdateは拒否される。
- delete policyがないため、通常ユーザーが `app_instances` を削除する導線は作りにくい。

つまり、企業間分離の最低限は成立している。

## 現行RLSで守れないこと

現行RLSだけでは以下を保証できない。

### 無料 / β版のみinsert許可

現行RLSは、`app_instances.app_key` の商品状態や料金形態を判定しない。

そのため、フロントが任意の `app_key` をinsertできる実装にすると、同じ企業アカウント内で有料 / サブスクの `app_key` もinsertできる可能性がある。

### 有料 / サブスクのDB側拒否

現行DBの `apps.status` は以下のみ。

```text
draft
active
beta
paused
internal
```

`apps` には `free` / `paid` / `subscription` の料金形態がない。

料金形態は主に `data/contents.json` / JS側にあるため、RLSから直接判定できない。

したがって、現行RLSだけで「有料 / サブスクはinsert拒否」を保証できない。

### status遷移制御

現行update policyは、自社行であれば `status` 更新を許可する。

そのため、実装次第では以下が起き得る。

- `paused` を `active` へ戻せる。
- `trial` を `active` へ変えられる。
- `disabled` を利用者操作で `active` / `trial` へ戻せる。

特に `disabled` は運営側停止 / 安全停止として扱うため、ユーザー操作だけで復活させてはいけない。

### フロント側判定だけでは弱い

`purchaseConfirmPage.js` は、有料 / サブスクでは `sessionStorage` 仮追加を行わないよう整理済み。

しかし、これはフロント実装上の安全策であり、DB側の完全な権限制御ではない。

将来 `app_instances` insert / updateをフロントへ追加する場合、フロント側allowlistや商品状態判定だけでは、本番相当DBの安全策としては弱い。

## status migration要否

### v1.7dで既存statusだけを使う場合

status migrationは不要。

理由:

- `active` は無料アプリの利用中に使える。
- `trial` はβ版 / 試用に使える。
- `paused` は利用解除 / 一時停止に使える。
- `disabled` は運営側停止に使える。

### migrationが必要になる場合

以下を採用するならmigrationが必要。

- `inactive` をDB上の利用解除statusにする。
- `pending` を決済待ち / 承認待ちとして `app_instances` に保存する。
- `cancelled` を解約状態として保存する。
- `app_instances` に料金形態、販売状態、購入状態を追加する。
- `apps` または別テーブルに商品 / 料金 / CTA正本を追加する。
- `disabled` からの復活禁止など、status遷移をDB側で強く制限する。
- 無料 / β版だけinsert許可するためのDB正本や関数を追加する。

今回、migrationファイルは作らない。

## 安全な実装方式の比較

### 候補A: フロントから app_instances insert / update

内容:

購入確認ページまたは利用開始画面から、ログイン中企業の `app_instances` へ直接insert / updateする。

良い点:

- 実装が軽い。
- GitHub Pages + Supabase anon keyの既存構成で動かしやすい。
- 既存RLSで他社 `company_account_id` への混入は防げる。

問題:

- RLSで無料 / β版だけを保証できない。
- 有料 / サブスクの `app_key` をinsertできる可能性が残る。
- `disabled` を利用者が復活させる実装事故を防ぎにくい。
- フロント側allowlistは改ざんや実装漏れに弱い。

結論:

汎用的な購入後反映としては非推奨。v1.7dで採用する場合は、無料 / β版の少数 `app_key` に限定したallowlistと人間確認を必須にする。

### 候補B: Supabase RPC / Edge Functionで利用開始処理

内容:

利用開始処理をRPCまたはEdge Functionに閉じ込め、DB側で商品状態、料金形態、現在status、`disabled` などを判定してから `app_instances` をinsert / updateする。

良い点:

- DB側で無料 / β版のみ許可できる。
- 有料 / サブスク、`disabled` 復活、status遷移を一箇所で制御できる。
- 将来、購入履歴や決済完了と接続しやすい。

問題:

- RPC / Edge Function実装、migration、RLS、権限設計が必要。
- 現行Supabase projectは本番相当DBのため、人間SQL確認と手動適用が必要。
- GitHub Pages中心の軽量運用からは少し重くなる。

結論:

本格的には最も安全。ただし、v1.7d直前にいきなり実装せず、別フェーズでmigration / RPC案を人間確認する。

### 候補C: 運営側手動反映

内容:

無料 / β版の利用開始も、当面は運営がDashboardや管理されたSQLで `app_instances` を追加 / 更新する。

良い点:

- 有料 / サブスクの誤反映リスクが低い。
- `disabled` 復活の誤操作をフロントから起こしにくい。
- DB / RLS変更が最小。

問題:

- ユーザーの即時利用開始体験にはならない。
- 運営作業が増える。
- 手動SQLのミスを防ぐ運用が必要。

結論:

本番相当DBでの安全性を優先するなら短期的な候補。ただし、無料アプリの即時利用開始というUXは弱い。

### 候補D: 無料 / β版だけをフロント反映し、有料 / サブスクは未反映のままPARKED

内容:

v1.7dでは無料 / β版だけを対象にし、対象 `app_key` を固定allowlist化する。有料 / サブスクは絶対に反映しない。

良い点:

- MVPとして軽い。
- 無料 / β版の利用開始体験を先に確認できる。
- 有料 / サブスク反映はv1.9以降へ送れる。

問題:

- DB側に料金形態正本がないため、厳密な安全性は弱い。
- フロント側allowlist管理を誤ると危険。
- RLSは有料 / サブスクinsertをDB側で拒否しない。
- `disabled` 復活禁止も実装側ガードに依存する。

条件:

- 対象 `app_key` を少数に限定する。
- `data/contents.json` の `priceType` が `free` / `free-beta` のものだけを対象にする。
- `paid` / `subscription` / `coming-soon` / `consultation` は絶対に対象外にする。
- 既存 `disabled` はユーザー操作で復活させない。
- 既存 `paused` だけを `active` / `trial` に戻す候補にする。
- 実装前に人間が対象 `app_key` と価格分類を確認する。

結論:

v1.7dの軽量MVP候補。ただし、DB側保証ではないため、`HUMAN_REQUIRED: YES` の人間判断を挟んで進む。

## 推奨方針

現時点の推奨は以下。

1. v1.7dでは、無料 / β版の少数allowlistに限定したフロント反映MVPを検討する。
2. ただし、これはDB側で完全に無料 / β版のみを保証するものではないと明記する。
3. 有料 / サブスクは `app_instances` に追加しない。
4. `disabled` はユーザー操作で復活させない。
5. `paused` の再開は、無料 / β版かつallowlist対象の場合だけ検討する。
6. 本格的な安全制御は、商品 / 料金正本のDB化、RPC / Edge Function、または管理者側反映へ送る。

つまり、v1.7dへ進むには「軽量MVPとしてフロントallowlistを許容するか」を人間が判断する必要がある。

## v1.7dの最小実装範囲案

v1.7dに進む場合の最小案は以下。

- 無料 / β版のみ対象。
- 有料 / サブスクは絶対に反映しない。
- 開発中 / 準備中 / 相談導線も反映しない。
- 対象 `app_key` を固定allowlistにする。
- `data/contents.json` の `priceType` が `free` / `free-beta` のものだけ対象候補にする。
- `app_instances(company_account_id, app_key)` の既存行を確認する。
- 既存 `active` / `trial` なら重複作成しない。
- 既存 `paused` なら、無料は `active`、β版は `trial` に戻す候補にする。
- 既存 `disabled` はユーザー操作で復活させない。
- `app_data` は触らない。
- `app_add_requests` は使わない。
- `company_accounts` / `plan_status` は触らない。
- `purchaseConfirmPage.js` の有料 / サブスク追加禁止は維持する。

ただし、v1.7d実装前に、対象 `app_key` と価格分類を人間が確認する。

## 有料 / サブスクの扱い

有料 / サブスクは、購入確認だけでは `app_instances` に追加しない。

決済完了または運営側の明示的な利用開始処理後まで追加しない。

決済未実装中に使わせたい場合は、有料 / サブスクではなく、無料 / β版 / 無料トライアルとして分類する。

フロントだけの判定で有料 / サブスクを守るのは弱い。

v1.9 決済・購入履歴以降で、決済完了、購入履歴、利用権限付与を接続する。

## v1.7dへ進む条件

v1.7dへ進むには、以下の人間判断が必要。

1. v1.7dを「無料 / β版限定の軽量MVP」として進めるか判断する。
2. フロントallowlist方式のリスクを許容するか判断する。
3. 対象 `app_key` を人間が確認する。
4. 対象商品の `priceType` が `free` / `free-beta` であることを人間が確認する。
5. 有料 / サブスクを対象外にすることを再確認する。
6. `disabled` を利用者操作で復活させない実装方針を確認する。
7. 本番相当DBに `app_instances` insert / updateを行うことを許容するか判断する。

この判断ができない場合は、v1.7d実装へ進まず、RPC / Edge Function / DB正本 / 運営側手動反映の設計へ進む。

## Supabase Dashboardで人間が確認すべきこと

今回のdocs整理ではDashboard操作は不要。

v1.7d実装前、またはRLS / migration案へ進む前には、以下を人間が確認する。

- `app_instances` の現在の列。
- `app_instances.status` の許可値。
- `app_instances(company_account_id, app_key)` のunique index。
- `app_instances_select_own_company` policy。
- `app_instances_insert_own_company` policy。
- `app_instances_update_own_company` policy。
- `app_instances` のdelete policyがないこと。
- `app_data.app_instance_id` の外部キーと cascade delete有無。
- 現行Supabase projectが本番相当DBであること。

## 今回実装しないこと

- `app_instances` insert / update実装。
- 利用開始DB処理実装。
- 利用解除DB処理実装。
- Supabase migrationファイル追加。
- Supabase migration変更。
- RLS変更。
- Auth変更。
- Edge Function実装。
- RPC実装。
- 決済実装。
- 購入履歴実装。
- 有料 / サブスクの利用可能化。
- `app_add_requests` を購入者導線に使うこと。
- 旧アプリ追加申請UI復活。
- 管理者画面からのDB編集。
- account / portal / my-apps のUI変更。
- `assets/js` の実装変更。

## HUMAN_REQUIRED

YES。

理由:

- 現行RLSだけでは無料 / β版のみinsertをDB側で保証できない。
- 有料 / サブスクの `app_key` を誤って追加するリスクをDB側で完全には防げない。
- `disabled` を利用者が復活できないようにするには、実装方針またはRLS / RPC / Edge Function側の追加判断が必要。
- v1.7dで軽量MVPとしてフロントallowlistを許容するか、人間判断が必要。
- 現行Supabase projectは本番相当DBであり、`app_instances` insert / updateを含む実装へ進む場合は人間確認が必要。

## 次フェーズ候補

`v1.7d 無料 / β版 app_instances反映MVP`

ただし、実装前に人間が以下を明示する。

- フロントallowlist方式で進めるか。
- 対象 `app_key`。
- 対象商品の `priceType`。
- 有料 / サブスクを絶対に対象外にすること。
- `disabled` を利用者操作で復活させないこと。
