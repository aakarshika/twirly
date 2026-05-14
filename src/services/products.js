import apiClient from '../lib/apiClient';

export const getProduct = async (productId) => {
  const { data } = await apiClient.get(`/api/products/${productId}`);
  return data.data;
};

export const getUserProducts = async (userId) => {
  const { data } = await apiClient.get(`/api/products/user/${userId}`);
  return data.data;
};

export const searchProducts = async (query, limit = 10) => {
  if (!query?.trim()) return [];
  const { data } = await apiClient.get('/api/products/search', { params: { q: query, limit } });
  return data.data;
};

export const createProduct = async (productData, _userId) => {
  const { data } = await apiClient.post('/api/products', {
    name:            productData.name,
    description:     productData.description,
    imageUrl:        productData.image_url,
    itemColorString: productData.item_color_string,
    categoryIds:     productData.category_ids ?? [],
  });
  // normalize response back to snake_case shape the UI expects
  const p = data.data;
  return { ...p, image_url: p.image_url, item_color_string: p.item_color_string };
};

export const updateProduct = async (productId, productData, _userId) => {
  const { data } = await apiClient.put(`/api/products/${productId}`, {
    name:            productData.name,
    description:     productData.description,
    imageUrl:        productData.image_url,
    itemColorString: productData.item_color_string,
    categoryIds:     productData.category_ids,
  });
  const p = data.data;
  return { ...p, image_url: p.image_url, item_color_string: p.item_color_string };
};

export const deleteProduct = async (productId) => {
  await apiClient.delete(`/api/products/${productId}`);
};

export const searchCategories = async (query = '', limit = 20) => {
  const { data } = await apiClient.get('/api/categories', {
    params: { q: query || undefined, limit },
  });
  return data.data;
};

export const createCategory = async (name) => {
  const { data } = await apiClient.post('/api/categories', { name });
  return data.data;
};
