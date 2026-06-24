# 05 Implementation Rules
# LLLD Works Hubへの実装ルール

## 目的

商品カードモックやカードデータを、LLLD Works HubのHTML/CSS/JSへ安全に反映する。

既存機能を壊さず、今後のアプリ追加に強い構造にする。

---

## 最優先

- 既存機能を壊さない
- GitHub Pagesで動く
- 外部サーバーやDBを使わない
- Reactなどの大きなフレームワークは導入しない
- localStorageの既存キーを安易に変更しない
- リンク先を勝手に変えない
- 検索・カテゴリ・お気に入り・利用履歴・並び替えを維持する

---

## 推奨構成

現在の構成が許せば、以下に整理する。

```txt
/
├── index.html
├── README.md
├── assets/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── app.js
│   ├── thumbnails/
│   │   ├── pdf-editor.png
│   │   ├── seats-app.png
│   │   └── ...
│   └── icons/
└── data/
    └── contents.json
```

ただし、既存が1枚HTMLなら無理に分割しない。  
壊れないことを最優先にする。

---

## コンテンツデータ管理

カードはHTML直書きで増やさず、可能な限り配列またはJSONで管理する。

例：

```js
const contents = [
  {
    id: "pdf-editor",
    title: "PDF編集ツール",
    category: "社内運営",
    type: "HTMLアプリ",
    description: "PDFの結合・編集・変換を簡単に",
    url: "./apps/pdf-editor/index.html",
    thumbnailType: "pdf",
    thumbnailImage: "assets/thumbnails/pdf-editor.png",
    iconType: "pdf",
    badge: "人気",
    tags: ["HTMLアプリ", "社内運営"],
    status: "公開中",
    featured: true,
    favoriteEnabled: true,
    detailEnabled: true,
    primaryActionLabel: "開く",
    updatedAt: "2026-06-22"
  }
];
```

---

## thumbnailImage と thumbnailType

### 優先順位
1. `thumbnailImage` がある → 実画像を表示
2. 画像がない → `thumbnailType` に応じた疑似サムネイルを表示
3. thumbnailType が不明 → `generic` を表示

---

## 疑似サムネイル

実画像がなくてもカードが成立するように、CSS/HTMLで疑似サムネイルを用意する。

必要なタイプ：
- pdf
- seats
- quiz
- attendance
- document
- proposal
- dashboard
- form
- generic

---

## 検索

検索対象に含める項目：
- title
- description
- category
- type
- tags
- status
- audience
- summary

---

## カテゴリ

カテゴリは固定HTMLではなく、データから生成できるとよい。

初期表示カテゴリ：
- すべて
- よく使う
- 塾事業
- コンサル事業
- 社内運営
- HTMLアプリ
- テンプレート

将来追加されても崩れないようにする。

---

## お気に入り

- localStorageで管理してよい
- id単位で保存する
- 既存のお気に入りキーがある場合は互換性を保つ
- お気に入りボタンはカードごとに独立して動く

---

## 利用履歴

- 「開く」クリック時にlastUsedAtを更新できるとよい
- localStorageで履歴を保存してよい
- 最大8件程度を最終利用履歴に表示
- 既存機能がある場合は壊さず利用する

---

## 並び替え

最低限維持：
- 最終利用順
- 更新日順
- 名前順
- カテゴリ順
- リセット

選択中のタブがわかるようにする。

---

## 詳細表示

詳細ボタンを押したときの候補：
- 既存詳細モーダルがあれば利用
- なければ簡易モーダルまたはカード下部展開でもよい

詳細に表示する項目：
- タイトル
- 説明
- カテゴリ
- タグ
- ステータス
- 想定利用者
- 更新日
- 概要

---

## レスポンシブ

### PC
- 左サイドバー
- 3〜4列カード

### iPad
- 左サイドバーまたは上部カテゴリ
- 2列カード

### スマホ
- サイドバーは上部または横スクロール
- 1列カード
- ボタンは押しやすく

---

## アクセシビリティ

- ボタンにはbutton要素またはroleを適切に使う
- altテキストを入れる
- キーボード操作を大きく妨げない
- 色だけで状態を伝えない
- フォーカス表示を消さない

---

## 実装後チェック

- ページが開く
- コンソールエラーがない
- 検索が動く
- カテゴリ絞り込みが動く
- お気に入りが動く
- 利用履歴が動く
- 並び替えが動く
- 各カードのリンクが維持されている
- 画像がなくても疑似サムネイルが表示される
- iPad幅で崩れない
- スマホ幅で崩れない
