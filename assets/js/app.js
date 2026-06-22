'use strict';

const fallbackContents = [
  {
    id:'dakokun', title:'だこくん', category:'社内運営', type:'HTMLアプリ',
    description:'出退勤の記録・集計を効率化',
    url:'./apps/dakokun/index.html',
    icon:'time', thumbnailType:'attendance', thumbnailImage:'./assets/thumbnails/dakokun-card.svg',
    tags:['人気','タイムカード','勤怠'], updatedAt:'2026-06-22', status:'公開中', featured:true, external:false
  },
  {
    id:'pdf-tool', title:'PDF編集ツール', category:'社内運営', type:'HTMLアプリ',
    description:'PDFの結合・編集・変換を簡単に',
    url:'./apps/pdf-tool/index.html',
    icon:'file', thumbnailType:'pdf', thumbnailImage:'./assets/thumbnails/pdf-tool-card.svg',
    tags:['人気','PDF','HTMLアプリ'], updatedAt:'2026-06-17', status:'公開中', featured:true, external:false
  },
  {
    id:'seatflow', title:'座席管理アプリ', category:'塾事業', type:'HTMLアプリ',
    description:'教室の座席配置と出欠を一元管理',
    url:'./apps/seatflow/index.html',
    icon:'seats', thumbnailType:'seats', thumbnailImage:'./assets/thumbnails/seatflow-card.svg',
    tags:['おすすめ','座席','教室運営'], updatedAt:'2026-06-17', status:'公開中', featured:true, external:false
  },
  {
    id:'quiz-maker', title:'小テスト作成', category:'塾事業', type:'HTMLアプリ',
    description:'小テストを作成・出力',
    url:'./apps/quiz-maker/index.html',
    icon:'quiz', thumbnailType:'quiz', thumbnailImage:'./assets/thumbnails/quiz-maker-card.svg',
    tags:['NEW','小テスト','教材'], updatedAt:'2026-06-22', status:'公開中', featured:true, external:false
  },
  {
    id:'exam-print', title:'入試問題印刷', category:'塾事業', type:'HTMLアプリ',
    description:'入試問題PDFを整理して印刷',
    url:'./apps/exam-print/index.html',
    icon:'exam', thumbnailType:'exam', thumbnailImage:'./assets/thumbnails/exam-print-card.svg',
    tags:['おすすめ','入試','PDF'], updatedAt:'2026-06-22', status:'公開中', featured:true, external:false
  },
  {
    id:'consulting-kit', title:'コンサル支援資料', category:'コンサル事業', type:'資料・テンプレート',
    description:'業務に役立つ資料を整理',
    url:'./apps/consulting-kit/index.html',
    icon:'dashboard', thumbnailType:'dashboard', thumbnailImage:'./assets/thumbnails/consulting-kit-card.svg',
    tags:['おすすめ','資料','テンプレート'], updatedAt:'2026-06-17', status:'公開中', featured:false, external:false
  }
];

const storage = {
  history: 'llldWorksHub.history',
  favorites: 'llldWorksHub.favorites'
};

const categoryFilters = [
  {id:'すべて', label:'すべて', icon:'ALL', test:() => true},
  {id:'よく使う', label:'よく使う', icon:'★', test:(item, ctx) => item.featured || ctx.favoriteIds.includes(item.id) || ctx.historyIds.includes(item.id) || hasTag(item, ['人気','おすすめ'])},
  {id:'塾事業', label:'塾事業', icon:'塾', test:item => item.category === '塾事業' || hasTag(item, ['塾事業','教材','教室運営'])},
  {id:'コンサル事業', label:'コンサル事業', icon:'Co', test:item => item.category === 'コンサル事業' || hasTag(item, ['コンサル','補助金'])},
  {id:'社内運営', label:'社内運営', icon:'社', test:item => item.category === '社内運営' || hasTag(item, ['社内運営','勤怠'])},
  {id:'HTMLアプリ', label:'HTMLアプリ', icon:'<>', test:item => item.type === 'HTMLアプリ' || hasTag(item, ['HTMLアプリ'])},
  {id:'テンプレート', label:'テンプレート', icon:'書', test:item => item.type.includes('テンプレート') || hasTag(item, ['テンプレート'])}
];

const sortLabels = {
  recent:'最終利用順',
  updated:'更新日順',
  title:'名前順',
  category:'カテゴリ順'
};

const state = {
  contents: [],
  query: '',
  category: 'すべて',
  type: 'すべて',
  sort: 'recent',
  detailId: ''
};

