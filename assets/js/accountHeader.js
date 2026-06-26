'use strict';

(() => {
  const BADGE_SELECTOR = '[data-account-badge]';

  init();

  async function init() {
    const badges = [...document.querySelectorAll(BADGE_SELECTOR)];
    if (!badges.length) return;

    setBadges(badges, '確認中');

    try {
      if (!window.AuthService?.getCurrentAccount) {
        setBadges(badges, '未ログイン');
        return;
      }

      const result = await window.AuthService.getCurrentAccount();
      if (result?.account) {
        const account = result.account;
        const label = account.companyName && account.email
          ? `${account.companyName} / ${account.email}`
          : account.email || account.companyName || 'ログイン中';
        setBadges(badges, label);
        return;
      }

      setBadges(badges, '未ログイン');
    } catch {
      setBadges(badges, '未ログイン');
    }
  }

  function setBadges(badges, text) {
    badges.forEach(badge => {
      badge.textContent = text;
      badge.title = text;
    });
  }
})();
