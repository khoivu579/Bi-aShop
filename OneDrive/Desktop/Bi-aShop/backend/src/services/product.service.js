const productRepository = require('../repositories/product.repository');
const { normalizeProductPayload } = require('../models');

async function getProducts(search) {
  return productRepository.findAll(search);
}

async function getProductById(id) {
  const product = await productRepository.findById(id);
  if (!product) {
    const err = new Error('Product not found');
    err.statusCode = 404;
    throw err;
  }
  return product;
}

async function createProduct(payload) {
  const data = normalizeProductPayload(payload);
  const id = await productRepository.create(data);
  return getProductById(id);
}

async function updateProduct(id, payload) {
  const data = normalizeProductPayload(payload);
  const updated = await productRepository.update(id, data);
  if (!updated) {
    const err = new Error('Product not found');
    err.statusCode = 404;
    throw err;
  }
  return getProductById(id);
}

async function deleteProduct(id) {
  const deleted = await productRepository.remove(id);
  if (!deleted) {
    const err = new Error('Product not found');
    err.statusCode = 404;
    throw err;
  }
  return { message: 'Product deleted successfully' };
}

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
