'use strict';

(() => {
  const ROLES = ['guest', 'member', 'author', 'admin'];
  let currentRole = 'guest';

  function getCurrentUser() {
    return {
      id: currentRole === 'guest' ? null : `mock-${currentRole}`,
      role: currentRole,
      isLoggedIn: currentRole !== 'guest',
      label: {
        guest: 'ゲスト',
        member: 'メンバー',
        author: '投稿者',
        admin: '管理者'
      }[currentRole]
    };
  }

  function setMockRole(role) {
    if (!ROLES.includes(role)) {
      throw new Error(`Unknown mock role: ${role}`);
    }
    currentRole = role;
    return getCurrentUser();
  }

  function can(action) {
    const role = currentRole;
    const permissions = {
      viewPublic: ['guest', 'member', 'author', 'admin'],
      viewInternal: ['member', 'author', 'admin'],
      submitContent: ['author', 'admin'],
      reviewContent: ['admin'],
      manageUsers: ['admin']
    };
    return (permissions[action] || []).includes(role);
  }

  window.AuthMockService = {
    roles: [...ROLES],
    getCurrentUser,
    setMockRole,
    can
  };
})();
