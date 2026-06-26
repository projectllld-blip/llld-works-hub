# AGENTS.md - LLLD Works Hub / Works Market

## まず読む
- グローバルのLLLD制作方針を必ず先に読むこと。
- このrepoでは、会話履歴よりもrepo内ドキュメントを正とする。
- 古い仕様と新しい仕様が矛盾する場合は、`docs/00_PROJECT_STATUS.md` と `docs/05_DECISION_LOG.md` を優先する。

## Codexの役割
Codexは、実装者・修正者・検査者です。

ただし、プロダクト判断、UIUX最終判断、Supabase本番操作、外部サービス設定、秘密情報入力は行わない。必要に応じて人間確認で止まること。

## 作業原則
- 小さく安全に変更する。
- 既存機能を壊さない。
- GitHub Pages前提を維持する。
- Supabaseのsecretを絶対に入れない。
- service_roleを要求しない。
- 不明点を勝手に危険な方向で決めない。
- STOP条件に該当したら作業を終了し、`HUMAN_REQUIRED: YES` で報告する。
- 作業後は必ず `docs/03_CODEX_REPORT_FORMAT.md` の形式で報告する。
- 会話履歴に依存せず、repo内ドキュメントを正とする。

## Codexがやってよいこと
- HTML/CSS/JSの軽微な修正。
- docs追加。
- Issueテンプレート追加。
- PRテンプレート追加。
- QA workflow案の追加。
- 構文チェック。
- secret scan。
- JSON parse。
- リンク確認。
- localStorageなどフロント側の実装。
- mock実装。
- draft migrationの作成。

## Codexが止まるべきこと
- Supabase Dashboardでの手動操作。
- RLSやmigrationの実DB適用。
- APIキー発行・入力。
- GitHub Secrets設定。
- GitHub Pages設定変更。
- DNS設定。
- Stripe / OAuth / メール送信など外部サービス設定。
- UIUXの好み判断。
- 本番データ削除。
- 破壊的変更。
- 仕様が曖昧で勝手に決めると危険な変更。

## 壊してはいけないもの
- `portal.html`
- `index.html`
- `account.html`
- `marketplace.html`
- `login.html`
- `signup.html`
- 既存HTMLアプリへのリンク。
- Supabase auth。
- `company_accounts`
- `app_instances`
- `app_data`
- `app_data.data_type = portal_state` の保存方針。
- GitHub Pages公開前提の構成。

## このrepoの技術前提
- GitHub Pagesで動く静的HTML / CSS / JavaScript中心の構成を維持する。
- パスは相対パスを基本にする。
- Supabase連携はあるが、secretやservice_roleはrepoに入れない。
- フロントに置いてよいのは公開前提のSupabase anon / public / publishable keyのみ。
- 既存設定は勝手に書き換えない。

## GitHub連動ルール
GitHubリモートが設定されている場合は、今回の作業に関係する変更だけを切り分けてcommitし、認証や競合などで失敗しない限りpushまで行う。

既存の未コミット変更がある場合は、勝手に混ぜず、今回分だけをstageする。pushできなかった場合は、理由と未反映のcommit有無を完了報告で伝える。
