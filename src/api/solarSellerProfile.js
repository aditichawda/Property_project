import axios from 'axios';
import { SOLAR_ENDPOINTS } from '../config/api';
import {
  extractPermissionNames,
  hasPermissionPayload,
} from '../utils/sellerPermissions';

function firstFilled(...values) {
  return values.find(
    (value) => value !== undefined && value !== null && String(value).trim() !== '',
  ) || '';
}

function unwrapStaffDetailPayload(detail) {
  if (!detail || typeof detail !== 'object') return detail || {};
  const nested =
    detail.staff ||
    detail.user ||
    detail.solar_user ||
    detail.solarUser ||
    detail.staff_detail ||
    detail.staffDetail ||
    detail.solar_staff ||
    detail.solarStaff ||
    detail.profile ||
    detail.detail ||
    detail.data;
  return nested && nested !== detail
    ? unwrapStaffDetailPayload(Array.isArray(nested) ? nested[0] : nested)
    : detail;
}

/** Normalize `/solar/detail` (or update `data`) for UI + localStorage */
export function mapSolarUserToSeller(d) {
  if (!d) return null;
  const permissionSources = [
    d.permissions,
    d.staffPermissions,
    d.staff_permissions,
    d.role?.permissions,
    d.role_permissions,
    d.privileges,
  ].filter(Boolean);
  const permissions = permissionSources.flatMap((source) =>
    Array.isArray(source) ? source : [source],
  );
  return {
    id: d.solar_user_id ?? d.id,
    status: d.status,
    fullName: d.full_name ?? d.name ?? '',
    phone: String(d.phone_number ?? d.phone ?? '').replace(/\D/g, ''),
    email: d.email ?? '',
    profileImage: d.profile_image || d.profile_image_url || d.image || d.image_url || '',
    address: d.address ?? '',
    state: d.state_name ?? d.state ?? '',
    city: d.city_name ?? d.city ?? '',
    stateId: d.state_id != null ? String(d.state_id) : '',
    cityId: d.city_id != null ? String(d.city_id) : '',
    accessToken: d.access_token,
    refreshToken: d.refresh_token,
    roleName: d.role_name || d.role || "",
    hasApiPermissions:
      hasPermissionPayload(d) ||
      (d.role && hasPermissionPayload(d.role)) ||
      permissionSources.length > 0,
    permissions,
    staffPermissions: extractPermissionNames(permissions),
  };
}

