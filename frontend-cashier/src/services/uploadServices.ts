import api from './axiosInstance';

export const uploadProductImage = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/upload/image', formData, { 
        headers: { 'Content-Type': 'multipart/form-data' } 
    });

    // const response = await api.post('/upload/image', formData);

    return response.data;
}