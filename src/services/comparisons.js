import apiClient from '../lib/apiClient';

/** Map frontend draft shape → API body, omitting null/undefined optional fields. */
function toApiBody(comparisonData) {
  const body = {
    name:        comparisonData.title,
    isPublished: comparisonData.isPublished ?? true,
    itemIds:     (comparisonData.items ?? []).map(i => i.id).filter(Boolean),
    aspects:     (comparisonData.aspects ?? []).map(a => ({
      ...(a.id != null ? { id: a.id } : {}),
      metricName:  a.metric_name,
      weight:      a.weight ?? 1,
      ...(a.description != null ? { description: a.description } : {}),
    })),
  };
  if (comparisonData.description != null) body.description = comparisonData.description;
  if (comparisonData.category_id != null) body.categoryId = comparisonData.category_id;
  if (comparisonData.endDate != null) body.endDate = comparisonData.endDate;
  return body;
}

export const createComparison = async (comparisonData) => {
  const { data } = await apiClient.post('/api/comparisons', toApiBody(comparisonData));
  return data.data;
};

export const updateComparison = async (setId, comparisonData) => {
  const { data } = await apiClient.put(`/api/comparisons/${setId}`, toApiBody(comparisonData));
  return data.data;
};

export const getComparisons = async (categoryId = null) => {
  const { data } = await apiClient.get('/api/comparisons', {
    params: categoryId ? { categoryId } : {},
  });
  return data.data;
};

export const getUserComparisons = async (userId) => {
  const { data } = await apiClient.get(`/api/comparisons/user/${userId}`);
  return data.data;
};

export const getComparison = async (id) => {
  const { data } = await apiClient.get(`/api/comparisons/${id}`);
  return data.data;
};

export const getUnpublishedComparison = async () => {
  try {
    const { data } = await apiClient.get('/api/comparisons/unpublished');
    return data.data;
  } catch (err) {
    if (err.response?.status === 404) return null;
    throw err;
  }
};

export const deleteComparisonSet = async (setId) => {
  await apiClient.delete(`/api/comparisons/${setId}`);
};
