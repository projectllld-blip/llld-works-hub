'use strict';

(() => {
  const DEFAULT_ACCOUNT = {
    status: 'mock',
    companyName: 'LLLDデモ教室',
    contactName: 'デモ担当者',
    email: 'demo@example.com',
    businessType: 'demo',
    apps: ['勤怠管理', '座席管理', 'PDF編集'],
    recentApps: ['PDF編集ツール', '座席管理アプリ', '小テスト作成'],
    syncStatus: 'mock mode: クラウド同期はまだ行っていません'
  };

  let mockAccount = { ...DEFAULT_ACCOUNT };

  async function getAuthConfig() {
    if (window.SiteConfigService?.getAuthConfig) {
      return window.SiteConfigService.getAuthConfig();
    }
    return { mode: 'mock', supabaseUrl: '', supabaseAnonKey: '' };
  }

  async function getAuthMode() {
    const config = await getAuthConfig();
    if (config.mode === 'supabase' && config.supabaseUrl && config.supabaseAnonKey) {
      return 'supabase';
    }
    return 'mock';
  }

  async function isSupabaseReady() {
    return (await getAuthMode()) === 'supabase';
  }

  async function mockLogin({ email }) {
    const mode = await getAuthMode();
    if (mode !== 'mock') {
      return {
        ok: false,
        mode,
        message: 'Supabase modeの実認証はまだ未実装です。'
      };
    }

    mockAccount = {
      ...mockAccount,
      email: email || mockAccount.email,
      status: 'mock'
    };

    return {
      ok: true,
      mode,
      account: { ...mockAccount },
      message: 'mock modeのため、本番ログインは行っていません。'
    };
  }

  async function mockSignup(input = {}) {
    const mode = await getAuthMode();
    if (mode !== 'mock') {
      return {
        ok: false,
        mode,
        message: 'Supabase modeの本登録はまだ未実装です。'
      };
    }

    mockAccount = {
      ...mockAccount,
      companyName: input.companyName || mockAccount.companyName,
      contactName: input.contactName || mockAccount.contactName,
      email: input.email || mockAccount.email,
      businessType: input.businessType || mockAccount.businessType,
      apps: Array.isArray(input.apps) && input.apps.length ? input.apps : mockAccount.apps,
      status: 'mock'
    };

    return {
      ok: true,
      mode,
      account: { ...mockAccount },
      message: 'mock modeのため、本番登録・実データ保存は行っていません。'
    };
  }

  async function getCurrentAccount() {
    const mode = await getAuthMode();
    return {
      mode,
      account: { ...mockAccount },
      isAuthenticated: mode === 'mock'
    };
  }

  async function logout() {
    const mode = await getAuthMode();
    mockAccount = { ...DEFAULT_ACCOUNT };
    return {
      ok: true,
      mode,
      message: 'mock modeの表示状態を初期化しました。本番ログアウト処理はまだありません。'
    };
  }

  window.AuthService = {
    getAuthMode,
    isSupabaseReady,
    mockLogin,
    mockSignup,
    getCurrentAccount,
    logout
  };
})();
