'use strict';

(() => {
  const DEFAULT_CONFIG = {
    contact: {
      mode: 'demo',
      email: '',
      endpointUrl: '',
      ownerName: 'LLLD Works Hub'
    }
  };

  const typeLabels = {
    development: '開発を相談する',
    estimate: '見積もりを相談する',
    purchase: '購入について相談する',
    request: '相談する',
    consultation: '相談する',
    customize: 'カスタマイズを相談する',
    template: '資料・テンプレート化を相談する',
    'early-access': '先行案内を受ける',
    beta: 'β版について相談する',
    submit: '投稿について相談する',
    support: '使い方を相談する'
  };

  const priceLabels = {
    free: '無料',
    'free-beta': '無料β',
    paid: '有料',
    consultation: '個別見積',
    'coming-soon': '準備中',
    internal: '社内限定'
  };

  const saleStatusLabels = {
    'on-sale': '販売中',
    beta: 'β版',
    'inquiry-only': '相談受付',
    preparing: '準備中',
    'internal-only': '社内限定'
  };

  const params = new URLSearchParams(location.search);
  const $ = id => document.getElementById(id);

  const form = $('requestForm');
  if (!form) return;

  const fields = {
    type: $('requestType'),
    item: $('requestItem'),
    organization: $('requestOrganization'),
    name: $('requestName'),
    email: $('requestEmail'),
    phone: $('requestPhone'),
    desired: $('requestDesired'),
    timing: $('requestTiming'),
    budget: $('requestBudget'),
    message: $('requestMessage'),
    preview: $('requestPreview'),
    submitButton: $('requestSubmitButton'),
    copyButton: $('copyRequestText'),
    thanksLink: $('purchaseThanksLink'),
    context: $('requestItemContext'),
    status: $('requestStatus'),
    confirmPanel: $('requestConfirmPanel'),
    confirmMessage: $('requestConfirmMessage'),
    confirmPreview: $('requestConfirmPreview'),
    mailtoLink: $('requestMailtoLink'),
    endpointButton: $('requestEndpointButton'),
    closeConfirm: $('requestCloseConfirm')
  };

  let selectedContent = null;
  let siteConfig = DEFAULT_CONFIG;
  let lastPayload = null;

  init();

  async function init() {
    const type = normalizeType(params.get('type'));
    const itemKey = params.get('item') || params.get('slug') || '';

    fields.type.value = type;
    fields.item.value = itemKey;

    [selectedContent, siteConfig] = await Promise.all([
      findContent(itemKey),
      loadSiteConfig()
    ]);

    if (selectedContent) fields.item.value = selectedContent.title;
    fields.desired.value = desiredDefault(type);
    fields.message.value = defaultMessage(type, fields.item.value, selectedContent);
    renderItemContext(selectedContent);

    form.addEventListener('input', update);
    form.addEventListener('submit', handleSubmit);
    fields.copyButton.addEventListener('click', copyRequestText);
    fields.closeConfirm.addEventListener('click', hideConfirmPanel);
    fields.endpointButton.addEventListener('click', submitEndpoint);
    update();
  }

  function update() {
    const payload = buildPayload();
    const text = buildRequestText(payload);
    const destination = resolveMode();
    fields.preview.textContent = text;
    fields.submitButton.textContent = submitLabel(destination.mode);
    fields.status.textContent = statusMessage(destination);
    fields.thanksLink.href = `./thanks.html?type=${thanksType(payload.type)}&item=${encodeURIComponent(payload.item)}`;
    setConfirmLinks(destination, payload, text);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const payload = buildPayload();
    const text = buildRequestText(payload);
    const destination = resolveMode();
    lastPayload = payload;

    if (destination.mode === 'mailto') {
      showConfirmPanel('メールアプリを開きます。内容を確認してから送信してください。', text, 'mailto');
      location.href = mailtoHref(payload, text);
      return;
    }

    if (destination.mode === 'endpoint') {
      showConfirmPanel('送信前に内容を確認してください。問題なければ「送信する」を押してください。', text, 'endpoint');
      return;
    }

    showConfirmPanel('現在、問い合わせ送信機能は準備中です。実送信は行っていません。', text, 'demo');
  }

  function buildPayload() {
    const type = normalizeType(fields.type.value);
    return {
      type,
      typeLabel: typeLabels[type] || type,
      item: fields.item.value.trim(),
      slug: selectedContent?.slug || params.get('slug') || params.get('item') || '',
      contentId: selectedContent?.id || '',
      organization: fields.organization.value.trim(),
      name: fields.name.value.trim(),
      email: fields.email.value.trim(),
      phone: fields.phone.value.trim(),
      desired: fields.desired.value.trim(),
      timing: fields.timing.value.trim(),
      budget: fields.budget.value.trim(),
      message: fields.message.value.trim(),
      pageUrl: location.href
    };
  }

  function buildRequestText(payload) {
    return [
      'LLLD Works Market 相談内容',
      '',
      `相談種別: ${payload.typeLabel || '未選択'}`,
      `対象商品: ${payload.item || '未入力'}`,
      `slug/item: ${payload.slug || '未指定'}`,
      `会社名 / 店舗名 / 教室名: ${payload.organization || '未入力'}`,
      `担当者名: ${payload.name || '未入力'}`,
      `メールアドレス: ${payload.email || '未入力'}`,
      `電話番号: ${payload.phone || '未入力'}`,
      `希望内容: ${payload.desired || '未入力'}`,
      `希望時期: ${payload.timing || '未入力'}`,
      `予算感: ${payload.budget || '未入力'}`,
      '',
      '相談内容:',
      payload.message || '未入力',
      '',
      `作成元URL: ${payload.pageUrl}`
    ].join('\n');
  }

  async function submitEndpoint() {
    if (!lastPayload) return;
    const destination = resolveMode();
    if (destination.mode !== 'endpoint') {
      fields.confirmMessage.textContent = '現在、問い合わせ送信機能は準備中です。実送信は行っていません。';
      return;
    }

    fields.endpointButton.disabled = true;
    fields.confirmMessage.textContent = '送信しています。';
    try {
      const response = await fetch(destination.endpointUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lastPayload)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      fields.confirmMessage.textContent = '送信しました。内容を確認後、手動で連絡します。';
    } catch {
      fields.confirmMessage.textContent = '送信できませんでした。時間を置くか、メール導線に切り替えてください。';
    } finally {
      fields.endpointButton.disabled = false;
    }
  }

  function resolveMode() {
    const contact = siteConfig.contact || {};
    const mode = ['demo', 'mailto', 'endpoint'].includes(contact.mode) ? contact.mode : 'demo';
    const email = (contact.email || '').trim();
    const endpointUrl = (contact.endpointUrl || '').trim();

    if (mode === 'mailto' && email) return { mode, email };
    if (mode === 'endpoint' && endpointUrl) return { mode, endpointUrl };
    return { mode: 'demo' };
  }

  function setConfirmLinks(destination, payload, text) {
    const mailto = mailtoHref(payload, text);
    fields.mailtoLink.href = mailto;
    fields.mailtoLink.hidden = destination.mode !== 'mailto';
    fields.endpointButton.hidden = destination.mode !== 'endpoint';
  }

  function mailtoHref(payload, body) {
    const email = (siteConfig.contact?.email || '').trim();
    const subject = `LLLD Works Market ${payload.typeLabel || '相談'}: ${payload.item || '対象未指定'}`;
    return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  function submitLabel(mode) {
    if (mode === 'mailto') return 'メールを作成する';
    if (mode === 'endpoint') return '送信前に確認する';
    return '入力内容を確認する';
  }

  function statusMessage(destination) {
    if (destination.mode === 'mailto') return 'メールアプリを開いて送信できます。問い合わせ内容はこのサイトには保存されません。';
    if (destination.mode === 'endpoint') return '自社APIへの送信モードです。APIキーや秘密キーは使いません。';
    return 'demo mode: 現在、問い合わせ送信機能は準備中です。入力内容は保存されず、確認表示だけ行います。';
  }

  function showConfirmPanel(message, text, mode) {
    fields.confirmPanel.hidden = false;
    fields.confirmMessage.textContent = message;
    fields.confirmPreview.textContent = text;
    fields.mailtoLink.hidden = mode !== 'mailto';
    fields.endpointButton.hidden = mode !== 'endpoint';
    fields.confirmPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function hideConfirmPanel() {
    fields.confirmPanel.hidden = true;
  }

  async function copyRequestText() {
    const text = buildRequestText(buildPayload());
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

  function thanksType(type) {
    if (type === 'purchase') return 'purchase';
    if (type === 'beta') return 'beta';
    if (type === 'early-access') return 'lead';
    return 'request';
  }

  function desiredDefault(type) {
    if (type === 'purchase') return '購入について相談したい';
    if (type === 'beta') return 'β版を試したい';
    if (type === 'early-access') return '先行案内を受けたい';
    if (type === 'customize') return 'カスタマイズを相談したい';
    if (type === 'support') return '導入方法を相談したい';
    return '開発を相談したい';
  }

  function defaultMessage(type, item, content) {
    const name = item || content?.title || '現場で使うツール';
    if (type === 'purchase') return `${name}の購入方法、納品方法、支払い方法を相談したいです。`;
    if (type === 'estimate') return `${name}の見積もりを相談したいです。`;
    if (type === 'early-access') return `${name}の先行案内を受けたいです。`;
    if (type === 'beta') return `${name}のβ版について相談したいです。`;
    if (type === 'submit') return `${name}の投稿や掲載について相談したいです。`;
    if (type === 'support') return `${name}の使い方や導入方法について相談したいです。`;
    if (type === 'customize') return `${name}を現場の運用に合わせて調整できるか相談したいです。`;
    return `${name}について、現場でどう使えるか相談したいです。`;
  }

  async function loadSiteConfig() {
    if (!window.ContentService?.getSiteConfig) return DEFAULT_CONFIG;
    const config = await window.ContentService.getSiteConfig();
    return {
      contact: { ...DEFAULT_CONFIG.contact, ...(config.contact || {}) }
    };
  }

  async function findContent(item) {
    if (!item || !window.ContentService) return null;
    try {
      const contents = await window.ContentService.getContents();
      const key = String(item);
      return contents.find(content => content.id === key || content.slug === key)
        || contents.find(content => content.title === key)
        || contents.find(content => [content.primaryCtaUrl, content.secondaryCtaUrl, content.inquiryUrl, content.requestUrl].filter(Boolean).some(value => String(value).includes(key)))
        || null;
    } catch {
      return null;
    }
  }

  function renderItemContext(content) {
    if (!fields.context || !content) return;
    fields.context.hidden = false;
    fields.context.innerHTML = `
      <h3>相談対象</h3>
      <div class="request-context-grid">
        <img src="${escapeAttr(content.thumbnail || content.thumbnailImage || './assets/thumbs/internal-operations.png')}" alt="">
        <div>
          <strong>${escapeHtml(content.title)}</strong>
          <p>${escapeHtml(content.summary || content.description || '')}</p>
          <dl class="request-context-meta">
            <div><dt>対象者</dt><dd>${escapeHtml(listText(content.targetUsers) || '-')}</dd></div>
            <div><dt>販売状態</dt><dd>${escapeHtml(saleStatusLabels[content.saleStatus] || content.saleStatus || '-')}</dd></div>
            <div><dt>価格</dt><dd>${escapeHtml(formatPrice(content))}</dd></div>
          </dl>
        </div>
      </div>
    `;
  }

  function formatPrice(content) {
    if (content.priceType === 'paid' && Number.isFinite(content.price) && content.price > 0) {
      return `${content.price.toLocaleString('ja-JP')}円`;
    }
    return priceLabels[content.priceType] || content.priceType || '-';
  }

  function listText(items = []) {
    return Array.isArray(items) && items.length ? items.join('、') : '';
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[char]);
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/`/g, '&#96;');
  }
})();
