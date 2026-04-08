class User {
  constructor({ id = null, fullName = '', email = '', role = 'USER', createdAt = null } = {}) {
    this.id = id;
    this.fullName = fullName;
    this.email = email;
    this.role = role;
    this.createdAt = createdAt;
  }

  static fromDbRow(row = {}) {
    return new User({
      id: row.id,
      fullName: row.full_name,
      email: row.email,
      role: row.role,
      createdAt: row.created_at,
    });
  }
}

function normalizeRegisterPayload(payload = {}) {
  return {
    fullName: String(payload.fullName || '').trim(),
    email: String(payload.email || '').trim().toLowerCase(),
    password: String(payload.password || ''),
  };
}

function normalizeLoginPayload(payload = {}) {
  return {
    email: String(payload.email || '').trim().toLowerCase(),
    password: String(payload.password || ''),
  };
}

function toPublicUser(user) {
  if (!user) return null;

  if (user.fullName) return user;
  return User.fromDbRow(user);
}

module.exports = {
  User,
  normalizeRegisterPayload,
  normalizeLoginPayload,
  toPublicUser,
};
