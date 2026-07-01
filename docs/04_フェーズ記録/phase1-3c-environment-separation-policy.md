# phase1-3c-environment-separation-policy

## Phase

v1.3c適用前 Supabase本番/検証分離方針整理

## 状態

方針整理のみ。Supabase SQL実行、migration適用、RLS変更、DB変更、Supabase project作成、`data/site-config.json` の実値変更は行っていない。

## 背景

環境分離状況確認の結果、repo構成上は production / staging / test が分離されていないことが分かった。

GitHub Pages公開版は `data/site-config.json` を参照しており、`auth.mode = supabase` である。

docs上では現在のSupabase projectを「検証用」と呼んできたが、GitHub Pages公開環境も同じSupabase projectを見ているため、運用上は本番相当DBとして扱うべき状態。

このため、`supabase/migrations/20260701_v13c_app_add_requests.sql` の実DB適用と、v1.3d account.html 申請DB保存実装はいったん停止する。

## 整理した方針

詳細な方針は `docs/16_ENVIRONMENT_SEPARATION_POLICY.md` を正とする。

要点:

- 現在のSupabase projectは、docs上は検証用として始まった。
- しかしGitHub Pages公開版も同じprojectを参照している。
- そのため、現在のSupabase projectは運用上、本番相当DBとして扱う。
- 今後migrationを実行する場合は、本番相当DBへの変更として `HUMAN_REQUIRED: YES` にする。
- 将来的に、別Supabase projectを検証用DBとして新規作成する方針を推奨候補にする。

## A案 / B案の比較

### A案: 現在のSupabase projectを本番相当DBとして扱う

推奨候補。

現在GitHub Pages公開版が参照しているprojectを本番相当DBとし、別途検証用Supabase projectを新規作成する。

既存の確認済みデータや公開版との整合性を保ちやすい一方、今後のmigrationは本番相当DBへの変更として慎重に扱う必要がある。

### B案: 現在のSupabase projectを検証用のまま扱う

別途、本番用Supabase projectを作成し、GitHub Pages公開版を本番用projectへ切り替える。

本番DBを新しく作れる一方、既存データ移行、Auth設定、RLS確認、`data/site-config.json` 切替、GitHub Pages公開版の再確認が必要になる。

## 確定方針

2026-07-01の人間判断により、A案を採用する。

```text
現在のSupabase project = 本番相当DB
新規作成する別Supabase project = 検証用DB
```

今後、現在GitHub Pages公開版が参照しているSupabase projectへのmigration / RLS / schema変更 / `app_data` / `app_instances` / Auth関連変更は、本番相当DBへの変更として扱う。

現在のSupabase projectに対するSQL適用は、必ず `HUMAN_REQUIRED: YES` とする。

## v1.3c migration停止理由

`20260701_v13c_app_add_requests.sql` は新規テーブルとRLS policyを追加するmigration案であり、既存データ削除は意図していない。

それでも、現在のSupabase projectがGitHub Pages公開版から参照されている以上、適用すると公開環境DBのschema変更になる。

現行Supabase projectへ適用する場合は、本番相当DBへのschema変更として扱う。

SQL全文確認とSQL Editorでの手動適用は人間が行う。Codexは実DBへ適用しない。

## v1.3c再開条件

v1.3cを現行Supabase projectへ適用して再開するには、以下を満たすこと。

1. 現在のSupabase projectを本番相当DBとして扱う前提を確認した。
2. 適用先project名を人間が明示した。
3. migration SQLを人間が全文確認した。
4. `drop`、`truncate`、`delete`、`disable row level security` がないことを確認した。
5. 既存テーブルや既存データへ破壊的影響がないことを確認した。
6. SQL Editorでの実行は人間が行う。
7. 適用後、RLSが有効なままか確認する。

検証用Supabase project作成後に検証DBへ適用する場合も、適用先project名を人間が明示し、SQL Editorでの実行は人間が行う。

## STOP条件

- Supabase SQL実行が必要。
- migration適用が必要。
- RLS変更が必要。
- DB変更が必要。
- Supabase project作成が必要。
- `data/site-config.json` の実値変更が必要。
- Supabase URL / anon key差し替えが必要。
- GitHub Pages設定変更が必要。
- v1.3c適用先projectの人間判断が未完了。
- 既存データ削除、RLS無効化、Auth破壊につながる変更が必要。
