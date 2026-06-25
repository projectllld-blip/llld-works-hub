'use strict';

(() => {
  const DATA_PATHS = {
    contents: './data/contents.json',
    authors: './data/authors.json',
    categories: './data/categories.json',
    siteConfig: './data/site-config.json'
  };

  const cache = new Map();

  async function fetchJson(key) {
    if (cache.has(key)) return cache.get(key);
    const path = DATA_PATHS[key];
    const response = await fetch(path, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Failed to load ${path}`);
    const data = await response.json();
    cache.set(key, key === 'siteConfig' ? data : (Array.isArray(data) ? data : []));
    return cache.get(key);
  }

  function normalizeText(value) {
    return String(value || '').toLowerCase().normalize('NFKC');
  }

  function matchesQuery(content, query) {
    const q = normalizeText(query);
    if (!q) return true;
    const haystack = normalizeText([
      content.title,
      content.summary,
      content.description,
      content.categoryId,
      content.authorId,
      content.priceType,
      content.price,
      content.currency,
      content.saleStatus,
      content.status,
      content.visibility,
      content.deliveryType,
      ...(content.targetUsers || []),
      ...(content.tags || []),
      ...(content.deliverables || []),
      ...(content.notes || [])
    ].join(' '));
    return haystack.includes(q);
  }

  function matchesFilters(content, filters = {}) {
    if (filters.categoryId && content.categoryId !== filters.categoryId) return false;
    if (filters.authorId && content.authorId !== filters.authorId) return false;
    if (filters.priceType && content.priceType !== filters.priceType) return false;
    if (filters.saleStatus && content.saleStatus !== filters.saleStatus) return false;
    if (filters.deliveryType && content.deliveryType !== filters.deliveryType) return false;
    if (filters.status && content.status !== filters.status) return false;
    if (filters.visibility && content.visibility !== filters.visibility) return false;
    if (typeof filters.featured === 'boolean' && Boolean(content.featured) !== filters.featured) return false;
    if (filters.query && !matchesQuery(content, filters.query)) return false;
    if (filters.tag && !(content.tags || []).includes(filters.tag)) return false;
    return true;
  }

  async function getContents() {
    // 将来的には、このfetch層をSupabaseやAPI呼び出しに差し替える想定。
    // 画面側はこのService関数群だけを見ることで、DB化時の変更範囲を絞る。
    return fetchJson('contents');
  }

  async function getContentBySlug(slug) {
    const contents = await getContents();
    return contents.find(content => content.slug === slug) || null;
  }

  async function getContentById(id) {
    const contents = await getContents();
    return contents.find(content => content.id === id) || null;
  }

  async function getFeaturedContents() {
    const contents = await getContents();
    return contents.filter(content => content.featured);
  }

  async function getRecentContents(limit = 8) {
    const contents = await getContents();
    return [...contents]
      .sort((a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')))
      .slice(0, limit);
  }

  async function getContentsByCategory(categoryId) {
    const contents = await getContents();
    return contents.filter(content => content.categoryId === categoryId);
  }

  async function getAuthors() {
    return fetchJson('authors');
  }

  async function getAuthorById(authorId) {
    const authors = await getAuthors();
    return authors.find(author => author.id === authorId) || null;
  }

  async function getCategories() {
    return fetchJson('categories');
  }

  async function getSiteConfig() {
    // 問い合わせ先も仮DBとしてJSON管理する。将来は管理画面やAPI側の設定に差し替える想定。
    try {
      return await fetchJson('siteConfig');
    } catch {
      return {
        auth: { mode: 'mock', supabaseUrl: '', supabaseAnonKey: '' },
        contact: { mode: 'demo', email: '', endpointUrl: '', ownerName: 'LLLD Works Hub' }
      };
    }
  }

  async function getCategoryById(categoryId) {
    const categories = await getCategories();
    return categories.find(category => category.id === categoryId) || null;
  }

  async function searchContents(query) {
    const contents = await getContents();
    return contents.filter(content => matchesQuery(content, query));
  }

  async function filterContents(filters = {}) {
    const contents = await getContents();
    return contents.filter(content => matchesFilters(content, filters));
  }

  window.ContentService = {
    getContents,
    getContentBySlug,
    getContentById,
    getFeaturedContents,
    getRecentContents,
    getContentsByCategory,
    getAuthors,
    getAuthorById,
    getCategories,
    getSiteConfig,
    getCategoryById,
    searchContents,
    filterContents
  };
})();
