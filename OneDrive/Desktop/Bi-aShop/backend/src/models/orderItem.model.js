class OrderItem {
  constructor({ id = null, orderId = null, productId = null, quantity = 0, unitPrice = 0 } = {}) {
    this.id = id;
    this.orderId = orderId;
    this.productId = productId;
    this.quantity = quantity;
    this.unitPrice = unitPrice;
  }

  static fromDbRow(row = {}) {
    return new OrderItem({
      id: row.id,
      orderId: row.order_id,
      productId: row.product_id,
      quantity: row.quantity,
      unitPrice: row.unit_price,
    });
  }
}

function calculateOrderTotal(items = []) {
  return items.reduce((sum, item) => sum + Number(item.price || item.unit_price || item.unitPrice || 0) * Number(item.quantity || 0), 0);
}

module.exports = {
  OrderItem,
  calculateOrderTotal,
};
