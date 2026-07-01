# 02 STOP CONDITIONS

以下に該当した場合、Codexはそれ以上勝手に進めず、作業を完了扱いにして `HUMAN_REQUIRED: YES` として報告する。

## Supabase関連
- Supabase Dashboardでの手動設定が必要。
- Supabase URL / anon key など人間入力が必要。
- RLSやmigrationを実DBへ適用する必要がある。
- Storage bucket作成が必要。
- service_role key が必要になりそう。
- 既存データに影響する変更がある。
- 本番DBと検証DBの判断が必要。

## GitHub / 公開関連
- GitHub Pages設定変更が必要。
- GitHub Secrets設定が必要。
- branch protection設定が必要。
- mainへの反映判断が必要。
- 公開URLでの確認が必要。
- GitHub Actions実装、workflow permissions変更、auto-merge有効化が必要。
- docs-only自動マージ対象外ファイルに触れている。
- GitHub Actionsまたは必須QAが失敗している。
- GitHub auto-merge設定に失敗した。
- branch protection / required checks / auto-merge設定が不明。
- PR作成、PRレビュー、mainマージ、branch削除を人間が行う必要がある。

## 外部サービス関連
- Stripe。
- Google OAuth。
- メール送信。
- DNS。
- 独自ドメイン。
- OpenAI API key。
- Gemini API key。
- その他APIキーやsecret。

## UIUX関連
- 見た目の好み判断が必要。
- iPad / スマホ / PCでの目視確認が必要。
- 日本のLPとしての見え方判断が必要。
- ユーザー体験上の優先順位判断が必要。

## 安全性関連
- 破壊的変更。
- 既存データ削除。
- 認証・権限・RLS・支払いに関わる変更。
- secret混入の疑い。
- 仕様が曖昧で勝手に決めると危険。
- service_role / sb_secret_ / private key / access_token / refresh_token などの混入疑い。
- RLSを無効化するSQLや `disable row level security` の追加。
- Supabase設定、Auth / login / signup / account、migration、`app_data`、`app_instances` に関わる変更。

docs-only自動マージ判定では、`service_role`、`sb_secret_`、`secret`、`disable row level security`、`RLS`、`migration` などをSTOP条件や禁止語説明としてdocsへ書くだけなら、このSTOP条件には該当しない。

ただし、以下はSTOP条件に該当する。
- 実secret値らしき文字列を追加している。
- private key blockを追加している。
- `alter table ... disable row level security` のようなRLS無効化SQLを追加している。
- Supabase URL / anon key / service_role keyなどの設定値を変更している。

## HUMAN_REQUIRED判定関連
- `HUMAN_REQUIRED` は「作業が残っているか」ではなく、「人間が実務として確認・判断・操作する必要が残っているか」で判定する。
- 人間が何か1つでも確認・判断・操作する必要がある場合は `HUMAN_REQUIRED: YES` とする。
- 人間が何もしなくてよい場合だけ `HUMAN_REQUIRED: NO` とする。
- mainマージが必要でも、GitHub auto-mergeが安全に設定済みで人間操作が残っていなければ `HUMAN_REQUIRED: NO` にできる。
- GitHub auto-merge設定不足、branch protection確認、required checks確認が必要な場合は `HUMAN_REQUIRED: YES` とする。

## git状態関連
- 作業開始時に `git status` がcleanでない。
- 変更内容に今回作業と無関係の差分が混ざっている。
- push時に競合や認証エラーが発生した。
- mainへ直接作業している。
