const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/user.repository');
const { toPublicUser, normalizeEmail, assertPasswordPolicy } = require('../models');
const { ROLES } = require('../constants/roles');

const ALLOWED_ROLES = [ROLES.ADMIN, ROLES.STAFF, ROLES.USER];

function normalizeRole(role) {
  const normalized = String(role || '').toUpperCase();
  if (!ALLOWED_ROLES.includes(normalized)) {
    const err = new Error(`role must be one of: ${ALLOWED_ROLES.join(', ')}`);
    err.statusCode = 400;
    throw err;
  }
  return normalized;
}

async function getUsers() {
  const users = await userRepository.findAll();
  return users.map(toPublicUser);
}

async function createUser(payload) {
  const fullName = String(payload.fullName || '').trim();
  const email = normalizeEmail(payload.email);
  const password = String(payload.password || '');
  const role = normalizeRole(payload.role);

  if (!fullName || !email || !password) {
    const err = new Error('fullName, email, password are required');
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
  const id = await userRepository.createUser({ fullName, email, passwordHash, role });
  const user = await userRepository.findById(id);
  return toPublicUser(user);
}

async function updateUser(id, payload, currentUserId) {
  const existing = await userRepository.findById(id);
  if (!existing) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  const fullName = String(payload.fullName || existing.full_name).trim();
  const email = normalizeEmail(payload.email || existing.email);
  const role = normalizeRole(payload.role || existing.role);
  const password = payload.password ? String(payload.password) : '';

  if (Number(id) === Number(currentUserId) && role !== existing.role) {
    const err = new Error('You cannot change your own role');
    err.statusCode = 400;
    throw err;
  }

  let passwordHash;
  if (password) {
    assertPasswordPolicy(password);
    passwordHash = await bcrypt.hash(password, 10);
  }

  const updated = await userRepository.updateUser(id, { fullName, email, role, passwordHash });
  if (!updated) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  const user = await userRepository.findById(id);
  return toPublicUser(user);
}

async function deleteUser(id, currentUserId) {
  if (Number(id) === Number(currentUserId)) {
    const err = new Error('You cannot delete your own account');
    err.statusCode = 400;
    throw err;
  }

  const deleted = await userRepository.deleteUser(id);
  if (!deleted) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  return { message: 'User deleted successfully' };
}

module.exports = {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
};
