import API from './api';

export const reportService = {
  async getInventoryReport(params = {}) {
    const response = await API.get('/reports/inventory', { params });
    return response.data;
  },

  async getLowStockReport() {
    const response = await API.get('/reports/low-stock');
    return response.data;
  },

  async getExpiredReport(days = 60) {
    const response = await API.get('/reports/expired', { params: { days } });
    return response.data;
  },

  async getTransactionReport(params = {}) {
    const response = await API.get('/reports/transactions', { params });
    return response.data;
  },
};

export default reportService;
