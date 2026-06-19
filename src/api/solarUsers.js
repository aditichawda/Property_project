import axios from 'axios';
import { SOLAR_ENDPOINTS } from '../config/api';

const DEFAULT_PER_PAGE = 20;

/**
 * @param {{ page?: number, perPage?: number, stateId?: string, cityId?: string, solarUserId?: string|null }} opts
 */
export async function fetchSolarUsersList(opts = {}) {
  const {
    page = 1,
    perPage = DEFAULT_PER_PAGE,
    stateId,
    cityId,
    solarUserId,
  } = opts;

  const params = new URLSearchParams();
  params.append('page', String(page));
  params.append('per_page', String(perPage));
  if (stateId) params.append('state_id', String(stateId));
  if (cityId) params.append('city_id', String(cityId));
  if (solarUserId) params.append('property_user_id', String(solarUserId));

  const { data } = await axios.get(`${SOLAR_ENDPOINTS.USERS}?${params.toString()}`);
  return data;
}

/**
 * Fetch a single solar seller/user by solar_user_id (best-effort; backend returns list shapes).
 * @param {string|number} solarUserId
 */
export async function fetchSolarUserById(solarUserId) {
  // Backend filtering by `solar_user_id` can vary; fetch a page and search for an exact match.
  const target = String(solarUserId);
  const raw = await fetchSolarUsersList({ page: 1, perPage: 50, solarUserId: target });
  const { items } = parseSolarUsersResponse(raw, 1, 50);
  if (items.length === 0) return null;
  const found =
    items.find((x) => String(x?.solar_user_id ?? x?.id ?? x?.user_id ?? '') === target) ||
    // If backend already filtered, first item is likely the match.
    items[0];
  return found || null;
}

export async function fetchSolarUserDetailRaw(solarUserId) {
  const fd = new FormData();
  fd.append('property_user_id', String(solarUserId));
  const { data } = await axios.post(SOLAR_ENDPOINTS.DETAIL, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  if (data?.success && data.data) return data.data;
  return null;
}

/**
 * Normalize various Laravel / custom shapes into { items, hasMore, nextPage }
 */
export function parseSolarUsersResponse(apiData, page, perPage) {
  const root = apiData?.data;
  let items = [];
  let hasMore = false;
  let nextPage = page + 1;

  if (Array.isArray(root)) {
    items = root;
    hasMore = items.length >= perPage;
  } else if (root && typeof root === 'object') {
    if (Array.isArray(root.data)) {
      items = root.data;
      const last = root.last_page ?? root.lastPage;
      const cur = root.current_page ?? root.currentPage ?? page;
      nextPage = cur + 1;
      hasMore = last != null ? cur < last : items.length >= perPage;
    } else if (Array.isArray(root.users)) {
      items = root.users;
      hasMore = items.length >= perPage;
    } else if (Array.isArray(root.items)) {
      items = root.items;
      hasMore = items.length >= perPage;
    }
  }

  return { items, hasMore, nextPage };
}

export function parseSolarUsersPagination(apiData, page = 1, perPage = DEFAULT_PER_PAGE) {
  const root = apiData?.data;
  const meta = root && !Array.isArray(root) && Array.isArray(root.data) ? root : apiData;
  const total = Number(meta?.total || 0);
  const lastPage = Number(
    meta?.last_page ||
      meta?.lastPage ||
      (total ? Math.ceil(total / perPage) : 1),
  );
  return {
    currentPage: Number(meta?.current_page || meta?.currentPage || page),
    perPage: Number(meta?.per_page || meta?.perPage || perPage),
    total,
    lastPage: lastPage || 1,
  };
}

const PARTNER_IMAGES = [
  require('../images/solar/banner3.jpg'),
  require('../images/solar/partner-02.jpg'),
  require('../images/solar/partner-03.jpg'),
  require('../images/solar/partner-04.jpg'),
  require('../images/solar/partner-05.jpg'),
  require('../images/solar/partner-06.jpg'),
  require('../images/solar/partner-07.jpg'),
  require('../images/solar/partner-08.jpg'),
];
const DEFAULT_SELLER_IMAGE = PARTNER_IMAGES[0];

function normalizeImageUrl(value) {
  const text = String(value || '').trim();
  if (!text) return '';
  if (/^(https?:)?\/\//i.test(text) || text.startsWith('data:')) return text;
  const cleanPath = text.startsWith('/') ? text : `/${text}`;
  return `https://www.admin.infrioindia.com${cleanPath}`;
}

export function mapApiSellerToCard(raw, index = 0) {
  const id =
    raw.solar_user_id ??
    raw.id ??
    raw.user_id ??
    `seller-${index}`;
  const city =
    raw.city_name ??
    raw.city ??
    '';
  const state =
    raw.state_name ??
    raw.state ??
    '';
  const location = [city, state].filter(Boolean).join(', ') || '—';
  const profileImage = normalizeImageUrl(
    raw.profileImage ||
      raw.profile_image_url ||
      raw.profile_image ||
      raw.image_url ||
      raw.image ||
      raw.photo_url ||
      raw.photo ||
      raw.avatar ||
      raw.logo,
  );
  const img = profileImage || DEFAULT_SELLER_IMAGE;

  return {
    id: String(id),
    image: img,
    fallbackImage: DEFAULT_SELLER_IMAGE,
    membername: raw.fullName || raw.full_name || raw.name || raw.company_name || raw.business_name || 'Property partner',
    activeproperty: raw.active_property_count > 0 ? `${raw.active_property_count} active properties` : ' ',
    rating: Number(raw.rating) || 5,
    description:
      raw.description ||
      raw.bio ||
      raw.about ||
      raw.address ||
      'Trusted Infrio property partner.',
    location,
  };
}
