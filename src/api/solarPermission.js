import { SOLAR_ENDPOINTS } from '../config/api';

export async function fetchSolarPermission() {
  const response = await fetch(SOLAR_ENDPOINTS.STAFF_PERMISSION_GET_ALL, {
    method: 'GET',
  });
  const result = await response.json();

  if (!response.ok || !result?.status) {
    throw new Error(result?.message || 'Unable to fetch permissions');
  }

  return Array.isArray(result.data) ? result.data : [];
}

export async function fetchRolePermissions({ sellerId, roleId }) {
  const body = new FormData();
  body.append('seller_id', String(sellerId));
  body.append('role', String(roleId));

  const response = await fetch(SOLAR_ENDPOINTS.STAFF_PERMISSION_GET_BY_ROLE, {
    method: 'POST',
    body,
  });
  const result = await response.json();

  if (!response.ok || !result?.status) {
    throw new Error(result?.message || 'Unable to fetch role permissions');
  }

  return Array.isArray(result.data) ? result.data : [];
}

export async function assignPermission({ sellerId, roleId, permissionIds }) {
  const body = new FormData();
  body.append('seller_id', String(sellerId));
  body.append('role', String(roleId));
  (permissionIds || []).forEach((permissionId) => {
    body.append('permissions[]', String(permissionId));
  });

  const response = await fetch(SOLAR_ENDPOINTS.STAFF_PERMISSION_ASSIGN, {
    method: 'POST',
    body,
  });
  const result = await response.json();

  if (!response.ok || !result?.status) {
    throw new Error(result?.message || 'Unable to assign permissions');
  }

  return result;
}
