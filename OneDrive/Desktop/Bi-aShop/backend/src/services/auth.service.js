const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/user.repository');
const { generateToken } = require('../utils/jwt');
const { ROLES } = require('../constants/roles');
const { normalizeRegisterPayload, normalizeLoginPayload, toPublicUser, assertPasswordPolicy, normalizeEmail } = require('../models');

async function register(payload) {
  const normalized = normalizeRegisterPayload(payload);
  const fullName = normalized.fullName;
  const email = normalizeEmail(normalized.email);
  const password = normalized.password;

  if (!fullName || !email || !password) {
    const err = new Error('fullName, email and password are required');
    err.statusCode = 400;
    throw err;
  }

  assertPasswordPolicy(password);

  const existed = await userRepository.findByEmail(email);
  if (existed) {
    const err = new Error('Email already exists');
    err.statusCode = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const userId = await userRepository.createUser({
    fullName,
    email,
    passwordHash,
    role: ROLES.USER,
  });

  const user = await userRepository.findById(userId);
  const token = generateToken({ id: user.id, email: user.email, role: user.role });

  return { token, user: toPublicUser(user) };
}

async function login(payload) {
  const normalized = normalizeLoginPayload(payload);
  const email = normalizeEmail(normalized.email);
  const password = normalized.password;

  if (!email || !password) {
    const err = new Error('email and password are required');
    err.statusCode = 400;
    throw err;
  }

  const user = await userRepository.findByEmail(email);
  if (!user) {
    const err = new Error('Invalid credentials');
    err.statusCode = 401;
    throw err;
  }

  const matched = await bcrypt.compare(password, user.password_hash);
  if (!matched) {
    const err = new Error('Invalid credentials');
    err.statusCode = 401;
    throw err;
  }

  const token = generateToken({ id: user.id, email: user.email, role: user.role });
  return { token, user: toPublicUser(user) };
}

async function getMe(userId) {
  const user = await userRepository.findById(userId);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  return toPublicUser(user);
}

module.exports = {
  register,
  login,
  getMe,
};
