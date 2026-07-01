# 16 ENVIRONMENT SEPARATION POLICY

## 目的

Supabaseの本番環境と検証環境を混同しないための方針を記録する。

v1.3c `app_add_requests` migration適用前に、現在GitHub Pages公開版が参照しているSupabase projectをどう扱うかを明確にする。

## 現在の環境構成

- GitHub Pages公開版はrepo内の `data/site-config.json` を参照する。
- `data/site-config.json` は `auth.mode = supabase` である。
- Supabase URLとanon / publishable keyは設定済みである。
- repo内に production / staging / test 用の別configはない。
- GitHub Pages公開環境とローカル検証環境で、Supabase設定を切り替える仕組みはまだない。

## 現在のSupabase projectの扱い

docs上では、現在のSupabase projectは「検証用」として始まった記録がある。

ただし、GitHub Pages公開版も同じ `data/site-config.json` を参照しているため、運用上は現在のSupabase projectを本番相当DBとして扱う。

この状態でmigrationを適用すると、検証作業のつもりでもGitHub Pages公開環境が参照するDB schemaへ反映される可能性がある。

## A案: 現在のSupabase projectを本番相当DBとして扱う

内容:

- 現在GitHub Pagesが参照しているSupabase projectを本番相当DBとする。
- 今後のmigrationは、本番相当DBへの変更として慎重に扱う。
- 別途、新しいSupabase projectを検証用DBとして作る。
- 将来的に `site-config` を本番用 / 検証用で分離する。

利点:

- 現在のGitHub Pages公開版との整合性を保ちやすい。
- 既存の確認済みログイン、企業情報、`portal_state` 保存などをそのまま維持しやすい。
- 既存データ移行の負担が比較的小さい。

注意点:

- 今後のSQL適用は本番相当DBへの変更として扱う必要がある。
- 検証用projectを別途作るまで、migration検証の逃げ場がない。
- SQL Editor適用、RLS変更、Auth設定変更は必ず `HUMAN_REQUIRED: YES` とする。

## B案: 現在のSupabase projectを検証用のまま扱う

内容:

- 別途、本番用Supabase projectを作成する。
- GitHub Pages公開版を本番用Supabase projectへ切り替える。
- 既存データ移行や設定切替を行う。

利点:

- 現在のprojectを検証DBとして使い続けられる。
- 本番DBを新しくきれいに作れる。
- migration検証と本番運用を明確に分けやすい。

注意点:

- 本番用project作成、migration適用、seed、Auth設定、RLS確認が必要になる。
- 既存の企業アカウント、`app_instances`、`app_data` を移すか捨てるかの判断が必要になる。
- `data/site-config.json` の切替作業が必要になる。
- GitHub Pages公開版の接続先変更は人間判断とブラウザ確認が必要。

## 確定方針

2026-07-01の人間判断により、A案を採用する。

```text
現在のSupabase project = 本番相当DB
新規作成する別Supabase project = 検証用DB
```

理由:

- GitHub Pages公開版がすでに現在のSupabase projectを参照しているため。
- 既存のv1.0 / v1.2b確認結果が現在のprojectに依存しているため。
- 本番用projectを新規に作って切り替えるより、まず検証用projectを別に追加する方が現状の整合性を崩しにくいため。

今後、現在GitHub Pages公開版が参照しているSupabase projectへの以下の変更は、本番相当DBへの変更として扱う。

- migration適用。
- RLS変更。
- schema変更。
- `app_data` 変更。
- `app_instances` 変更。
- Auth関連変更。

現在のSupabase projectに対するSQL適用は、必ず `HUMAN_REQUIRED: YES` とする。

## v1.3c app_add_requests migrationの扱い

`supabase/migrations/20260701_v13c_app_add_requests.sql` はrepo上に存在するが、実DBには未適用。

現行Supabase projectへ適用する場合は、本番相当DBへの変更として扱う。

適用前に人間がSQL全文を確認し、SQL Editorで手動適用する。Codexは実DBへ適用しない。

## v1.3c再開条件

v1.3c `app_add_requests` migrationを現行Supabase projectへ適用して再開するには、以下を満たすこと。

1. 現在のSupabase projectを本番相当DBとして扱う前提を確認している。
2. 適用先project名を人間が明示している。
3. migration SQLを人間が全文確認している。
4. `drop`、`truncate`、`delete`、`disable row level security` がないことを確認している。
5. 既存テーブルや既存データへ破壊的影響がないことを確認している。
6. SQL Editorでの実行は人間が行う。
7. 適用後、RLSが有効なままか人間が確認する。

検証用Supabase project作成後に検証DBへ適用する場合も、適用先project名を人間が明示し、SQL Editorでの実行は人間が行う。

## 本番/検証分離後の想定構成

推奨構成:

- GitHub Pages公開版: 本番相当Supabase projectを参照する。
- ローカル検証: 検証用Supabase projectを参照する。
- migration検証: まず検証用Supabase projectで確認し、問題なければ本番相当DBへ人間が適用する。

## site-config分離案

将来候補:

- `data/site-config.json`: GitHub Pages公開版用。
- `data/site-config.local.json`: ローカル検証用。repoへ入れない、またはテンプレートだけ置く。
- `data/site-config.example.json`: 設定例。secretや実keyは入れない。

注意:

- GitHub Pagesは静的配信のため、フロントに置いた値は公開される。
- フロントに置いてよいのはanon / public / publishable keyのみ。
- service role key、DB password、private key、secretは絶対に置かない。

## GitHub Pagesとローカル検証の切替案

短期:

- GitHub Pages公開版は現在の `data/site-config.json` を使う。
- 検証用projectを作るまでは、DB変更の検証も本番相当DBで行うことになる。
- 既存データ削除、RLS無効化、Auth破壊につながる変更は禁止する。
- migration適用、RLS変更、schema変更、`app_data` / `app_instances` / Auth関連変更は必ず `HUMAN_REQUIRED: YES` とする。

中期:

- ローカル検証時だけ別configを読み込める仕組みを設計する。
- ただし、config切替実装は本体JS変更になるため、別Phaseで扱う。

長期:

- 本番、検証、ローカルの運用手順をdocs化する。
- migration適用順序、RLS確認、Auth URL設定、GitHub Pages反映確認をチェックリスト化する。

## STOP条件

以下に該当した場合は、Codexは作業を止めて `HUMAN_REQUIRED: YES` とする。

- Supabase SQL Editorでの実行が必要。
- migration適用が必要。
- RLS変更が必要。
- DB変更が必要。
- Supabase project作成が必要。
- `data/site-config.json` の実値変更が必要。
- Supabase URL / anon key差し替えが必要。
- GitHub Pages設定変更が必要。
- 本番相当DBへ変更してよいか人間判断が必要。
- 検証用projectと本番相当projectのどちらに適用するか不明。
- 既存データ削除、RLS無効化、Auth破壊につながる変更が必要。
