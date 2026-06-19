import { SOLAR_ENDPOINTS } from '../config/api';
import {
  extractPermissionNames,
  hasPermissionPayload,
} from '../utils/sellerPermissions';

function getFirstValue(...values) {
  return values.find(
    (value) => value !== undefined && value !== null && String(value).trim() !== '',
  ) || '';
}

function unwrapStaffPayload(row) {
  if (!row || typeof row !== 'object') return row || {};
  return row.staff || row.user || row.solar_staff || row.solarStaff || row;
}

function mapStaffRow(row, roleNameById) {
  const staff = unwrapStaffPayload(row);
  const roleObj = staff?.role && typeof staff.role === 'object' ? staff.role : null;
  const stateObj = staff?.state && typeof staff.state === 'object' ? staff.state : null;
  const cityObj = staff?.city && typeof staff.city === 'object' ? staff.city : null;
  const roleId = getFirstValue(staff?.role_id, roleObj?.id);
  return {
    id: staff?.id,
    sellerId: getFirstValue(staff?.seller_id, staff?.solar_user_id, staff?.seller?.id),
    name: getFirstValue(staff?.name, staff?.full_name, staff?.staff_name),
    phone: getFirstValue(staff?.phone, staff?.phone_number),
    email: staff?.email || '',
    address: staff?.address || '',
    state: getFirstValue(staff?.state_name, stateObj?.name, staff?.state),
    city: getFirstValue(staff?.city_name, cityObj?.name, staff?.city),
    stateId: getFirstValue(staff?.state_id, stateObj?.id),
    cityId: getFirstValue(staff?.city_id, cityObj?.id),
    roleId,
    roleName: getFirstValue(staff?.role_name, roleObj?.name, roleObj?.role_name, staff?.role),
    role: getFirstValue(staff?.role, staff?.role_name, roleObj?.name, roleNameById[roleId]),
    status: staff?.status != null ? Number(staff.status) : 0,
    createdAt: staff?.created_at || '',
  };
}

export function mapStaffDetail(row, roleNameById = {}) {
  const staff = unwrapStaffPayload(row);
  const roleObj = staff?.role && typeof staff.role === 'object' ? staff.role : null;
  const stateObj = staff?.state && typeof staff.state === 'object' ? staff.state : null;
  const cityObj = staff?.city && typeof staff.city === 'object' ? staff.city : null;
  const roleId = getFirstValue(staff?.role_id, roleObj?.id);
  const permissionSources = [
    staff?.permissions,
    staff?.staffPermissions,
    staff?.staff_permissions,
    roleObj?.permissions,
    staff?.role_permissions,
    staff?.privileges,
  ].filter(Boolean);
  const permissions = permissionSources.flatMap((source) =>
    Array.isArray(source) ? source : [source],
  );
  return {
    id: staff?.id,
    sellerId: getFirstValue(staff?.seller_id, staff?.solar_user_id, staff?.seller?.id),
    name: getFirstValue(staff?.name, staff?.full_name, staff?.staff_name),
    fullName: getFirstValue(staff?.full_name, staff?.name, staff?.staff_name),
    phone: getFirstValue(staff?.phone, staff?.phone_number),
    email: staff?.email || '',
    address: staff?.address || '',
    state: getFirstValue(staff?.state_name, stateObj?.name, staff?.state),
    city: getFirstValue(staff?.city_name, cityObj?.name, staff?.city),
    stateId: getFirstValue(staff?.state_id, stateObj?.id),
    cityId: getFirstValue(staff?.city_id, cityObj?.id),
    profileImage: getFirstValue(staff?.profile_image, staff?.profile_image_url, staff?.image, staff?.image_url),
    roleId,
    roleName: getFirstValue(staff?.role_name, roleObj?.name, roleObj?.role_name, staff?.role),
    role: getFirstValue(staff?.role, staff?.role_name, roleObj?.name, roleNameById[roleId]),
    permissions,
    staffPermissions: extractPermissionNames(permissions),
    hasApiPermissions:
      hasPermissionPayload(staff) ||
      (roleObj && hasPermissionPayload(roleObj)) ||
      permissionSources.length > 0,
    createdAt: staff?.created_at || '',
  };
}

