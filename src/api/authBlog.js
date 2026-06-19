import axios from 'axios';
import { AUTH_ENDPOINTS } from '../config/api';

export async function fetchAuthBlogList() {
  const { data } = await axios.get(AUTH_ENDPOINTS.BLOG_LIST);
  return data;
}

export function parseAuthBlogListResponse(json) {
  const ok = json?.success === true || json?.status === true;
  const items = Array.isArray(json?.data) ? json.data : [];
  return { ok, items };
}

/**
 * Legacy auth detail API — JSON body `{ id }`.
 * @param {string|number} blogId
 */
export async function fetchAuthBlogDetail(blogId) {
  const { data } = await axios.post(AUTH_ENDPOINTS.BLOG_DETAILS, { id: blogId }, {
    headers: { 'Content-Type': 'application/json' },
  });
  return data;
}
