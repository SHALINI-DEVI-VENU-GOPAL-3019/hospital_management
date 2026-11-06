import API from './api';

export const dashboardService = {
  async getStats() {
    const response = await API.get('/dashboard/stats');
    return response.data;
  },
};

export default dashboardService;