const $ = id => document.getElementById(id);

init();

async function init(){
  state.contents = (await loadContents()).map(normalizeContent);
  bindEvents();
  renderAll();
}

async function loadContents(){
  try{
    const res = await fetch('./data/contents.json', {cache:'no-store'});
    if(!res.ok) throw new Error('contents.json not found');
    const data = await res.json();
    return Array.isArray(data) && data.length ? data : fallbackContents;
  }catch(error){
    return fallbackContents;
  }
}

function normalizeContent(item){
  const title = item.title || '無題';
  return {
    id:item.id,
    title,
    description:item.description || '',
    category:normalizeCategory(item.category, item),
    type:item.type || '資料',
    url:item.url || '#',
    icon:item.icon || inferIcon(item),
    thumbnailType:item.thumbnailType || inferThumbnailType(item),
    thumbnailImage:item.thumbnailImage || item.thumbnail || '',
    thumbnail:item.thumbnail || '',
    tags:Array.isArray(item.tags) ? item.tags : [],
    isFavorite:false,
    lastUsedAt:'',
    updatedAt:item.updatedAt || '',
    status:item.status || '公開中',
    featured:Boolean(item.featured),
    external:Boolean(item.external)
  };
}

function normalizeCategory(category, item){
  const raw = category || '';
  if(['教材作成','教室運用'].includes(raw)) return '塾事業';
  if(['コンサル','補助金'].includes(raw)) return 'コンサル事業';
  if(['PDF','管理'].includes(raw)) return '社内運営';
  if(raw) return raw;
  if((item.tags || []).some(tag => ['小テスト','入試','座席'].includes(tag))) return '塾事業';
  return '社内運営';
}

function inferThumbnailType(item){
  const text = normalize([item.id, item.title, item.description, ...(item.tags || [])].join(' '));
  if(text.includes('pdf')) return 'pdf';
  if(text.includes('座席')) return 'seats';
  if(text.includes('小テスト')) return 'quiz';
  if(text.includes('勤怠') || text.includes('タイムカード') || text.includes('打刻')) return 'attendance';
  if(text.includes('入試')) return 'exam';
  if(text.includes('補助金')) return 'document';
  if(text.includes('相談') || text.includes('提案')) return 'proposal';
  if(text.includes('コンサル')) return 'dashboard';
  return 'generic';
}

function inferIcon(item){
  const type = item.thumbnailType || inferThumbnailType(item);
  const map = {pdf:'PDF', seats:'席', quiz:'問', attendance:'勤', document:'書', proposal:'提', dashboard:'図', form:'申', exam:'入'};
  return map[type] || 'APP';
}

function renderAll(){
  renderMetrics();
  renderCategoryNav();
  renderTypeChips();
  renderFavorites();
  renderRecent();
  renderContents();
}

function renderMetrics(){
  const favorites = getFavorites();
  const history = getValidHistory();
  $('metricTotal').textContent = state.contents.length;
  $('metricFavorites').textContent = favorites.filter(id => state.contents.some(item => item.id === id)).length;
  $('metricApps').textContent = state.contents.filter(item => item.type === 'HTMLアプリ').length;
  $('metricRecent').textContent = history.length;
}

function renderCategoryNav(){
  const ctx = filterContext();
  $('categoryNav').innerHTML = categoryFilters.map(filter => {
    const count = state.contents.filter(item => filter.test(item, ctx)).length;
    return `<button class="nav-button ${state.category === filter.id ? 'active' : ''}" type="button" data-category="${escapeAttr(filter.id)}">
      <span class="nav-left"><span class="nav-icon">${escapeHtml(filter.icon)}</span><span>${escapeHtml(filter.label)}</span></span>
      <span class="nav-count">${count}</span>
    </button>`;
  }).join('');
}

function renderTypeChips(){
  const types = ['すべて', ...unique(state.contents.map(item => item.type))];
  $('typeChips').innerHTML = types.map(type => `<button class="chip ${state.type === type ? 'active' : ''}" type="button" data-type="${escapeAttr(type)}">${escapeHtml(type)}</button>`).join('');
}

function renderFavorites(){
  const items = getFavorites().map(id => state.contents.find(item => item.id === id)).filter(Boolean);
  $('sideFavoriteList').innerHTML = items.length
    ? items.map(item => `<a class="side-favorite-link" href="${escapeAttr(item.url)}" data-open-id="${escapeAttr(item.id)}" target="_blank" rel="noopener" aria-label="${escapeAttr(item.title)}を新しいタブで開く">
      <span class="side-favorite-icon">★</span><span>${escapeHtml(item.title)}</span>
    </a>`).join('')
    : '<div class="side-empty">未登録</div>';
}

