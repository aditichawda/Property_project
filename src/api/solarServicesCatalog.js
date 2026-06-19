import axios from 'axios';
import { SOLAR_ENDPOINTS } from '../config/api';
import { stripHtml } from '../utils/stripHtml';

const FALLBACK_IMAGES = [
  require('../images/solar/sol-residential.jpg'),
  require('../images/solar/sol-commercial.jpg'),
  require('../images/solar/sol-maintenance.jpg'),
  require('../images/solar/sol-battery.jpg'),
];

/**
 * Public catalog — GET with optional location filters.
 * Backend may return the full list; use client-side pagination in the UI if needed.
 */
export async function fetchSolarServicesCatalog({ stateId, cityId } = {}) {
  const params = new URLSearchParams();
  if (stateId) params.append('state_id', String(stateId));
  if (cityId) params.append('city_id', String(cityId));
  const q = params.toString();
  const url = q ? `${SOLAR_ENDPOINTS.SERVICES_CATALOG}?${q}` : SOLAR_ENDPOINTS.SERVICES_CATALOG;
  const { data } = await axios.get(url);
  return data;
}

export function parseSolarServicesCatalogResponse(apiData) {
  const root = apiData?.data;
  const items = Array.isArray(root) ? root : [];
  return { items, ok: !!apiData?.success };
}

/**
 * Shape expected by {@link SolutionsGrid} in WhatWeDo1.
 */
export function mapApiServiceToSolutionItem(raw, index = 0) {
  if (!raw) return null;
  const id = raw.id ?? raw.service_id;
  const sellerId = raw.solar_user_id ?? raw.seller_id;
  const thumb =
    (typeof raw.thumbnail_url === 'string' && raw.thumbnail_url) ||
    (Array.isArray(raw.service_image_urls) && raw.service_image_urls[0]) ||
    null;
  const img = thumb || FALLBACK_IMAGES[Math.abs(Number(id) || index) % FALLBACK_IMAGES.length];
  const plainDesc = stripHtml(raw.description || '');
  const city = raw.city_name || raw.city || '';
  const state = raw.state_name || raw.state || '';
  const locationLine = [city, state].filter(Boolean).join(', ');
  const category = String(raw.solar_service_category_name || '').trim();

  return {
    id: `svc-${id}`,
    serviceId: id,
    sellerId: sellerId != null ? String(sellerId) : '',
    title: String(raw.title || 'Solar service').trim() || 'Solar service',
    vendorName: category || locationLine || 'Solar service',
    image: img,
    short: plainDesc.slice(0, 180),
    description: plainDesc,
    href: sellerId != null && id != null ? `/properties/${sellerId}/services/${id}` : '/services',
  };
}
