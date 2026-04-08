const { getRequest, sql } = require('../config/db');

async function findByEmail(email) {
  const result = await getRequest()
    .input('email', sql.NVarChar, email)
    .query('SELECT id, full_name, email, password_hash, role, created_at FROM app_users WHERE email = @email');

  return result.recordset[0] || null;
}

async function findById(id) {
  const result = await getRequest()
    .input('id', sql.Int, id)
    .query('SELECT id, full_name, email, role, created_at FROM app_users WHERE id = @id');

  return result.recordset[0] || null;
}

async function createUser({ fullName, email, passwordHash, role }) {
  const result = await getRequest()
    .input('full_name', sql.NVarChar, fullName)
    .input('email', sql.NVarChar, email)
    .input('password_hash', sql.NVarChar, passwordHash)
    .input('role', sql.NVarChar, role)
    .query(`
      INSERT INTO app_users (full_name, email, password_hash, role)
      OUTPUT INSERTED.id
      VALUES (@full_name, @email, @password_hash, @role)
    `);

  return result.recordset[0].id;
}

async function findAll() {
  const result = await getRequest().query(`
    SELECT id, full_name, email, role, created_at
    FROM app_users
    ORDER BY id DESC
  `);

  return result.recordset;
}

async function updateUser(id, { fullName, email, role, passwordHash }) {
  const request = getRequest()
    .input('id', sql.Int, id)
    .input('full_name', sql.NVarChar, fullName)
    .input('email', sql.NVarChar, email)
    .input('role', sql.NVarChar, role);

  let setPasswordClause = '';
  if (passwordHash) {
    request.input('password_hash', sql.NVarChar, passwordHash);
    setPasswordClause = ', password_hash = @password_hash';
  }

  const result = await request.query(`
    UPDATE app_users
    SET
      full_name = @full_name,
      email = @email,
      role = @role
      ${setPasswordClause}
    WHERE id = @id
  `);

  return result.rowsAffected[0] > 0;
}

async function deleteUser(id) {
  const result = await getRequest()
    .input('id', sql.Int, id)
    .query('DELETE FROM app_users WHERE id = @id');

  return result.rowsAffected[0] > 0;
}

module.exports = {
  findByEmail,
  findById,
  createUser,
  findAll,
  updateUser,
  deleteUser,
};
