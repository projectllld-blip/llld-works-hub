'use strict';

(() => {
  const VALID_AUTH_MODES = ['mock', 'supabase'];

  const DEFAULT_CONFIG = {
    auth: {
      mode: 'mock',
      supabaseUrl: '',
      supabaseAnonKey: ''
    },
    contact: {
      mode: 'demo',
      email: '',
      endpointUrl: '',
      ownerName: 'LLLD Works Hub'
    }
  };

  let cache = null;
  const scriptUrl = document.currentScript?.src || '';

  async function loadSiteConfig() {
    cache = null;
    return getSiteConfig();
  }

  async function getSiteConfig() {
    if (cache) return cache;

    try {
      const response = await fetch(resolveConfigUrl(), { cache: 'no-store' });
      if (!response.ok) throw new Error(`Failed to load site-config.json: ${response.status}`);
      const config = await response.json();
      cache = mergeConfig(config);
    } catch {
      cache = mergeConfig({});
    }

    return cache;
  }

  async function getAuthConfig() {
    const config = await getSiteConfig();
    return config.auth;
  }

  async function getRequestedAuthMode() {
    const auth = await getAuthConfig();
    return auth.mode;
  }

  async function getSafeAuthMode() {
    const auth = await getAuthConfig();
    if (auth.mode !== 'supabase') return 'mock';
    return auth.supabaseUrl && auth.supabaseAnonKey ? 'supabase' : 'mock';
  }

  async function getContactConfig() {
    const config = await getSiteConfig();
    return config.contact;
  }

  function mergeConfig(config = {}) {
    return {
      auth: normalizeAuthConfig(config.auth),
      contact: {
        ...DEFAULT_CONFIG.contact,
        ...(config.contact || {})
      }
    };
  }

  function normalizeAuthConfig(auth = {}) {
    const rawAuth = auth || {};
    const mode = VALID_AUTH_MODES.includes(rawAuth.mode) ? rawAuth.mode : DEFAULT_CONFIG.auth.mode;
    return {
      ...DEFAULT_CONFIG.auth,
      ...rawAuth,
      mode,
      supabaseUrl: String(rawAuth.supabaseUrl || '').trim(),
      supabaseAnonKey: String(rawAuth.supabaseAnonKey || '').trim()
    };
  }

  function resolveConfigUrl() {
    if (scriptUrl) {
      try {
        return new URL('../../data/site-config.json', scriptUrl).href;
      } catch {
        return './data/site-config.json';
      }
    }
    return './data/site-config.json';
  }

  window.SiteConfigService = {
    loadSiteConfig,
    getSiteConfig,
    getAuthConfig,
    getRequestedAuthMode,
    getSafeAuthMode,
    getContactConfig
  };
})();
