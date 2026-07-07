# v1.7b app_instances status / 利用解除DB設計

## Phase

v1.7b app_instances status / 利用解除DB設計

## 状態

設計整理完了。

今回はdocs整理のみで、`app_instances` insert / update実装、利用開始DB処理、利用解除DB処理、Supabase migration、RLS、本体HTML / JS / CSS、`data/contents.json` は変更しない。

## 目的

購入後 / 利用開始後に正式な利用中アプリとして扱うため、`app_instances` のstatus設計、利用解除、再利用開始、`app_data` の扱い、RLS / migration要否を整理する。

v1.6では無料 / β版のみ `sessionStorage` 仮追加を許可した。v1.7方針整理では、正式な利用中アプリの正本は `app_instances` と決めた。

v1.7bでは、いきなり反映実装へ入らず、状態管理の土台を固める。

## 既存 app_instances schema

repo上のmigrationでは、`app_instances` は既に存在する。

確認元:

- `supabase/migrations/20260625_v010_company_account_foundation.sql`
- `supabase/migrations/20260625_v013_app_instances_from_signup_metadata.sql`
- `supabase/migrations/20260627_v016_ensure_works_portal_app_instance.sql`
- `assets/js/appInstanceService.js`
- `docs/05_実装指示/app-instance-list.md`
- `docs/05_実装指示/supabase-rls-policy.md`

### 列

`20260625_v010_company_account_foundation.sql` 上の列:

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

### status列

`status` 列は既に存在する。

現行check制約:

```text
active
trial
paused
disabled
```

このため、`inactive`、`pending`、`cancelled`、`beta` をそのまま `app_instances.status` に保存するにはmigrationが必要になる。

### 制約 / index

`v0.13` / `v0.16` migrationで、以下の一意indexが追加されている。

```text
app_instances(company_account_id, app_key)
```

同じ企業アカウントに同じ `app_key` を重複追加しない土台はある。

### app_dataとの関係

`app_data.app_instance_id` は `app_instances.id` を参照し、`on delete cascade` が設定されている。

そのため、`app_instances` を物理削除すると、`app_instance_id` で紐づく `app_data` も削除される可能性がある。

v1.7b方針として、利用解除では `app_instances` を物理削除しない。

### appsとの関係

`app_instances.app_key` は `apps.app_key` を参照する。

`apps.status` は以下のcheck制約を持つ。

```text
draft
active
beta
paused
internal
```

ただし、`apps` には料金形態 `free` / `paid` / `subscription` の正本はない。料金形態やCTAは、現状では主に `data/contents.json` / JS側にある。

## 既存表示 / 読込の確認

### AppInstanceService

`assets/js/appInstanceService.js` は、Supabase modeで以下を取得する。

```text
id, company_account_id, app_key, display_name, status, settings_json, created_at, updated_at
```

その後、`apps` の `app_key,name,description,status` を取得し、フロント側で結合する。

現状は `status` による表示除外は行っていない。`paused` / `disabled` の行が存在しても、取得結果には含まれる。

### account.html / my-apps.html

`account.html` と `my-apps.html` は、`AppInstanceService.getMyAppInstances()` の結果を利用中アプリ一覧として表示する。

現状は `active` / `trial` / `paused` / `disabled` の表示ラベルはあるが、停止済みアプリを通常一覧から除外する実装はない。

### portal.html

v1.6時点の `portal.html` は、購入確認ページの `sessionStorage` 仮追加を一時表示する。正式な利用中アプリ一覧の正本は `app_instances` へ寄せる方針だが、v1.7bではUI / JS変更はしない。

## status設計

現行check制約に合わせたMVP推奨は以下。

| status | 意味 | 主な用途 |
| --- | --- | --- |
| `active` | 利用中 | 無料アプリの正式利用中、有料 / サブスクの決済後または運営側有効化後 |
| `trial` | β版 / トライアル中 | β版利用、無料トライアル、検証用追加 |
| `paused` | 利用者側の利用停止 / 一時停止 | 利用解除済みだが再利用開始できる状態 |
| `disabled` | 運営側停止 / 安全停止 | 規約、契約、障害、運営判断による停止 |

### inactiveについて

