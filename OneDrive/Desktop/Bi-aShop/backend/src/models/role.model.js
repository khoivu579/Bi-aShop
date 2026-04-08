const APP_ROLES = {
  ADMIN: 'ADMIN',
  STAFF: 'STAFF',
  USER: 'USER',
};

class Role {
  constructor(value = APP_ROLES.USER) {
    this.value = value;
  }

  isAdmin() {
    return this.value === APP_ROLES.ADMIN;
  }
}

function isAdmin(user) {
  return user?.role === APP_ROLES.ADMIN;
}

module.exports = {
  Role,
  APP_ROLES,
  isAdmin,
};
