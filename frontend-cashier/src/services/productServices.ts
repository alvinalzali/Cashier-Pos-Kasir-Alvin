import api from './axiosInstance';

export const getAllProducts = async () => {
    const response = await api.get('/product');
    return response.data;
};

export const searchProduct = async (name: string) => {
    const response = await api.get(`/product/search/${name}`);
    return response.data;
}

export const createProduct = async (productData: any) => {
    const response = await api.post('/product/add', productData);
    return response.data;  
}

export const updateProduct = async (id: number, productData: any) => {
    const response = await api.patch(`/product/${id}`, productData);
    return response.data;
}

export const deleteProduct = async (id: number) => {
    const response = await api.delete(`/product/${id}`);
    return response.data;
}