利用解除を表す言葉としては `inactive` が分かりやすい。

ただし、現行check制約には `inactive` がないため、`inactive` を正式statusにするにはmigrationが必要。

v1.7b時点の推奨:

- MVPでは既存statusの `paused` を「利用解除 / 一時停止」相当として使う。
- 将来、画面文言では `利用解除済み` と表示してもよい。
- DB上も `inactive` に揃えたい場合は、v1.7c以降でmigration案を作る。

### pendingについて

`pending` は決済待ち / 承認待ちを表す候補だが、現行check制約にはない。

v1.7b時点では、決済未実装の有料 / サブスクを `pending` として `app_instances` に作らない。

理由:

- `pending` を作るにはmigrationが必要。
- 決済前の有料 / サブスクを `app_instances` に作ると、表示側のミスで利用可能に見えるリスクがある。
- 購入履歴 / 決済状態の正本がない段階で、`app_instances` に購入待ち状態を混ぜると責務が曖昧になる。

## 利用解除設計

利用解除は物理削除ではなく状態管理にする。

方針:

- `app_instances` は削除しない。
- 利用者側の解除は、MVPでは `status = paused` として扱う。
- 運営側停止は `status = disabled` として扱う。
- 再利用開始時は、対象が無料 / β版など再開可能な場合のみ `active` または `trial` へ戻す。
- 解除済み / 停止済みは、通常の利用中アプリ一覧では表示しない、または「停止中」表示に分離する。
- 管理者mock / 将来の履歴画面では確認できる余地を残す。

### UI確認方針

利用解除UIを実装する場合は、誤操作防止が必要。

候補:

- 解除前に確認ダイアログを表示する。
- 「データは削除されません」と明示する。
- 有料 / サブスクの停止は契約 / 決済と関係するため、ユーザー操作だけで完結させない。
- `disabled` は利用者が直接設定できない運営側状態にする。

今回はUI実装しない。

## app_dataの扱い

利用解除時に `app_data` は削除しない。

理由:

- 誤解除時に復旧できる。
- 再利用開始時に以前の設定やデータを引き継げる。
- トラブル対応や監査で役立つ。
- `app_instances` 物理削除は `app_data` cascade削除につながる可能性があり危険。

方針:

- 利用解除は `app_instances.status` の更新で表す。
- `app_data` は保持する。
- 再利用開始時は既存 `app_data` を引き継ぐ。
- 完全削除、データ消去、退会時削除、保存期間ポリシーは別フェーズで扱う。

## 無料 / β版の利用開始と app_instances

無料 / β版は、将来的に利用開始確認後に `app_instances` へ正式反映する候補。

候補フロー:

1. 購入確認ページで無料 / β版か確認する。
2. ログイン中企業アカウントを確認する。
3. `app_instances(company_account_id, app_key)` の既存行を確認する。
4. 既存行がなければ追加する。
5. 既存行が `paused` の場合は、再利用開始として `active` または `trial` へ戻す。
6. 既存行が `disabled` の場合は、ユーザー側だけで再開せず停止理由を表示する。

無料 / β版の推奨status:

- 無料: `active`
- β版: `trial`

ただし、v1.7bでは実装しない。

## 有料 / サブスクの扱い

有料 / サブスクは、購入確認だけでは `app_instances` に追加しない。

方針:

- 決済完了後、または運営側の明示的な利用開始処理後に追加する。
- 決済未実装中に使わせたい場合は、有料 / サブスクではなく無料 / β版 / 無料トライアルとして分類する。
- 有料 / サブスクを `sessionStorage` 仮追加対象にも正式 `app_instances` 反映対象にも含めない。
- 有料 / サブスクを `pending` として `app_instances` に置く案は、購入履歴 / 決済状態の正本ができるまで採用しない。

理由:

- 決済前に `app_instances` へ追加すると、利用可能に見えるリスクがある。
- フロントだけで有料 / サブスクを除外するのは安全性が弱い。
- DB / RLS側に料金形態や商品状態の正本がないため、安全な制御が難しい。

## RLS / migration 要否

### 現行RLSでできること

`app_instances` の現行policyは、`company_account_id` がログイン中ユーザーの自社であることを確認する。

