# 04 Mock Generation Rules

## 目的

HTML解析結果とカードデータをもとに、  
LLLD Works Hubに掲載できる高品質な商品カードモック画像を作成する。

---

## 基本方針

商品カードモックは、以下を満たすこと。

- 1枚の独立したカードとして見える
- LLLD Works Hubのカード群に並べても違和感がない
- サムネイルでツール内容が伝わる
- 日本語テキストが自然
- 実務ツールとして信頼感がある
- ビジコンで見せてもプロダクト感がある

---

## 画像構成

### 全体
- 4:5 縦長推奨
- 白または薄いグレー背景
- 中央に大きな白カード
- 角丸
- 薄い影
- 余白広め

### カード上部
- 状態タグがある場合は左上に重ねる
- 大きなアプリ画面風サムネイル
- サムネイルはカード幅の大半を使う
- サムネイル内は本物のUIに見えるようにする

### カード中部
- 左にアイコン
- 中央にタイトル
- 右にカテゴリバッジ

### カード下部
- 説明文
- 操作ボタン
- その他メニュー

---

## 生成プロンプトの基本テンプレ

```txt
Create a standalone high-fidelity product card mock image for LLLD Works Hub.

Style:
- Japanese SaaS / internal tools portal
- White rounded product card
- Subtle shadow
- Clean spacing
- Dark navy text
- Teal primary button
- Light blue/green category pill
- Clear Japanese typography
- Thumbnail-first design
- The tool purpose must be immediately understandable

Card content:
- Product name: "{title}"
- Category pill: "{category}"
- Description: "{description}"
- Status tag: "{badge}"
- thumbnailType: "{thumbnailType}"
- thumbnail focus: "{thumbnailFocus}"

Card structure:
1. Large top thumbnail showing a realistic simplified app screen.
2. Title row with icon, product name, and category pill.
3. Short description text.
4. Bottom action row:
   - filled teal button "開く"
   - outlined button "お気に入り"
   - outlined button "詳細"
   - vertical three-dots menu.

Important:
- Show only one product card, not the full dashboard.
- Use natural Japanese.
- Avoid abstract thumbnails.
- Make the thumbnail look like the actual tool screen.
```

---

## thumbnailType別のモック指示

### pdf
```txt
The top thumbnail should show a PDF editor screen:
left page thumbnail sidebar, main PDF document preview, top toolbar, save button, and a small red PDF icon.
```

### seats
```txt
The top thumbnail should show a classroom seat management screen:
colored seat blocks, blackboard label, left control panel with date/class/status legend, and seat numbers.
```

### quiz
```txt
The top thumbnail should show a quiz creation screen:
rows labeled 問題1, 問題2, 問題3, point badges, edit/duplicate/delete buttons, and a create/export button.
```

### attendance
```txt
The top thumbnail should show an attendance management table:
employee names, dates, start time, end time, working hours, and status chips such as 出勤, 遅刻, 欠勤.
```

### document
```txt
The top thumbnail should show a document template editor:
document page, heading, sections, bullet points, left page thumbnails, and save button.
```

### proposal
```txt
The top thumbnail should show a proposal slide editor:
slide thumbnails on the left, main slide canvas with proposal blocks, charts, next steps, and share button.
```

### dashboard
```txt
The top thumbnail should show a consulting/report dashboard:
KPI cards, bar chart, line chart, table, project status chips, and filter/export controls.
```

### form
```txt
The top thumbnail should show an internal request form:
input fields, dropdowns, applicant information, request details, file attachment, approval flow, and submit button.
```

### generic
```txt
The top thumbnail should show a generic business tool dashboard:
simple cards, list rows, action buttons, and a clear title area based on the product name.
```

---

## テキスト品質ルール

- 日本語を崩さない
- 誤字をできるだけ避ける
- 英語UIになりすぎない
- タイトルとカテゴリは必ず読めるようにする
- サムネイル内の細かい文字は多少ダミーでもよい
- カード下部のタイトル、説明、ボタン文言は正確にする

---

## 参考画像の使い方

`references/` にあるカード画像を参照する。

参考にするポイント：
- カードの大きさ
- 余白
- サムネイルの比率
- ボタン配置
- タグ位置
- タイトル行の構造
- 日本語の見え方
- 業務アプリ感

画像の中身はコピーしなくてよいが、カード構造と品質感は合わせる。

---

## 出力後に確認すること

- 何のツールか一瞬でわかるか
- サムネイルが抽象的でないか
- タイトルが読めるか
- カテゴリが読めるか
- 説明文が自然か
- ボタンが3つ揃っているか
- 既存カードと並べても違和感がないか
