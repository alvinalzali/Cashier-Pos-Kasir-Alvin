import api from './axiosInstance';

export const getCart = async (userId: number) => {
  const response = await api.get(`/cart/${userId}`);
  return response.data;
};

export const addToCart = async (productId: number, userId: number) => {
  const response = await api.post(`/cart/${productId}`, { userId, qty: 1 });
  return response.data;
};

export const updateCartQty = async (cartId: number, qty: number) => {
  const response = await api.patch(`/cart/${cartId}`, { qty });
  return response.data;
};

export const deleteCartItem = async (cartId: number) => {
  const response = await api.delete(`/cart/${cartId}`);
  return response.data;
};