export async function fetchSolarUserDetail(solarUserId) {
  const fd = new FormData();
  fd.append('property_user_id', String(solarUserId));
  const { data } = await axios.post(SOLAR_ENDPOINTS.DETAIL, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  const rawDetail = Array.isArray(data?.data) ? data.data[0] : data?.data;
  const requestSucceeded =
    data?.success === true ||
    data?.status === true ||
    data?.success === 1 ||
    data?.status === 1;
  if (requestSucceeded && rawDetail) {
    return mapSolarUserToSeller(rawDetail);
  }
  const msg =
    typeof data?.message === 'string'
      ? data.message
      : 'Could not load seller details.';
  throw new Error(msg);
}

export async function fetchSolarStaffDetail(staffId) {
  const fd = new FormData();
  fd.append('solar_user_id', String(staffId));
  const { data } = await axios.post(SOLAR_ENDPOINTS.STAFF_PROFILE_DETAIL, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  const rawResponseDetail =
    data?.data ?? data?.staff ?? data?.user ?? data?.detail ?? null;
  if ((data?.success || data?.status) && rawResponseDetail) {
    const rawDetail = Array.isArray(rawResponseDetail)
      ? rawResponseDetail[0]
      : rawResponseDetail;
    const detail = unwrapStaffDetailPayload(rawDetail);
    const roleObj = detail?.role && typeof detail.role === 'object' ? detail.role : null;
    const stateObj = detail?.state && typeof detail.state === 'object' ? detail.state : null;
    const cityObj = detail?.city && typeof detail.city === 'object' ? detail.city : null;
    const mapped = mapSolarUserToSeller(detail);
    return {
      ...mapped,
      id: firstFilled(detail?.seller_id, detail?.solar_user_id, detail?.seller?.id, mapped?.id),
      staffId: firstFilled(detail?.id, detail?.staff_id, staffId),
      isStaff: true,
      type: 'staff',
      user_type: 'staff',
      fullName: firstFilled(detail?.full_name, detail?.name, detail?.staff_name, mapped?.fullName),
      name: firstFilled(detail?.name, detail?.full_name, detail?.staff_name, mapped?.fullName),
      phone: String(firstFilled(detail?.phone_number, detail?.phone, mapped?.phone)).replace(/\D/g, ''),
      email: firstFilled(detail?.email, mapped?.email),
      address: firstFilled(detail?.address, mapped?.address),
      state: firstFilled(detail?.state_name, stateObj?.name, mapped?.state),
      city: firstFilled(detail?.city_name, cityObj?.name, mapped?.city),
      stateId: firstFilled(detail?.state_id, stateObj?.id, mapped?.stateId),
      cityId: firstFilled(detail?.city_id, cityObj?.id, mapped?.cityId),
      profileImage: firstFilled(detail?.profile_image, detail?.profile_image_url, detail?.image, detail?.image_url, mapped?.profileImage),
      sellerId: firstFilled(detail?.seller_id, detail?.solar_user_id, detail?.seller?.id, mapped?.sellerId),
      roleId: firstFilled(detail?.role_id, roleObj?.id, mapped?.roleId),
      roleName:
        firstFilled(detail?.role_name, roleObj?.name, roleObj?.role_name, detail?.role, mapped?.roleName),
      permissions:
        Array.isArray(detail?.permissions) && detail.permissions.length
          ? detail.permissions
          : mapped?.permissions || [],
      staffPermissions:
        extractPermissionNames(detail?.permissions).length
          ? extractPermissionNames(detail?.permissions)
          : mapped?.staffPermissions || [],
      hasApiPermissions:
        hasPermissionPayload(detail) || mapped?.hasApiPermissions,
    };
  }
  const msg =
    typeof data?.message === "string"
      ? data.message
      : "Could not load staff details.";
  throw new Error(msg);
}

export async function updateSolarUserProfile({
  solarUserId,
  full_name,
  phone_number,
  address,
  state_id,
  city_id,
}) {
  const fd = new FormData();
  fd.append('property_user_id', String(solarUserId));
  fd.append('full_name', String(full_name || '').trim());
  fd.append('phone_number', String(phone_number || '').replace(/\D/g, ''));
  fd.append('address', String(address || '').trim());
  fd.append('state_id', String(state_id));
  fd.append('city_id', String(city_id));
  const { data } = await axios.post(SOLAR_ENDPOINTS.UPDATE, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function updateSolarProfileImage({ solarUserId, file }) {
  const fd = new FormData();
  fd.append('property_user_id', String(solarUserId));
  fd.append('profile_image', file);
  const { data } = await axios.post(SOLAR_ENDPOINTS.PROFILE_UPDATE, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function updateSolarStaffProfileImage({ staffId, file }) {
  const fd = new FormData();
  fd.append('staff_id', String(staffId));
  fd.append('profile_image', file);
  const { data } = await axios.post(SOLAR_ENDPOINTS.STAFF_PROFILE_UPDATE, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

/** Merge into existing sellerInfo in localStorage (keeps tokens, etc.) */
export function persistSellerInfoFromApi(mapped) {
  if (typeof window === 'undefined' || !mapped) return;
  let prev = {};
  try {
    prev = JSON.parse(localStorage.getItem('sellerInfo') || '{}') || {};
  } catch {
    prev = {};
  }
  const mappedPermissions = Array.isArray(mapped.permissions)
    ? mapped.permissions
    : null;
  const mappedStaffPermissions = Array.isArray(mapped.staffPermissions)
    ? mapped.staffPermissions
    : null;
  const filledMapped = Object.entries(mapped).reduce((acc, [key, value]) => {
    if (value === undefined || value === null) return acc;
    if (typeof value === 'string' && value.trim() === '') return acc;
    acc[key] = value;
    return acc;
  }, {});
  const next = {
    ...prev,
    ...filledMapped,
    id: filledMapped.id ?? prev.id,
    permissions:
      mappedPermissions && mappedPermissions.length
        ? mappedPermissions
        : prev.permissions || [],
    staffPermissions:
      mappedStaffPermissions && mappedStaffPermissions.length
        ? mappedStaffPermissions
        : prev.staffPermissions || [],
    hasApiPermissions:
      mapped.hasApiPermissions || prev.hasApiPermissions || false,
  };
  localStorage.setItem('sellerInfo', JSON.stringify(next));
  window.dispatchEvent(new Event('seller-info-updated'));
}
