import { apiClient } from './client';

export async function listCompetitions() {
  const { data } = await apiClient.get('/competitions');
  return data;
}

export async function fetchCompetition(id) {
  const { data } = await apiClient.get(`/competitions/${id}`);
  return data;
}

export async function registerForCompetition(id, payload = {}) {
  const { data } = await apiClient.post(`/competitions/${id}/register`, payload);
  return data;
}

export async function uploadSubmission(id, file) {
  const form = new FormData();

  if (file.file instanceof Blob || (typeof File !== 'undefined' && file.file instanceof File)) {
    form.append('file', file.file, file.name || 'submission');
  } else if (file.file) {
    form.append('file', file.file);
  } else {
    form.append('file', {
      uri: file.uri,
      name: file.name || 'submission',
      type: file.mimeType || file.type || 'application/octet-stream',
    });
  }

  const { data } = await apiClient.post(`/competitions/${id}/submissions`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}
