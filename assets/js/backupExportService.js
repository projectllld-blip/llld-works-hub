'use strict';

(() => {
  const BACKUP_VERSION = 1;
  const SOURCE = 'llld-works-hub';

  async function exportCompanyBackup() {
    const result = await buildCompanyBackup();
    if (!result.ok) return result;

    const fileName = buildBackupFileName();
    downloadJson(fileName, result.backup);

    return {
      ...result,
      fileName,
      message: '自社クラウドデータのJSONバックアップを書き出しました。復元はまだ未対応です。'
    };
  }

  async function buildCompanyBackup() {
    const accountResult = await window.AuthService?.getCurrentAccount?.();
    const status = accountResult?.status || await window.AuthService?.getAuthStatus?.();

    if (!accountResult?.account?.id) {
      return {
        ok: false,
        mode: status?.mode || 'mock',
        backupStatus: 'not_logged_in',
        message: 'バックアップを書き出すには企業アカウントでログインしてください。'
      };
    }

    if (status?.mode !== 'supabase') {
      return {
        ok: false,
        mode: status?.mode || 'mock',
        backupStatus: 'mock_mode',
        message: 'mock modeではバックアップを書き出しません。Supabaseログイン後に実行してください。'
      };
    }

    const client = await window.SupabaseClientService?.getSupabaseClient?.();
    if (!client?.from) {
      return {
        ok: false,
        mode: 'supabase',
        backupStatus: 'client_unavailable',
        message: 'Supabase clientを確認できません。接続設定を確認してください。'
      };
    }

    const account = accountResult.account;

    try {
      const [instancesResult, appDataResult] = await Promise.all([
        client
          .from('app_instances')
          .select('id,app_key,display_name,status,created_at,updated_at')
          .eq('company_account_id', account.id)
          .order('created_at', { ascending: true }),
        client
          .from('app_data')
          .select('id,app_instance_id,app_key,data_type,data_json,created_at,updated_at')
          .eq('company_account_id', account.id)
          .order('updated_at', { ascending: true })
      ]);

      if (instancesResult.error) {
        return {
          ok: false,
          mode: 'supabase',
          backupStatus: 'app_instances_error',
          message: '利用アプリ情報の取得に失敗しました。RLS設定とapp_instancesを確認してください。'
        };
      }

      if (appDataResult.error) {
        return {
          ok: false,
          mode: 'supabase',
          backupStatus: 'app_data_error',
          message: 'クラウド保存データの取得に失敗しました。RLS設定とapp_dataを確認してください。'
        };
      }

      const appInstances = (instancesResult.data || []).map(normalizeAppInstance);
      const appData = (appDataResult.data || []).map(normalizeAppData);

      return {
        ok: true,
        mode: 'supabase',
        backupStatus: 'ready',
        backup: {
          backupVersion: BACKUP_VERSION,
          exportedAt: new Date().toISOString(),
          source: SOURCE,
          scope: 'company_account',
          restorePolicy: {
            doNotTrustSourceIds: true,
            restoreRequiresLoggedInCompany: true,
            sourceIdsAreReferenceOnly: true,
            restoreNotImplemented: true
          },
          company: {
            companyName: account.companyName || '',
            sourceCompanyAccountId: account.id,
            createdAt: account.createdAt || '',
            updatedAt: account.updatedAt || ''
          },
          appInstances,
          appData
        },
        counts: {
          appInstances: appInstances.length,
          appData: appData.length
        },
        message: 'バックアップJSONを作成できます。'
      };
    } catch {
      return {
        ok: false,
        mode: 'supabase',
        backupStatus: 'export_failed',
        message: 'バックアップJSONの作成に失敗しました。接続状態を確認してください。'
      };
    }
  }

  function normalizeAppInstance(row = {}) {
    return {
      sourceAppInstanceId: row.id || '',
      appKey: row.app_key || '',
      displayName: row.display_name || '',
      status: row.status || '',
      createdAt: row.created_at || '',
      updatedAt: row.updated_at || ''
    };
  }

  function normalizeAppData(row = {}) {
    return {
      sourceAppDataId: row.id || '',
      sourceAppInstanceId: row.app_instance_id || '',
      appKey: row.app_key || '',
      dataType: row.data_type || '',
      dataJson: row.data_json || {},
      createdAt: row.created_at || '',
      updatedAt: row.updated_at || ''
    };
  }

  function buildBackupFileName() {
    const now = new Date();
    const pad = value => String(value).padStart(2, '0');
    const stamp = [
      now.getFullYear(),
      pad(now.getMonth() + 1),
      pad(now.getDate()),
      '-',
      pad(now.getHours()),
      pad(now.getMinutes())
    ].join('');
    return `llld-works-hub-backup-${stamp}.json`;
  }

  function downloadJson(fileName, data) {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  window.BackupExportService = {
    buildCompanyBackup,
    exportCompanyBackup
  };
})();