function renderRecent(){
  const history = getValidHistory().slice(0,8);
  $('recentGrid').innerHTML = history.length
    ? history.map(record => {
      const item = state.contents.find(content => content.id === record.id);
      return recentCard(item, record.usedAt);
    }).join('')
    : '<div class="empty">まだ利用履歴がありません。コンテンツを開くとここに表示されます。</div>';
}

function renderContents(){
  updateSortTabs();
  const items = filteredContents();
  $('resultMeta').textContent = `${items.length}件表示中 / 全${state.contents.length}件`;
  $('contentGrid').innerHTML = items.length
    ? items.map(contentCard).join('')
    : '<div class="empty">条件に合うコンテンツがありません。</div>';
}

function filteredContents(){
  const ctx = filterContext();
  const categoryFilter = categoryFilters.find(filter => filter.id === state.category) || categoryFilters[0];
  const q = normalize(state.query);
  const historyOrder = new Map(getValidHistory().map((item, index) => [item.id, index]));
  const items = state.contents.filter(item => {
    const searchText = normalize([item.title, item.category, item.type, item.description, item.status, ...(item.tags || [])].join(' '));
    const matchQuery = !q || searchText.includes(q);
    const matchCategory = categoryFilter.test(item, ctx);
    const matchType = state.type === 'すべて' || item.type === state.type;
    return matchQuery && matchCategory && matchType;
  });

  items.sort((a,b) => {
    if(state.sort === 'recent'){
      const ai = historyOrder.has(a.id) ? historyOrder.get(a.id) : 9999;
      const bi = historyOrder.has(b.id) ? historyOrder.get(b.id) : 9999;
      if(ai !== bi) return ai - bi;
      if(Boolean(a.featured) !== Boolean(b.featured)) return a.featured ? -1 : 1;
      return String(b.updatedAt).localeCompare(String(a.updatedAt));
    }
    if(state.sort === 'updated') return String(b.updatedAt).localeCompare(String(a.updatedAt));
    if(state.sort === 'title') return a.title.localeCompare(b.title, 'ja');
    if(state.sort === 'category') return a.category.localeCompare(b.category, 'ja') || a.title.localeCompare(b.title, 'ja');
    return 0;
  });
  return items;
}

function contentCard(item){
  const active = getFavorites().includes(item.id);
  const ribbon = statusRibbon(item);
  return `<article class="content-card" data-card-id="${escapeAttr(item.id)}" tabindex="0" aria-label="${escapeAttr(item.title)}を開く">
    ${ribbon ? `<span class="status-ribbon ${escapeAttr(ribbon.className)}">${escapeHtml(ribbon.label)}</span>` : ''}
    ${thumbnail(item)}
    <div class="card-body">
      <div class="card-top">
        <span class="tool-icon">${escapeHtml(iconLabel(item))}</span>
        <div class="card-title">
          <h4>${escapeHtml(item.title)}</h4>
          <span class="category-badge">${escapeHtml(item.category)}</span>
        </div>
        <button class="favorite ${active ? 'active' : ''}" type="button" data-favorite="${escapeAttr(item.id)}" aria-label="お気に入り切替">${active ? '★' : '☆'}</button>
      </div>
      <p class="desc">${escapeHtml(item.description)}</p>
      <div class="tag-row">${item.tags.slice(0,4).map(tagHtml).join('')}</div>
      <div class="card-meta"><span>${escapeHtml(item.status)}</span><span>更新 ${escapeHtml(item.updatedAt || '-')}</span></div>
      <div class="card-actions">
        <a class="btn primary" href="${escapeAttr(item.url)}" data-open-id="${escapeAttr(item.id)}" target="_blank" rel="noopener">開く</a>
        <button class="btn secondary" type="button" data-detail="${escapeAttr(item.id)}">詳細</button>
        <button class="btn more-button" type="button" data-copy="${escapeAttr(item.url)}" aria-label="URLをコピー">⋮</button>
      </div>
    </div>
  </article>`;
}

