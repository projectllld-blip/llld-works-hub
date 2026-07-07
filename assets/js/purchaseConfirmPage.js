'use strict';

(() => {
  const STORAGE_KEY = 'llldWorksHub.portalAdditions.session';
  const priceLabels = {
    free: '無料',
    'free-beta': '無料β',
    paid: '買い切り',
    subscription: 'サブスク',
    'coming-soon': '有料予定'
  };
  const saleStatusLabels = {
    'on-sale': '販売中',
    beta: 'β版',
    'inquiry-only': '手動確認',
    preparing: '開発中'
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
      const key = getContentKey();
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

  function getContentKey() {
    const keys = ['slug', 'item', 'id', 'app', 'product', 'content', 'contentId'];
    for (const key of keys) {
      const value = params.get(key);
      if (value) return value.trim();
    }
    return '';
  }

  function render(content) {
    if (isConsultationContent(content)) {
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

    if (isPreparingContent(content)) {
      const requestUrl = content.inquiryUrl || content.requestUrl || `./request.html?type=early-access&item=${encodeURIComponent(content.slug || content.id)}`;
      root.innerHTML = `
        <span class="market-kicker">開発中</span>
        <h1>${escapeHtml(content.title)}</h1>
        <p>${escapeHtml(content.summary || content.description || 'このコンテンツは現在準備中です。')}</p>
        <div class="purchase-flow-note">
          <strong>まだ購入・利用開始はできません</strong>
          <p>準備中の商品は、ポータルへの追加や購入確認を行いません。公開準備が整った後に、利用開始または購入確認の導線へ切り替えます。</p>
        </div>
        <div class="detail-cta-row">
          <a class="btn primary" href="${escapeAttr(requestUrl)}">先行案内を受ける</a>
          <a class="btn secondary" href="./marketplace.html">マーケットへ戻る</a>
        </div>
      `;
      return;
    }

    const openUrl = content.url || content.contentUrl || '';
    const flow = getPurchaseFlow(content);
    root.innerHTML = `
      <section class="purchase-confirm-layout">
        <figure class="purchase-confirm-thumb">
          <img src="${escapeAttr(content.thumbnailImage || content.thumbnail || './assets/thumbs/internal-operations.png')}" alt="${escapeAttr(content.title)}">
        </figure>
        <div>
          <span class="market-kicker">${escapeHtml(flow.kicker)}</span>
          <h1>${escapeHtml(content.title)}</h1>
          <p>${escapeHtml(content.summary || content.description || '')}</p>
          <dl class="detail-definition purchase-confirm-definition">
            <div><dt>価格</dt><dd>${escapeHtml(formatPrice(content))}</dd></div>
            <div><dt>状態</dt><dd>${escapeHtml(saleStatusLabels[content.saleStatus] || content.saleStatus || '-')}</dd></div>
            <div><dt>提供方法</dt><dd>${escapeHtml(deliveryLabels[content.deliveryType] || content.deliveryType || '-')}</dd></div>
            <div><dt>確認後の扱い</dt><dd>${escapeHtml(flow.afterConfirm)}</dd></div>
          </dl>
          <div class="purchase-flow-note">
            <strong>${escapeHtml(flow.noteTitle)}</strong>
            <p>${escapeHtml(flow.note)}</p>
          </div>
          <fieldset class="purchase-support-options">
            <legend>任意サポート</legend>
            <label><input type="checkbox" value="初期設定サポート"> 初期設定サポートを相談する</label>
            <label><input type="checkbox" value="使い方説明"> 使い方説明を希望する</label>
            <label><input type="checkbox" value="カスタマイズ相談"> カスタマイズ相談を希望する</label>
            <label><input type="checkbox" value="導入代行"> 導入代行について相談する</label>
          </fieldset>
          <div class="detail-cta-row">
            <button class="btn primary" type="button" id="confirmPurchaseButton">${escapeHtml(flow.buttonLabel)}</button>
            <a class="btn secondary" href="./marketplace.html">戻る</a>
          </div>
          <p class="request-status" id="purchaseStatus" aria-live="polite">${escapeHtml(flow.initialStatus)}</p>
          ${flow.canPortalAdd && openUrl ? `<p class="purchase-open-note">確認後に、ポータルから開く導線と別タブ起動を確認できます。</p>` : ''}
        </div>
      </section>
    `;

    document.getElementById('confirmPurchaseButton')?.addEventListener('click', () => confirm(content));
  }

  async function confirm(content) {
    const flow = getPurchaseFlow(content);
    const supportRequests = Array.from(document.querySelectorAll('.purchase-support-options input:checked'))
      .map(input => input.value);
    const status = document.getElementById('purchaseStatus');
    if (!flow.canPortalAdd) {
      if (status) {
        const supportLink = supportRequests.length
          ? ` <a href="${escapeAttr(supportUrl(content, supportRequests))}">サポート相談へ進む</a>`
          : '';
        status.innerHTML = `${escapeHtml(flow.doneMessage)}${supportLink}`;
      }
      return;
    }

    const button = document.getElementById('confirmPurchaseButton');
    if (button) {
      button.disabled = true;
      button.textContent = '確認中';
    }
    if (status) status.textContent = '利用開始を確認しています。';

    const reflection = await reflectAppInstance(content);
    if (reflection.handled && !reflection.fallbackToSession) {
      if (status) {
        status.innerHTML = resultMessageHtml(content, flow, supportRequests, reflection);
      }
      if (button) {
        button.disabled = false;
        button.textContent = flow.buttonLabel;
      }
      return;
    }

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
      actionType: flow.actionType,
      portalStatusLabel: flow.portalStatusLabel,
      supportRequests,
      addedAt: new Date().toISOString()
    };
    const next = [nextItem, ...additions.filter(item => item.id !== nextItem.id)].slice(0, 12);
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      if (status) {
        status.textContent = 'このブラウザでは一時追加を保存できませんでした。ブラウザ設定を確認してください。';
      }
      if (button) {
        button.disabled = false;
        button.textContent = flow.buttonLabel;
      }
      return;
    }
    if (status) {
      status.innerHTML = sessionMessageHtml(content, flow, supportRequests, nextItem);
    }
    if (button) {
      button.disabled = false;
      button.textContent = flow.buttonLabel;
    }
  }

  async function reflectAppInstance(content) {
    if (!window.AppInstanceService?.reflectFreeBetaAppInstance) {
      return { handled: false, fallbackToSession: true };
    }

    try {
      const result = await window.AppInstanceService.reflectFreeBetaAppInstance({
        slug: content.slug || content.id || '',
        priceType: content.priceType || ''
      });

      if (result?.reason === 'mock_mode') {
        return { handled: true, fallbackToSession: true, result };
      }

      return { handled: true, fallbackToSession: false, result };
    } catch {
      return {
        handled: true,
        fallbackToSession: false,
        result: {
          ok: false,
          reason: 'reflection_exception',
          message: '利用開始の保存に失敗しました。時間をおいてもう一度お試しください。'
        }
      };
    }
  }

  function resultMessageHtml(content, flow, supportRequests, reflection) {
    const result = reflection?.result || {};
    const supportLink = supportRequests.length
      ? ` <a href="${escapeAttr(supportUrl(content, supportRequests))}">サポート相談へ進む</a>`
      : '';

    if (!result.ok) {
      return `${escapeHtml(result.message || '利用開始を保存できませんでした。')}${supportLink}`;
    }

    const openUrl = content.url || content.contentUrl || content.detailUrl || '';
    const openLink = openUrl
      ? ` <a href="${escapeAttr(openUrl)}" target="_blank" rel="noopener">別タブで開く</a>`
      : '';
    const portalLink = ' <a href="./portal.html">ポータルで確認する</a>';
    const message = result.message || flow.doneMessage;
    return `${escapeHtml(message)}${portalLink}${openLink}${supportLink}`;
  }

  function sessionMessageHtml(content, flow, supportRequests, nextItem) {
    const supportLink = supportRequests.length
      ? ` <a href="${escapeAttr(supportUrl(content, supportRequests))}">サポート相談へ進む</a>`
      : '';
    const openLink = nextItem.url
      ? ` <a href="${escapeAttr(nextItem.url)}" target="_blank" rel="noopener">別タブで開く</a>`
      : '';
    return `${escapeHtml(flow.doneMessage)} <a href="./portal.html">ポータルで確認する</a>${openLink}${supportLink}`;
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

  function isConsultationContent(content) {
    return content.priceType === 'consultation' || content.deliveryType === 'inquiry-only' || content.saleStatus === 'inquiry-only';
  }

  function isPreparingContent(content) {
    return content.priceType === 'coming-soon' || content.saleStatus === 'preparing';
  }

  function getPurchaseFlow(content) {
    if (content.priceType === 'free-beta') {
      return {
        actionType: 'beta',
        kicker: 'β版利用確認',
        buttonLabel: 'β版を利用する',
        canPortalAdd: true,
        afterConfirm: 'β版としてポータルへ一時追加',
        portalStatusLabel: 'β版利用開始済み',
        initialStatus: 'まだポータルには追加していません。',
        noteTitle: 'β版として確認してから使います',
        note: 'β版は未完成範囲が残る前提で利用します。正式な利用中アプリ反映、購入履歴、決済連携は後続フェーズで扱います。',
        doneMessage: 'β版をポータルへ一時追加しました。'
      };
    }
    if (content.priceType === 'paid' || content.priceType === 'subscription') {
      return {
        actionType: 'purchase',
        kicker: '購入確認',
        buttonLabel: '購入確認を完了する',
        canPortalAdd: false,
        afterConfirm: '購入確認のみ。ポータルへは追加しません',
        portalStatusLabel: '決済待ち',
        initialStatus: '購入確認前です。このアプリはまだ利用開始されません。',
        noteTitle: 'この画面では決済しません',
        note: '今回は購入確認フローのMVPです。支払い処理、購入履歴、正式な利用権限付与はまだ行いません。このアプリは決済完了後、または運営側の明示的な利用開始処理後に利用できるようになります。',
        doneMessage: '購入内容を確認しました。現在、決済機能は準備中です。このアプリはまだ利用開始されていません。正式な購入・決済が完了すると利用できるようになります。'
      };
    }
    return {
      actionType: 'start',
      kicker: '利用開始確認',
      buttonLabel: '利用開始する',
      canPortalAdd: true,
      afterConfirm: '利用開始済みとしてポータルへ一時追加',
      portalStatusLabel: '利用開始済み',
      initialStatus: 'まだポータルには追加していません。',
      noteTitle: '確認してから利用開始します',
      note: '無料ツールも直接追加せず、ここで内容を確認してからポータルへ追加します。正式な利用中アプリ反映は後続フェーズで扱います。',
      doneMessage: '利用開始としてポータルへ一時追加しました。'
    };
  }

  function supportUrl(content, supportRequests) {
    const params = new URLSearchParams({
      type: 'support',
      item: content.slug || content.id || '',
      support: supportRequests.join(',')
    });
    return `./support.html?${params.toString()}`;
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
