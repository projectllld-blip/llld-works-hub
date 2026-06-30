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
    if (Array.isArray(layout.layouts)) return sanitizeSeatFlowState(layout);

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

  function sanitizeSeatFlowState(input = {}) {
    const now = new Date().toISOString();
    const layouts = Array.isArray(input.layouts) ? input.layouts : [];
    const ui = input.uiSettings || {};
    const sanitizedLayouts = layouts.map(sanitizeLayout).filter(Boolean);
    const activeLayoutId = safeText(input.activeLayoutId || sanitizedLayouts[0]?.id || '', 80);

    return {
      schemaVersion: 1,
      saveScope: 'seatflow_state',
      revision: Math.max(0, Math.floor(safeNumber(input.revision, 0))),
      updatedAt: safeText(input.updatedAt || now, 40),
      updatedByClientId: safeText(input.updatedByClientId || '', 80),
      activeLayoutId,
      layouts: sanitizedLayouts,
      uiSettings: {
        mode: safeText(ui.mode || 'edit', 20),
        zoom: safeNumber(ui.zoom, 0.8),
        grid: ui.grid !== false,
        rightCollapsed: Boolean(ui.rightCollapsed),
        dashboardWidth: safeNumber(ui.dashboardWidth, 390)
      }
    };
  }

  function sanitizeLayout(layout = {}) {
    const floor = layout.floor || {};
    const items = Array.isArray(layout.items) ? layout.items : [];
    const outline = Array.isArray(layout.outline) ? layout.outline : [];
    const id = safeText(layout.id || '', 80);
    if (!id) return null;

    return {
      id,
      name: safeText(layout.name || 'SeatFlowレイアウト', 60),
      facilityType: safeText(layout.facilityType || 'custom', 40),
      floor: {
        w: safeNumber(floor.w ?? floor.width, DEFAULT_CANVAS.width),
        h: safeNumber(floor.h ?? floor.height, DEFAULT_CANVAS.height),
        grid: safeNumber(floor.grid ?? floor.gridSize, DEFAULT_CANVAS.gridSize)
      },
      outline: outline.map(sanitizePoint).filter(Boolean),
      draftOutline: [],
      items: items.map(sanitizeItem).filter(Boolean),
      updatedAt: safeText(layout.updatedAt || '', 40)
    };
  }

  function sanitizePoint(point = {}) {
    const x = safeNumber(point.x, NaN);
    const y = safeNumber(point.y, NaN);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
    return { x, y };
  }

  async function saveSeatLayoutToCloud(layout = {}, options = {}) {
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

    const { data: currentRow, error: currentError } = await fetchSeatLayoutRow(client, status);
    if (currentError) {
      return {
        ok: false,
        mode: 'supabase',
        status: 'save_failed',
        message: 'クラウド保存前の状態確認に失敗しました。ログイン状態、SeatFlow利用設定、RLS設定を確認してください。'
      };
    }

    const currentState = currentRow?.data_json || {};
    const currentRevision = Math.max(0, Math.floor(safeNumber(currentState.revision, 0)));
    const expectedRevision = Math.max(0, Math.floor(safeNumber(options.expectedRevision ?? layout.baseRevision, 0)));
    const currentClientId = safeText(currentState.updatedByClientId || '', 80);
    const incomingClientId = safeText(layout.updatedByClientId || '', 80);

    if (!options.force && currentRow && currentRevision > expectedRevision && currentClientId !== incomingClientId) {
      return {
        ok: false,
        mode: 'supabase',
        status: 'conflict',
        message: '別タブまたは別端末でSeatFlowが更新されています。クラウドを再読込するか、この内容で上書き保存してください。',
        revision: currentRevision,
        updatedAt: currentState.updatedAt || currentRow.updated_at,
        updatedByClientId: currentClientId
      };
    }

    const sanitizedLayout = sanitizeSeatLayout({
      ...layout,
      revision: Math.max(currentRevision, expectedRevision) + 1,
      updatedAt: new Date().toISOString()
    });
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
        revision: sanitizedLayout.revision || 0,
        updatedAt: sanitizedLayout.updatedAt || data?.updated_at || sanitizedLayout.savedAt,
        updatedByClientId: sanitizedLayout.updatedByClientId || '',
        itemCount: countItems(sanitizedLayout),
        layoutCount: countLayouts(sanitizedLayout),
        accountId: status.account.id,
        appInstanceId: status.appInstance.id,
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
      const { data, error } = await fetchSeatLayoutRow(client, status);

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
        savedAt: data.updated_at,
        updatedAt: data.updated_at,
        revision: Math.max(0, Math.floor(safeNumber(data.data_json?.revision, 0))),
        updatedByClientId: safeText(data.data_json?.updatedByClientId || '', 80),
        rowId: data.id,
        itemCount: countItems(data.data_json || {}),
        layoutCount: countLayouts(data.data_json || {}),
        accountId: status.account.id,
        appInstanceId: status.appInstance.id
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

  function countLayouts(payload = {}) {
    if (Array.isArray(payload.layouts)) return payload.layouts.length;
    return Array.isArray(payload.items) ? 1 : 0;
  }

  function countItems(payload = {}) {
    if (Array.isArray(payload.layouts)) {
      return payload.layouts.reduce((sum, layout) => sum + (Array.isArray(layout.items) ? layout.items.length : 0), 0);
    }
    return Array.isArray(payload.items) ? payload.items.length : 0;
  }

  function fetchSeatLayoutRow(client, status) {
    return client
      .from('app_data')
      .select('id,data_json,updated_at,app_instance_id,company_account_id')
      .eq('company_account_id', status.account.id)
      .eq('app_instance_id', status.appInstance.id)
      .eq('app_key', APP_KEY)
      .eq('data_type', DATA_TYPE)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();
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
      color: safeColor(item.color),
      fontSize: safeNumber(item.fontSize, 0),
      textVertical: Boolean(item.textVertical)
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
    if (/^\s*(生徒|講師|先生|保護者|お客様|顧客|利用者)\s*[:：]/.test(text)) return '';
    return text;
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
