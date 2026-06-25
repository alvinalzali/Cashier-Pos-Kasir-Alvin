import api from './axiosInstance';

export const login = async (credentials: any) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const logout = () => {
    import('js-cookie').then((Cookies) => {
        Cookies.default.remove('token');
    });
};

export const register = async (userData: any) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};