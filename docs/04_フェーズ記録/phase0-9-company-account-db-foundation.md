# v0.9 企業アカウント・ログイン画面・DB基盤

作成日: 2026-06-25

## 目的

LLLD Works Hub / Works Marketを、将来クラウド運用へ進めるために、企業・店舗・教室単位のアカウントUIとDB設計の土台を追加した。

今回の前提は「アカウント = 企業 / 店舗 / 教室」。

## 追加した画面

- `login.html`
- `signup.html`
- `account.html`

## 追加したJS

- `assets/js/siteConfigService.js`
- `assets/js/authService.js`
- `assets/js/accountPage.js`

## 設定

`data/site-config.json` に `auth` 設定を追加した。

```json
{
  "auth": {
    "mode": "mock",
    "supabaseUrl": "",
    "supabaseAnonKey": ""
  }
}
```

Supabase URLとanon keyが空の間はmock modeとして扱う。

## 現時点の認証状態

- 本番ログインはしない。
- 本番登録はしない。
- パスワードは保存しない。
- 認証トークンをlocalStorageで独自管理しない。
- Supabase本番接続は必須にしていない。
- service role keyはフロントに置かない。

## まだ実装しないこと

- 所属組織管理
- 複数スタッフログイン
- 権限管理UI
- 勤怠実データのDB保存
- 座席実データのDB保存
- 決済
- 購入履歴
- 自動納品
- 管理画面の本番操作化

## 次に進む候補

v1.0では、座席管理のクラウド保存から検討する。

勤怠は修正履歴、労務リスク、実データ保護が重いため、最後に慎重に扱う。
