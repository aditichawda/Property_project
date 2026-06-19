import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { safeJsonParse } from '../../utils/safeJsonParse';
import {
  extractPermissionNames,
  hasAnySellerPermission,
} from '../../utils/sellerPermissions';
import {
  fetchSolarStaffDetail,
  persistSellerInfoFromApi,
} from '../../api/solarSellerProfile';
import { fetchRolePermissions } from '../../api/solarPermission';

/**
 * Allows access only when localStorage infrioAuth exists AND role === 'seller'.
 */
export default function SellerProtectedRoute({ children, permissions }) {
  const location = useLocation();
  const auth = typeof window !== 'undefined' ? safeJsonParse(localStorage.getItem('infrioAuth'), null) : null;
  const [seller, setSeller] = useState(() =>
    typeof window !== 'undefined'
      ? safeJsonParse(localStorage.getItem('sellerInfo'), null)
      : null,
  );
  const [refreshingPermissions, setRefreshingPermissions] = useState(false);

  useEffect(() => {
    let alive = true;

    async function refreshStaffPermissions() {
      if (typeof window === 'undefined') return;
      const latestSeller = safeJsonParse(localStorage.getItem('sellerInfo'), null);
      const isStaff =
        latestSeller?.isStaff ||
        latestSeller?.staffId ||
        latestSeller?.staff_id ||
        auth?.loginType === 'staff' ||
        auth?.accountType === 'staff';
      if (!isStaff) {
        setSeller(latestSeller);
        return;
      }

      const staffId = latestSeller?.staffId || latestSeller?.staff_id || auth?.staffId;
      if (!staffId) {
        setSeller(latestSeller);
        return;
      }

      setRefreshingPermissions(true);
      try {
        const detail = await fetchSolarStaffDetail(staffId);
        let staffPermissions = extractPermissionNames(
          detail?.permissions || detail?.staffPermissions || [],
        );
        const sellerId =
          detail?.sellerId ||
          latestSeller?.sellerId ||
          latestSeller?.seller_id ||
          latestSeller?.solar_user_id ||
          auth?.userId;
        const roleForPermission =
          detail?.roleName ||
          detail?.role ||
          detail?.roleId ||
          latestSeller?.roleName ||
          latestSeller?.role ||
          latestSeller?.roleId ||
          auth?.staffRole ||
          auth?.roleId ||
          '';

        if (sellerId && roleForPermission) {
          const rolePermissions = await fetchRolePermissions({
            sellerId,
            roleId: roleForPermission,
          });
          const rolePermissionNames = extractPermissionNames(rolePermissions);
          if (rolePermissionNames.length) {
            staffPermissions = rolePermissionNames;
          }
        }

        if (!staffPermissions.length) {
          staffPermissions = extractPermissionNames(
            latestSeller?.staffPermissions ||
              latestSeller?.permissions ||
              latestSeller?.staff_permissions ||
              [],
          );
        }

        persistSellerInfoFromApi({
          ...detail,
          id: sellerId || latestSeller?.id,
          sellerId: sellerId || latestSeller?.sellerId,
          staffId,
          isStaff: true,
          type: 'staff',
          user_type: 'staff',
          role: 'staff',
          hasApiPermissions: true,
          permissions: staffPermissions,
          staffPermissions,
        });

        if (alive) {
          setSeller(safeJsonParse(localStorage.getItem('sellerInfo'), null));
        }
      } catch (error) {
        console.error('Failed to refresh staff route permissions', error);
        if (alive) setSeller(safeJsonParse(localStorage.getItem('sellerInfo'), null));
      } finally {
        if (alive) setRefreshingPermissions(false);
      }
    }

    refreshStaffPermissions();
    return () => {
      alive = false;
    };
  }, [auth?.accountType, auth?.loginType, auth?.roleId, auth?.staffId, auth?.staffRole, auth?.userId, location.pathname]);

  if (!auth || !auth.role) {
    return <Navigate to="/seller-login" state={{ redirect: location.pathname }} replace />;
  }

  if (auth.role !== 'seller') {
    return <Navigate to="/seller-login" state={{ redirect: location.pathname }} replace />;
  }

  if (refreshingPermissions) {
    return null;
  }

  if (permissions && !hasAnySellerPermission(seller, permissions)) {
    return <Navigate to="/seller-account" replace />;
  }

  return children;
}