確認できること:

- 自社 `app_instances` だけselectできる。
- insert / update時に、他社 `company_account_id` を指定することはRLSで拒否される。
- 他社データ混入を防ぐ最低限の企業分離はある。

### 現行RLSで不足すること

現行RLSは、商品種別や料金形態を判定しない。

不足:

- 無料 / β版だけinsert許可する制御がない。
- 有料 / サブスクの `app_key` をinsert拒否する制御がない。
- `status = active` / `trial` / `paused` / `disabled` の遷移制御がない。
- 利用者が `disabled` を解除できないようにする制御がない。
- `apps.status` は料金形態を持たない。
- `data/contents.json` はDB外の静的JSONなのでRLSから参照できない。

### status列追加の要否

status列自体は既に存在するため、MVPで `active` / `trial` / `paused` / `disabled` を使うならstatus列追加migrationは不要。

ただし、以下を採用する場合はmigrationが必要。

- `inactive`
- `pending`
- `cancelled`
- `beta`
- status遷移制約
- 解除理由、停止理由、停止日時、再開日時などの履歴列

### RLS変更の要否

v1.7dで無料 / β版の正式反映を安全に実装するには、RLSまたは管理された反映処理の見直しが必要になる可能性が高い。

選択肢:

1. DB側に商品 / 料金 / 公開状態の正本を持ち、RLSで無料 / β版だけinsert許可する。
2. フロントから直接insertせず、管理されたRPC / Edge Function / 運営処理で無料 / β版だけ反映する。
3. 当面は実装を見送り、`sessionStorage` 仮追加に留める。

v1.7bの結論として、v1.7cでRLS / migration案を整理してから実装可否を判断する。

## 推奨フェーズ分割

v1.7以降は以下に分割する。

### v1.7b app_instances status / 利用解除DB設計

今回のdocs整理。完了。

### v1.7c app_instances status / RLS / migration案

目的:

- 既存statusを使うか、`inactive` / `pending` を追加するか判断する。
- 無料 / β版だけを安全に反映するDB / RLS案を整理する。
- 商品 / 料金 / 公開状態のDB正本が必要か判断する。
- `disabled` は運営側だけが解除できるようにする必要があるか整理する。

### v1.7d 無料 / β版 app_instances反映実装

目的:

- v1.7cで安全条件が整った場合のみ実装する。
- 無料は `active`、β版は `trial` として反映する。
- 既存行があれば重複追加しない。
- `paused` は再利用開始候補として扱う。
- `disabled` はユーザー側で再開しない。

### v1.7e account / portal / my-apps 表示整合

目的:

- `active` / `trial` を通常の利用中として表示する。
- `paused` / `disabled` は通常一覧から除外するか、停止済みセクションに分離する。
- `sessionStorage` 仮追加と正式 `app_instances` 表示を混同しない。

### v1.7f 利用解除UI / paused化

目的:

- 無料 / β版の利用解除UIを検討する。
- 解除時は `app_instances.status = paused` とし、`app_data` は残す。
- 誤操作防止と再利用開始導線を整理する。

### v1.7g 有料 / サブスク反映は決済後へPARKED

目的:

- 有料 / サブスクは、v1.9決済・購入履歴、または運営側の明示的な利用開始処理後まで正式反映しない。

## 今回実装しないこと

- `app_instances` insert / update実装。
- 利用開始DB処理。
- 利用解除DB処理。
- Supabase migration変更。
- RLS変更。
- Auth変更。
- 決済実装。
- 購入履歴実装。
- 有料 / サブスクの利用可能化。
- `app_add_requests` を使う導線復活。
- 旧アプリ追加申請UI復活。
- 管理者画面からのDB編集。
- account / portal / my-apps のUI変更。
- assets/js の実装変更。

## HUMAN_REQUIRED

YES。

理由:

- 現行Supabase projectは本番相当DBであり、`app_instances` に関するschema / policy変更は人間確認が必要。
- v1.7c以降で、RLS / migration / 管理された反映処理の要否を人間判断する必要がある。
- 無料 / β版だけを安全に追加し、有料 / サブスクを拒否する制御は、現行RLSだけでは不足している。
