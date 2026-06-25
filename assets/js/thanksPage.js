'use strict';

(() => {
  const messages = {
    purchase: {
      kicker: '購入受付',
      title: '購入相談の流れを確認できます。',
      lead: 'このページはローカル検証用・導線確認用の完了画面です。実際の送信はrequest.htmlの自社フォーム設定に合わせて行います。',
      primaryHeading: '納品までの流れ',
      primary: [
        '対象商品とお支払い方法を確認します',
        '必要に応じて銀行振込、手動請求、決済リンクを個別に案内します',
        '納品はメール添付、Google Drive限定リンク、手動共有のいずれかで行います',
        '有料ファイル本体はGitHub Pages上に直接置きません'
      ],
      secondaryHeading: '返信目安',
      secondary: [
        '通常1〜3営業日以内に確認します',
        '購入内容が不明な場合は追加で確認します',
        '自動納品ではなく手動納品です'
      ]
    },
    request: {
      kicker: '相談受付',
      title: '相談受付後の流れを確認できます。',
      lead: 'このページはローカル検証用・導線確認用の完了画面です。自社フォームがdemo modeの間は、送信完了として扱いません。',
      primaryHeading: '開発相談・見積もり相談の流れ',
      primary: [
        '困りごとと利用場面を確認します',
        '必要な機能、納期、予算感を整理します',
        '制作範囲が固まってから見積もりを案内します',
        'ログイン、DB、自動納品が必要な場合は別フェーズで検討します'
      ],
      secondaryHeading: '返信目安',
      secondary: [
        '通常1〜3営業日以内に確認します',
        '資料や現状画面がある場合は追加で共有をお願いすることがあります',
        '急ぎの場合は、相談内容に希望納期を書いてください'
      ]
    },
    beta: {
      kicker: 'β版利用',
      title: 'β版のご利用ありがとうございます。',
      lead: '気づいた点や改善希望があれば、相談ページから送ってください。',
      primaryHeading: 'β版について',
      primary: [
        '無料または検証用として提供している状態です',
        '正式販売前に仕様が変わる可能性があります',
        '重要データは必ず手元でバックアップしてください'
      ],
      secondaryHeading: '次の流れ',
      secondary: [
        '改善相談や自社用カスタマイズは個別に受け付けます',
        '有料化する場合はMarket上で案内します'
      ]
    },
    lead: {
      kicker: '先行案内',
      title: '先行案内の受付ありがとうございます。',
      lead: '準備が整い次第、内容を案内します。',
      primaryHeading: '案内までの流れ',
      primary: [
        '商品内容と提供時期を整理します',
        '販売開始またはβ提供の準備ができたら案内します',
        '希望内容がある場合は相談ページから送ってください'
      ],
      secondaryHeading: '確認事項',
      secondary: [
        '先行案内は購入確定ではありません',
        '価格や内容は変更される場合があります'
      ]
    }
  };

  const params = new URLSearchParams(location.search);
  const type = messages[params.get('type')] ? params.get('type') : 'request';
  const message = messages[type];

  setText('thanksKicker', message.kicker);
  setText('thanksTitle', message.title);
  setText('thanksLead', message.lead);
  setText('thanksPrimaryHeading', message.primaryHeading);
  setText('thanksSecondaryHeading', message.secondaryHeading);
  setList('thanksPrimaryList', message.primary);
  setList('thanksSecondaryList', message.secondary);

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function setList(id, items) {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = items.map(item => `<li>${escapeHtml(item)}</li>`).join('');
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[char]));
  }
})();
