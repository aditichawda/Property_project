import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { safeJsonParse } from '../utils/safeJsonParse';
import { hasPermissionPayload } from '../utils/sellerPermissions';
import { clearAppStorage } from '../utils/authStorage';
import { fetchSolarUserDetail } from '../api/solarSellerProfile';

const AuthContext = createContext(null);

function readAuthFromStorage() {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('infrioAuth');
  return safeJsonParse(raw, null);
}

function normalizeSellerAccountType(seller) {
  if (seller?.isStaff || seller?.staffId || seller?.staff_id) {
    return 'staff';
  }
  const rawTypes = [
    seller?.user_type,
    seller?.userType,
    seller?.apiUserType,
    seller?.type,
    seller?.apiType,
    seller?.accountType,
    seller?.loginType,
    seller?.role,
  ]
    .flat()
    .map((value) => String(value || '').trim().toLowerCase())
    .filter(Boolean);
  if (rawTypes.some((type) => ['staff', 'employee'].includes(type))) {
    return 'staff';
  }
  if (
    rawTypes.some((type) =>
      ['seller', 'solar_seller', 'solarseller', 'partner'].includes(type),
    )
  ) {
    return 'seller';
  }
  return 'staff';
}

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [auth, setAuth] = useState(() => readAuthFromStorage());
  const [sellerRegistrationOpen, setSellerRegistrationOpen] = useState(false);

  useEffect(() => {
    // Keep context in sync if some other part updates localStorage.
    const handler = () => setAuth(readAuthFromStorage());
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const openSellerRegistration = () => setSellerRegistrationOpen(true);
  const closeSellerRegistration = () => setSellerRegistrationOpen(false);

  const loginAsSeller = (sellerPayload) => {
    const seller = sellerPayload || {};
    const accountType = normalizeSellerAccountType(seller);
    const sellerId =
      seller.sellerId ||
      seller.seller_id ||
      seller.solar_user_id ||
      seller.id ||
      String(Date.now());
    const staffId =
      accountType === 'staff'
        ? seller.staffId || seller.staff_id || seller.user_id || ''
        : '';
    const identifier = seller.email || seller.phone || 'seller';
    const hasApiPermissions =
      Boolean(seller.hasApiPermissions) ||
      hasPermissionPayload(seller) ||
      (seller.role && hasPermissionPayload(seller.role));

    const authObj = {
      role: 'seller',
      loginType: accountType,
      type: seller.type || accountType,
      user_type: seller.user_type || accountType,
      accountType,
      identifier,
      userId: sellerId,
      staffId,
      roleId: seller.roleId || '',
      staffRole: seller.roleName || seller.staffRole || '',
      accessToken: seller.accessToken || '',
      refreshToken: seller.refreshToken || '',
    };

    clearAppStorage();
    localStorage.setItem('infrioAuth', JSON.stringify(authObj));
    localStorage.setItem(
      'sellerInfo',
      JSON.stringify({
        ...seller,
        id: sellerId,
        sellerId,
        staffId,
        isStaff: accountType === 'staff',
        accountType,
        type: seller.type || accountType,
        user_type: seller.user_type || accountType,
        role: accountType,
        hasApiPermissions,
      }),
    );

    setAuth(authObj);
    setSellerRegistrationOpen(false);
    navigate(seller.redirectPath || '/seller-dashboard');
  };

  const logout = async (redirectPath) => {
    const isSellerSession =
      auth?.role === 'seller' ||
      auth?.loginType === 'seller' ||
      auth?.loginType === 'staff' ||
      auth?.accountType === 'seller' ||
      auth?.accountType === 'staff';
    const nextPath =
      redirectPath || (isSellerSession ? '/seller-login' : '/login');

    await clearAppStorage();

    setAuth(null);
    setSellerRegistrationOpen(false);
    if (nextPath === '/seller-login') {
      window.location.replace('/seller-login');
      return;
    }
    navigate(nextPath, { replace: true });
  };

  const forceInactiveLogout = async () => {
    await clearAppStorage();
    setAuth(null);
    setSellerRegistrationOpen(false);
    window.location.replace('/seller-login?inactive=1');
  };

  useEffect(() => {
    if (auth?.role !== 'seller' || auth?.loginType === 'staff') return undefined;

    let cancelled = false;
    let checking = false;

    const checkSellerStatus = async () => {
      if (checking || cancelled) return;
      const seller = safeJsonParse(localStorage.getItem('sellerInfo'), {}) || {};
      const sellerId =
        seller.sellerId ||
        seller.seller_id ||
        seller.solar_user_id ||
        seller.id ||
        auth?.userId;
      if (!sellerId) return;

      checking = true;
      try {
        const detail = await fetchSolarUserDetail(sellerId);
        if (!cancelled && Number(detail?.status) === 0) {
          await forceInactiveLogout();
        }
      } catch (error) {
        console.error('Unable to verify seller account status', error);
      } finally {
        checking = false;
      }
    };

    checkSellerStatus();
    const intervalId = window.setInterval(checkSellerStatus, 30000);
    const handleFocus = () => checkSellerStatus();
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') checkSellerStatus();
    };
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [auth?.loginType, auth?.role, auth?.userId, location.pathname]);

  const value = {
    auth,
    role: auth?.role || null,
    isSeller: auth?.role === 'seller',
    isLoggedIn: !!auth,
    sellerRegistrationOpen,
    openSellerRegistration,
    closeSellerRegistration,
    loginAsSeller,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export { AuthContext };
