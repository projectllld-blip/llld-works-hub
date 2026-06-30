# v0.16 乙アカウント works_portal 有効化トラブル調査

## 状況

乙アカウントではログイン自体はできているが、`portal.html` で以下が表示される。

```text
このアカウントではポータル保存がまだ有効化されていません。管理者に確認してください。
```

この表示は、`assets/js/portalStateService.js` がログイン中企業アカウントの `app_instances` から `app_key = works_portal` を取得できないときに出る。

## コード上の期待値

- `portalStateService.js` が探している app_key: `works_portal`
- `portalStateService.js` が探している data_type: `portal_state`
- `company_account_id` の取得元: `AuthService.getCurrentAccount()` -> `company_accounts.owner_user_id = auth.uid()`
- app_instance取得条件: `app_instances.company_account_id = ログイン中企業ID` かつ `app_instances.app_key = works_portal`
- app_data保存条件: `company_account_id`、`app_instance_id`、`app_key = works_portal`、`data_type = portal_state`

## migration / docs上の想定

`works_portal` appは `supabase/migrations/20260627_v01411_portal_app_instance.sql` で作る想定だった。

v0.16では、乙のような「company_accountはあるがworks_portal app_instanceがない」状態を防ぐため、以下のmigration案で全企業アカウントへの基盤アプリ付与を明示する。

```text
supabase/migrations/20260627_v016_ensure_works_portal_app_instance.sql
```

`app_instances` の必要カラム:

- `company_account_id`
- `app_key`
- `display_name`
- `status`
- `settings_json`

`app_data.data_type = portal_state` は、`works_portal` の `app_instances.id` に紐づく1行として保存する。

RLS上は、`company_accounts.owner_user_id = auth.uid()` に一致する企業アカウントの `app_instances` / `app_data` だけをselect / insert / updateできる前提。

## 原因候補

### A. app_key不一致

- 判定: 可能性は低い。
- 根拠: コード、docs、migrationはいずれも `works_portal` / `portal_state` で一致している。
- 修正要否: なし。

### B. company_account_id取り違え

- 判定: 現時点では可能性は低い。
- 根拠: `AuthService.getCurrentAccount()` はSupabase Authの現在ユーザーを取得し、`company_accounts.owner_user_id = user.id` で企業アカウントを取得している。`portalStateService.js` はその `account.id` を使っている。
- 修正要否: なし。

### C. app_instances状態カラム不足 / inactive

- 判定: 可能性は低い。
- 根拠: `app_instances` には `status` があり、許容値は `active` / `trial` / `paused` / `disabled`。`portalStateService.js` は現状 `status` 条件を付けず、`company_account_id` と `app_key` だけで取得している。
- 修正要否: なし。

### D. RLSで自社app_instancesが読めない

- 判定: repo内だけでは未確定。
- 根拠: migration上のRLSは `company_accounts.owner_user_id = auth.uid()` と `app_instances.company_account_id` の一致で読める設計。ただし、実DBで乙の `company_accounts.owner_user_id` が乙のauth userと一致していない場合は0件に見える。
- 修正要否: 実DB確認が必要。RLS変更はCodex側では適用しない。

### E. 実DBに乙のworks_portal app_instanceが未作成

- 判定: 最有力。
- 根拠: signup画面の選択肢には `works_portal` がなく、`supabase/migrations/20260625_v013_app_instances_from_signup_metadata.sql` は `selected_app_keys` に入っているappだけを `app_instances` に作成する。v0.14.11 migrationは既存company全体へ `works_portal` を追加する案だが、適用後に作られた新規アカウントには自動で入らない可能性がある。
- 修正要否: 既存乙アカウントは実DBへの `works_portal` app_instance追加が必要。Codexでは実適用しない。今後の新規登録向けに、`AuthService.normalizeSignupInput()` で `works_portal` を必須app_keyとして `selected_app_keys` に含める修正を行った。

## コード側で修正したこと

今後の新規登録で `works_portal` が `selected_app_keys` から漏れないようにした。

- `AuthService.normalizeSignupInput()` で `works_portal` を必須app_keyとして追加する。
- UIの「使いたいアプリ」選択には出さず、ポータル基盤として内部的に付与する。

## v0.16 migration案

乙個別の手動追加ではなく、全企業アカウントへ `works_portal` を必ず付与するmigration案を追加した。

対象:

- `apps` に `works_portal` を保証する。
- `app_instances(company_account_id, app_key)` のunique indexを保証する。
- 既存の全 `company_accounts` に `works_portal` app_instanceを追加する。
- `portal_state` 初期行がない `works_portal` app_instanceへ初期 `app_data` を追加する。
- `handle_new_company_account()` を置き換え、新規signup時は `selected_app_keys` の有無に関係なく `works_portal` app_instanceを必ず作る。

実DBへの適用はCodexでは行わない。Supabase Dashboardで人間が内容確認後に適用する。

重複防止:

- `app_instances_company_app_unique` により `company_account_id + app_key` の重複を防ぐ。
- 既存企業への追加は `where not exists` を使う。
- 新規signup時の追加は `on conflict (company_account_id, app_key) do nothing` を使う。
- `portal_state` 初期行は `app_data_instance_type_unique` と `where not exists` で重複を防ぐ。

## 人間確認事項

- 乙の `company_accounts.owner_user_id` が乙のSupabase Auth user idと一致していること。
- 乙の `app_instances` に `app_key = works_portal` が存在すること。
- 存在しない場合は、乙個別追加ではなく `supabase/migrations/20260627_v016_ensure_works_portal_app_instance.sql` を人間が確認して適用すること。
- 適用後、乙ログインで `portal.html` を再読込し、`portal_state` が空状態または読込済みとして扱われること。
- 甲ログインで乙の `portal_state` が読めない / 更新できないこと。
