# Midterm Audit v0.6

作成日: 2026-06-25

## 監査結果

OK。Step 2の商品データ品質整理へ進める状態。

## セキュリティ確認

- 本物のAPIキー、秘密キー、認証情報は今回の確認範囲では見つからなかった。
- Supabase本番接続は入っていない。
- Stripe等の決済処理は入っていない。
- 管理画面は本番操作不可のモック。
- 有料商品の本体ファイルはGitHub Pagesへ直接置かない方針を維持。

## GitHubに置いてはいけないもの

次は置かない。

- 生徒名簿
- 顧客情報
- 講師・従業員情報
- 勤怠実データ
- 購入履歴
- 審査状況
- 売上情報
- APIキー
- Supabase秘密キー
- Stripe秘密キー
- 有料商品の本体ファイル
- 教材PDF
- 入試問題PDF
- 契約書
- 見積書
- 補助金申請書類の実データ
- 顧客相談内容
- 録音・文字起こしデータ

## localStorage確認

現在の主な使用箇所:

- `assets/js/app.js`: 最終利用履歴、お気に入り
- `assets/js/authMockService.js`: 表示確認用モックロール
- `assets/js/storagePolicy.js`: 許可キーの定義

購入履歴、審査状況、権限情報、売上情報は保存しない。

## internal / internal_only 確認

Market側の表示条件は以下。

- `priceType !== "internal"`
- `saleStatus !== "internal-only"`
- `visibility !== "internal"`

ブラウザ確認ではMarket側に `internal / internal-only / internal_only` は表示されなかった。

## 未追跡ファイル確認

- `アーカイブ.zip` が未追跡で残っている。
- 今回は中身を触っていない。
- commit前にリポジトリ外へ移動、または `.gitignore` へ追加する判断が必要。

## 未コミット変更確認

Phase 6以降の作業差分が未コミットのまま残っている。
ユーザー指示によりcommit / pushは行っていない。

## 本番反映前の注意点

- `admin.html` を本番に出すかは要判断。
- 管理画面モック、投稿申請モック、Supabase準備文書は本番公開前に切り分ける。
- 有料商品の実ファイル管理場所を確定する。
- 問い合わせ先を本番用に差し替える。
- `docs/02_監査/release-checklist.md` を通す。
