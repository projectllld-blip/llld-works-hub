'use strict';

(() => {
  const state = {
    contents: [],
    authors: [],
    categories: [],
    query: '',
    status: 'all',
    selectedContentId: null
  };

  const mockSubmissions = [
    {
      title: '教室向け欠席連絡テンプレート',
      submitter: 'サンプル申請者A',
      email: 'sample-author@example.invalid',
      contentType: 'Excelテンプレート',
      targetUsers: '塾・教室',
      desiredPrice: '980円',
      status: 'received',
      receivedAt: '2026-06-25',
      memo: '個人情報を含まないサンプルとして受領。著作権確認待ち。'
    },
    {
      title: '小規模店舗 月次確認シート',
      submitter: 'サンプル申請者B',
      email: 'sample-partner@example.invalid',
      contentType: 'チェックリスト',
      targetUsers: '店舗・事務',
      desiredPrice: '1,480円',
      status: 'reviewing',
      receivedAt: '2026-06-24',
      memo: '販売ページ文言と納品形式を確認中。'
    },
    {
      title: '面談前ヒアリング項目集',
      submitter: 'LLLD公式',
      email: 'official@example.invalid',
      contentType: 'PDF資料',
      targetUsers: '塾・営業',
      desiredPrice: '2,980円',
      status: 'needs_fix',
      receivedAt: '2026-06-23',
      memo: 'サンプル文言の誇大表現を弱める。'
    }
  ];

  const roleLabels = {
    guest: 'ゲスト',
    member: 'メンバー',
    author: '投稿者',
    admin: '管理者'
  };

  const statusLabels = {
    all: '状態すべて',
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

  const visibilityLabels = {
    public: '一般公開',
    limited: '限定公開',
    internal: '社内向け',
    internal_only: '完全社内限定',
    'internal-and-public': '社内・一般公開',
    private: '非公開'
  };

  const deliveryLabels = {
    'direct-link': '直接リンク',
    manual: '手動納品',
    'google-drive': 'Drive納品',
    'app-link': 'アプリリンク',
    'inquiry-only': '相談後案内'
  };

  const priceTypeLabels = {
    free: '無料',
    beta: 'β版',
    paid: '有料',
    'free-beta': '無料β',
    consultation: '問い合わせ',
    'coming-soon': '準備中',
    inquiry: '問い合わせ',
    internal: '社内限定'
  };

  const reviewChecklist = [
    '個人情報を含んでいない',
    '顧客情報を含んでいない',
    '勤怠実データを含んでいない',
    '教材PDFや入試問題PDFをGitHubに置いていない',
    '著作権的に問題がない',
    '有料商品の本体ファイルをGitHubに置いていない',
    '説明文が誇大表現になっていない',
    '価格表示がわかりやすい',
    'CTAが適切',
    '対象ユーザーが明確',
    '実際に現場で使える内容',
    '公開範囲が正しい'
  ];

  const publishDefinitions = {
    status: [
      ['draft', '下書き'],
      ['review', '審査中'],
      ['published', '公開中'],
      ['private', '非公開'],
      ['rejected', '却下'],
      ['archived', 'アーカイブ']
    ],
    visibility: [
      ['public', '一般公開'],
      ['limited', '限定公開'],
      ['internal', '社内向け'],
      ['internal_only', '完全社内限定']
    ],
    sale: [
      ['free', '無料'],
      ['beta', 'β版'],
      ['paid', '有料'],
      ['coming_soon', '準備中'],
      ['inquiry', '問い合わせ'],
      ['internal', '社内限定']
    ]
  };

  const $ = selector => document.querySelector(selector);

  init();

  async function init() {
    if (!window.ContentService) {
      renderError('データ取得Serviceを読み込めませんでした。');
      return;
    }

    try {
      [state.contents, state.authors, state.categories] = await Promise.all([
        window.ContentService.getContents(),
        window.ContentService.getAuthors(),
        window.ContentService.getCategories()
      ]);
      renderRoleControls();
      renderStatusFilter();
      bindEvents();
      render();
    } catch (error) {
      renderError('管理モック用データを読み込めませんでした。localhostで開いているか確認してください。');
    }
  }

  function bindEvents() {
    const search = $('#adminSearch');
    if (search) {
      search.addEventListener('input', event => {
        state.query = event.target.value.trim();
        renderList();
      });
    }

    const status = $('#adminStatusFilter');
    if (status) {
      status.addEventListener('change', event => {
        state.status = event.target.value;
        renderList();
      });
    }

    const role = $('#mockRoleSelect');
    if (role && window.AuthMockService) {
      role.addEventListener('change', event => {
        window.AuthMockService.setCurrentRoleMock(event.target.value);
        renderRoleNote();
      });
    }

    document.addEventListener('click', event => {
      const button = event.target.closest('[data-admin-action]');
      if (!button) return;
      const content = state.contents.find(item => item.id === button.dataset.contentId);
      if (!content) return;
      state.selectedContentId = content.id;
      renderInspector(button.dataset.adminAction, content);
    });
  }

  function render() {
    renderSummary();
    renderList();
    renderSubmissions();
    renderRoleNote();
  }

  function renderRoleControls() {
    const select = $('#mockRoleSelect');
    if (!select || !window.AuthMockService) return;
    const current = window.AuthMockService.getCurrentUserMock();
    select.innerHTML = window.AuthMockService.roles
      .map(role => `<option value="${escapeAttr(role)}"${role === current.role ? ' selected' : ''}>${escapeHtml(roleLabels[role] || role)}</option>`)
      .join('');
  }

  function renderRoleNote() {
    const root = $('#adminRoleNote');
    if (!root || !window.AuthMockService) return;
    const user = window.AuthMockService.getCurrentUserMock();
    root.innerHTML = `現在の表示確認ロール: <strong>${escapeHtml(user.label)}</strong>。これはlocalStorageに保存されるモック値で、本番権限ではありません。`;
  }

  function renderStatusFilter() {
    const select = $('#adminStatusFilter');
    if (!select) return;
    select.innerHTML = Object.entries(statusLabels)
      .map(([value, label]) => `<option value="${escapeAttr(value)}">${escapeHtml(label)}</option>`)
      .join('');
  }

  function renderSummary() {
    setText('#adminTotalContents', state.contents.length);
    setText('#adminMarketContents', visibleMarketContents().length);
    setText('#adminOnSaleContents', state.contents.filter(content => content.saleStatus === 'on-sale').length);
    setText('#adminPendingContents', state.contents.filter(content => ['review', 'coming-soon'].includes(content.status) || content.saleStatus === 'preparing').length);
  }

  function renderList() {
    const root = $('#adminContentList');
    if (!root) return;
    const items = filteredContents();
    root.innerHTML = items.length
      ? items.map(rowTemplate).join('')
      : '<div class="empty">条件に合うコンテンツがありません。</div>';
  }

  function filteredContents() {
    const query = normalize(state.query);
    return state.contents.filter(content => {
      const matchStatus = state.status === 'all' || content.status === state.status;
      const text = normalize([
        content.title,
        content.slug,
        content.categoryId,
        content.authorId,
        content.priceType,
        content.saleStatus,
        ...(content.tags || [])
      ].join(' '));
      return matchStatus && (!query || text.includes(query));
    });
  }

  function rowTemplate(content) {
    const author = state.authors.find(item => item.id === content.authorId);
    const category = state.categories.find(item => item.id === content.categoryId);
    const visible = content.priceType !== 'internal' && content.saleStatus !== 'internal-only' && content.visibility !== 'internal';
    return `<article class="admin-row">
      <div>
        <strong>${escapeHtml(content.title)}</strong>
        <span>${escapeHtml(content.slug || content.id)}</span>
      </div>
      <div>${escapeHtml(category?.name || content.categoryId || '未分類')}</div>
      <div>${escapeHtml(author?.name || content.authorId || '投稿者未設定')}</div>
      <div><span class="admin-pill">${escapeHtml(statusLabels[content.status] || content.status || '-')}</span></div>
      <div><span class="admin-pill">${escapeHtml(saleStatusLabels[content.saleStatus] || content.saleStatus || '-')}</span></div>
      <div>${visible ? 'Market表示' : '非表示'}</div>
      <div class="admin-actions">
        <button type="button" data-admin-action="detail" data-content-id="${escapeAttr(content.id)}">詳細</button>
        <button type="button" data-admin-action="review" data-content-id="${escapeAttr(content.id)}">審査</button>
        <button type="button" data-admin-action="edit" data-content-id="${escapeAttr(content.id)}">編集モック</button>
        <button type="button" data-admin-action="publish" data-content-id="${escapeAttr(content.id)}">公開判定</button>
      </div>
    </article>`;
  }

  function renderInspector(action, content) {
    const root = $('#adminInspectorPanel');
    if (!root) return;
    const templates = {
      detail: detailPanel,
      review: reviewPanel,
      edit: editMockPanel,
      publish: publishPanel
    };
    root.innerHTML = (templates[action] || detailPanel)(content);
    root.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function detailPanel(content) {
    const author = state.authors.find(item => item.id === content.authorId);
    const category = state.categories.find(item => item.id === content.categoryId);
    return `<h3>詳細: ${escapeHtml(content.title)}</h3>
      <div class="admin-detail-grid">
        ${detailItem('タイトル', content.title)}
        ${detailItem('slug / id', `${content.slug || '-'} / ${content.id || '-'}`)}
        ${detailItem('投稿者', author?.name || content.authorId || '-')}
        ${detailItem('カテゴリ', category?.name || content.categoryId || '-')}
        ${detailItem('公開状態', statusLabels[content.status] || content.status || '-')}
        ${detailItem('公開範囲', visibilityLabels[content.visibility] || content.visibility || '-')}
        ${detailItem('販売状態', saleStatusLabels[content.saleStatus] || content.saleStatus || '-')}
        ${detailItem('価格', formatPrice(content))}
        ${detailItem('提供方法', deliveryLabels[content.deliveryType] || content.deliveryType || '-')}
        ${detailItem('対象ユーザー', listText(content.targetUsers))}
        ${detailItem('タグ', listText(content.tags))}
        ${detailItem('概要', content.summary || content.description || '-')}
        ${detailItem('URL', content.contentUrl || content.primaryCtaUrl || content.detailUrl || '-')}
        ${detailItem('サムネイルURL', content.thumbnail || content.thumbnailImage || '-')}
        ${detailItem('最終更新日', content.updatedAt || '-')}
        ${detailItem('CTA種別', `${content.primaryCtaType || '-'} / ${content.primaryCtaLabel || '-'}`)}
      </div>
      <p class="admin-note">この詳細表示はモックです。ここからデータ保存は行いません。</p>`;
  }

  function reviewPanel(content) {
    return `<h3>審査チェック: ${escapeHtml(content.title)}</h3>
      <p class="admin-note">チェック操作は画面上だけのモックです。localStorage保存もDB保存も行いません。</p>
      <div class="admin-checklist">
        ${reviewChecklist.map((item, index) => `<label><input type="checkbox" value="${index}"> ${escapeHtml(item)}</label>`).join('')}
      </div>`;
  }

  function editMockPanel(content) {
    return `<h3>編集モック: ${escapeHtml(content.title)}</h3>
      <p class="admin-note">将来の編集画面イメージです。入力欄は表示確認用で、実データには反映しません。</p>
      <div class="admin-edit-grid">
        <label>タイトル<input value="${escapeAttr(content.title || '')}" readonly></label>
        <label>slug<input value="${escapeAttr(content.slug || '')}" readonly></label>
        <label>価格<input value="${escapeAttr(formatPrice(content))}" readonly></label>
        <label>CTA<input value="${escapeAttr(content.primaryCtaLabel || '')}" readonly></label>
        <label class="admin-wide">概要<textarea readonly>${escapeHtml(content.summary || content.description || '')}</textarea></label>
      </div>`;
  }

  function publishPanel(content) {
    return `<h3>公開判定: ${escapeHtml(content.title)}</h3>
      <p class="admin-note">この操作はモックです。切り替えUIを操作しても data/contents.json は変更されません。</p>
      <div class="admin-definition-grid">
        ${definitionBlock('公開状態', publishDefinitions.status, content.status)}
        ${definitionBlock('公開範囲', publishDefinitions.visibility, content.visibility)}
        ${definitionBlock('販売状態', publishDefinitions.sale, content.priceType)}
      </div>
      <div class="admin-edit-grid">
        <label>公開状態<select>${publishDefinitions.status.map(([value, label]) => option(value, label, value === content.status)).join('')}</select></label>
        <label>公開範囲<select>${publishDefinitions.visibility.map(([value, label]) => option(value, label, value === content.visibility)).join('')}</select></label>
        <label>販売状態<select>${publishDefinitions.sale.map(([value, label]) => option(value, label, value === content.priceType)).join('')}</select></label>
      </div>`;
  }

  function renderSubmissions() {
    const root = $('#submissionMockList');
    if (!root) return;
    root.innerHTML = mockSubmissions.map(submission => `<article class="admin-submission-row">
      <div><strong>${escapeHtml(submission.title)}</strong><span>${escapeHtml(submission.contentType)}</span></div>
      <div>${escapeHtml(submission.submitter)}<span>${escapeHtml(submission.email)}</span></div>
      <div>${escapeHtml(submission.targetUsers)}</div>
      <div>${escapeHtml(submission.desiredPrice)}</div>
      <div><span class="admin-pill">${escapeHtml(submission.status)}</span><span>${escapeHtml(submission.receivedAt)}</span></div>
      <div>${escapeHtml(submission.memo)}</div>
    </article>`).join('');
  }

  function detailItem(label, value) {
    return `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value || '-')}</dd></div>`;
  }

  function definitionBlock(title, rows, currentValue) {
    return `<article>
      <h4>${escapeHtml(title)}</h4>
      <dl>${rows.map(([value, label]) => `<div class="${value === currentValue ? 'current' : ''}"><dt>${escapeHtml(value)}</dt><dd>${escapeHtml(label)}</dd></div>`).join('')}</dl>
    </article>`;
  }

  function option(value, label, selected) {
    return `<option value="${escapeAttr(value)}"${selected ? ' selected' : ''}>${escapeHtml(label)}</option>`;
  }

  function formatPrice(content) {
    if (content.priceType === 'free') return '無料';
    if (content.priceType === 'free-beta') return '無料β';
    if (content.priceType === 'consultation') return '問い合わせ';
    if (content.priceType === 'coming-soon') return '準備中';
    if (content.priceType === 'internal') return '社内限定';
    if (content.price == null || content.price === '') return priceTypeLabels[content.priceType] || '-';
    return `${Number(content.price).toLocaleString('ja-JP')} ${content.currency || 'JPY'}`;
  }

  function listText(items) {
    return Array.isArray(items) && items.length ? items.join('、') : '-';
  }

  function visibleMarketContents() {
    return state.contents.filter(content => content.priceType !== 'internal' && content.saleStatus !== 'internal-only' && content.visibility !== 'internal');
  }

  function renderError(message) {
    const root = $('#adminContentList');
    if (root) root.innerHTML = `<div class="empty">${escapeHtml(message)}</div>`;
  }

  function setText(selector, value) {
    const node = $(selector);
    if (node) node.textContent = String(value);
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
    })[char]);
  }

  function escapeAttr(value) {
    return escapeHtml(value);
  }
})();
