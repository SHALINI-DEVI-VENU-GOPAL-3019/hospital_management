import API from './api';

export const stockService = {
  async stockIn(data) {
    const response = await API.post('/stock/in', data);
    return response.data;
  },

  async stockOut(data) {
    const response = await API.post('/stock/out', data);
    return response.data;
  },

  async getStockHistory(params = {}) {
    const response = await API.get('/stock/history', { params });
    return response.data;
  },
};

export default stockService;