function recentCard(item, usedAt){
  return `<article class="recent-card">
    <button class="quick-remove" type="button" data-remove-history="${escapeAttr(item.id)}" aria-label="${escapeAttr(item.title)}を履歴から削除">×</button>
    <a class="recent-thumb-link" href="${escapeAttr(item.url)}" data-open-id="${escapeAttr(item.id)}" target="_blank" rel="noopener" aria-label="${escapeAttr(item.title)}を新しいタブで開く">
      <div class="recent-thumb">${thumbnailMini(item)}</div>
    </a>
    <a href="${escapeAttr(item.url)}" data-open-id="${escapeAttr(item.id)}" target="_blank" rel="noopener">
      <h4>${escapeHtml(item.title)}</h4>
      <p>${escapeHtml(relativeTime(usedAt))}</p>
    </a>
  </article>`;
}

function thumbnail(item){
  if(item.thumbnailImage){
    return `<div class="thumb"><img src="${escapeAttr(item.thumbnailImage)}" alt="${escapeAttr(item.title)}" loading="lazy" onerror="this.closest('.thumb').innerHTML = window.renderPseudoThumb('${escapeAttr(item.thumbnailType)}')"></div>`;
  }
  return `<div class="thumb">${pseudoThumb(item.thumbnailType)}</div>`;
}

function thumbnailMini(item){
  if(item.thumbnailImage){
    return `<img src="${escapeAttr(item.thumbnailImage)}" alt="" loading="lazy" onerror="this.parentElement.innerHTML = window.renderPseudoThumb('${escapeAttr(item.thumbnailType)}')">`;
  }
  return pseudoThumb(item.thumbnailType);
}

window.renderPseudoThumb = type => pseudoThumb(type);

function pseudoThumb(type){
  const safe = knownThumbType(type);
  const body = {
    pdf:`<div class="pdf-layout"><div class="pdf-pages"><i></i><i></i><i></i></div><div class="pdf-preview"><div class="doc-lines"><i></i><i></i><i></i></div></div></div>`,
    seats:`<div class="seat-map">${'<i></i>'.repeat(40)}</div>`,
    quiz:`<div class="quiz-screen">${[1,2,3].map(n => `<div class="quiz-row"><b></b><i></i><span></span></div>`).join('')}<div class="quiz-button"></div></div>`,
    attendance:`<div class="attendance-table">${[1,2,3,4].map(() => `<div class="attendance-row"><i></i><b></b><b></b><span></span></div>`).join('')}</div>`,
    document:`<div class="doc-lines"><i></i><i></i><i></i><i></i><i></i><i></i></div>`,
    proposal:`<div class="proposal-screen"><div class="proposal-main"><i></i><i></i><i></i><i></i></div><div class="proposal-side"></div></div>`,
    dashboard:`<div class="dashboard-grid"><div class="dash-card"><i></i><div class="dash-bars"><b style="height:16px"></b><b></b><b></b></div></div><div class="dash-card"><i></i><div class="dash-bars"><b style="height:20px"></b><b style="height:12px"></b><b style="height:22px"></b></div></div><div class="dash-card"><i></i><i></i></div><div class="dash-card"><i></i><i></i></div></div>`,
    form:`<div class="form-screen"><i></i><i></i><i></i><b></b></div>`,
    exam:`<div class="pdf-layout"><div class="pdf-pages"><i></i><i></i><i></i></div><div class="quiz-screen"><div class="quiz-row"><b></b><i></i><span></span></div><div class="quiz-row"><b></b><i></i><span></span></div><div class="doc-lines"><i></i><i></i></div></div></div>`,
    generic:`<div class="generic-screen"><i></i><i></i><i></i><i></i></div>`
  }[safe];
  return `<div class="thumb-mini"><div class="thumb-window"><div class="thumb-bar"><span></span><span></span><span></span></div><div class="thumb-body">${body}</div></div></div>`;
}

function knownThumbType(type){
  const supported = ['pdf','seats','quiz','attendance','document','proposal','dashboard','form','lp','flyer','exam','crm','training','checklist','calendar','invoice','report','ai','marketplace','generic'];
  if(!supported.includes(type)) return 'generic';
  if(['lp','flyer','training','report'].includes(type)) return 'proposal';
  if(['crm','calendar','invoice','checklist'].includes(type)) return 'form';
  if(['ai','marketplace'].includes(type)) return 'dashboard';
  return type;
}

function tagHtml(tag){
  const cls = tag === '人気' ? 'hot' : tag === 'おすすめ' ? 'recommend' : tag === 'NEW' ? 'new' : '';
  return `<span class="tag ${cls}">${escapeHtml(tag)}</span>`;
}

