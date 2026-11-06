import API from './api';

export const authService = {
  async register(userData) {
    const response = await API.post('/auth/register', userData);
    return response.data;
  },

  async login(credentials) {
    const response = await API.post('/auth/login', credentials);
    return response.data;
  },

  async getProfile() {
    const response = await API.get('/auth/profile');
    return response.data;
  },

  logout() {
    localStorage.removeItem('hospital_token');
    localStorage.removeItem('hospital_user');
  },
};

export default authService;