export async function fetchSolarStaffAll(sellerId, roleNameById = {}) {
  const fd = new FormData();
  fd.append('seller_id', String(sellerId || ''));

  const response = await fetch(SOLAR_ENDPOINTS.STAFF_ALL, {
    method: 'POST',
    body: fd,
  });
  const result = await response.json();
  if (!(response.ok && result?.status)) {
    throw new Error(result?.message || 'Unable to load staff list.');
  }
  const list = Array.isArray(result?.data) ? result.data : [];
  return list.map((row) => mapStaffRow(row, roleNameById));
}

export async function fetchSolarStaffDetail(staffId, roleNameById = {}) {
  const fd = new FormData();
  fd.append('solar_user_id', String(staffId));

  const response = await fetch(SOLAR_ENDPOINTS.STAFF_PROFILE_DETAIL, {
    method: 'POST',
    body: fd,
  });
  const result = await response.json();
  if (!(response.ok && (result?.status || result?.success))) {
    throw new Error(result?.message || 'Unable to load staff details.');
  }
  const detail = Array.isArray(result?.data) ? result.data[0] : result?.data;
  return mapStaffDetail(detail || {}, roleNameById);
}

export async function createSolarStaff(payload) {
  const fd = new FormData();
  fd.append('name', payload.name);
  fd.append('email', payload.email);
  fd.append('phone', payload.phone);
  fd.append('role', String(payload.roleName || payload.role));
  fd.append('seller_id', String(payload.sellerId));
  fd.append('password', payload.password);
  if (payload.address != null) fd.append('address', String(payload.address));
  if (payload.cityId != null) fd.append('city_id', String(payload.cityId));
  if (payload.stateId != null) fd.append('state_id', String(payload.stateId));

  const response = await fetch(SOLAR_ENDPOINTS.STAFF_STORE, {
    method: 'POST',
    body: fd,
  });
  const result = await response.json();
  if (!(response.ok && result?.status)) {
    const err = new Error(
      typeof result?.message === "string"
        ? result.message
        : "Unable to create staff member.",
    );
    err.apiData = result?.message;
    throw err;
  }
  return result;
}

export async function updateSolarStaff(staffId, payload) {
  const fd = new FormData();
  fd.append('name', payload.name);
  fd.append('phone', payload.phone);
  fd.append('role', String(payload.roleName || payload.role));
  if (payload.email) fd.append('email', payload.email);
  if (payload.password) fd.append('password', payload.password);
  if (payload.address != null) fd.append('address', String(payload.address));
  if (payload.cityId != null) fd.append('city_id', String(payload.cityId));
  if (payload.stateId != null) fd.append('state_id', String(payload.stateId));

  const response = await fetch(SOLAR_ENDPOINTS.STAFF_UPDATE(staffId), {
    method: 'POST',
    body: fd,
  });
  const result = await response.json();
  if (!(response.ok && result?.status)) {
    const err = new Error(
      typeof result?.message === "string"
        ? result.message
        : "Unable to update staff member.",
    );
    err.apiData = result?.message;
    throw err;
  }
  return result;
}
export async function deleteSolarStaff(sellerId, staffId) {
  const response = await fetch(SOLAR_ENDPOINTS.STAFF_DELETE(staffId), {
    method: 'DELETE',
  });

  const result = await response.json();
  if (!(response.ok && result?.status)) {
    const err = new Error(
      typeof result?.message === "string"
        ? result.message
        : "Unable to delete staff member.",
    );
    err.apiData = result?.message;
    throw err;
  }
  return result;
}

export async function toggleSolarStaffStatus(staffId, newStatus) {
  const fd = new FormData();
  fd.append('current_status', String(newStatus));

  const response = await fetch(SOLAR_ENDPOINTS.STAFF_DELETE(staffId), {
    method: 'DELETE',
    body: fd,
  });

  const result = await response.json();
  if (!(response.ok && result?.status)) {
    throw new Error(result?.message || 'Unable to update status.');
  }
  return result;
}
