import api from './axiosInstance';

export const checkout = async (transactionData: any) => {
  const response = await api.post('/transaction', transactionData);
  return response.data;
};

export const getAllTransactions = async () => {
  const response = await api.get('/transaction');
  return response.data;
};

export const getTransactionById = async (id: number) => {
  const response = await api.get(`/transaction/${id}`);
  return response.data;
};