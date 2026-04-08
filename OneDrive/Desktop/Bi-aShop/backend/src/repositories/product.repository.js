const { getRequest, sql } = require('../config/db');

async function findAll(search) {
  const request = getRequest();
  if (search) {
    request.input('search', sql.NVarChar, `%${search}%`);
    const result = await request.query(`
      SELECT id, name, brand, material, length_cm, weight_g, price, stock, image_url, description, created_at, updated_at
      FROM products
      WHERE name LIKE @search OR brand LIKE @search
      ORDER BY id DESC
    `);
    return result.recordset;
  }

  const result = await request.query(`
    SELECT id, name, brand, material, length_cm, weight_g, price, stock, image_url, description, created_at, updated_at
    FROM products
    ORDER BY id DESC
  `);
  return result.recordset;
}

async function findById(id) {
  const result = await getRequest()
    .input('id', sql.Int, id)
    .query(`
      SELECT id, name, brand, material, length_cm, weight_g, price, stock, image_url, description, created_at, updated_at
      FROM products
      WHERE id = @id
    `);

  return result.recordset[0] || null;
}

async function create(product) {
  const result = await getRequest()
    .input('name', sql.NVarChar, product.name)
    .input('brand', sql.NVarChar, product.brand)
    .input('material', sql.NVarChar, product.material)
    .input('length_cm', sql.Decimal(6, 2), product.lengthCm)
    .input('weight_g', sql.Decimal(6, 2), product.weightG)
    .input('price', sql.Decimal(12, 2), product.price)
    .input('stock', sql.Int, product.stock)
    .input('image_url', sql.NVarChar, product.imageUrl)
    .input('description', sql.NVarChar, product.description)
    .query(`
      INSERT INTO products (name, brand, material, length_cm, weight_g, price, stock, image_url, description)
      OUTPUT INSERTED.id
      VALUES (@name, @brand, @material, @length_cm, @weight_g, @price, @stock, @image_url, @description)
    `);

  return result.recordset[0].id;
}

async function update(id, product) {
  const result = await getRequest()
    .input('id', sql.Int, id)
    .input('name', sql.NVarChar, product.name)
    .input('brand', sql.NVarChar, product.brand)
    .input('material', sql.NVarChar, product.material)
    .input('length_cm', sql.Decimal(6, 2), product.lengthCm)
    .input('weight_g', sql.Decimal(6, 2), product.weightG)
    .input('price', sql.Decimal(12, 2), product.price)
    .input('stock', sql.Int, product.stock)
    .input('image_url', sql.NVarChar, product.imageUrl)
    .input('description', sql.NVarChar, product.description)
    .query(`
      UPDATE products
      SET
        name = @name,
        brand = @brand,
        material = @material,
        length_cm = @length_cm,
        weight_g = @weight_g,
        price = @price,
        stock = @stock,
        image_url = @image_url,
        description = @description,
        updated_at = GETDATE()
      WHERE id = @id
    `);

  return result.rowsAffected[0] > 0;
}

async function remove(id) {
  const result = await getRequest()
    .input('id', sql.Int, id)
    .query('DELETE FROM products WHERE id = @id');

  return result.rowsAffected[0] > 0;
}

async function adjustStock(id, delta) {
  const result = await getRequest()
    .input('id', sql.Int, id)
    .input('delta', sql.Int, delta)
    .query(`
      UPDATE products
      SET stock = stock + @delta, updated_at = GETDATE()
      WHERE id = @id AND stock + @delta >= 0
    `);

  return result.rowsAffected[0] > 0;
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
  adjustStock,
};
