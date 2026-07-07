# v1.7d事前確認 無料 / β版 allowlist対象app_key確認

## Phase

v1.7d事前確認 無料 / β版 allowlist対象app_key確認

## 目的

v1.7d 無料 / β版 `app_instances` 反映MVPへ進む前に、正式反映してよい候補 `app_key` を整理する。

今回は調査とdocs整理のみ。`app_instances` insert / update、RLS変更、migration追加、UI / JS変更は行わない。

## 前提

- v1.7cで、現行RLSだけでは無料 / β版のみinsert許可、有料 / サブスク拒否、`disabled` 復活禁止をDB側で完全保証できないことを確認済み。
- 軽量MVPとして、無料 / β版の少数 `app_key` だけをフロント側allowlistで正式反映する方式は一旦許容する。
- ただし、実装前に対象 `app_key`、価格分類、既存DB制約 / policy、`disabled` 復活禁止方針を人間が確認する。

## 参照したもの

- `data/contents.json`
- `assets/js/purchaseConfirmPage.js`
- `assets/js/marketPages.js`
- `assets/js/appInstanceService.js`
- `purchase-confirm.html`
- `marketplace.html`
- `content-detail.html`
- `account.html`
- `portal.html`
- `my-apps.html`
- `docs/04_フェーズ記録/phase1-7c-app-instances-rls-migration-plan.md`
- `docs/04_フェーズ記録/phase1-7b-app-instances-status-design.md`
- `docs/04_フェーズ記録/phase1-7-post-purchase-app-instance-reflection.md`
- `docs/04_フェーズ記録/phase1-6b-product-pricing-cta-settings.md`
- `docs/04_フェーズ記録/phase1-4-productization-policy.md`

## 重要な確認結果

`data/contents.json` には `app_key` / `appKey` が明示されていない。

そのため、このdocs上の `app_key` は、以下をもとにした推定である。

- `data/contents.json` の `slug` / `id` / `url`
- `assets/js/appInstanceService.js` の `APP_LINKS`
- `assets/js/appInstanceService.js` の既存app key

v1.7d実装前に、人間が `slug -> app_key` の対応を最終確認すること。

## contents分類一覧

| 推定app_key | slug | title | price / pricing | status / product status | CTA | v1.7d allowlist | 理由 / 注意点 |
|---|---|---|---|---|---|---|---|
| `attendance` | `dakokun` | だこくん | `consultation` | `published` / `inquiry-only` / `inquiry-only` | `開発を相談する` / `β版を試す` | 対象外 / 人間判断待ち | URLから `attendance` と推定できるが、正本分類は相談導線。副CTAにβ版があるため曖昧。人間が無料β版へ再分類しない限りallowlistに入れない。 |
| `seatflow` | `seatflow` | 座席管理アプリ | `consultation` | `published` / `inquiry-only` / `inquiry-only` | `教室用に相談する` / `β版を試す` | 対象外 / 人間判断待ち | app_keyは推定しやすいが、正本分類は相談導線。副CTAにβ版があるため曖昧。SeatFlow完全クラウド同期はPARKEDのため、標準allowlistには入れない。 |
| `pdf_tool` | `pdf-tool` | PDF編集ツール | `free` / `0` | `published` / `on-sale` / `app-link` | `無料で使う` | 無料候補 | `priceType = free`、`deliveryType = app-link`、既存 `APP_LINKS.pdf_tool` あり。無料アプリとして候補。 |
| `quiz_maker` | `quiz-maker` | 小テスト作成ツール | `free-beta` / `0` | `published` / `beta` / `app-link` | `β版を試す` | β版候補 | `priceType = free-beta`、`saleStatus = beta`、`deliveryType = app-link`、既存 `APP_LINKS.quiz_maker` あり。β版 / trialとして候補。 |
| `meeting_support` | `meeting-support` | 面談ヒアリングシート | `paid` / `1980` | `published` / `on-sale` / `manual` | `購入について相談する` | 対象外 | 有料かつ手動納品。決済 / 運営側反映前に利用可能化しない。 |
| `sales_talk_support` | `sales-talk-support` | 営業トーク支援ツール | `coming-soon` | `coming-soon` / `preparing` / `manual` | `先行案内を受ける` | 対象外 | 準備中。購入・利用開始不可。 |
| 未確定 | `subsidy-templates` | 補助金準備テンプレート | `paid` / `4980` | `published` / `on-sale` / `manual` | `購入について相談する` | 対象外 | 有料かつ手動納品。app_keyも未確定。 |
| 未確定 | `internal-operations` | 社内運用資料 | `internal` | `published` / `internal-only` / `direct-link` | `社内限定` | 対象外 | 社内限定。購入後反映対象ではない。 |
| 未確定 | `monthly-operations-checklist` | 月末業務チェックリスト | `paid` / `980` | `published` / `on-sale` / `manual` | `購入について相談する` | 対象外 | 有料かつ手動納品。app_keyも未確定。 |
| 未確定 | `dakokun-custom` | だこくん 自社用カスタマイズ | `consultation` | `published` / `inquiry-only` / `inquiry-only` | `開発を相談する` | 対象外 | 開発相談 / カスタマイズ導線。 |
| 未確定 | `seatflow-classroom-custom` | 座席管理アプリ 教室用カスタマイズ | `consultation` | `published` / `inquiry-only` / `inquiry-only` | `教室用に相談する` | 対象外 | 開発相談 / カスタマイズ導線。 |
| 未確定 | `internal-portal-build` | 社内ポータル制作 | `consultation` | `published` / `inquiry-only` / `inquiry-only` | `相談する` | 対象外 | 開発相談 / 制作相談導線。 |

