import API from './api';

export const productService = {
  async getProducts(params = {}) {
    const response = await API.get('/products', { params });
    return response.data;
  },

  async getProductById(id) {
    const response = await API.get(`/products/${id}`);
    return response.data;
  },

  async createProduct(productData) {
    const response = await API.post('/products', productData);
    return response.data;
  },

  async updateProduct(id, productData) {
    const response = await API.put(`/products/${id}`, productData);
    return response.data;
  },

  async deleteProduct(id) {
    const response = await API.delete(`/products/${id}`);
    return response.data;
  },
};

export default productService;
