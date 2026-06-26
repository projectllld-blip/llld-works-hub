'use strict';

(() => {
  const state = {
    contents: [],
    authors: [],
    categories: [],
    query: '',
    categoryId: 'all',
    priceType: 'all',
    tag: 'all'
  };

  const priceLabels = {
    free: '無料',
    'free-beta': '無料β',
    paid: '有料',
    consultation: '開発相談',
    internal: '社内限定',
    'coming-soon': '準備中'
  };

  const statusLabels = {
    published: '公開中',
    draft: '下書き',
    review: '審査中',
    'coming-soon': '準備中',
    archived: '掲載終了'
  };

  const saleStatusLabels = {
    'on-sale': '販売中',
    beta: 'β版',
    'inquiry-only': '相談受付',
    preparing: '準備中',
    'internal-only': '社内限定'
  };

  const deliveryLabels = {
    'direct-link': '直接リンク',
    manual: '手動納品',
    'google-drive': 'Drive納品',
    'app-link': 'アプリリンク',
    'inquiry-only': '相談後案内'
  };

  const visibilityLabels = {
    public: '一般公開',
    limited: '限定公開',
    internal: '社内向け',
    internal_only: '完全社内限定',
    'internal-and-public': '社内・一般公開',
    private: '非公開'
  };

  const authorTypeLabels = {
    official: '公式',
    partner: '提携',
    external: '外部投稿者',
    staff: 'スタッフ'
  };

  const $ = selector => document.querySelector(selector);
  const $$ = selector => Array.from(document.querySelectorAll(selector));

  init();

  async function init() {
    if (!window.ContentService) return;
    renderInitialLoading();
    try {
      [state.contents, state.authors, state.categories] = await Promise.all([
        window.ContentService.getContents(),
        window.ContentService.getAuthors(),
        window.ContentService.getCategories()
      ]);
      const page = document.body.dataset.marketPage;
      if (page === 'marketplace') renderMarketplace();
      if (page === 'detail') renderDetail();
      if (page === 'author') renderAuthor();
    } catch (error) {
      renderLoadError();
    }
  }

  function renderInitialLoading() {
    const page = document.body.dataset.marketPage;
    if (page === 'marketplace') {
      setText('#marketResultMeta', '商品情報を読み込んでいます。');
      renderCards('#marketGrid', [], {
        title: '読み込み中です',
        message: '商品情報を確認しています。少しお待ちください。',
        type: 'loading'
      });
    }
    if (page === 'detail') {
      const root = $('#contentDetail');
      if (root) {
        root.innerHTML = statusBlock('読み込み中です', '商品情報を確認しています。少しお待ちください。', 'loading');
      }
    }
  }

  function renderMarketplace() {
    renderCategoryChips();
    renderPriceOptions();
    renderTagChips();
    bindMarketplaceFilters();
    renderMarketplaceLists();
  }

  function renderCategoryChips() {
    const wrap = $('#marketCategoryChips');
    if (!wrap) return;
    const visibleCategoryIds = new Set(visibleMarketContents(state.contents).map(content => content.categoryId));
    wrap.innerHTML = [
      chipButton('all', 'すべて', state.categoryId === 'all', 'category'),
      ...state.categories
        .filter(category => visibleCategoryIds.has(category.id))
        .map(category => chipButton(category.id, category.name, state.categoryId === category.id, 'category'))
    ].join('');
  }

  function renderPriceOptions() {
    const select = $('#priceFilter');
    if (!select) return;
    const options = ['all', 'free', 'free-beta', 'paid', 'consultation', 'coming-soon'];
    select.innerHTML = options.map(value => `<option value="${escapeAttr(value)}">${escapeHtml(value === 'all' ? '価格タイプすべて' : priceLabels[value])}</option>`).join('');
  }

  function renderTagChips() {
    const wrap = $('#tagChips');
    if (!wrap) return;
    const tags = unique(visibleMarketContents(state.contents).flatMap(content => content.tags || [])).slice(0, 18);
    wrap.innerHTML = [
      chipButton('all', 'タグすべて', state.tag === 'all', 'tag'),
      ...tags.map(tag => chipButton(tag, tag, state.tag === tag, 'tag'))
    ].join('');
  }

  function bindMarketplaceFilters() {
    const search = $('#marketSearch');
    if (search) {
      search.addEventListener('input', event => {
        state.query = event.target.value.trim();
        renderMarketplaceLists();
      });
    }

    const price = $('#priceFilter');
    if (price) {
      price.addEventListener('change', event => {
        state.priceType = event.target.value;
        renderMarketplaceLists();
      });
    }

    document.addEventListener('click', event => {
      const category = event.target.closest('[data-market-category]');
      if (category) {
        state.categoryId = category.dataset.marketCategory;
        renderCategoryChips();
        renderMarketplaceLists();
      }

      const tag = event.target.closest('[data-market-tag]');
      if (tag) {
        state.tag = tag.dataset.marketTag;
        renderTagChips();
        renderMarketplaceLists();
      }
    });
  }

  function renderMarketplaceLists() {
    const filtered = filteredContents();
    const marketContents = visibleMarketContents(state.contents);
    setText('#marketResultMeta', `${filtered.length}件表示中 / 全${marketContents.length}件`);
    const empty = marketContents.length === 0
      ? {
          title: '表示できる商品がありません',
          message: '公開できる商品データがまだありません。data/contents.json の公開範囲を確認してください。',
          type: 'empty'
        }
      : {
          title: '条件に合う商品がありません',
          message: '検索条件やカテゴリを変えて、もう一度探してください。',
          type: 'empty'
        };
    renderCards('#marketGrid', filtered, empty);
    renderCards('#freeToolsGrid', filtered.filter(content => ['free', 'free-beta'].includes(content.priceType)).slice(0, 6), {
      title: '無料ツールはまだありません',
      message: '公開できる無料ツールが追加されるとここに表示されます。',
      type: 'empty'
    });
    renderCards('#paidTemplatesGrid', filtered.filter(content => content.priceType === 'paid' && ['on-sale', 'inquiry-only'].includes(content.saleStatus)).slice(0, 6), {
      title: '販売中テンプレートはまだありません',
      message: '有料販売または問い合わせ受付の商品が追加されるとここに表示されます。',
      type: 'empty'
    });
    renderCards('#comingSoonGrid', filtered.filter(content => content.priceType === 'coming-soon' || content.saleStatus === 'preparing').slice(0, 6), {
      title: '有料予定コンテンツはまだありません',
      message: '準備中の商品が追加されるとここに表示されます。',
      type: 'empty'
    });
    renderCards('#consultationGrid', filtered.filter(content => content.priceType === 'consultation').slice(0, 6), {
      title: '開発相談できる商品はまだありません',
      message: '個別相談の対象商品が追加されるとここに表示されます。',
      type: 'empty'
    });
    renderCards('#schoolGrid', filtered.filter(content => includesAny(content.targetUsers, ['塾', '教室長', '教室スタッフ', '講師'])).slice(0, 6), {
      title: '塾・教室向けの商品はまだありません',
      message: '対象者に塾・教室が含まれる商品が追加されるとここに表示されます。',
      type: 'empty'
    });
    renderCards('#smallBusinessGrid', filtered.filter(content => includesAny(content.targetUsers, ['小規模事業者', '店舗', '事務'])).slice(0, 6), {
      title: '小規模事業者向けの商品はまだありません',
      message: '対象者に店舗・事務・小規模事業者が含まれる商品が追加されるとここに表示されます。',
      type: 'empty'
    });
  }

  function filteredContents() {
    const q = normalize(state.query);
    return visibleMarketContents(state.contents).filter(content => {
      const text = normalize([
        content.title,
        content.summary,
        content.description,
        content.category,
        content.categoryId,
        getAuthor(content.authorId)?.name,
        ...(content.targetUsers || []),
        ...(content.tags || [])
      ].join(' '));
      const matchQuery = !q || text.includes(q);
      const matchCategory = state.categoryId === 'all' || content.categoryId === state.categoryId;
      const matchPrice = state.priceType === 'all' || content.priceType === state.priceType;
      const matchTag = state.tag === 'all' || (content.tags || []).includes(state.tag);
      return matchQuery && matchCategory && matchPrice && matchTag;
    });
  }

  function visibleMarketContents(contents) {
    const internalValues = new Set(['internal', 'internal-only', 'internal_only']);
    return contents.filter(content =>
      !internalValues.has(content.priceType) &&
      !internalValues.has(content.saleStatus) &&
      !internalValues.has(content.visibility) &&
      !internalValues.has(content.categoryId)
    );
  }

  function renderCards(selector, contents, emptyState = null) {
    const wrap = $(selector);
    if (!wrap) return;
    wrap.innerHTML = contents.length
      ? contents.map(contentCard).join('')
      : statusBlock(
          emptyState?.title || '条件に合う商品がありません',
          emptyState?.message || '検索条件やカテゴリを変えて、もう一度探してください。',
          emptyState?.type || 'empty'
        );
  }

  function contentCard(content) {
    const author = getAuthor(content.authorId);
    const category = getCategory(content.categoryId);
    const action = getPrimaryAction(content);
    const priceText = formatPrice(content);
    const saleText = saleStatusLabels[content.saleStatus] || statusLabels[content.status] || content.saleStatus || content.status || '未設定';
    return `<article class="market-card">
      <a class="market-thumb" href="${escapeAttr(content.detailUrl)}">
        <img src="${escapeAttr(content.thumbnail || content.thumbnailImage || '')}" alt="${escapeAttr(content.title)}" loading="lazy">
      </a>
      <div class="market-card-body">
        <div class="market-card-badges">
          <span class="market-badge price-${escapeAttr(content.priceType || 'free')}">${escapeHtml(priceText)}</span>
          <span class="market-badge status-${escapeAttr(content.saleStatus || content.status || 'draft')}">${escapeHtml(saleText)}</span>
        </div>
        <h3><a href="${escapeAttr(content.detailUrl)}">${escapeHtml(content.title)}</a></h3>
        <p>${escapeHtml(content.summary || content.description || '')}</p>
        <div class="market-card-facts">
          <span>${escapeHtml(listText(content.targetUsers, 2) || '対象者確認中')}</span>
          <span>${escapeHtml(deliveryLabels[content.deliveryType] || '提供方法確認中')}</span>
        </div>
        <div class="market-meta">
          <span>${escapeHtml(category?.name || content.category || '未分類')}</span>
          <a href="${escapeAttr(author?.profileUrl || '#')}">${escapeHtml(author?.name || '投稿者未設定')}</a>
        </div>
        <div class="target-row">${(content.targetUsers || []).slice(0, 3).map(item => `<span>${escapeHtml(item)}</span>`).join('')}</div>
        <div class="tag-row">${(content.tags || []).slice(0, 4).map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}</div>
        <div class="market-actions">
          <a class="btn primary" href="${escapeAttr(content.detailUrl)}">詳細を見る</a>
          <a class="btn secondary" href="${escapeAttr(action.href)}">${escapeHtml(action.label)}</a>
        </div>
      </div>
    </article>`;
  }

  function renderDetail() {
    const slug = new URLSearchParams(location.search).get('slug') || '';
    const content = visibleMarketContents(state.contents).find(item => item.slug === slug);
    const root = $('#contentDetail');
    if (!root) return;
    if (!content) {
      root.innerHTML = notFound('該当する商品が見つかりません', '公開中の商品ではないか、URLが変わった可能性があります。マーケット一覧から開き直してください。');
      return;
    }

    const author = getAuthor(content.authorId);
    const category = getCategory(content.categoryId);
    const action = getPrimaryAction(content);
    const secondaryAction = getSecondaryAction(content, action);
    const secondaryButton = secondaryAction
      ? `<a class="btn secondary" href="${escapeAttr(secondaryAction.href)}">${escapeHtml(secondaryAction.label)}</a>`
      : '';
    const related = visibleMarketContents(state.contents)
      .filter(item => item.id !== content.id && (item.categoryId === content.categoryId || hasOverlap(item.tags, content.tags)))
      .slice(0, 3);

    root.innerHTML = `
      <section class="detail-lp-hero">
        <div>
          <div class="market-card-badges">
            <span class="market-badge price-${escapeAttr(content.priceType || 'free')}">${escapeHtml(formatPrice(content))}</span>
            <span class="market-badge status-${escapeAttr(content.saleStatus || content.status || 'draft')}">${escapeHtml(saleStatusLabels[content.saleStatus] || statusLabels[content.status] || content.saleStatus || content.status || '未設定')}</span>
          </div>
          <h1>${escapeHtml(content.title)}</h1>
          <p>${escapeHtml(content.description || content.summary || '')}</p>
          <div class="detail-hero-facts">
            ${detailFact('対象者', listText(content.targetUsers, 3))}
            ${detailFact('販売状態', saleStatusLabels[content.saleStatus] || content.saleStatus || '-')}
            ${detailFact('価格', formatPrice(content))}
            ${detailFact('提供方法', deliveryLabels[content.deliveryType] || content.deliveryType || '-')}
          </div>
          <div class="detail-cta-row">
            <a class="btn primary" href="${escapeAttr(action.href)}">${escapeHtml(action.label)}</a>
            ${secondaryButton}
          </div>
        </div>
        <figure>
          <img src="${escapeAttr(content.thumbnail || content.thumbnailImage || '')}" alt="${escapeAttr(content.title)}">
        </figure>
      </section>

      <section class="detail-lp-grid">
        ${infoBlock('誰向けか', content.targetUsers)}
        ${infoBlock('この商品で解決できること', content.problems)}
        ${infoBlock('できること', content.features)}
        ${infoBlock('入っているもの / 提供内容', content.deliverables)}
        ${infoBlock('使い方', content.usageSteps)}
        ${infoBlock('注意事項', content.notes)}
      </section>

      <section class="detail-panel detail-bottom-cta">
        <div>
          <h2>気になる場合は、まず相談できます。</h2>
          <p>購入、導入、カスタマイズ、β版利用など、今の状態に合わせて手動で確認します。</p>
        </div>
        <div class="detail-cta-row">
          <a class="btn primary" href="${escapeAttr(action.href)}">${escapeHtml(action.label)}</a>
          ${secondaryButton}
        </div>
      </section>

      <section class="detail-panel">
        <h2>コンテンツ情報</h2>
        <dl class="detail-definition">
          <div><dt>カテゴリ</dt><dd>${escapeHtml(category?.name || content.category || '未分類')}</dd></div>
          <div><dt>投稿者</dt><dd><a href="${escapeAttr(author?.profileUrl || '#')}">${escapeHtml(author?.name || '投稿者未設定')}</a></dd></div>
          <div><dt>公開状態</dt><dd>${escapeHtml(statusLabels[content.status] || content.status || '-')}</dd></div>
          <div><dt>販売状態</dt><dd>${escapeHtml(saleStatusLabels[content.saleStatus] || content.saleStatus || '-')}</dd></div>
          <div><dt>価格</dt><dd>${escapeHtml(formatPrice(content))}</dd></div>
          <div><dt>提供方法</dt><dd>${escapeHtml(deliveryLabels[content.deliveryType] || content.deliveryType || '-')}</dd></div>
          <div><dt>対象ユーザー</dt><dd>${escapeHtml(listText(content.targetUsers) || '-')}</dd></div>
          <div><dt>更新日</dt><dd>${escapeHtml(content.updatedAt || '-')}</dd></div>
          <div><dt>公開範囲</dt><dd>${escapeHtml(visibilityLabels[content.visibility] || content.visibility || '-')}</dd></div>
          <div><dt>CTA種別</dt><dd>${escapeHtml(content.primaryCtaType || action.label || '-')}</dd></div>
        </dl>
        <div class="tag-row">${(content.tags || []).map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}</div>
      </section>

      <section class="detail-panel">
        <h2>投稿者</h2>
        <div class="author-mini">
          <img src="${escapeAttr(author?.avatar || './assets/images/author-llld.png')}" alt="">
          <div>
            <h3>${escapeHtml(author?.name || '投稿者未設定')}</h3>
            <p>${escapeHtml(author?.summary || '')}</p>
            <a class="text-button" href="${escapeAttr(author?.profileUrl || '#')}">投稿者ページを見る</a>
          </div>
        </div>
      </section>

      <section class="detail-panel">
        <h2>関連コンテンツ</h2>
        <div class="market-grid compact">${related.map(contentCard).join('') || '<div class="empty">関連コンテンツはまだありません。</div>'}</div>
      </section>
    `;
  }

  function renderAuthor() {
    const id = new URLSearchParams(location.search).get('id') || '';
    const author = state.authors.find(item => item.id === id);
    const root = $('#authorDetail');
    if (!root) return;
    if (!author) {
      root.innerHTML = notFound('投稿者が見つかりません', 'マーケット一覧から開き直してください。');
      return;
    }
    const works = state.contents.filter(content => content.authorId === author.id);
    root.innerHTML = `
      <section class="author-hero">
        <img src="${escapeAttr(author.avatar || './assets/images/author-llld.png')}" alt="">
        <div>
          <span class="market-badge">${escapeHtml(authorTypeLabels[author.type] || author.type || '投稿者')}</span>
          <h1>${escapeHtml(author.name)}</h1>
          <p>${escapeHtml(author.profile || author.summary || '')}</p>
          <a class="btn primary" href="${escapeAttr(author.contactUrl || './request.html')}">問い合わせ・開発相談</a>
        </div>
      </section>
      <section class="detail-panel">
        <h2>投稿コンテンツ</h2>
        <div class="market-grid">${visibleMarketContents(works).map(contentCard).join('') || '<div class="empty">掲載コンテンツはまだありません。</div>'}</div>
      </section>
    `;
  }

  function getPrimaryAction(content) {
    const openUrl = content.url || content.contentUrl || content.primaryCtaUrl;
    const inquiryUrl = content.inquiryUrl || content.requestUrl || content.primaryCtaUrl || './request.html';

    if (content.priceType === 'free') {
      return { label: content.primaryCtaLabel || '無料で使う', href: openUrl || content.detailUrl || './marketplace.html' };
    }
    if (content.priceType === 'free-beta') {
      return { label: content.primaryCtaLabel || 'β版を試す', href: openUrl || inquiryUrl };
    }
    if (content.priceType === 'paid' && content.saleStatus === 'on-sale') {
      if (content.paymentUrl) return { label: '購入する', href: content.paymentUrl };
      return { label: content.primaryCtaLabel || '購入について相談する', href: inquiryUrl };
    }
    if (content.priceType === 'paid' && content.saleStatus === 'preparing') {
      return { label: content.primaryCtaLabel || '先行案内を受ける', href: inquiryUrl };
    }
    if (content.priceType === 'consultation') {
      return { label: content.primaryCtaLabel || '開発を相談する', href: inquiryUrl };
    }
    if (content.priceType === 'coming-soon') {
      return { label: content.primaryCtaLabel || '先行案内を受ける', href: inquiryUrl };
    }
    if (content.priceType === 'internal') {
      return { label: content.primaryCtaLabel || '社内限定', href: openUrl || './index.html' };
    }
    return { label: content.ctaLabel || '相談する', href: content.inquiryUrl || content.requestUrl || './request.html' };
  }

  function getSecondaryAction(content, primaryAction = null) {
    if (content.secondaryCtaLabel && content.secondaryCtaUrl) {
      if (primaryAction && content.secondaryCtaUrl === primaryAction.href && content.secondaryCtaLabel === primaryAction.label) return null;
      return { label: content.secondaryCtaLabel, href: content.secondaryCtaUrl };
    }
    if (content.priceType === 'free' || content.priceType === 'free-beta') {
      const href = content.inquiryUrl || './request.html';
      if (!primaryAction || primaryAction.href !== href) return { label: '相談する', href };
    }
    return null;
  }

  function chipButton(value, label, active, type) {
    const attr = type === 'category' ? 'data-market-category' : 'data-market-tag';
    return `<button class="chip ${active ? 'active' : ''}" type="button" ${attr}="${escapeAttr(value)}">${escapeHtml(label)}</button>`;
  }

  function infoBlock(title, items = []) {
    if (!Array.isArray(items) || !items.length) return '';
    const list = items;
    return `<article class="detail-panel">
      <h2>${escapeHtml(title)}</h2>
      <ul>${list.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
    </article>`;
  }

  function notFound(title, message) {
    return `<section class="detail-panel not-found">
      <h1>${escapeHtml(title)}</h1>
      <p>${escapeHtml(message)}</p>
      <a class="btn primary" href="./marketplace.html">マーケット一覧へ</a>
    </section>`;
  }

  function renderLoadError() {
    const page = document.body.dataset.marketPage;
    const title = '商品情報の読み込みに失敗しました';
    const message = 'data/contents.json などの商品データを確認できませんでした。再読み込みするか、ローカルサーバーで開いているか確認してください。';
    if (page === 'marketplace') {
      setText('#marketResultMeta', '読み込みに失敗しました。');
      ['#marketGrid', '#freeToolsGrid', '#paidTemplatesGrid', '#comingSoonGrid', '#consultationGrid', '#schoolGrid', '#smallBusinessGrid']
        .forEach(selector => {
          const root = $(selector);
          if (root) root.innerHTML = statusBlock(title, message, 'error', true);
        });
      return;
    }
    const root = $('#contentDetail') || $('#authorDetail');
    if (root) root.innerHTML = statusBlock(title, message, 'error', true);
  }

  function statusBlock(title, message, type = 'info', retry = false) {
    const className = type === 'loading' ? 'loading-state' : type === 'empty' ? 'empty-state' : `status-message ${type}`;
    const retryButton = retry ? '<button class="btn secondary" type="button" onclick="window.location.reload()">再読み込み</button>' : '';
    return `<div class="${className}">
      <strong>${escapeHtml(title)}</strong>
      <span>${escapeHtml(message)}</span>
      ${retryButton}
    </div>`;
  }

  function getAuthor(authorId) {
    return state.authors.find(author => author.id === authorId) || null;
  }

  function getCategory(categoryId) {
    return state.categories.find(category => category.id === categoryId) || null;
  }

  function setText(selector, value) {
    const el = $(selector);
    if (el) el.textContent = value;
  }

  function hasOverlap(a = [], b = []) {
    return a.some(item => b.includes(item));
  }

  function includesAny(values = [], candidates = []) {
    return values.some(value => candidates.includes(value));
  }

  function detailFact(label, value) {
    if (!value || value === '-') return '';
    return `<span><b>${escapeHtml(label)}</b>${escapeHtml(value)}</span>`;
  }

  function listText(items = [], limit = 0) {
    if (!Array.isArray(items) || !items.length) return '';
    const list = limit ? items.slice(0, limit) : items;
    return list.join('、');
  }

  function formatPrice(content) {
    if (content.priceType === 'free') return '無料';
    if (content.priceType === 'free-beta') return '無料β';
    if (content.priceType === 'consultation') return '個別見積';
    if (content.priceType === 'coming-soon') return '有料予定';
    if (content.priceType === 'internal') return '社内限定';
    if (content.priceType === 'paid') {
      return Number.isFinite(content.price) && content.price > 0
        ? `${content.price.toLocaleString('ja-JP')}円`
        : '購入相談';
    }
    return priceLabels[content.priceType] || content.priceType || '未設定';
  }

  function unique(values) {
    return Array.from(new Set(values.filter(Boolean)));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().normalize('NFKC');
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