function statusRibbon(item){
  if(hasTag(item, ['人気'])) return {label:'人気', className:'popular'};
  if(hasTag(item, ['おすすめ'])) return {label:'おすすめ', className:'recommend'};
  if(hasTag(item, ['NEW'])) return {label:'NEW', className:'new'};
  if(hasTag(item, ['ベータ版'])) return {label:'ベータ版', className:'beta'};
  return null;
}

function openDetail(id){
  const item = state.contents.find(content => content.id === id);
  if(!item) return;
  state.detailId = id;
  $('detailContent').innerHTML = `<div class="detail-hero">
    ${thumbnail(item)}
    <div class="detail-info">
      <h3 id="detailTitle">${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.description)}</p>
      <div class="tag-row">${item.tags.map(tagHtml).join('')}</div>
      <div class="detail-grid">
        <div class="detail-item"><span>カテゴリ</span><b>${escapeHtml(item.category)}</b></div>
        <div class="detail-item"><span>種別</span><b>${escapeHtml(item.type)}</b></div>
        <div class="detail-item"><span>状態</span><b>${escapeHtml(item.status)}</b></div>
        <div class="detail-item"><span>更新日</span><b>${escapeHtml(item.updatedAt || '-')}</b></div>
      </div>
      <div class="detail-actions">
        <a class="btn primary" href="${escapeAttr(item.url)}" data-open-id="${escapeAttr(item.id)}" target="_blank" rel="noopener">開く</a>
        <button class="btn secondary" type="button" data-favorite="${escapeAttr(item.id)}">お気に入り</button>
        <button class="btn secondary" type="button" data-copy="${escapeAttr(item.url)}">URLコピー</button>
      </div>
    </div>
  </div>`;
  $('detailModal').classList.add('show');
  $('detailModal').setAttribute('aria-hidden', 'false');
}

function closeDetail(){
  $('detailModal').classList.remove('show');
  $('detailModal').setAttribute('aria-hidden', 'true');
}

