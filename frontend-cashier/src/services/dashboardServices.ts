import api from './axiosInstance';

export const getDashboardSummary = async (range: string = 'today') => {
  const response = await api.get(`/dashboard/summary?range=${range}`);
  return response.data;
};