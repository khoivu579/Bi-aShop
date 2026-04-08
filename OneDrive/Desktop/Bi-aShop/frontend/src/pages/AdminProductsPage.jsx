import { useEffect, useState } from 'react';
import { createProduct, deleteProduct, getProducts, updateProduct } from '../services/productApi';
import { createUser, deleteUser, getUsers, updateUser } from '../services/userApi';
import { useAuth } from '../context/AuthContext';

const initialForm = {
  id: null,
  name: '',
  brand: '',
  material: '',
  lengthCm: '',
  weightG: '',
  price: '',
  stock: '',
  imageUrl: '',
  description: '',
};

const initialUserForm = {
  id: null,
  fullName: '',
  email: '',
  role: 'USER',
  password: '',
};

function normalizeForm(form) {
  return {
    name: form.name,
    brand: form.brand,
    material: form.material || null,
    lengthCm: form.lengthCm ? Number(form.lengthCm) : null,
    weightG: form.weightG ? Number(form.weightG) : null,
    price: Number(form.price || 0),
    stock: Number(form.stock || 0),
    imageUrl: form.imageUrl || null,
    description: form.description || null,
  };
}

function AdminProductsPage() {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [userForm, setUserForm] = useState(initialUserForm);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function loadProducts() {
    const data = await getProducts();
    setProducts(data);
  }

  async function loadUsers() {
    const data = await getUsers(token);
    setUsers(data);
  }

  async function loadData() {
    try {
      setError('');
      await Promise.all([loadProducts(), loadUsers()]);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleUserChange(event) {
    const { name, value } = event.target;
    setUserForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleEdit(product) {
    setForm({
      id: product.id,
      name: product.name,
      brand: product.brand,
      material: product.material || '',
      lengthCm: product.length_cm || '',
      weightG: product.weight_g || '',
      price: product.price,
      stock: product.stock,
      imageUrl: product.image_url || '',
      description: product.description || '',
    });
  }

  function resetForm() {
    setForm(initialForm);
  }

  function resetUserForm() {
    setUserForm(initialUserForm);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      if (form.id) {
        await updateProduct(form.id, normalizeForm(form), token);
        setMessage('Product updated');
      } else {
        await createProduct(normalizeForm(form), token);
        setMessage('Product created');
      }
      resetForm();
      loadProducts();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this product?')) return;
    setError('');
    try {
      await deleteProduct(id, token);
      loadProducts();
    } catch (err) {
      setError(err.message);
    }
  }

  function handleEditUser(user) {
    setUserForm({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      password: '',
    });
  }

  async function handleSubmitUser(event) {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      if (userForm.id) {
        await updateUser(userForm.id, userForm, token);
        setMessage('Account updated');
      } else {
        await createUser(userForm, token);
        setMessage('Account created');
      }
      resetUserForm();
      loadUsers();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteUser(id) {
    if (!window.confirm('Delete this account?')) return;
    setError('');
    try {
      await deleteUser(id, token);
      loadUsers();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <>
      <section className="panel">
        <h2>Admin Product CRUD</h2>
        {error ? <p className="error">{error}</p> : null}
        {message ? <p className="success">{message}</p> : null}

        <form className="product-form" onSubmit={handleSubmit}>
          <label>Name<input name="name" value={form.name} onChange={handleChange} required /></label>
          <label>Brand<input name="brand" value={form.brand} onChange={handleChange} required /></label>
          <label>Material<input name="material" value={form.material} onChange={handleChange} /></label>
          <label>Length<input name="lengthCm" type="number" value={form.lengthCm} onChange={handleChange} /></label>
          <label>Weight<input name="weightG" type="number" value={form.weightG} onChange={handleChange} /></label>
          <label>Price<input name="price" type="number" min="0" value={form.price} onChange={handleChange} required /></label>
          <label>Stock<input name="stock" type="number" min="0" value={form.stock} onChange={handleChange} required /></label>
          <label>
            Image (URL hoặc tên file trong backend/src/upload)
            <input name="imageUrl" value={form.imageUrl} onChange={handleChange} placeholder="Predator Aspire A1 Cue.jpg" />
          </label>
          <label>Description<textarea name="description" rows="3" value={form.description} onChange={handleChange} /></label>
          <div className="action-row">
            <button type="submit">{form.id ? 'Update Product' : 'Create Product'}</button>
            {form.id ? <button type="button" className="secondary" onClick={resetForm}>Cancel Edit</button> : null}
          </div>
        </form>
      </section>

      <section className="panel">
        <h2>Products</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Brand</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td>{product.name}</td>
                  <td>{product.brand}</td>
                  <td>{Number(product.price).toLocaleString('vi-VN')}</td>
                  <td>{product.stock}</td>
                  <td>
                    <div className="action-row">
                      <button type="button" className="secondary" onClick={() => handleEdit(product)}>Edit</button>
                      <button type="button" className="danger" onClick={() => handleDelete(product.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel">
        <h2>Admin Account CRUD</h2>
        <form className="product-form" onSubmit={handleSubmitUser}>
          <label>Full Name<input name="fullName" value={userForm.fullName} onChange={handleUserChange} required /></label>
          <label>Email<input name="email" type="email" value={userForm.email} onChange={handleUserChange} required /></label>
          <label>
            Role
            <select name="role" value={userForm.role} onChange={handleUserChange}>
              <option value="USER">USER</option>
              <option value="STAFF">STAFF</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </label>
          <label>
            Password {userForm.id ? '(optional when update)' : ''}
            <input name="password" type="password" value={userForm.password} onChange={handleUserChange} required={!userForm.id} />
          </label>
          <div className="action-row">
            <button type="submit">{userForm.id ? 'Update Account' : 'Create Account'}</button>
            {userForm.id ? <button type="button" className="secondary" onClick={resetUserForm}>Cancel Edit</button> : null}
          </div>
        </form>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.fullName}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    <div className="action-row">
                      <button type="button" className="secondary" onClick={() => handleEditUser(user)}>Edit</button>
                      <button type="button" className="danger" onClick={() => handleDeleteUser(user.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

export default AdminProductsPage;