function bindEvents(){
  document.addEventListener('click', event => {
    const removeHistory = event.target.closest('[data-remove-history]');
    if(removeHistory){
      event.preventDefault();
      event.stopPropagation();
      removeHistoryItem(removeHistory.dataset.removeHistory);
      return;
    }

    const nav = event.target.closest('[data-category]');
    if(nav){
      state.category = nav.dataset.category;
      renderAll();
      closeSidebarOnMobile();
      return;
    }

    const chip = event.target.closest('[data-type]');
    if(chip){
      state.type = chip.dataset.type;
      renderAll();
      return;
    }

    const sort = event.target.closest('[data-sort]');
    if(sort){
      state.sort = sort.dataset.sort;
      renderContents();
      return;
    }

    const detail = event.target.closest('[data-detail]');
    if(detail){
      event.preventDefault();
      event.stopPropagation();
      openDetail(detail.dataset.detail);
      return;
    }

    const fav = event.target.closest('[data-favorite]');
    if(fav){
      event.preventDefault();
      event.stopPropagation();
      toggleFavorite(fav.dataset.favorite);
      return;
    }

    const opener = event.target.closest('[data-open-id]');
    if(opener){
      event.preventDefault();
      saveHistory(opener.dataset.openId);
      openContentInNewTab(opener.getAttribute('href'));
      return;
    }

    const copy = event.target.closest('[data-copy]');
    if(copy){
      event.preventDefault();
      event.stopPropagation();
      copyUrl(copy.dataset.copy);
      return;
    }

    const card = event.target.closest('[data-card-id]');
    if(card){
      const item = state.contents.find(content => content.id === card.dataset.cardId);
      if(item){
        saveHistory(item.id);
        openContentInNewTab(item.url);
      }
    }
  });

  document.addEventListener('keydown', event => {
    if(event.key === 'Escape'){
      closeSidebarOnMobile();
      closeDetail();
    }
    if(event.key === '/' && !['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)){
      event.preventDefault();
      $('searchInput').focus();
    }
    if(event.key === 'Enter' && document.activeElement?.matches?.('[data-card-id]')){
      const item = state.contents.find(content => content.id === document.activeElement.dataset.cardId);
      if(item){
        saveHistory(item.id);
        openContentInNewTab(item.url);
      }
    }
  });

  $('searchInput').addEventListener('input', event => {
    state.query = event.target.value.trim();
    $('clearSearch').classList.toggle('show', Boolean(state.query));
    renderContents();
  });

  $('clearSearch').addEventListener('click', () => {
    state.query = '';
    $('searchInput').value = '';
    $('clearSearch').classList.remove('show');
    renderContents();
  });

  $('resetFilters').addEventListener('click', () => {
    state.query = '';
    state.category = 'すべて';
    state.type = 'すべて';
    state.sort = 'recent';
    $('searchInput').value = '';
    $('clearSearch').classList.remove('show');
    renderAll();
  });

  $('showAllRecent').addEventListener('click', () => {
    state.category = 'すべて';
    state.type = 'すべて';
    state.sort = 'recent';
    renderAll();
  });

  $('openSidebar').addEventListener('click', () => $('sidebar').classList.add('open'));
  $('closeDetail').addEventListener('click', closeDetail);
  $('detailModal').addEventListener('click', event => {
    if(event.target === $('detailModal')) closeDetail();
  });
}

function toggleFavorite(id){
  const current = getFavorites();
  const active = current.includes(id);
  const next = active ? current.filter(item => item !== id) : [id, ...current];
  localStorage.setItem(storage.favorites, JSON.stringify(next));
  renderAll();
  if(state.detailId) openDetail(state.detailId);
  toast(active ? 'お気に入りを解除しました' : 'お気に入りに追加しました');
}

function saveHistory(id){
  if(!state.contents.some(item => item.id === id)) return;
  const next = getHistory().filter(item => item.id !== id);
  next.unshift({id, usedAt:new Date().toISOString()});
  localStorage.setItem(storage.history, JSON.stringify(next.slice(0,8)));
  renderAll();
}

function removeHistoryItem(id){
  localStorage.setItem(storage.history, JSON.stringify(getHistory().filter(item => item.id !== id)));
  renderAll();
  toast('履歴から削除しました');
}

function getHistory(){
  try{return JSON.parse(localStorage.getItem(storage.history) || '[]');}
  catch{return [];}
}

function getValidHistory(){
  return getHistory().filter(record => state.contents.some(content => content.id === record.id));
}

function getFavorites(){
  try{return JSON.parse(localStorage.getItem(storage.favorites) || '[]');}
  catch{return [];}
}

function filterContext(){
  return {
    favoriteIds:getFavorites(),
    historyIds:getValidHistory().map(item => item.id)
  };
}

function openContentInNewTab(url){
  if(!url) return;
  const absoluteUrl = new URL(url, location.href).href;
  const opened = window.open(absoluteUrl, '_blank', 'noopener');
  if(opened) opened.opener = null;
  else location.href = absoluteUrl;
}

function copyUrl(url){
  const absolute = new URL(url, location.href).href;
  if(navigator.clipboard && window.isSecureContext){
    navigator.clipboard.writeText(absolute).then(() => toast('URLをコピーしました')).catch(() => fallbackCopy(absolute));
  }else{
    fallbackCopy(absolute);
  }
}

function fallbackCopy(text){
  const textarea = document.createElement('textarea');
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  textarea.remove();
  toast('URLをコピーしました');
}

function updateSortTabs(){
  document.querySelectorAll('[data-sort]').forEach(button => {
    button.classList.toggle('active', button.dataset.sort === state.sort);
    button.setAttribute('aria-pressed', String(button.dataset.sort === state.sort));
  });
}

function closeSidebarOnMobile(){
  if(window.innerWidth <= 960) $('sidebar').classList.remove('open');
}

function toast(message){
  const el = $('toast');
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(window.__worksHubToast);
  window.__worksHubToast = setTimeout(() => el.classList.remove('show'), 1700);
}

function iconLabel(item){
  if(item.icon && item.icon.length <= 3) return item.icon;
  return inferIcon(item);
}

function hasTag(item, tags){
  return (item.tags || []).some(tag => tags.includes(tag));
}

function relativeTime(iso){
  if(!iso) return '利用日時不明';
  const diff = Date.now() - new Date(iso).getTime();
  if(Number.isNaN(diff)) return '利用日時不明';
  const minutes = Math.max(0, Math.floor(diff / 60000));
  if(minutes < 1) return 'たった今';
  if(minutes < 60) return `${minutes}分前`;
  const hours = Math.floor(minutes / 60);
  if(hours < 24) return `${hours}時間前`;
  const days = Math.floor(hours / 24);
  if(days < 7) return `${days}日前`;
  return new Date(iso).toLocaleDateString('ja-JP');
}

function unique(values){
  return Array.from(new Set(values.filter(Boolean)));
}

function normalize(value){
  return String(value || '').toLowerCase().normalize('NFKC');
}

function escapeHtml(value){
  return String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}

function escapeAttr(value){
  return escapeHtml(value).replace(/`/g, '&#96;');
}
