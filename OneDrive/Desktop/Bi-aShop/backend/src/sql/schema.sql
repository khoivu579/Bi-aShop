IF DB_ID('BiAShop') IS NULL
BEGIN
  CREATE DATABASE BiAShop;
END
GO

USE BiAShop;
GO

IF OBJECT_ID('dbo.app_users', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.app_users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    full_name NVARCHAR(150) NOT NULL,
    email NVARCHAR(150) NOT NULL UNIQUE,
    password_hash NVARCHAR(255) NOT NULL,
    role NVARCHAR(20) NOT NULL DEFAULT('USER'),
    created_at DATETIME NOT NULL DEFAULT(GETDATE())
  );
END
GO

IF OBJECT_ID('dbo.carts', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.carts (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    created_at DATETIME NOT NULL DEFAULT(GETDATE()),
    updated_at DATETIME NOT NULL DEFAULT(GETDATE()),
    CONSTRAINT FK_carts_users FOREIGN KEY (user_id) REFERENCES dbo.app_users(id)
  );
END
GO

IF OBJECT_ID('dbo.orders', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.orders (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    shipping_address NVARCHAR(300) NOT NULL,
    payment_method NVARCHAR(30) NOT NULL,
    status NVARCHAR(30) NOT NULL DEFAULT('PENDING'),
    created_at DATETIME NOT NULL DEFAULT(GETDATE()),
    CONSTRAINT FK_orders_users FOREIGN KEY (user_id) REFERENCES dbo.app_users(id)
  );
END
GO

IF OBJECT_ID('dbo.payments', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.payments (
    id INT IDENTITY(1,1) PRIMARY KEY,
    order_id INT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    method NVARCHAR(30) NOT NULL,
    status NVARCHAR(30) NOT NULL DEFAULT('PENDING'),
    paid_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT(GETDATE()),
    CONSTRAINT FK_payments_orders FOREIGN KEY (order_id) REFERENCES dbo.orders(id)
  );
END
GO

IF OBJECT_ID('dbo.products', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.products (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(200) NOT NULL,
    brand NVARCHAR(100) NOT NULL,
    material NVARCHAR(100) NULL,
    length_cm DECIMAL(6,2) NULL,
    weight_g DECIMAL(6,2) NULL,
    price DECIMAL(12,2) NOT NULL DEFAULT(0),
    stock INT NOT NULL DEFAULT(0),
    image_url NVARCHAR(500) NULL,
    description NVARCHAR(MAX) NULL,
    created_at DATETIME NOT NULL DEFAULT(GETDATE()),
    updated_at DATETIME NOT NULL DEFAULT(GETDATE())
  );
END
GO

IF OBJECT_ID('dbo.cart_items', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.cart_items (
    id INT IDENTITY(1,1) PRIMARY KEY,
    cart_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    created_at DATETIME NOT NULL DEFAULT(GETDATE()),
    CONSTRAINT UQ_cart_items UNIQUE (cart_id, product_id),
    CONSTRAINT FK_cart_items_carts FOREIGN KEY (cart_id) REFERENCES dbo.carts(id) ON DELETE CASCADE,
    CONSTRAINT FK_cart_items_products FOREIGN KEY (product_id) REFERENCES dbo.products(id)
  );
END
GO

IF OBJECT_ID('dbo.order_items', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.order_items (
    id INT IDENTITY(1,1) PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(12,2) NOT NULL,
    CONSTRAINT FK_order_items_orders FOREIGN KEY (order_id) REFERENCES dbo.orders(id) ON DELETE CASCADE,
    CONSTRAINT FK_order_items_products FOREIGN KEY (product_id) REFERENCES dbo.products(id)
  );
END
GO

UPDATE dbo.orders
SET status = 'PENDING'
WHERE status = 'CONFIRMED';
GO

UPDATE dbo.orders
SET status = 'WAITING_APPROVE'
WHERE status = 'DELIVERED';
GO

UPDATE dbo.orders
SET payment_method = 'BANK'
WHERE payment_method = 'COD';
GO

UPDATE dbo.payments
SET method = 'BANK'
WHERE method = 'COD';
GO

UPDATE dbo.orders
SET payment_method = 'CASH'
WHERE payment_method = 'CARD';
GO

UPDATE dbo.payments
SET method = 'CASH'
WHERE method = 'CARD';
GO

IF NOT EXISTS (SELECT 1 FROM dbo.app_users WHERE email = 'admin@gmail.com')
BEGIN
  INSERT INTO dbo.app_users (full_name, email, password_hash, role)
  VALUES ('System Admin', 'admin@gmail.com', '$2a$10$QV6DW7xr7q37meWYSD9l2.RwgHm1k7HNI5i0vGMmfHLRycjiOdWbK', 'ADMIN');
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.app_users WHERE email = 'user@gmail.com')
BEGIN
  INSERT INTO dbo.app_users (full_name, email, password_hash, role)
  VALUES ('Sample User', 'user@gmail.com', '$2a$10$1a6DmzdpbDuqHkOsyApv9OKh4FPN4dEqlw1P0TgtGVNr0kH04w1i6', 'USER');
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.app_users WHERE email = 'staff@gmail.com')
BEGIN
  INSERT INTO dbo.app_users (full_name, email, password_hash, role)
  VALUES ('Sample Staff', 'staff@gmail.com', '$2a$10$LUkReAGpuPY7jPLb.svhzOrwEp0IAfrm8NibSzQCAkfJlKQoLelx6', 'STAFF');
END
GO

INSERT INTO dbo.products (name, brand, material, length_cm, weight_g, price, stock, image_url, description)
SELECT 'Predator Aspire A1 Cue', 'Predator', 'Maple', 147.00, 560.00, 8900000, 8, 'Predator Aspire A1 Cue.jpg', 'Balanced cue for advanced players'
WHERE NOT EXISTS (SELECT 1 FROM dbo.products WHERE name = 'Predator Aspire A1 Cue');
GO

INSERT INTO dbo.products (name, brand, material, length_cm, weight_g, price, stock, image_url, description)
SELECT 'McDermott G-Core M58', 'McDermott', 'Maple', 148.00, 575.00, 7200000, 12, 'McDermott G-Core M58.jpg', 'Smooth stroke and stable feel'
WHERE NOT EXISTS (SELECT 1 FROM dbo.products WHERE name = 'McDermott G-Core M58');
GO

INSERT INTO dbo.products (name, brand, material, length_cm, weight_g, price, stock, image_url, description)
SELECT 'Cuetec Cynergy SVB', 'Cuetec', 'Carbon Fiber', 147.00, 545.00, 11000000, 6, 'Cuetec Cynergy SVB.png', 'Low deflection carbon shaft'
WHERE NOT EXISTS (SELECT 1 FROM dbo.products WHERE name = 'Cuetec Cynergy SVB');
GO

INSERT INTO dbo.products (name, brand, material, length_cm, weight_g, price, stock, image_url, description)
SELECT 'Mezz EC9-WMR', 'Mezz Cues', 'Rosewood', 148.00, 570.00, 14500000, 4, 'Mezz.jpg', 'Premium Japanese cue with rosewood butt design'
WHERE NOT EXISTS (SELECT 1 FROM dbo.products WHERE name = 'Mezz EC9-WMR');
GO

INSERT INTO dbo.products (name, brand, material, length_cm, weight_g, price, stock, image_url, description)
SELECT 'Peri P20 Limited', 'Peri', 'Maple', 147.00, 555.00, 9800000, 7, 'Peri.jpg', 'Low deflection shaft and smooth finish for stable control'
WHERE NOT EXISTS (SELECT 1 FROM dbo.products WHERE name = 'Peri P20 Limited');
GO
