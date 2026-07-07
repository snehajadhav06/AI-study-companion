import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export const authService = {
  async login(email, password) {
    const params = new URLSearchParams();
    params.append('username', email);
    params.append('password', password);

    const response = await axios.post(`${API_URL}/auth/login`, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    return response.data;
  },

  async register(email, password, fullName) {
    const response = await axios.post(`${API_URL}/auth/register`, {
      email,
      password,
      full_name: fullName
    });
    return response.data;
  },

  async getCurrentUser(token) {
    const response = await axios.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};

export default authService;
