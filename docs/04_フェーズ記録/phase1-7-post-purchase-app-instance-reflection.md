# v1.7 購入後の利用開始反映 方針整理

## Phase

v1.7 購入後の利用開始反映 方針整理

## 状態

方針整理完了。

今回はdocs整理のみで、`app_instances` insert / update、利用開始DB処理、利用解除DB処理、Supabase migration、RLS、本体HTML / JS / CSS、`data/contents.json` は変更しない。

## 目的

v1.6では、無料 / β版は `sessionStorage` による仮追加表示、有料 / サブスクは購入確認のみで利用可能にしない方針を確認した。

v1.7では、購入確認 / 利用開始確認後に、どのタイミングで正式な利用中アプリとして `app_instances` へ反映するかを整理する。

## 既存 app_instances 構造

repo上のmigration / docs / JSから確認できる既存構造は以下。

### テーブル

`supabase/migrations/20260625_v010_company_account_foundation.sql` では、`app_instances` は以下の列を持つ。

- `id`
- `company_account_id`
- `app_key`
- `display_name`
- `status`
- `settings_json`
- `created_at`
- `updated_at`

`status` のcheck制約候補:

```text
active
trial
paused
disabled
```

`supabase/migrations/20260625_v013_app_instances_from_signup_metadata.sql` と `supabase/migrations/20260627_v016_ensure_works_portal_app_instance.sql` では、以下の一意制約が追加されている。

```text
app_instances(company_account_id, app_key)
```

このため、同じ企業に同じ `app_key` を重複追加しない設計は既にある。

### 読込

`assets/js/appInstanceService.js` は `app_instances` から以下を取得している。

```text
id, company_account_id, app_key, display_name, status, settings_json, created_at, updated_at
```

その後、`apps` を `app_key` で取得して、`account.html` / `my-apps.html` 用の利用中アプリ表示へつなげている。

### 表示

- `account.html`: 利用中アプリ一覧を表示する。
- `my-apps.html`: 利用中アプリ一覧と利用状態を表示する。
- `portal.html`: v1.6時点では `sessionStorage` の仮追加を一時表示するが、正式な利用中アプリの正本は `app_instances` へ寄せる方針。

## sessionStorage仮追加と正式反映の切り分け

v1.6の `sessionStorage` 仮追加は、購入ページMVPの見た目確認用である。

- `sessionStorage`: 同一ブラウザセッション内の一時表示。
- `app_instances`: 企業アカウント単位の正式な利用中アプリ。
- v1.7以降は、無料 / β版も最終的には `app_instances` を正とする。
- 有料 / サブスクは、決済未実装中は `sessionStorage` 仮追加も正式追加もしない。
- `sessionStorage` の仮追加だけでは、別ブラウザ / 別端末 / 再ログイン時に利用中アプリとして復元されない。

## 無料 / β版の正式利用開始方針

### 無料アプリ

候補方針:

- 利用開始確認後、`app_instances` に追加する。
- 既に `app_instances(company_account_id, app_key)` が存在する場合は重複追加しない。
- `status = disabled` / `paused` のような停止状態がある場合は、再利用開始時に `active` へ戻す候補にする。
- `display_name` は `apps.name` または商品設定側の表示名を使う。
- `settings_json` は初期値 `{}` にする。

ただし、現行RLSだけでは「無料アプリだけinsert可」をDB側で判定できない。

### β版アプリ

候補方針:

- β版利用確認後、`app_instances` に追加する。
- `status = trial` または `settings_json` にβ版由来の情報を持たせる候補がある。
- `apps.status = beta` と紐づけられる場合は、表示側でβ版と分かるようにする。
- 既に存在する場合は重複追加しない。

ただし、β版かどうかを `data/contents.json` / `apps.status` / 将来の商品設定DBのどれで判定するかを決める必要がある。

## 有料 / サブスクの扱い

決定事項:

- 有料 / サブスクは、購入確認だけでは `app_instances` に追加しない。
- 有料 / サブスクは、決済完了または運営側の明示的な利用開始処理後に `app_instances` へ追加する。
- 決済未実装中に無料で使わせたい場合は、有料 / サブスクではなく、無料 / β版 / 無料トライアルとして分類する。
- `portal.html` / `my-apps.html` / `account.html` に、購入済み・利用可能として表示しない。
- フロントからの自由な `app_instances` insertで有料 / サブスクが追加される状態にはしない。

## 利用解除方針

利用解除は、`app_instances` の物理削除ではなく状態管理が望ましい。

候補:

- `status = disabled`: 利用停止。
- `status = paused`: 一時停止。
- `status = active`: 利用中。
- `status = trial`: β版 / トライアル中。

既存 `app_instances.status` には `active` / `trial` / `paused` / `disabled` があるため、状態管理の土台はある。

ただし、以下は未整理。