## allowlist候補: 無料

v1.7d実装候補。ただし、実装前に人間が `slug -> app_key` と価格分類を確認する。

| app_key | slug | title | 反映時status候補 | 理由 |
|---|---|---|---|---|
| `pdf_tool` | `pdf-tool` | PDF編集ツール | `active` | `priceType = free`、`deliveryType = app-link`、`APP_LINKS.pdf_tool` あり。 |

## allowlist候補: β版 / trial

v1.7d実装候補。ただし、実装前に人間が `slug -> app_key` と価格分類を確認する。

| app_key | slug | title | 反映時status候補 | 理由 |
|---|---|---|---|---|
| `quiz_maker` | `quiz-maker` | 小テスト作成ツール | `trial` | `priceType = free-beta`、`saleStatus = beta`、`deliveryType = app-link`、`APP_LINKS.quiz_maker` あり。 |

## allowlist対象外: 有料 / サブスク

以下はv1.7d allowlistに入れない。

| app_key | slug | title | 理由 |
|---|---|---|---|
| `meeting_support` | `meeting-support` | 面談ヒアリングシート | `priceType = paid`、手動納品。 |
| 未確定 | `subsidy-templates` | 補助金準備テンプレート | `priceType = paid`、手動納品。 |
| 未確定 | `monthly-operations-checklist` | 月末業務チェックリスト | `priceType = paid`、手動納品。 |

## allowlist対象外: 準備中

| app_key | slug | title | 理由 |
|---|---|---|---|
| `sales_talk_support` | `sales-talk-support` | 営業トーク支援ツール | `priceType = coming-soon` / `saleStatus = preparing`。 |

## allowlist対象外: 開発相談 / 導入相談

| app_key | slug | title | 理由 |
|---|---|---|---|
| `attendance` | `dakokun` | だこくん | 正本分類が `consultation` / `inquiry-only`。副CTAにβ版があるため人間判断待ちだが、初期allowlistには入れない。 |
| `seatflow` | `seatflow` | 座席管理アプリ | 正本分類が `consultation` / `inquiry-only`。副CTAにβ版があるため人間判断待ちだが、初期allowlistには入れない。 |
| 未確定 | `dakokun-custom` | だこくん 自社用カスタマイズ | 開発相談 / カスタマイズ導線。 |
| 未確定 | `seatflow-classroom-custom` | 座席管理アプリ 教室用カスタマイズ | 開発相談 / カスタマイズ導線。 |
| 未確定 | `internal-portal-build` | 社内ポータル制作 | 制作相談導線。 |

