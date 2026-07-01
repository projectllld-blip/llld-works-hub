'use strict';

(() => {
  const SUPPORTED_BACKUP_VERSIONS = [1];
  const EXPECTED_SOURCE = 'llld-works-hub';
  const EXPECTED_SCOPE = 'company_account';

  async function readBackupFile(file) {
    if (!file) {
      return {
        ok: false,
        status: 'file_missing',
        message: '確認するバックアップJSONを選択してください。'
      };
    }

    try {
      const text = await file.text();
      return validateBackupJson(text);
    } catch {
      return {
        ok: false,
        status: 'file_read_failed',
        message: 'バックアップJSONを読み込めませんでした。ファイルを確認してください。'
      };
    }
  }

  function validateBackupJson(text) {
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return {
        ok: false,
        status: 'invalid_json',
        message: 'JSONとして読み込めませんでした。ファイル形式を確認してください。'
      };
    }

    return validateBackupData(data);
  }

  function validateBackupData(data) {
    const errors = [];
    const warnings = [];

    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      errors.push('バックアップJSONのルート構造が不正です。');
    }

    const backupVersion = Number(data?.backupVersion);
    if (!Number.isInteger(backupVersion)) {
      errors.push('backupVersion がありません。');
    } else if (!SUPPORTED_BACKUP_VERSIONS.includes(backupVersion)) {
      errors.push(`backupVersion ${backupVersion} は未対応です。`);
    }

    if (data?.source !== EXPECTED_SOURCE) {
      errors.push('source が llld-works-hub ではありません。');
    }

    if (data?.scope !== EXPECTED_SCOPE) {
      errors.push('scope が company_account ではありません。');
    }

    const restorePolicy = data?.restorePolicy || {};
    if (!restorePolicy || typeof restorePolicy !== 'object' || Array.isArray(restorePolicy)) {
      errors.push('restorePolicy がありません。');
    } else if (restorePolicy.doNotTrustSourceIds !== true) {
      errors.push('restorePolicy.doNotTrustSourceIds が true ではありません。');
    }

    if (!data?.company || typeof data.company !== 'object' || Array.isArray(data.company)) {
      errors.push('company 情報がありません。');
    }

    if (!Array.isArray(data?.appInstances)) {
      errors.push('appInstances が配列ではありません。');
    }

    if (!Array.isArray(data?.appData)) {
      errors.push('appData が配列ではありません。');
    }

    const appData = Array.isArray(data?.appData) ? data.appData : [];
    appData.forEach((item, index) => {
      if (!item?.appKey) errors.push(`appData[${index}] に appKey がありません。`);
      if (!item?.dataType) errors.push(`appData[${index}] に dataType がありません。`);
      if (!Object.prototype.hasOwnProperty.call(item || {}, 'dataJson')) {
        errors.push(`appData[${index}] に dataJson がありません。`);
      }
    });

    if (data?.company?.sourceCompanyAccountId) {
      warnings.push('sourceCompanyAccountId は参考IDです。復元時にそのまま使いません。');
    }

    const dataTypes = [...new Set(appData.map(item => item?.dataType).filter(Boolean))].sort();
    const appKeys = [...new Set(appData.map(item => item?.appKey).filter(Boolean))].sort();

    return {
      ok: errors.length === 0,
      status: errors.length ? 'invalid_backup' : 'valid_backup',
      message: errors.length
        ? 'バックアップJSONの検証で問題が見つかりました。'
        : 'バックアップJSONを確認しました。これはプレビューのみで、復元は実行されません。',
      errors,
      warnings,
      summary: {
        backupVersion: Number.isInteger(backupVersion) ? backupVersion : '',
        exportedAt: data?.exportedAt || '',
        source: data?.source || '',
        scope: data?.scope || '',
        companyName: data?.company?.companyName || '',
        appInstanceCount: Array.isArray(data?.appInstances) ? data.appInstances.length : 0,
        appDataCount: appData.length,
        dataTypes,
        appKeys,
        restorePolicy: {
          doNotTrustSourceIds: restorePolicy.doNotTrustSourceIds === true,
          restoreRequiresLoggedInCompany: restorePolicy.restoreRequiresLoggedInCompany === true,
          restoreNotImplemented: restorePolicy.restoreNotImplemented === true
        }
      }
    };
  }

  window.BackupImportPreviewService = {
    readBackupFile,
    validateBackupJson,
    validateBackupData
  };
})();
