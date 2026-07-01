# v1.0 アカウント別クラウド基盤MVP完成 条件整理

## 状態

完了。

v1.0は販売開始や決済開始ではなく、アカウント別クラウド基盤のMVP完成宣言を行うPhase。

v0.18 検証環境デプロイまでに、GitHub Pages公開版、認証・ポータル導線、PC / iPad / スマホ表示の大きな崩れがないことは確認済み。

v0.9.5〜v0.18で整備した範囲を、アカウント別クラウド基盤MVPとして完了扱いにする。

## v1.0の目的

企業アカウント単位で、ログイン、企業情報取得、利用アプリ取得、ポータル状態のクラウド保存・復元、企業間データ分離が最低限成立していることを確認し、アカウント別クラウド基盤MVPとして区切る。

## v1.0に含める範囲

### 認証

- signup。
- login。
- logout。
- 未ログイン時の `portal.html` からloginへの誘導。
- login後の `portal.html` への復帰。

### 企業アカウント

- `company_accounts`。
- ログイン中ユーザーに紐づく企業アカウント取得。
- `account.html` の企業情報表示。

### 利用アプリ

- `app_instances`。
- `account.html` の利用アプリ一覧。
- 主要アプリ入口リンク。
- `works_portal` を全企業アカウント必須の基盤アプリとして扱う方針。

### ポータルクラウド保存

- `works_portal`。
- `app_data.data_type = portal_state`。
- 現在保存対象になっているポータル内データ。
  - メモ / ToDo。
  - 掲示板。
  - 保管庫ツリー構造。
  - 保管庫リンク情報。
  - お気に入り。
  - 最近使ったもの。
  - ポータル表示設定。
- 企業アカウント単位の保存・復元。

### RLS / データ分離

- `portal_state` の企業間分離。
- 他社データ混入が確認されていないこと。
- RLSが無効化されていないこと。
- service_role keyを使わないこと。

### 公開環境

- GitHub Pages公開URL。
- 主要ページHTTP 200。
- PC / iPad / スマホで大きな崩れがないこと。
- `portal.html` のヘッダー非表示・大きな横崩れが解消済みであること。

## v1.0に含めない範囲

- 販売機能。
- 決済。
- 購入履歴。
- アプリ追加申請。
- 管理者承認画面。
- スタッフ個別ログイン。
- 権限管理。
- 複数店舗管理。
- 自動決済。
- 高度管理者ダッシュボード。
- SeatFlow完全クラウド同期。
- バックアップ復元の実装。
- Supabase Storage。
- ファイル本体保存。
- 販売用UI/UX強化。
- β販売開始。

## PARKED範囲

以下はv1.0には含めず、引き続きPARKED。

- SeatFlow完全クラウド同期。
- SeatFlow複数レイアウト同期。
- SeatFlow名簿 / QR / NFC / メモのクラウド保存。
- SeatFlow全体状態の完全バックアップ・復元。
- 複数タブ競合解決。
- v0.17b バックアップJSONエクスポートMVP。
- v0.17c バックアップJSON読込・検証・プレビュー。
- v0.17d 限定復元設計。
- 復元実装。
- 決済。
- 購入履歴。
- スタッフ個別ログイン。
- 権限管理。
- 複数店舗管理。
- 自動決済。

## v1.0完了判断に必要な確認項目

v1.0完了整理へ進む前に、以下を確認する。

- 企業アカウントでsignupできる。
- 企業アカウントでloginできる。
- logoutできる。
- 未ログインで `portal.html` を開くとloginへ誘導される。
- login後に `portal.html` へ戻れる。
- `account.html` が開ける。
- `account.html` に企業情報が表示される。
- `account.html` に利用アプリ一覧が表示される。
- `portal.html` がログイン後に開ける。
- `portal_state` がSupabaseへ保存できる。
- `portal_state` がリロード後に復元できる。
- 別企業アカウントと `portal_state` が混ざらない。
- GitHub Pages公開URLで主要ページが開ける。
- Supabase Auth URL Configurationが公開URLに合っている。
- RLSが有効なまま。
- `service_role` / `sb_secret_` / secretがrepoに混入していない。
- PARKED範囲が誤って公開UIやv1.0範囲に混ざっていない。
- スマホ版の軽微なUI調整余地をv1.0ブロッカーにしない判断が維持されている。

## v1.0完了候補条件

以下を満たしているため、v1.0完了扱いにする。

- 認証導線が公開版で成立している。
- `company_accounts` と `app_instances` がログイン中企業アカウント単位で取得できる。
- `portal_state` が企業アカウント単位で保存・復元できる。
- 企業間で `portal_state` が混ざらない。
- GitHub Pages公開版で主要ページが開ける。
- Supabase設定、RLS、secret混入に重大問題がない。
- PARKED範囲が明確に切り分けられている。

## v1.0完了判断

v1.0 アカウント別クラウド基盤MVP完成は完了。

完了扱いに含むもの:

