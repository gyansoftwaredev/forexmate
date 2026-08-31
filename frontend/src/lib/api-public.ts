import axios from 'axios';

const rawUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const PUBLIC_API_URL = rawUrl.endsWith('/api/v1') ? rawUrl.slice(0, -7) : rawUrl;

/**
 * Public API Client (No Authentication Required)
 */
export const publicApi = axios.create({
  baseURL: `${PUBLIC_API_URL}/api/v1/public`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getLiveRates = async () => {
  const res = await publicApi.get('/rates');
  return res.data?.data || res.data;
};

export const getActiveBranches = async (city?: string) => {
  const params = city ? { city } : {};
  const res = await publicApi.get('/branches', { params });
  return res.data?.data || res.data;
};

export const getActiveCities = async () => {
  const res = await publicApi.get('/cities');
  return res.data?.data || res.data;
};

export const getTestimonials = async () => {
  const res = await publicApi.get('/testimonials');
  return res.data?.data || res.data;
};