- 誰が利用解除できるか。
- 利用解除時に `app_data` を残すか。
- 再利用開始時に過去設定を復元するか。
- 有料 / サブスクの停止をユーザー操作で許可するか。
- 停止履歴を `audit_logs` に残すか。

## RLS方針

既存RLSでは、`app_instances` は `company_account_id` がログイン中ユーザーの自社であることを確認している。

既存方針:

- 自社の `app_instances` だけselectできる。
- 自社の `app_instances` だけinsert / updateできる。
- 他社 `company_account_id` へのinsertはRLSで拒否される。

不足している点:

- 無料 / β版だけをinsert可にする商品状態判定はない。
- 有料 / サブスクをフロントから勝手にinsertできないようにするDB側制御が不足している。
- 商品状態は現状 `data/contents.json` やJSにも存在し、RLSからは直接参照できない。
- `apps.status` は `active` / `beta` などを持つが、料金形態 `free` / `paid` / `subscription` までは持たない。
- RLSだけで商品状態と料金状態を完全に判定するには、DB上の商品 / 料金 / CTA正本が必要になる可能性が高い。

結論:

v1.7の正式DB反映実装へ進む前に、少なくとも以下のどちらかが必要。

1. 無料 / β版としてinsert可能な `app_key` をDB側で安全に判定できる仕組み。
2. フロントから直接insertせず、運営側または管理された関数 / APIで無料 / β版だけを反映する仕組み。

現行RLSのまま、購入確認ページから汎用的に `app_instances` insertを行う実装は、有料 / サブスク混入リスクがあるため避ける。

## 既存構造で対応できること / できないこと

### 対応できること

- `app_instances` を正式な利用中アプリの正本にする。
- `company_account_id + app_key` の重複防止。
- `status` による active / trial / paused / disabled の状態表現。
- 自社 `company_account_id` の範囲に限定したselect / insert / update。
- `account.html` / `my-apps.html` で利用中アプリとして表示する。

### まだ安全に対応できないこと

- 無料 / β版だけをDB側でinsert許可すること。
- 有料 / サブスクをDB側で確実にinsert拒否すること。
- 決済完了後だけ有料 / サブスクを反映すること。
- 料金形態、商品状態、CTA、購入可否をDB正本として扱うこと。
- 利用解除履歴、再開履歴、購入履歴を残すこと。

## v1.7分割案

安全のため、v1.7は以下に分割する。

### v1.7a 購入後反映 方針整理

今回のdocs整理。完了。

### v1.7b app_instances status / 利用解除DB設計

目的:

- 既存 `status` の使い方を確定する。
- `active` / `trial` / `paused` / `disabled` の意味を整理する。
- 利用解除、再開、履歴、`app_data` の扱いを整理する。
- RLS / migrationが必要か判断する。

### v1.7c 無料 / β版 app_instances反映設計

目的:

- 無料 / β版だけを正式反映できる条件を設計する。
- 有料 / サブスクが混入しない制御を設計する。
- DB側の商品状態正本が必要か確認する。
- 必要ならmigration / RLS案を作る。

### v1.7d 無料 / β版 app_instances反映MVP

目的:

- v1.7b / v1.7cで安全条件が揃った後、無料 / β版だけを `app_instances` へ反映する。
- 既存行があれば重複追加しない。
- 停止状態なら再開する。
- `account.html` / `my-apps.html` / `portal.html` の表示を整合させる。

### v1.7e 有料 / サブスク反映は決済後へPARKED

目的:

- 有料 / サブスクはv1.9決済・購入履歴、または運営側の明示的な利用開始処理後に反映する。
- 決済前に利用可能化しない方針を維持する。

## STOP条件

以下に該当する場合は、v1.7実装へ進まず停止する。

- `app_instances` insert / update実装が必要。
- Supabase migration変更が必要。
- RLS変更が必要。
- DB保存処理が必要。
- 無料 / β版だけを安全に追加するDB側制御がない。
- 有料 / サブスクを誤って追加する可能性がある。
- account / portal / my-apps の表示整合にコード変更が必要。
- Auth変更が必要。
- site-config変更が必要。
- 決済実装が必要。
- 購入履歴実装が必要。

## 次フェーズ推奨

次は `v1.7b app_instances status / 利用解除DB設計` を推奨する。

理由:

- 既存 `app_instances.status` には状態管理の土台がある。
- ただし、利用解除、再利用開始、履歴、`app_data` の扱いが未確定。
- 無料 / β版反映を実装する前に、状態設計を固める必要がある。
- 有料 / サブスク混入を防ぐため、RLS / 商品状態DB / 管理された反映処理の要否を人間判断する必要がある。

## HUMAN_REQUIRED

YES。

理由:

- 既存RLSだけでは無料 / β版だけを安全にinsert許可し、有料 / サブスクを拒否する制御が不足している。
- v1.7b以降で、DB / RLS / migration要否の人間判断が必要。
- 現行Supabase projectは本番相当DBであり、`app_instances` に関するschema / policy変更は人間確認が必要。
