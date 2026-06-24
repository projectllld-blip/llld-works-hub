'use strict';

(() => {
  const CONFIG = {
    // 本番の問い合わせ先メールまたはGoogleフォームURLが決まったらここを差し替える。
    // 空のままなら、利用者のメールソフトで宛先を選んで送る運用にする。
    mailTo: '',
    externalFormUrl: ''
  };

  const typeLabels = {
    development: '開発を相談する',
    estimate: '見積もりを相談する',
    purchase: '購入について相談する',
    template: '資料・テンプレート化を相談する'
  };

  const params = new URLSearchParams(location.search);
  const $ = id => document.getElementById(id);

  const form = $('requestForm');
  if (!form) return;

  const fields = {
    type: $('requestType'),
    item: $('requestItem'),
    name: $('requestName'),
    contact: $('requestContact'),
    message: $('requestMessage'),
    preview: $('requestPreview'),
    mailLink: $('requestMailLink'),
    copyButton: $('copyRequestText'),
    thanksLink: $('purchaseThanksLink')
  };

  init();

  function init() {
    const type = normalizeType(params.get('type'));
    fields.type.value = type;
    fields.item.value = params.get('item') || '';
    fields.message.value = defaultMessage(type, fields.item.value);

    form.addEventListener('input', update);
    fields.copyButton.addEventListener('click', copyRequestText);
    update();
  }

  function update() {
    const text = buildRequestText();
    fields.preview.textContent = text;

    const type = normalizeType(fields.type.value);
    const subject = `LLLD Works Market ${typeLabels[type] || '相談'}`;
    const mailHref = `mailto:${CONFIG.mailTo}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
    fields.mailLink.href = CONFIG.externalFormUrl || mailHref;
    fields.mailLink.textContent = typeLabels[type] || '開発を相談する';
    fields.thanksLink.href = `./thanks.html?type=${type === 'purchase' ? 'purchase' : 'request'}&item=${encodeURIComponent(fields.item.value.trim())}`;
  }

  function buildRequestText() {
    const type = normalizeType(fields.type.value);
    return [
      'LLLD Works Market 相談内容',
      '',
      `相談種別: ${typeLabels[type] || type}`,
      `商品・内容: ${fields.item.value.trim() || '未入力'}`,
      `お名前: ${fields.name.value.trim() || '未入力'}`,
      `連絡先: ${fields.contact.value.trim() || '未入力'}`,
      '',
      '相談内容:',
      fields.message.value.trim() || '未入力',
      '',
      `作成元URL: ${location.href}`
    ].join('\n');
  }

  async function copyRequestText() {
    const text = buildRequestText();
    try {
      await navigator.clipboard.writeText(text);
      fields.copyButton.textContent = 'コピーしました';
      setTimeout(() => {
        fields.copyButton.textContent = '相談内容をコピー';
      }, 1800);
    } catch {
      fields.preview.focus();
      fields.copyButton.textContent = '下の文章をコピーしてください';
    }
  }

  function normalizeType(value) {
    return typeLabels[value] ? value : 'development';
  }

  function defaultMessage(type, item) {
    if (type === 'purchase') return `${item || '商品'}の購入方法と納品方法を相談したいです。`;
    if (type === 'estimate') return `${item || '制作内容'}の見積もりを相談したいです。`;
    return `${item || '現場で使うツール'}について相談したいです。`;
  }
})();
