'use strict';

(() => {
  const APP_KEY = 'seatflow';
  const DATA_TYPE = 'seat_layout';
  const DEFAULT_CANVAS = { width: 1200, height: 800, gridSize: 20, zoom: 1 };
  const RISK_KEYS = new Set([
    'studentName', 'student_name', 'userName', 'user_name', 'teacherName', 'teacher_name',
    'customerName', 'customer_name', 'parentName', 'parent_name', 'assignedName',
    'personId', 'phone', 'email', 'memo', 'note', 'reservation', 'reservedBy',
    'occupiedBy', 'attendance', 'nfc', 'barcode', 'code'
  ]);

  async function getSeatFlowCloudStatus() {
    const authStatus = await window.AuthService?.getAuthStatus?.();
    if (!authStatus || authStatus.mode !== 'supabase') {
      return {
        ok: true,
        mode: authStatus?.mode || 'mock',
        status: 'mock',
        message: 'mock modeのため、クラウド保存は行いません。既存のローカル保存は利用できます。'
      };
    }

    const accountResult = await window.AuthService?.getCurrentAccount?.();
    if (!accountResult?.account?.id) {
      return {
        ok: false,
        mode: 'supabase',
        status: accountResult?.isAuthenticated ? 'account_missing' : 'not_logged_in',
        message: accountResult?.message || 'クラウド保存にはログインが必要です。'
      };
    }

    const appInstanceResult = await getSeatFlowAppInstance(accountResult.account.id);
    return {
      ok: appInstanceResult.ok,
      mode: 'supabase',
      status: appInstanceResult.ok ? 'ready' : appInstanceResult.status,
      account: accountResult.account,
      appInstance: appInstanceResult.appInstance || null,
      message: appInstanceResult.ok
        ? 'Supabase modeです。ログイン中の企業アカウントにSeatFlowレイアウトを保存できます。'
        : appInstanceResult.message
    };
  }

  async function getSeatFlowAppInstance(companyAccountId) {
    if (!companyAccountId) {
      const accountResult = await window.AuthService?.getCurrentAccount?.();
      companyAccountId = accountResult?.account?.id || '';
    }

    const authStatus = await window.AuthService?.getAuthStatus?.();
    if (!authStatus || authStatus.mode !== 'supabase') {
      return {
        ok: false,
        mode: authStatus?.mode || 'mock',
        status: 'mock',
        appInstance: null,
        message: 'mock modeのため、SeatFlowのapp_instanceは取得しません。'
      };
    }

    if (!companyAccountId) {
      return {
        ok: false,
        mode: 'supabase',
        status: 'account_missing',
        appInstance: null,
        message: '企業アカウント情報が未取得のため、SeatFlow利用設定を確認できません。'
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
          message: 'SeatFlow利用設定の取得に失敗しました。RLS設定とapp_instancesを確認してください。'
        };
      }

      if (!data) {
        return {
          ok: false,
          mode: 'supabase',
          status: 'app_instance_not_found',
          appInstance: null,
          message: 'この企業アカウントにはSeatFlowがまだ登録されていません。利用アプリ一覧またはapp_instances設定を確認してください。'
        };
      }

      return {
        ok: true,
        mode: 'supabase',
        status: 'app_instance_loaded',
        appInstance: normalizeAppInstance(data),
        message: 'SeatFlow利用設定を確認しました。'
      };
    } catch {
      return {
        ok: false,
        mode: 'supabase',
        status: 'app_instance_error',
        appInstance: null,
        message: 'SeatFlow利用設定の取得に失敗しました。接続設定を確認してください。'
      };
    }
  }

  function sanitizeSeatLayout(layout = {}) {
    const canvas = layout.canvas || {};
    const settings = layout.settings || {};
    const items = Array.isArray(layout.items) ? layout.items : [];

    return {
      version: Number(layout.version) || 1,
      layoutName: safeText(layout.layoutName || layout.name || 'SeatFlowレイアウト', 40),
      savedAt: new Date().toISOString(),
      source: 'seatflow',
      canvas: {
        width: safeNumber(canvas.width, DEFAULT_CANVAS.width),
        height: safeNumber(canvas.height, DEFAULT_CANVAS.height),
        gridSize: safeNumber(canvas.gridSize, DEFAULT_CANVAS.gridSize),
        zoom: safeNumber(canvas.zoom, DEFAULT_CANVAS.zoom)
      },
      items: items.map(sanitizeItem).filter(Boolean),
      settings: {
        showGrid: Boolean(settings.showGrid),
        snapToGrid: settings.snapToGrid !== false
      }
    };
  }

  async function saveSeatLayoutToCloud(layout = {}) {
    const status = await getSeatFlowCloudStatus();
    if (status.mode !== 'supabase') {
      return {
        ok: false,
        mode: status.mode,
        status: 'mock',
        message: 'mock modeのためクラウド保存は行いません。ローカル保存を利用してください。'
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

    const sanitizedLayout = sanitizeSeatLayout(layout);
    const payload = {
      company_account_id: status.account.id,
      app_instance_id: status.appInstance.id,
      app_key: APP_KEY,
      data_type: DATA_TYPE,
      data_json: sanitizedLayout
    };

    try {
      const { data, error } = await client
        .from('app_data')
        .upsert(payload, { onConflict: 'app_instance_id,data_type' })
        .select()
        .maybeSingle();

      if (error) {
        return {
          ok: false,
          mode: 'supabase',
          status: 'save_failed',
          message: 'クラウド保存に失敗しました。ログイン状態、SeatFlow利用設定、RLS設定を確認してください。'
        };
      }

      return {
        ok: true,
        mode: 'supabase',
        status: 'saved',
        message: 'SeatFlowレイアウトをクラウド保存しました。',
        savedAt: data?.updated_at || sanitizedLayout.savedAt,
        data
      };
    } catch {
      return {
        ok: false,
        mode: 'supabase',
        status: 'save_failed',
        message: 'クラウド保存に失敗しました。接続設定を確認してください。'
      };
    }
  }

  async function loadSeatLayoutFromCloud() {
    const status = await getSeatFlowCloudStatus();
    if (status.mode !== 'supabase') {
      return {
        ok: false,
        mode: status.mode,
        status: 'mock',
        message: 'mock modeのためクラウド読込は行いません。ローカル保存を利用してください。'
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
          message: 'クラウド読込に失敗しました。ログイン状態、SeatFlow利用設定、RLS設定を確認してください。'
        };
      }

      if (!data) {
        return {
          ok: false,
          mode: 'supabase',
          status: 'not_found',
          message: 'クラウド保存されたSeatFlowレイアウトはまだありません。先に「クラウド保存」を押してください。'
        };
      }

      return {
        ok: true,
        mode: 'supabase',
        status: 'loaded',
        message: 'クラウド保存されたSeatFlowレイアウトを読み込みました。',
        layout: normalizeSeatLayoutData(data),
        updatedAt: data.updated_at
      };
    } catch {
      return {
        ok: false,
        mode: 'supabase',
        status: 'load_failed',
        message: 'クラウド読込に失敗しました。接続設定を確認してください。'
      };
    }
  }

  function normalizeSeatLayoutData(row = {}) {
    return sanitizeSeatLayout(row.data_json || {});
  }

  function normalizeAppInstance(row = {}) {
    return {
      id: row.id || '',
      companyAccountId: row.company_account_id || '',
      appKey: row.app_key || APP_KEY,
      displayName: row.display_name || 'SeatFlow',
      status: row.status || '',
      settings: row.settings_json || {},
      createdAt: row.created_at || '',
      updatedAt: row.updated_at || ''
    };
  }

  function sanitizeItem(item = {}) {
    const type = safeText(item.type || 'seat', 32);
    const safe = {
      id: safeText(item.id || '', 64),
      type,
      label: sanitizeLabel(item.label, type),
      x: safeNumber(item.x, 0),
      y: safeNumber(item.y, 0),
      width: safeNumber(item.width ?? item.w, 80),
      height: safeNumber(item.height ?? item.h, 60),
      rotation: safeNumber(item.rotation ?? item.r, 0),
      z: safeNumber(item.z, 1),
      groupId: safeText(item.groupId || '', 64),
      assignable: Boolean(item.assignable),
      noBorder: Boolean(item.noBorder),
      color: safeColor(item.color)
    };

    Object.keys(item).forEach(key => {
      if (RISK_KEYS.has(key)) return;
    });

    return safe;
  }

  function sanitizeLabel(label, type) {
    const text = safeText(label || '', 24).replace(/[\r\n\t]/g, ' ');
    if (!text) return '';
    if (looksLikeContact(text)) return '';
    if (type === 'seat') {
      return /^[A-Za-z0-9０-９一二三四五六七八九十百#\-ー号席座 ]{1,16}$/.test(text) ? text : '';
    }
    return text.length <= 16 ? text : safeText(type, 16);
  }

  function safeText(value, max = 80) {
    return String(value ?? '').trim().slice(0, max);
  }

  function safeNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }

  function safeColor(value) {
    const text = String(value || '').trim();
    return /^#[0-9a-f]{6}$/i.test(text) ? text : '';
  }

  function looksLikeContact(text) {
    return /@|[0-9０-９]{2,4}[-ー−][0-9０-９]{2,4}[-ー−][0-9０-９]{3,4}/.test(text);
  }

  window.SeatFlowCloudService = {
    getSeatFlowCloudStatus,
    getSeatFlowAppInstance,
    sanitizeSeatLayout,
    saveSeatLayoutToCloud,
    loadSeatLayoutFromCloud,
    normalizeSeatLayoutData
  };
})();
