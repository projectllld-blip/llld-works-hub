'use strict';

(() => {
  /*
   * LLLD Works Hub localStorage policy
   *
   * OK to store locally:
   * - Recently viewed contents
   * - Last 8 usage history records
   * - Display preferences
   * - Temporary drafts
   *
   * Do not store locally:
   * - Account information
   * - Author information
   * - Purchase history
   * - Review status
   * - Published/private status
   * - Permission information
   * - Sales information
   *
   * Future account, purchase, review, permission, and sales data must live in
   * a real backend such as Supabase, not in browser localStorage.
   */

  const allowedKeys = [
    'llldWorksHub.history',
    'llldWorksHub.favorites',
    'llldWorksHub.display',
    'llldWorksHub.draft'
  ];

  const disallowedDomains = [
    'account',
    'author',
    'purchase',
    'review',
    'visibility',
    'permission',
    'sales'
  ];

  function isAllowedKey(key) {
    return allowedKeys.includes(key) || key.startsWith('llldWorksHub.draft.');
  }

  function assertAllowedKey(key) {
    if (!isAllowedKey(key)) {
      throw new Error(`localStorage key is not allowed by policy: ${key}`);
    }
  }

  function setItem(key, value) {
    assertAllowedKey(key);
    localStorage.setItem(key, JSON.stringify(value));
  }

  function getItem(key, fallback = null) {
    assertAllowedKey(key);
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  }

  function removeItem(key) {
    assertAllowedKey(key);
    localStorage.removeItem(key);
  }

  window.StoragePolicy = {
    allowedKeys: [...allowedKeys],
    disallowedDomains: [...disallowedDomains],
    isAllowedKey,
    assertAllowedKey,
    setItem,
    getItem,
    removeItem
  };
})();
