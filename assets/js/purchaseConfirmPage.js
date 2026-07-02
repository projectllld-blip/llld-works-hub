'use strict';

(() => {
  const STORAGE_KEY = 'llldWorksHub.portalAdditions.session';
  const priceLabels = {
    free: '無料',
    'free-beta': '無料β',
    paid: '有料'
  };
  const saleStatusLabels = {
    'on-sale': '販売中',
    beta: 'β版',
    'inquiry-only': '手動確認',
    preparing: '準備中'
  };
  const deliveryLabels = {
    'direct-link': '直接リンク',
    manual: '手動納品',
    'google-drive': 'Drive納品',
    'app-link': 'アプリリンク',
    'inquiry-only': '相談後案内'
  };

  const root = document.getElementById('purchaseConfirmRoot');
  const params = new URLSearchParams(location.search);

  init();

  async function init() {
    if (!root || !window.ContentService) return;
    try {
      const key = params.get('item') || params.get('slug') || params.get('id') || '';
      const contents = await window.ContentService.getContents();
      const content = contents.find(item => item.slug === key || item.id === key);
      if (!content) {
        renderNotFound();
        return;
      }
      render(content);
    } catch {
      root.innerHTML = notFoundHtml('読み込みに失敗しました。', 'マーケット一覧から開き直してください。');
    }
  }

  function render(content) {
    if (content.priceType === 'consultation') {
      const requestUrl = content.inquiryUrl || content.requestUrl || `./request.html?type=development&item=${encodeURIComponent(content.slug || content.id)}`;
      root.innerHTML = `
        <span class="market-kicker">開発相談</span>
        <h1>${escapeHtml(content.title)}</h1>
        <p>この項目は購入・利用開始ではなく、現場に合わせた開発相談として扱います。</p>
        <div class="detail-cta-row">
          <a class="btn primary" href="${escapeAttr(requestUrl)}">開発要望を書く</a>
          <a class="btn secondary" href="./marketplace.html">マーケットへ戻る</a>
        </div>
      `;
      return;
    }

    const openUrl = content.url || content.contentUrl || '';
    const isPaid = content.priceType === 'paid';
    const actionLabel = isPaid ? '購入確認を完了してポータルに追加する' : '利用開始してポータルに追加する';
    root.innerHTML = `
      <section class="purchase-confirm-layout">
        <figure class="purchase-confirm-thumb">
          <img src="${escapeAttr(content.thumbnailImage || content.thumbnail || './assets/thumbs/internal-operations.png')}" alt="${escapeAttr(content.title)}">
        </figure>
        <div>
          <span class="market-kicker">購入・利用開始確認</span>
          <h1>${escapeHtml(content.title)}</h1>
          <p>${escapeHtml(content.summary || content.description || '')}</p>
          <dl class="detail-definition purchase-confirm-definition">
            <div><dt>価格</dt><dd>${escapeHtml(formatPrice(content))}</dd></div>
            <div><dt>状態</dt><dd>${escapeHtml(saleStatusLabels[content.saleStatus] || content.saleStatus || '-')}</dd></div>
            <div><dt>提供方法</dt><dd>${escapeHtml(deliveryLabels[content.deliveryType] || content.deliveryType || '-')}</dd></div>
            <div><dt>ポータル追加</dt><dd>確認後に追加</dd></div>
          </dl>
          <div class="purchase-flow-note">
            <strong>確認してから追加します</strong>
            <p>無料・β版・有料のいずれも、ここで内容を確認してからポータルへ追加します。決済・購入履歴の本実装は後続フェーズです。</p>
          </div>
          <div class="detail-cta-row">
            <button class="btn primary" type="button" id="confirmPurchaseButton">${escapeHtml(actionLabel)}</button>
            ${openUrl ? `<a class="btn secondary" href="${escapeAttr(openUrl)}" target="_blank" rel="noopener">別タブで開く</a>` : ''}
            <a class="btn secondary" href="./marketplace.html">戻る</a>
          </div>
          <p class="request-status" id="purchaseStatus" aria-live="polite">まだポータルには追加していません。</p>
        </div>
      </section>
    `;

    document.getElementById('confirmPurchaseButton')?.addEventListener('click', () => confirm(content));
  }

  function confirm(content) {
    const additions = readAdditions();
    const nextItem = {
      id: content.id,
      slug: content.slug,
      title: content.title,
      summary: content.summary || content.description || '',
      category: content.category || '',
      categoryId: content.categoryId || '',
      priceType: content.priceType || '',
      url: content.url || content.contentUrl || content.detailUrl || '',
      detailUrl: content.detailUrl || '',
      thumbnail: content.thumbnailImage || content.thumbnail || '',
      addedAt: new Date().toISOString()
    };
    const next = [nextItem, ...additions.filter(item => item.id !== nextItem.id)].slice(0, 12);
    const status = document.getElementById('purchaseStatus');
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      if (status) {
        status.textContent = 'このブラウザでは一時追加を保存できませんでした。ブラウザ設定を確認してください。';
      }
      return;
    }
    if (status) {
      status.innerHTML = `ポータルに追加しました。<a href="./portal.html">ポータルで確認する</a>`;
    }
  }

  function readAdditions() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      const parsed = JSON.parse(raw || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function renderNotFound() {
    root.innerHTML = notFoundHtml('対象が見つかりません。', 'マーケット一覧から開き直してください。');
  }

  function notFoundHtml(title, message) {
    return `
      <span class="market-kicker">確認できません</span>
      <h1>${escapeHtml(title)}</h1>
      <p>${escapeHtml(message)}</p>
      <div class="detail-cta-row">
        <a class="btn primary" href="./marketplace.html">マーケットへ戻る</a>
      </div>
    `;
  }

  function formatPrice(content) {
    if (content.priceType === 'paid' && Number.isFinite(content.price) && content.price > 0) {
      return `${content.price.toLocaleString('ja-JP')}円`;
    }
    return priceLabels[content.priceType] || content.priceType || '-';
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

  function escapeAttr(value) {
    return escapeHtml(value).replace(/`/g, '&#96;');
  }
})();