- 企業アカウント単位のsignup / login / logout。
- 未ログイン時の `portal.html` login誘導。
- login後の `portal.html` 復帰。
- `company_accounts` の取得。
- `app_instances` の取得。
- `account.html` の企業情報表示。
- `account.html` の利用アプリ一覧。
- `works_portal` app_instance。
- `portal_state` のSupabase保存・復元。
- `portal_state` の企業間分離。
- GitHub Pages公開環境での主要ページ確認。
- PC / iPad / スマホで大きな崩れがないこと。

完了扱いに含めないもの:

- 販売機能。
- 決済。
- 購入履歴。
- アプリ追加申請。
- 管理者承認画面。
- スタッフ個別ログイン。
- 権限管理。
- 複数店舗管理。
- SeatFlow完全クラウド同期。
- バックアップ復元の実装。
- Supabase Storage。
- ファイル本体保存。

## v1.1へ進む前の確認事項

v1.1 簡易管理者画面では、いきなり実装に入らず、まず管理者画面で見る対象と権限境界を整理する。

確認すること:

- 管理者画面で何を見るべきか。
- 企業一覧を表示する必要があるか。
- `company_accounts` の一覧確認が必要か。
- `app_instances` の確認が必要か。
- `app_data` / `portal_state` の状態確認が必要か。
- 管理者認証をどう扱うか。
- 管理者権限をどのテーブル・RLSで表現するか。
- v1.1でDB / RLS変更が必要そうか。
- Supabase Dashboard操作が必要か。
- 人間判断が必要な設定・権限・公開範囲があるか。

v1.1で注意すること:

- service_role keyをフロントに置かない。
- RLSを無効化しない。
- 企業横断のデータ閲覧は権限設計なしに実装しない。
- 管理者画面を公開URLに置く場合のアクセス制御を先に決める。
- DB / RLS / migration変更が必要な場合は案だけ作り、人間確認で止まる。

## v1.1 作業票案

```md
# LLLD Works Hub / Works Market

# Codex作業票：v1.1 簡易管理者画面 方針整理

## 今回の作業

v1.1 簡易管理者画面に進む前に、管理者画面で見る対象、権限境界、実装範囲、STOP条件を整理してください。

今回は実装に入らず、docs整理のみ行ってください。

## 前提

- v1.0 アカウント別クラウド基盤MVP完成は完了。
- v1.0は販売開始ではなく、企業アカウント単位のクラウド基盤MVP完成。
- 決済、購入履歴、スタッフ個別ログイン、権限管理、複数店舗管理、SeatFlow完全クラウド同期、バックアップ復元はPARKED。

## 整理すること

- 管理者画面で何を見るべきか。
- 企業一覧が必要か。
- `company_accounts` の確認範囲。
- `app_instances` の確認範囲。
- `app_data` / `portal_state` の状態確認範囲。
- 管理者認証・管理者権限の扱い。
- v1.1でDB / RLS / migration変更が必要か。
- Supabase Dashboard操作が必要か。
- 人間判断が必要な点。

## 触ってよいファイル

- docs/04_フェーズ記録/phase1-1-admin-screen.md
- docs/00_PROJECT_STATUS.md
- docs/06_TASK_QUEUE.md
- docs/05_DECISION_LOG.md
- docs/03_構想/roadmap-after-portal-uiux-change.md

## 触ってはいけないファイル

- portal.html
- login.html
- signup.html
- account.html
- assets/js/*.js
- data/site-config.json
- Supabase migration
- .github/workflows/qa.yml
- Supabase URL / anon key関連設定

## STOP条件

- 本体UI / JS実装が必要
- Supabase Dashboard操作が必要
- DB / RLS / migration変更が必要
- service_role keyが必要
- 管理者権限の人間判断が必要
- 企業横断データ閲覧の安全性が判断できない

## 報告フォーマット

docs/03_CODEX_REPORT_FORMAT.md に従ってください。
```

## v1.0後に進むPhase候補

- v1.1 簡易管理者画面。
- v1.2 企業情報編集。
- v1.3 アプリ追加申請。
- v1.4 購入ページ。
- v1.5 決済・購入履歴。
- v1.6 実アプリの商品化。
- v1.7 販売用UI/UX強化。
- v1.8 販売前QA・導入テスト。
- v1.9 β販売開始。
- v2.0 小規模事業者向け販売版。

## 後回し / 将来Phase

- v2.1 スタッフ個別ログイン。
- v2.2 権限管理。
- v2.3 複数店舗管理。
- v2.4 自動決済。
- v2.5 利用状況分析。
- v2.6 アプリ投稿・販売機能。
- v2.7 テンプレートマーケット化。
- v2.8 高度管理者ダッシュボード。

## 現時点の判断

v1.0完了。

次の候補は v1.1 簡易管理者画面。

ただし、v1.1は管理者権限・企業横断確認・DB / RLS変更に踏み込む可能性があるため、最初は方針整理から始める。
