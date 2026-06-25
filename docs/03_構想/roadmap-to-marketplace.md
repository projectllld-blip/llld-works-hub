# Roadmap to Marketplace

LLLD Works Hub / Works Market を、静的MVPから販売プラットフォームへ育てるためのロードマップ。

## 現在地

- ローカル検証版
- 静的HTML/CSS/JS
- `data/` を仮DBとして使用
- 問い合わせ、購入相談、手動納品を前提
- ログイン、DB、決済、自動納品は未実装

## Step 1: 販売検証版

- 商品棚を見せる。
- 有料商品を3件以上並べる。
- 無料入口を用意する。
- 開発相談商品を用意する。
- 問い合わせ導線をメールまたは外部フォームに接続する。

## Step 2: 限定公開

- 社内・関係者・ビジコン相談相手に見せる。
- 価格、説明、CTAの反応を見る。
- 手動販売・手動納品で問題点を集める。
- `release-checklist.md` を通して本番反映可否を判断する。

## Step 3: 代表本人による疑似β

- 従業員がいない間は社内βを疑似βに圧縮する。
- 代表本人が販売導線、相談導線、既存Hub導線、安全性を確認する。
- 通常βへ戻す条件を `docs/04_フェーズ記録/phase4-skipped-beta-note.md` に残す。

## Step 4: DB化検討

- Supabase等で `contents`、`authors`、`categories` を管理する。
- `assets/js/contentService.js` のfetch層をAPI呼び出しに差し替える。
- フロント側の表示関数は極力変えない。
- 詳細は `docs/03_構想/supabase-migration-plan.md` に整理する。

## Step 5: 管理画面Skeleton

- `admin.html` で投稿管理、審査、販売管理の見取り図を確認する。
- 本番操作はまだできない。
- Supabase、認証、RLSが整うまで保存や公開処理を入れない。

## Step 6: 投稿審査制

- 外部投稿は直接公開させない。
- 投稿申請、著作権確認、個人情報確認、掲載判断をLLLD側で行う。
- 審査状態や権限情報はlocalStorageに置かない。

## Step 7: 決済・納品

- Stripe Payment Links等を検討する。
- 自動納品は急がない。
- 有料ファイル本体はGitHub Pagesに置かない。
- 購入履歴や売上情報はDB側で管理する。
