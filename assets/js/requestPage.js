'use strict';

(() => {
  const DEFAULT_CONFIG = {
    forms: {},
    contact: {
      email: '',
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

  const formKeyByType = {
    purchase: 'purchase',
    request: 'request',
    development: 'request',
    estimate: 'request',
    consultation: 'consultation',
    customize: 'customize',
    template: 'request',
    'early-access': 'earlyAccess',
    beta: 'beta',
    submit: 'submit',
    support: 'support'
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
    thanksLink: $('purchaseThanksLink'),
    context: $('requestItemContext'),
    status: $('requestStatus')
  };

  let selectedContent = null;
  let siteConfig = DEFAULT_CONFIG;

  init();

  async function init() {
    const type = normalizeType(params.get('type'));
    fields.type.value = type;
    fields.item.value = params.get('item') || params.get('slug') || '';
    [selectedContent, siteConfig] = await Promise.all([
      findContent(fields.item.value),
      loadSiteConfig()
    ]);
    if (selectedContent) fields.item.value = selectedContent.title;
    fields.message.value = defaultMessage(type, fields.item.value, selectedContent);
    renderItemContext(selectedContent);

    form.addEventListener('input', update);
    fields.copyButton.addEventListener('click', copyRequestText);
    update();
  }

  function update() {
    const text = buildRequestText();
    fields.preview.textContent = text;

    const type = normalizeType(fields.type.value);
    const subject = `LLLD Works Market ${typeLabels[type] || '相談'}`;
    const destination = resolveDestination(type, subject, text);
    fields.mailLink.href = destination.href;
    fields.mailLink.textContent = destination.label;
    fields.mailLink.classList.toggle('disabled', destination.disabled);
    fields.mailLink.setAttribute('aria-disabled', String(destination.disabled));
    if (fields.status) fields.status.textContent = destination.message;
    fields.thanksLink.href = `./thanks.html?type=${thanksType(type)}&item=${encodeURIComponent(fields.item.value.trim())}`;
  }

  function buildRequestText() {
    const type = normalizeType(fields.type.value);
    const contentSlug = selectedContent?.slug || params.get('slug') || params.get('item') || '';
    return [
      'LLLD Works Market 相談内容',
      '',
      `相談種別: ${typeLabels[type] || type}`,
      `商品・内容: ${fields.item.value.trim() || '未入力'}`,
      `slug/item: ${contentSlug || '未指定'}`,
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

  function thanksType(type) {
    if (type === 'purchase') return 'purchase';
    if (type === 'beta') return 'beta';
    if (type === 'early-access') return 'lead';
    return 'request';
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
      forms: { ...DEFAULT_CONFIG.forms, ...(config.forms || {}) },
      contact: { ...DEFAULT_CONFIG.contact, ...(config.contact || {}) }
    };
  }

  function resolveDestination(type, subject, body) {
    const formUrl = formUrlForType(type);
    if (formUrl) {
      const url = new URL(formUrl, location.href);
      url.searchParams.set('type', type);
      if (selectedContent?.slug) url.searchParams.set('slug', selectedContent.slug);
      if (selectedContent?.id) url.searchParams.set('item', selectedContent.id);
      return {
        href: url.href,
        label: typeLabels[type] || '相談する',
        message: '外部フォームを開いて送信できます。',
        disabled: false
      };
    }

    const email = (siteConfig.contact?.email || '').trim();
    if (email) {
      return {
        href: `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
        label: 'メールで相談する',
        message: 'メールソフトを開いて、内容を確認してから送信してください。',
        disabled: false
      };
    }

    return {
      href: '#requestForm',
      label: '問い合わせフォーム準備中',
      message: '現在、問い合わせフォームを準備中です。相談内容をコピーして、送信先設定後に使える状態です。',
      disabled: true
    };
  }

  function formUrlForType(type) {
    const forms = siteConfig.forms || {};
    const key = formKeyByType[type] || 'request';
    return (forms[key] || forms.request || '').trim();
  }

  async function findContent(item) {
    if (!item || !window.ContentService) return null;
    try {
      const contents = await window.ContentService.getContents();
      return contents.find(content => {
        const values = [
          content.id,
          content.slug,
          content.title,
          content.primaryCtaUrl,
          content.secondaryCtaUrl,
          content.inquiryUrl,
          content.requestUrl
        ].filter(Boolean);
        return values.some(value => String(value).includes(item));
      }) || null;
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
          <div class="tag-row">${(content.targetUsers || []).slice(0, 3).map(item => `<span class="tag">${escapeHtml(item)}</span>`).join('')}</div>
        </div>
      </div>
    `;
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
