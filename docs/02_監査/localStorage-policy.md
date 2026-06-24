# localStorage Policy

LLLD Works Hub / Works Market でのlocalStorage使用方針。

## 保存してよいもの

- 最近見たコンテンツ
- 最終利用履歴8件
- お気に入り
- 表示設定
- 一時的な下書き
- 表示確認用のモックロール
- ログイン不要ツールの一時作業データ

## 保存してはいけないもの

- 本番アカウント情報
- 投稿者情報
- 購入履歴
- 審査状況
- 公開/非公開ステータス
- 権限情報
- 売上情報
- 個人情報を含む業務データ
- 勤怠の実データ
- 顧客情報、生徒情報、スタッフ個人情報

## 実装ルール

- Market本体の重要情報はlocalStorageに置かない。
- 許可キーは `assets/js/storagePolicy.js` に集約する。
- 将来ログインや購入履歴を扱う場合は、Supabase等のDB側で管理する。
- localStorageはブラウザ削除で消えるため、重要データ保存には使わない。

## 現在許可しているキー

- `llldWorksHub.history`
- `llldWorksHub.favorites`
- `llldWorksHub.display`
- `llldWorksHub.draft`
- `llldWorksHub.mockRole`

