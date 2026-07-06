'use strict';

(() => {
  const BADGE_SELECTOR = '[data-account-badge]';
  const LOGOUT_SELECTOR = '[data-account-logout]';
  const NOTICE_SELECTOR = '[data-market-notice-link]';

  init();

  async function init() {
    const badges = [...document.querySelectorAll(BADGE_SELECTOR)];
    bindNoticePopup();
    bindLogoutButtons(badges);
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

  function bindLogoutButtons(badges) {
    const buttons = [...document.querySelectorAll(LOGOUT_SELECTOR)];
    buttons.forEach(button => {
      button.addEventListener('click', async () => {
        const originalText = button.textContent;
        button.disabled = true;
        button.textContent = '処理中';

        try {
          if (!window.AuthService?.logout) {
            window.alert('ログアウト機能を読み込めませんでした。');
            return;
          }

          const result = await window.AuthService.logout();
          if (!result?.ok) {
            window.alert(result?.message || 'ログアウトできませんでした。');
            return;
          }

          setBadges(badges, '未ログイン');
          window.alert(result.message || 'ログアウトしました。');
        } catch {
          window.alert('ログアウト処理中にエラーが発生しました。');
        } finally {
          button.disabled = false;
          button.textContent = originalText;
        }
      });
    });
  }

  function bindNoticePopup() {
    const noticeButtons = [...document.querySelectorAll(NOTICE_SELECTOR)];
    noticeButtons.forEach(button => {
      if (button.dataset.noticeBound === 'true') return;
      button.dataset.noticeBound = 'true';
      button.addEventListener('click', event => {
        event.preventDefault();
        window.alert('運営からのお知らせ機能は準備中です。公開までしばらくお待ちください。');
      });
    });
  }
})();