## allowlist対象外: 社内限定

| app_key | slug | title | 理由 |
|---|---|---|---|
| 未確定 | `internal-operations` | 社内運用資料 | `internal-only`。購入後反映対象ではない。 |

## 人間判断待ち

v1.7d実装前に、以下を人間が確認する。

1. `pdf-tool -> pdf_tool` を正式なallowlist対象にしてよいか。
2. `quiz-maker -> quiz_maker` を正式なallowlist対象にしてよいか。
3. `dakokun -> attendance` は、現在の `consultation` 扱いのままallowlist対象外でよいか。無料β版として反映したい場合は、先に商品分類の再整理が必要。
4. `seatflow -> seatflow` は、現在の `consultation` 扱いのままallowlist対象外でよいか。SeatFlow完全クラウド同期はPARKEDのため、標準allowlistに入れる場合は別判断が必要。
5. `data/contents.json` に明示的な `app_key` を追加するかは、v1.7dではなく後続のデータ正規化タスクで扱うか。

## disabled復活禁止方針

v1.7d実装へ進む場合、以下を守る。

- 既存 `app_instances.status = active` の場合: 重複作成しない。
- 既存 `app_instances.status = trial` の場合: 重複作成しない。
- 既存 `app_instances.status = paused` の場合: allowlist対象なら復活候補にする。
  - 無料アプリは `active` に戻す候補。
  - β版アプリは `trial` に戻す候補。
- 既存 `app_instances.status = disabled` の場合: ユーザー操作では復活させない。
- `disabled` の表示候補は「運営側で停止されています」。
- `app_data` は触らない。
- `app_instances` の物理削除はしない。

## v1.7d実装前のSTOP条件

以下に該当する場合、v1.7d実装へ進まず停止する。

- allowlist対象 `app_key` が人間確定していない。
- `free` / `free-beta` の分類が曖昧。
- 有料 / サブスク / 準備中 / 開発相談がallowlistへ混ざる可能性がある。
- `disabled` をユーザー操作で復活できる可能性がある。
- `company_account_id + app_key` unique indexが実DBで確認できていない。
- `app_instances` のselect / insert / update policyが実DBで確認できていない。
- delete policyが存在する可能性がある。
- `app_data.app_instance_id` のcascade delete有無が確認できていない。
- v1.7dの範囲が、無料 / β版の正式反映MVPを超える。
- 有料 / サブスク、決済、購入履歴、管理者反映、RPC / Edge Functionへ踏み込みそう。

## Supabase Dashboardで人間が確認すべきこと

v1.7d実装前に、以下を確認する。

- `app_instances` の列と `status` 許可値。
- `company_account_id + app_key` unique index。
- `app_instances` のselect policy。
- `app_instances` のinsert policy。
- `app_instances` のupdate policy。
- delete policyがないこと。
- `app_data.app_instance_id` のcascade delete有無。
- `apps` テーブルに `pdf_tool` / `quiz_maker` が存在すること。
- `apps` テーブルに人間がallowlist対象として確定した `app_key` が存在すること。

## ブラウザで人間が確認すべきこと

今回はなし。UI / JS は変更していない。

## 今回変更していないもの

- `account.html`
- `portal.html`
- `my-apps.html`
- `marketplace.html`
- `content-detail.html`
- `purchase-confirm.html`
- `admin.html`
- `assets/js/*`
- `assets/css/*`
- `data/contents.json`
- `data/site-config.json`
- `supabase/migrations/*`
- `.github/workflows/*`

## 結論

v1.7dの初期allowlist候補は、現時点では以下に限定する。

- 無料候補: `pdf_tool`
- β版 / trial候補: `quiz_maker`

`attendance` / `seatflow` は、実アプリとしては存在するが `data/contents.json` 上の正本分類が `consultation` であるため、v1.7d初期allowlistには入れない。人間が無料β版として正式反映したい場合は、先に商品分類と `app_key` 対応を再確認する。
