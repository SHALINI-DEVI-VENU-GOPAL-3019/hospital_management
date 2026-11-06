import API from './api';

export const supplierService = {
  async getSuppliers(params = {}) {
    const response = await API.get('/suppliers', { params });
    return response.data;
  },

  async getSupplierById(id) {
    const response = await API.get(`/suppliers/${id}`);
    return response.data;
  },

  async createSupplier(data) {
    const response = await API.post('/suppliers', data);
    return response.data;
  },

  async updateSupplier(id, data) {
    const response = await API.put(`/suppliers/${id}`, data);
    return response.data;
  },

  async deleteSupplier(id) {
    const response = await API.delete(`/suppliers/${id}`);
    return response.data;
  },
};

export default supplierService;
