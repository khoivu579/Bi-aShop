class Product {
  constructor({
    id = null,
    name = '',
    brand = '',
    material = null,
    lengthCm = null,
    weightG = null,
    price = 0,
    stock = 0,
    imageUrl = null,
    description = null,
    createdAt = null,
    updatedAt = null,
  } = {}) {
    this.id = id;
    this.name = name;
    this.brand = brand;
    this.material = material;
    this.lengthCm = lengthCm;
    this.weightG = weightG;
    this.price = price;
    this.stock = stock;
    this.imageUrl = imageUrl;
    this.description = description;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static fromDbRow(row = {}) {
    return new Product({
      id: row.id,
      name: row.name,
      brand: row.brand,
      material: row.material,
      lengthCm: row.length_cm,
      weightG: row.weight_g,
      price: row.price,
      stock: row.stock,
      imageUrl: row.image_url,
      description: row.description,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }
}

function normalizeNumber(value, fieldName) {
  const numberValue = Number(value);
  if (Number.isNaN(numberValue)) {
    const err = new Error(`${fieldName} must be a valid number`);
    err.statusCode = 400;
    throw err;
  }
  return numberValue;
}

function normalizeProductPayload(payload = {}) {
  if (!payload.name || !payload.brand) {
    const err = new Error('name and brand are required');
    err.statusCode = 400;
    throw err;
  }

  return {
    name: String(payload.name).trim(),
    brand: String(payload.brand).trim(),
    material: payload.material ? String(payload.material).trim() : null,
    lengthCm: payload.lengthCm != null ? normalizeNumber(payload.lengthCm, 'lengthCm') : null,
    weightG: payload.weightG != null ? normalizeNumber(payload.weightG, 'weightG') : null,
    price: normalizeNumber(payload.price ?? 0, 'price'),
    stock: Math.max(0, Math.floor(normalizeNumber(payload.stock ?? 0, 'stock'))),
    imageUrl: payload.imageUrl ? String(payload.imageUrl).trim() : null,
    description: payload.description ? String(payload.description).trim() : null,
  };
}

module.exports = {
  Product,
  normalizeProductPayload,
};
