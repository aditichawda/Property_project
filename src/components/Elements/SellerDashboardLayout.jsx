import React, { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  updateSolarProfileImage,
  updateSolarStaffProfileImage,
  mapSolarUserToSeller,
  persistSellerInfoFromApi,
  fetchSolarUserDetail,
  fetchSolarStaffDetail,
} from "../../api/solarSellerProfile";
import { fetchRolePermissions } from "../../api/solarPermission";
import {
  extractPermissionNames,
  hasAnySellerPermission,
} from "../../utils/sellerPermissions";

function getSellerInfo() {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem("sellerInfo") || "null");
  } catch {
    return null;
  }
}

function mergeSellerInfo(prev = {}, next = {}) {
  const merged = { ...(prev || {}) };
  Object.entries(next || {}).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (typeof value === "string" && value.trim() === "") return;
    if (Array.isArray(value) && value.length === 0) return;
    merged[key] = value;
  });
  return merged;
}

const navItems = [
  {
    to: "/seller-dashboard",
    label: "Dashboard",
    icon: "fa-th-large",
    permissions: ["Dashboard.Manage"],
  },
  // { to: '/seller-leads', label: 'My Leads', icon: 'fa-users' },
  {
    to: "/seller-enquiries",
    label: "My Enquiries",
    icon: "fa-envelope",
    permissions: ["Enquiry.Manage"],
  },
];

function getAccountType(seller, auth) {
  if (
    seller.isStaff ||
    seller.staffId ||
    seller.staff_id ||
    auth?.loginType === "staff"
  ) {
    return "staff";
  }
  const rawTypes = [
    seller.accountType,
    seller.user_type,
    seller.userType,
    seller.apiUserType,
    seller.type,
    seller.apiType,
    auth?.accountType,
    auth?.user_type,
    auth?.loginType,
  ]
    .flat()
    .map((value) =>
      String(value || "")
        .trim()
        .toLowerCase(),
    )
    .filter(Boolean);
  if (rawTypes.some((type) => ["staff", "employee"].includes(type))) {
    return "staff";
  }
  if (
    rawTypes.some((type) =>
      ["seller", "solar_seller", "solarseller", "partner"].includes(type),
    )
  ) {
    return "seller";
  }
  return seller.isStaff || auth?.loginType === "staff" ? "staff" : "seller";
}

