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

## git状態関連
- 作業開始時に `git status` がcleanでない。
- 変更内容に今回作業と無関係の差分が混ざっている。
- push時に競合や認証エラーが発生した。
- mainへ直接作業している。
