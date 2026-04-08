class Auth {
  constructor({ email = '', password = '' } = {}) {
    this.email = email;
    this.password = password;
  }

  static fromPayload(payload = {}) {
    return new Auth({
      email: normalizeEmail(payload.email),
      password: String(payload.password || ''),
    });
  }
}

function assertPasswordPolicy(password) {
  if (!password || password.length < 6) {
    const err = new Error('Password must be at least 6 characters');
    err.statusCode = 400;
    throw err;
  }
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

module.exports = {
  Auth,
  assertPasswordPolicy,
  normalizeEmail,
};