export default function SellerDashboardLayout({ children }) {
  const { auth, logout } = useAuth();
  const location = useLocation();

  const [seller, setSeller] = useState(() => getSellerInfo() || {});
  const isStaffLogin = getAccountType(seller, auth) === "staff";
  const displayName =
    seller.fullName || seller.name || (isStaffLogin ? "Staff" : "Seller");
  const accountLabel = isStaffLogin ? "Staff Account" : "Manage Account";
  const displayPhone = seller.phone ? `+91 ${seller.phone}` : "—";
  const solarUserId =
    seller.sellerId || seller.seller_id || seller.solar_user_id || seller.id;

  useEffect(() => {
    async function refreshProfile() {
      try {
        let detail = null;
        let staffPermissionNames = [];
        const staffId = seller.staffId || seller.staff_id;
        const existingStaffPermissionNames = extractPermissionNames(
          seller.staffPermissions ||
            seller.staff_permissions ||
            seller.permissions ||
            [],
        );

        if (isStaffLogin && staffId) {
          detail = await fetchSolarStaffDetail(staffId);
          staffPermissionNames = extractPermissionNames(detail?.permissions);

          const roleForPermission =
            detail?.roleName ||
            detail?.role ||
            detail?.roleId ||
            seller.roleName ||
            seller.role ||
            seller.roleId ||
            "";
          const sellerIdForPermission =
            detail?.sellerId ||
            seller.sellerId ||
            seller.seller_id ||
            seller.solar_user_id ||
            solarUserId;

          if (sellerIdForPermission && roleForPermission) {
            try {
              const rolePermissions = await fetchRolePermissions({
                sellerId: sellerIdForPermission,
                roleId: roleForPermission,
              });
              const rolePermissionNames =
                extractPermissionNames(rolePermissions);
              if (rolePermissionNames.length) {
                staffPermissionNames = rolePermissionNames;
              }
            } catch (permissionError) {
              console.error(
                "Failed to refresh staff permissions",
                permissionError,
              );
            }
          }

          if (!staffPermissionNames.length) {
            staffPermissionNames = existingStaffPermissionNames;
          }
        } else if (solarUserId) {
          detail = await fetchSolarUserDetail(solarUserId);
        }

        if (detail) {
          persistSellerInfoFromApi(
            isStaffLogin
              ? {
                  ...detail,
                  id: detail.sellerId || solarUserId || detail.id,
                  sellerId: detail.sellerId || solarUserId || detail.id,
                  staffId,
                  isStaff: true,
                  type: "staff",
                  user_type: "staff",
                  role: "staff",
                  fullName:
                    detail.fullName ||
                    detail.name ||
                    seller.fullName ||
                    seller.name,
                  name:
                    detail.fullName ||
                    detail.name ||
                    seller.fullName ||
                    seller.name,
                  phone: detail.phone || seller.phone,
                  email: detail.email || seller.email,
                  address: detail.address || seller.address,
                  city: detail.city || seller.city,
                  state: detail.state || seller.state,
                  cityId: detail.cityId || seller.cityId,
                  stateId: detail.stateId || seller.stateId,
                  profileImage: detail.profileImage || seller.profileImage,
                  roleName:
                    detail.roleName ||
                    detail.role ||
                    seller.roleName ||
                    seller.role,
                  hasApiPermissions: true,
                  permissions: staffPermissionNames,
                  staffPermissions: staffPermissionNames,
                }
              : detail,
          );
          setSeller((prev) => mergeSellerInfo(prev, getSellerInfo() || {}));
        }
      } catch (e) {
        console.error("Failed to refresh seller profile", e);
      }
    }
    refreshProfile();
  }, [solarUserId, seller.staffId, isStaffLogin, location.pathname]);

  useEffect(() => {
    const refreshFromStorage = () => {
      setSeller((prev) => mergeSellerInfo(prev, getSellerInfo() || {}));
    };
    window.addEventListener("seller-info-updated", refreshFromStorage);
    window.addEventListener("storage", refreshFromStorage);
    return () => {
      window.removeEventListener("seller-info-updated", refreshFromStorage);
      window.removeEventListener("storage", refreshFromStorage);
    };
  }, []);

  const canShowStaff = true;
  const canShowRole = true;
  const canShowLeadStepMaster = false;
  const canShowStaffManager = true;
  const canShowProperties = hasAnySellerPermission(seller, ["Services.Manage"]);
  const canShowAccount = hasAnySellerPermission(seller, ["Dashboard.Settings"]);

  const staffManagerActive =
    location.pathname.startsWith("/seller-staff") ||
    location.pathname.startsWith("/seller-privileges") ||
    location.pathname.startsWith("/seller-lead-step-master");
  const accountMenuActive =
    location.pathname.startsWith("/seller-account") ||
    location.pathname.startsWith("/seller-profile") ||
    location.pathname.startsWith("/seller-change-password");
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [staffMenuOpen, setStaffMenuOpen] = useState(staffManagerActive);
  const [accountMenuOpen, setAccountMenuOpen] = useState(accountMenuActive);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [pendingPhotoFile, setPendingPhotoFile] = useState(null);
  const [pendingPhotoUrl, setPendingPhotoUrl] = useState("");
  const fileInputRef = useRef(null);
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const avatarSrc = useMemo(() => {
    const src = seller.profileImage;
    return typeof src === "string" && src.trim() ? src : "";
  }, [seller.profileImage]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (accountMenuActive) setAccountMenuOpen(true);
    if (staffManagerActive) setStaffMenuOpen(true);
  }, [accountMenuActive, staffManagerActive]);

  const hasExpandedSidebarMenu = staffMenuOpen || accountMenuOpen;

  const onPickPhoto = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const onFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || (!solarUserId && !seller.staffId)) return;
    const url = URL.createObjectURL(file);
    setPendingPhotoFile(file);
    setPendingPhotoUrl(url);
    setPhotoModalOpen(true);
  };

  const closePhotoModal = () => {
    if (pendingPhotoUrl) URL.revokeObjectURL(pendingPhotoUrl);
    setPendingPhotoFile(null);
    setPendingPhotoUrl("");
    setPhotoModalOpen(false);
  };

  const confirmUploadPhoto = async () => {
    const file = pendingPhotoFile;
    if (!file || (!solarUserId && !seller.staffId)) return;
    try {
      setPhotoUploading(true);
      if (isStaffLogin) {
          const data = await updateSolarStaffProfileImage({
            staffId: seller.staffId || seller.staff_id,
            file,
          });
          if (data?.success || data?.status) {
            try {
              const detail = await fetchSolarStaffDetail(
                seller.staffId || seller.staff_id,
              );
            persistSellerInfoFromApi({
              ...seller,
              ...detail,
              id: detail.sellerId || solarUserId || seller.id,
              sellerId: detail.sellerId || solarUserId || seller.sellerId,
              staffId: seller.staffId,
              isStaff: true,
              type: "staff",
              user_type: "staff",
              role: "staff",
              roleName: seller.roleName,
              permissions: seller.permissions,
              staffPermissions: seller.staffPermissions,
              hasApiPermissions: seller.hasApiPermissions,
            });
          } catch {
            if (data?.data) {
              persistSellerInfoFromApi({
                ...seller,
                ...mapSolarUserToSeller(data.data),
                staffId: seller.staffId,
                isStaff: true,
                type: "staff",
              });
            }
          }
          setSeller((prev) => mergeSellerInfo(prev, getSellerInfo() || {}));
        }
      } else {
        const data = await updateSolarProfileImage({ solarUserId, file });
        if (data?.success && data.data) {
          const mapped = mapSolarUserToSeller(data.data);
          persistSellerInfoFromApi(mapped);
          setSeller((prev) => mergeSellerInfo(prev, getSellerInfo() || {}));
        }
      }
    } finally {
      setPhotoUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setProfileMenuOpen(false);
      closePhotoModal();
    }
  };

  return (
    <div className="seller-crm-page seller-crm-theme">
      <div
        className={
          hasExpandedSidebarMenu
            ? "seller-crm-outer seller-crm-outer--sidebar-expanded"
            : "seller-crm-outer"
        }
      >
        <div className="seller-crm-mobile-topbar">
          <button
            type="button"
            className="seller-crm-mobile-menu-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open seller menu"
            aria-expanded={sidebarOpen}
          >
            <i className="fa fa-bars" aria-hidden />
            <span>Menu</span>
          </button>
          <div className="seller-crm-mobile-title">{displayName}</div>
        </div>
        {sidebarOpen && (
          <button
            type="button"
            className="seller-crm-sidebar-backdrop"
            aria-label="Close seller menu"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <div className="seller-crm-shell">
          <aside
            className={
              sidebarOpen
                ? "seller-crm-sidebar seller-crm-sidebar--open"
                : "seller-crm-sidebar"
            }
          >
            <button
              type="button"
              className="seller-crm-sidebar-close"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close seller menu"
            >
              <i className="fa fa-times" aria-hidden />
            </button>
            <div className="seller-crm-sidebar-profile">
              <button
                type="button"
                className="seller-crm-avatar"
                onClick={onPickPhoto}
                aria-label="Update profile photo"
                disabled={photoUploading}
              >
                {avatarSrc ? (
                  <img src={avatarSrc} alt="" />
                ) : (
                  <i className="fa fa-user" aria-hidden />
                )}
                <span
                  className="seller-crm-avatar-edit"
                  aria-hidden
                  title="Edit photo"
                >
                  <i className="fa fa-pencil" />
                </span>
              </button>
              <div className="seller-crm-profile-name">{displayName}</div>
              {isStaffLogin && (
                <div className="seller-crm-profile-phone">
                  {seller.roleName || seller.role || "Staff"}
                </div>
              )}
              <div className="seller-crm-profile-phone">{displayPhone}</div>
              {canShowAccount && (
                <NavLink
                  to={isStaffLogin ? "/seller-profile" : "/seller-profile"}
                  className="seller-crm-profile-btn"
                >
                  {accountLabel}
                </NavLink>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={onFileChange}
                style={{ display: "none" }}
              />
            </div>

            <nav
              className="seller-crm-sidebar-nav"
              aria-label="Seller account"
              onClick={(event) => {
                const target = event.target;
                if (target && target.closest && target.closest("a")) {
                  setSidebarOpen(false);
                }
              }}
            >
              <ul className="seller-crm-nav-list">
                {navItems.map((item) => {
                  if (!hasAnySellerPermission(seller, item.permissions))
                    return null;
                  if (item.to !== "/seller-profile") {
                    return (
                      <li key={item.to}>
                        <NavLink
                          to={item.to}
                          className={({ isActive }) =>
                            isActive
                              ? "seller-crm-nav-link is-active"
                              : "seller-crm-nav-link"
                          }
                          end={item.to === "/seller-dashboard"}
                        >
                          <i
                            className={`fa ${item.icon} seller-crm-nav-icon`}
                            aria-hidden
                          />
                          <span>{item.label}</span>
                        </NavLink>
                      </li>
                    );
                  }
                  return (
                    <li key={item.to} className="seller-crm-profile-nav">
                      <button
                        type="button"
                        className="seller-crm-nav-link"
                        onClick={() => setProfileMenuOpen((v) => !v)}
                      >
                        <i
                          className={`fa ${item.icon} seller-crm-nav-icon`}
                          aria-hidden
                        />
                        <span>Profile</span>
                        <i
                          className={`fa fa-angle-${profileMenuOpen ? "up" : "down"} seller-crm-nav-caret`}
                          aria-hidden
                        />
                      </button>
                      {profileMenuOpen && (
                        <div className="seller-crm-profile-menu">
                          <NavLink
                            to="/seller-profile"
                            className="seller-crm-profile-menu__item"
                            onClick={() => setProfileMenuOpen(false)}
                          >
                            <i className="fa fa-pencil" aria-hidden /> Edit
                            Profile
                          </NavLink>
                          <button
                            type="button"
                            className="seller-crm-profile-menu__item"
                            onClick={onPickPhoto}
                            disabled={photoUploading}
                          >
                            <i className="fa fa-camera" aria-hidden />{" "}
                            {photoUploading ? "Uploading…" : "Update Photo"}
                          </button>
                        </div>
                      )}
                    </li>
                  );
                })}
                {/* {canShowStaffManager && (
                  <li className="seller-crm-profile-nav">
                    <button
                      type="button"
                      className={
                        staffManagerActive
                          ? "seller-crm-nav-link is-active"
                          : "seller-crm-nav-link"
                      }
                      onClick={() => setStaffMenuOpen((v) => !v)}
                    >
                      <i
                        className="fa fa-id-badge seller-crm-nav-icon"
                        aria-hidden
                      />
                      <span>Staff Manage</span>
                      <i
                        className={`fa fa-angle-${
                          staffMenuOpen ? "up" : "down"
                        } seller-crm-nav-caret`}
                        aria-hidden
                      />
                    </button>
                    {staffMenuOpen ? (
                      <div className="seller-crm-account-subnav">
                        {canShowStaff ? (
                          <NavLink
                            to="/seller-staff"
                            className={({ isActive }) =>
                              isActive && location.search !== "?tab=roles"
                                ? "seller-crm-account-subnav__item is-active"
                                : "seller-crm-account-subnav__item"
                            }
                          >
                            <i className="fa fa-users" aria-hidden />
                            <span>Staff</span>
                          </NavLink>
                        ) : null}
                        {canShowRole ? (
                          <NavLink
                            to="/seller-privileges"
                            className={({ isActive }) =>
                              isActive && location.search === "?tab=roles"
                                ? "seller-crm-account-subnav__item is-active"
                                : "seller-crm-account-subnav__item"
                            }
                          >
                            <i className="fa fa-shield" aria-hidden />
                            <span>Role</span>
                          </NavLink>
                        ) : null}
                      </div>
                    ) : null}
                  </li>
                )} */}
                {canShowProperties && (
                  <li>
                    <NavLink
                      to="/seller-services"
                      className={({ isActive }) =>
                        isActive
                          ? "seller-crm-nav-link is-active"
                          : "seller-crm-nav-link"
                      }
                    >
                      <i
                        className="fa fa-home seller-crm-nav-icon"
                        aria-hidden
                      />
                      <span>Properties</span>
                    </NavLink>
                  </li>
                )}
                {canShowAccount && (
                  <li className="seller-crm-profile-nav">
                    <button
                      type="button"
                      className={
                        accountMenuActive
                          ? "seller-crm-nav-link is-active"
                          : "seller-crm-nav-link"
                      }
                      onClick={() => setAccountMenuOpen((v) => !v)}
                    >
                      <i
                        className="fa fa-user seller-crm-nav-icon"
                        aria-hidden
                      />
                      <span>Account</span>
                      <i
                        className={`fa fa-angle-${accountMenuOpen ? "up" : "down"} seller-crm-nav-caret`}
                        aria-hidden
                      />
                    </button>
                    {accountMenuOpen && (
                      <div className="seller-crm-profile-menu">
                        <NavLink
                          to="/seller-account"
                          className={({ isActive }) =>
                            isActive
                              ? "seller-crm-profile-menu__item is-active"
                              : "seller-crm-profile-menu__item"
                          }
                        >
                          <i className="fa fa-user" aria-hidden /> Account
                          Detail
                        </NavLink>
                        <NavLink
                          to="/seller-change-password"
                          className={({ isActive }) =>
                            isActive
                              ? "seller-crm-profile-menu__item is-active"
                              : "seller-crm-profile-menu__item"
                          }
                        >
                          <i className="fa fa-lock" aria-hidden /> Change
                          Password
                        </NavLink>
                      </div>
                    )}
                  </li>
                )}
                <li>
                  <button
                    type="button"
                    className="seller-crm-nav-link seller-crm-nav-link--logout"
                    // onClick={logout}
                    onClick={() => setLogoutConfirm(true)}
                  >
                    <i
                      className="fa fa-sign-out seller-crm-nav-icon"
                      aria-hidden
                    />
                    <span>Logout</span>
                  </button>
                </li>
              </ul>
            </nav>
          </aside>

          <main className="seller-crm-main">{children}</main>
        </div>
      </div>
      {/* Logout Confirm Modal */}
      {logoutConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onMouseDown={(e) =>
            e.target === e.currentTarget && setLogoutConfirm(false)
          }
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "36px 32px 28px",
              maxWidth: "380px",
              width: "90%",
              textAlign: "center",
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
            }}
          >
            {/* Icon */}
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                background: "#fff3e0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <i
                className="fa fa-sign-out"
                style={{ fontSize: 26, color: "#f97316" }}
              />
            </div>

            <h4
              style={{
                fontWeight: 700,
                fontSize: 18,
                marginBottom: "15px",
                color: "#111",
              }}
            >
              Are you sure you want to logout?
            </h4>

            <div
              style={{ display: "flex", gap: "12px", justifyContent: "center" }}
            >
              <button
                type="button"
                onClick={() => setLogoutConfirm(false)}
                style={{
                  padding: "10px 24px",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  background: "#f5f5f5",
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setLogoutConfirm(false);
                  logout();
                }}
                style={{
                  padding: "10px 24px",
                  borderRadius: "8px",
                  border: "none",
                  background: "linear-gradient(135deg, #f97316, #ea580c)",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(249,115,22,0.4)",
                }}
              >
                <i className="fa fa-sign-out" style={{ marginRight: 6 }} />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
      {photoModalOpen && (
        <div
          className="seller-crm-photo-modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={closePhotoModal}
        >
          <div
            className="seller-crm-photo-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="seller-crm-photo-modal__head">
              <div className="seller-crm-photo-modal__title">
                Update profile photo
              </div>
              <button
                type="button"
                className="seller-crm-photo-modal__close"
                onClick={closePhotoModal}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="seller-crm-photo-modal__body">
              {pendingPhotoUrl ? (
                <img
                  className="seller-crm-photo-modal__preview"
                  src={pendingPhotoUrl}
                  alt="Preview"
                />
              ) : null}
            </div>
            <div className="seller-crm-photo-modal__actions">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={closePhotoModal}
                disabled={photoUploading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="site-button"
                onClick={confirmUploadPhoto}
                disabled={photoUploading}
              >
                {photoUploading ? "Uploading…" : "Upload"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
