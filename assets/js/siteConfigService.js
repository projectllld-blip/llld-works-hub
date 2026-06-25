'use strict';

(() => {
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

  async function getSiteConfig() {
    if (cache) return cache;

    try {
      const response = await fetch('./data/site-config.json', { cache: 'no-store' });
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

  async function getContactConfig() {
    const config = await getSiteConfig();
    return config.contact;
  }

  function mergeConfig(config = {}) {
    return {
      auth: {
        ...DEFAULT_CONFIG.auth,
        ...(config.auth || {})
      },
      contact: {
        ...DEFAULT_CONFIG.contact,
        ...(config.contact || {})
      }
    };
  }

  window.SiteConfigService = {
    getSiteConfig,
    getAuthConfig,
    getContactConfig
  };
})();
