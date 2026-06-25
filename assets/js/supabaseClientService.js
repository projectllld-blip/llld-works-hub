'use strict';

(() => {
  let cachedClient = null;
  let cachedClientKey = '';

  async function getSupabaseConfig() {
    const auth = await window.SiteConfigService?.getAuthConfig?.();
    return {
      requestedMode: auth?.mode || 'mock',
      supabaseUrl: String(auth?.supabaseUrl || '').trim(),
      supabaseAnonKey: String(auth?.supabaseAnonKey || '').trim()
    };
  }

  async function isSupabaseConfigured() {
    const config = await getSupabaseConfig();
    return Boolean(config.supabaseUrl && config.supabaseAnonKey);
  }

  async function getSupabaseClient() {
    const config = await getSupabaseConfig();
    const configured = Boolean(config.supabaseUrl && config.supabaseAnonKey);
    const createClient = window.supabase?.createClient;
    const clientKey = `${config.supabaseUrl}:${config.supabaseAnonKey}`;

    if (!configured || typeof createClient !== 'function') return null;
    if (cachedClient && cachedClientKey === clientKey) return cachedClient;

    try {
      cachedClient = createClient(config.supabaseUrl, config.supabaseAnonKey);
      cachedClientKey = clientKey;
      return cachedClient;
    } catch {
      cachedClient = null;
      cachedClientKey = '';
      return null;
    }
  }

  async function getSupabaseConnectionStatus() {
    const config = await getSupabaseConfig();
    const configured = Boolean(config.supabaseUrl && config.supabaseAnonKey);
    const clientAvailable = typeof window.supabase?.createClient === 'function';
    const safeMode = config.requestedMode === 'supabase' && configured ? 'supabase' : 'mock';

    let reason = 'mock_requested';
    let message = 'mock modeで動作しています。本番登録・本番ログインはまだ行いません。';

    if (config.requestedMode === 'supabase' && !configured) {
      reason = 'supabase_config_missing';
      message = 'Supabase設定が未完了のため、mock modeで動作しています。';
    } else if (config.requestedMode === 'supabase' && configured && !clientAvailable) {
      reason = 'supabase_library_missing';
      message = 'Supabase設定は検出されていますが、ライブラリ未読込のため本番処理は実行しません。';
    } else if (config.requestedMode === 'supabase' && configured && clientAvailable) {
      reason = 'supabase_configured';
      message = 'Supabase設定は検出されています。v0.12ではsignup / login / account接続が対象です。';
    }

    return {
      requestedMode: config.requestedMode,
      safeMode,
      configured,
      clientAvailable,
      clientReady: Boolean(configured && clientAvailable),
      supabaseUrlSet: Boolean(config.supabaseUrl),
      supabaseAnonKeySet: Boolean(config.supabaseAnonKey),
      reason,
      message
    };
  }

  window.SupabaseClientService = {
    getSupabaseConfig,
    isSupabaseConfigured,
    getSupabaseClient,
    getSupabaseConnectionStatus
  };
})();
