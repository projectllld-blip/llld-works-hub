'use strict';

(() => {
  const APP_KEY = 'works_portal';
  const DATA_TYPE = 'portal_state';

  function createInitialPortalState() {
    return {
      schemaVersion: 1,
      memos: [],
      todos: [],
      boardPosts: [],
      storageTree: [],
      favorites: [],
      recentItems: [],
      portalSettings: {
        storageFoldersOpen: {},
        lastSelectedStorageId: null
      },
      updatedAt: null
    };
  }

  async function getPortalCloudStatus() {
    const authStatus = await window.AuthService?.getAuthStatus?.();
    if (!authStatus || authStatus.mode !== 'supabase') {
      return {
        ok: true,
        mode: authStatus?.mode || 'mock',
        status: 'mock',
        message: 'ログインすると会社ごとのポータル状態をクラウド保存できます。'
      };
    }

    const accountResult = await window.AuthService?.getCurrentAccount?.();
    if (!accountResult?.account?.id) {
      return {
        ok: false,
        mode: 'supabase',
        status: accountResult?.isAuthenticated ? 'account_missing' : 'not_logged_in',
        account: null,
        message: accountResult?.message || 'ポータル保存には企業アカウントでのログインが必要です。'
      };
    }

    const appInstanceResult = await getPortalAppInstance(accountResult.account.id);
    return {
      ok: appInstanceResult.ok,
      mode: 'supabase',
      status: appInstanceResult.ok ? 'ready' : appInstanceResult.status,
      account: accountResult.account,
      appInstance: appInstanceResult.appInstance || null,
      message: appInstanceResult.ok
        ? 'ポータル編集データをクラウド保存できます。'
        : appInstanceResult.message
    };
  }

  async function getPortalAppInstance(companyAccountId) {
    const authStatus = await window.AuthService?.getAuthStatus?.();
    if (!authStatus || authStatus.mode !== 'supabase') {
      return {
        ok: false,
        mode: authStatus?.mode || 'mock',
        status: 'mock',
        appInstance: null,
        message: 'mock modeのため、Works Portalのapp_instanceは取得しません。'
      };
    }

    if (!companyAccountId) {
      return {
        ok: false,
        mode: 'supabase',
        status: 'account_missing',
        appInstance: null,
        message: '企業アカウント情報が未取得のため、ポータル利用設定を確認できません。'
      };
    }

    const client = await window.SupabaseClientService?.getSupabaseClient?.();
    if (!client?.from) {
      return {
        ok: false,
        mode: 'supabase',
        status: 'client_unavailable',
        appInstance: null,
        message: 'Supabase clientを確認できません。接続設定を確認してください。'
      };
    }

    try {
      const { data, error } = await client
        .from('app_instances')
        .select('id,company_account_id,app_key,display_name,status,settings_json,created_at,updated_at')
        .eq('company_account_id', companyAccountId)
        .eq('app_key', APP_KEY)
        .maybeSingle();

      if (error) {
        return {
          ok: false,
          mode: 'supabase',
          status: 'app_instance_error',
          appInstance: null,
          message: 'ポータル利用設定の取得に失敗しました。RLS設定とapp_instancesを確認してください。'
        };
      }

      if (!data) {
        return {
          ok: false,
          mode: 'supabase',
          status: 'app_instance_not_found',
          appInstance: null,
          message: 'Works Portalの利用設定が見つかりません。v0.14.11 migrationの適用を確認してください。'
        };
      }

      return {
        ok: true,
        mode: 'supabase',
        status: 'app_instance_loaded',
        appInstance: normalizeAppInstance(data),
        message: 'Works Portal利用設定を確認しました。'
      };
    } catch {
      return {
        ok: false,
        mode: 'supabase',
        status: 'app_instance_error',
        appInstance: null,
        message: 'ポータル利用設定の取得に失敗しました。接続設定を確認してください。'
      };
    }
  }

  async function loadPortalState() {
    const status = await getPortalCloudStatus();
    if (status.mode !== 'supabase') {
      return {
        ok: true,
        mode: status.mode,
        status: 'mock',
        state: createInitialPortalState(),
        message: status.message
      };
    }

    if (!status.ok || !status.account?.id || !status.appInstance?.id) {
      return {
        ok: false,
        mode: 'supabase',
        status: status.status,
        state: createInitialPortalState(),
        message: status.message
      };
    }

    const client = await window.SupabaseClientService?.getSupabaseClient?.();
    if (!client?.from) {
      return {
        ok: false,
        mode: 'supabase',
        status: 'client_unavailable',
        state: createInitialPortalState(),
        message: 'Supabase clientを確認できません。接続設定を確認してください。'
      };
    }

    try {
      const { data, error } = await client
        .from('app_data')
        .select('id,data_json,updated_at')
        .eq('company_account_id', status.account.id)
        .eq('app_instance_id', status.appInstance.id)
        .eq('app_key', APP_KEY)
        .eq('data_type', DATA_TYPE)
        .maybeSingle();

      if (error) {
        return {
          ok: false,
          mode: 'supabase',
          status: 'load_failed',
          state: createInitialPortalState(),
          message: 'ポータル情報の読込に失敗しました。RLS設定とapp_dataを確認してください。'
        };
      }

      if (!data) {
        return {
          ok: true,
          mode: 'supabase',
          status: 'empty',
          state: createInitialPortalState(),
          account: status.account,
          appInstance: status.appInstance,
          message: 'クラウド保存されたポータル情報はまだありません。初回保存で作成します。'
        };
      }

      return {
        ok: true,
        mode: 'supabase',
        status: 'loaded',
        state: normalizePortalState(data.data_json),
        updatedAt: data.updated_at,
        account: status.account,
        appInstance: status.appInstance,
        message: 'ポータル情報を読み込みました。'
      };
    } catch {
      return {
        ok: false,
        mode: 'supabase',
        status: 'load_failed',
        state: createInitialPortalState(),
        message: 'ポータル情報の読込に失敗しました。接続設定を確認してください。'
      };
    }
  }

  async function savePortalState(state = {}) {
    const status = await getPortalCloudStatus();
    if (status.mode !== 'supabase') {
      return {
        ok: false,
        mode: status.mode,
        status: 'mock',
        message: 'ログインすると会社ごとのポータル状態をクラウド保存できます。'
      };
    }

    if (!status.ok || !status.account?.id || !status.appInstance?.id) {
      return {
        ok: false,
        mode: 'supabase',
        status: status.status,
        message: status.message
      };
    }

    const client = await window.SupabaseClientService?.getSupabaseClient?.();
    if (!client?.from) {
      return {
        ok: false,
        mode: 'supabase',
        status: 'client_unavailable',
        message: 'Supabase clientを確認できません。接続設定を確認してください。'
      };
    }

    const payloadState = normalizePortalState({
      ...state,
      updatedAt: new Date().toISOString()
    });

    try {
      const { data, error } = await client
        .from('app_data')
        .upsert({
          company_account_id: status.account.id,
          app_instance_id: status.appInstance.id,
          app_key: APP_KEY,
          data_type: DATA_TYPE,
          data_json: payloadState
        }, { onConflict: 'app_instance_id,data_type' })
        .select('id,updated_at')
        .maybeSingle();

      if (error) {
        return {
          ok: false,
          mode: 'supabase',
          status: 'save_failed',
          message: 'ポータル情報の保存に失敗しました。ログイン状態、RLS設定、app_dataを確認してください。'
        };
      }

      return {
        ok: true,
        mode: 'supabase',
        status: 'saved',
        savedAt: data?.updated_at || payloadState.updatedAt,
        state: payloadState,
        message: 'ポータル情報を保存しました。'
      };
    } catch {
      return {
        ok: false,
        mode: 'supabase',
        status: 'save_failed',
        message: 'ポータル情報の保存に失敗しました。接続設定を確認してください。'
      };
    }
  }

  function normalizePortalState(state = {}) {
    const initial = createInitialPortalState();
    const source = state && typeof state === 'object' ? state : {};
    return {
      schemaVersion: Number(source.schemaVersion || source.portalVersion || initial.schemaVersion) || 1,
      memos: normalizeItems(source.memos),
      todos: normalizeItems(source.todos),
      boardPosts: normalizeItems(source.boardPosts),
      storageTree: Array.isArray(source.storageTree) ? source.storageTree : [],
      favorites: normalizeItems(source.favorites),
      recentItems: normalizeItems(source.recentItems),
      portalSettings: {
        ...initial.portalSettings,
        ...(source.portalSettings && typeof source.portalSettings === 'object' ? source.portalSettings : {})
      },
      updatedAt: source.updatedAt || null
    };
  }

  function normalizeItems(items) {
    return Array.isArray(items) ? items.filter(item => item && typeof item === 'object') : [];
  }

  function normalizeAppInstance(row = {}) {
    return {
      id: row.id || '',
      companyAccountId: row.company_account_id || '',
      appKey: row.app_key || APP_KEY,
      displayName: row.display_name || 'LLLD Works Hub ポータル',
      status: row.status || '',
      settings: row.settings_json || {},
      createdAt: row.created_at || '',
      updatedAt: row.updated_at || ''
    };
  }

  window.PortalStateService = {
    APP_KEY,
    DATA_TYPE,
    createInitialPortalState,
    getPortalCloudStatus,
    getPortalAppInstance,
    loadPortalState,
    savePortalState,
    normalizePortalState
  };
})();
