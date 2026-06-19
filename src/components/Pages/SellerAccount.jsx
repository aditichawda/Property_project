import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import Header2 from "../Common/Header2";
import Footer2 from "../Common/Footer2";
import axios from "axios";
import { SOLAR_ENDPOINTS } from "../../config/api";
import SellerDashboardLayout from "../Elements/SellerDashboardLayout";
import { safeJsonParse } from "../../utils/safeJsonParse";
import {
  fetchSolarUserDetail,
  fetchSolarStaffDetail,
  persistSellerInfoFromApi,
} from "../../api/solarSellerProfile";
import { useAuth } from "../../context/AuthContext";

function readSellerInfo() {
  if (typeof window === "undefined") return null;
  return safeJsonParse(localStorage.getItem("sellerInfo"), null);
}

function isStaffAccount(info, auth) {
  const types = [
    info?.accountType,
    info?.user_type,
    info?.userType,
    info?.type,
    info?.apiType,
    auth?.accountType,
    auth?.user_type,
    auth?.loginType,
    auth?.type,
  ]
    .map((value) =>
      String(value || "")
        .trim()
        .toLowerCase(),
    )
    .filter(Boolean);
  return (
    info?.isStaff === true ||
    types.some((type) => ["staff", "employee"].includes(type))
  );
}

function mergeFilled(base = {}, patch = {}) {
  const next = { ...base };
  Object.entries(patch || {}).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (typeof value === "string" && value.trim() === "") return;
    next[key] = value;
  });
  return next;
}

export default function SellerAccount() {
  const { auth } = useAuth();
  const [seller, setSeller] = useState(() => readSellerInfo() || {});
  const [loading, setLoading] = useState(true);
  const [detailError, setDetailError] = useState("");

  // useEffect(() => {
  //   const info = readSellerInfo();
  //   const isStaffLogin = Boolean(info?.isStaff || auth?.loginType === "staff");
  //   const solarUserId = info?.id;
  //   const staffId = info?.staffId || auth?.staffId;
  //   if (!solarUserId) {
  //     setSeller(info || {});
  //     setLoading(false);
  //     return;
  //   }
  //   let cancelled = false;
  //   (async () => {
  //     try {
  //       setLoading(true);
  //       setDetailError("");
  //       if (isStaffLogin && staffId) {
  //         const mappedStaff = await fetchSolarStaffDetail(staffId);
  //         const nextStaff = {
  //           ...(info || {}),
  //           ...mappedStaff,
  //           id: solarUserId,
  //           staffId,
  //           isStaff: true,
  //           type: "staff",
  //           fullName:
  //             mappedStaff.fullName || mappedStaff.name || info?.fullName || "",
  //           roleName: mappedStaff.role || info?.roleName || "",
  //         };
  //         if (cancelled) return;
  //         setSeller(nextStaff);
  //         localStorage.setItem("sellerInfo", JSON.stringify(nextStaff));
  //         return;
  //       }
  //       const mapped = await fetchSolarUserDetail(solarUserId);
  //       if (cancelled) return;
  //       setSeller(mapped);
  //       persistSellerInfoFromApi(mapped);
  //     } catch (e) {
  //       if (!cancelled) {
  //         setSeller(info || {});
  //         setDetailError(e?.message || "Could not load account details.");
  //       }
  //     } finally {
  //       if (!cancelled) setLoading(false);
  //     }
  //   })();
  //   return () => {
  //     cancelled = true;
  //   };
  // }, [auth?.loginType, auth?.staffId]);

  useEffect(() => {
    const info = readSellerInfo();
    const staffLogin = isStaffAccount(info, auth);
    const staffId = info?.staffId || info?.staff_id || auth?.staffId;
    const solarUserId =
      info?.sellerId || info?.seller_id || info?.solar_user_id || info?.id;
    const detailId = staffLogin ? staffId : solarUserId;

    if (!detailId) {
      setSeller(info || {});
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setDetailError("");

        const mapped = staffLogin
          ? await fetchSolarStaffDetail(detailId)
          : await fetchSolarUserDetail(detailId);

        if (cancelled) return;

        const nextSeller = {
          ...mergeFilled(info || {}, mapped || {}),
          id: solarUserId || mapped?.id || info?.id,
          sellerId: solarUserId || mapped?.sellerId || info?.sellerId,
          staffId: staffLogin ? staffId : info?.staffId,
          isStaff: staffLogin,
          type: staffLogin ? "staff" : "seller",
          user_type: staffLogin ? "staff" : "seller",
        };

        setSeller(nextSeller);

        if (staffLogin) {
          localStorage.setItem("sellerInfo", JSON.stringify(nextSeller));
          window.dispatchEvent(new Event("seller-info-updated"));
        } else {
          persistSellerInfoFromApi(mapped);
        }
      } catch (e) {
        if (!cancelled) {
          setSeller(info || {});
          setDetailError(e?.message || "Could not load account details.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [auth?.loginType, auth?.staffId, auth?.type, auth?.user_type]);
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [state, setState] = useState({
    submitting: false,
    error: "",
    ok: "",
    submitted: false,
  });

  const errors = {};
  if (!form.currentPassword)
    errors.currentPassword = "Current password is required.";
  if (!form.newPassword) errors.newPassword = "New password is required.";
  else if (form.newPassword.length < 6)
    errors.newPassword = "Password must be at least 6 characters.";
  if (!form.confirmPassword)
    errors.confirmPassword = "Confirm password is required.";
  else if (form.newPassword !== form.confirmPassword)
    errors.confirmPassword = "Passwords do not match.";

  const setField = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    setState((prev) => ({ ...prev, error: "", ok: "" }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setState((prev) => ({ ...prev, submitted: true, error: "", ok: "" }));
    if (Object.keys(errors).length) return;

    const sellerInfo = readSellerInfo() || {};
    const accountEmail = sellerInfo.email || seller.email;
    if (!accountEmail) {
      setState((prev) => ({
        ...prev,
        error: "Email not found. Please login again.",
      }));
      return;
    }

    try {
      setState({ submitting: true, error: "", ok: "", submitted: true });
      const accountType =
        auth?.loginType === "staff" ||
        sellerInfo.isStaff ||
        sellerInfo.type === "staff"
          ? "staff"
          : "seller";
      const fd = new FormData();
      fd.append("email", String(accountEmail).trim());
      fd.append("type", accountType);
      fd.append("current_password", form.currentPassword);
      fd.append("new_password", form.newPassword);

      const { data } = await axios.post(
        SOLAR_ENDPOINTS.STAFF_CHANGE_PASSWORD,
        fd,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      if (!(data?.success || data?.status)) {
        setState({
          submitting: false,
          error:
            typeof data?.message === "string"
              ? data.message
              : "Could not change password.",
          ok: "",
          submitted: true,
        });
        return;
      }

      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setState({
        submitting: false,
        error: "",
        ok: data?.message || "Password changed successfully.",
        submitted: false,
      });
    } catch (err) {
      const apiMsg = err.response?.data?.message;
      setState({
        submitting: false,
        error:
          typeof apiMsg === "string"
            ? apiMsg
            : err?.message || "Could not change password.",
        ok: "",
        submitted: true,
      });
    }
  };

  return (
    <>
      <Header2 stickyNo />
      <div className="page-content">
        <SellerDashboardLayout>
          {/* ── Account Detail Card ── */}
          <div className="seller-crm-panel mb-3">
            <div className="seller-crm-panel-head mx-3">
              <h2 className="seller-crm-panel-title">Account Detail</h2>

              <NavLink to="/seller-profile" className="seller-crm-btn-orange">
                Profile Edit
              </NavLink>
            </div>
            <div className="seller-crm-panel-body">
              {loading && <p className="text-muted">Loading details...</p>}
              {detailError && !loading && (
                <p className="text-warning">{detailError}</p>
              )}
              {!loading && (
                <div className="row">
                  <div className="col-md-4">
                    <div className="seller-account-detail-item">
                      <span className="seller-account-detail-label">
                        Contact Person
                      </span>
                      <span className="seller-account-detail-value">
                        {seller.fullName || seller.name || "—"}
                      </span>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="seller-account-detail-item">
                      <span className="seller-account-detail-label">Phone</span>
                      <span className="seller-account-detail-value">
                        {seller.phone ? `+91 ${seller.phone}` : "—"}
                      </span>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="seller-account-detail-item">
                      <span className="seller-account-detail-label">Email</span>
                      <span className="seller-account-detail-value">
                        {seller.email || "—"}
                      </span>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="seller-account-detail-item">
                      <span className="seller-account-detail-label">
                        Address
                      </span>
                      <span className="seller-account-detail-value">
                        {seller.address || "—"}
                      </span>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="seller-account-detail-item">
                      <span className="seller-account-detail-label">
                        City / State
                      </span>
                      <span className="seller-account-detail-value">
                        {[seller.city, seller.state]
                          .filter(Boolean)
                          .join(", ") || "—"}
                      </span>
                    </div>
                  </div>
                  {seller.isStaff && (
                    <div className="col-md-4">
                      <div className="seller-account-detail-item">
                        <span className="seller-account-detail-label">
                          Staff Role
                        </span>
                        <span className="seller-account-detail-value">
                          {seller.roleName ||
                            seller.role ||
                            auth?.staffRole ||
                            "Staff"}
                        </span>
                      </div>
                    </div>
                  )}
                  {/* <div className="col-md-4">
                    <div className="seller-account-detail-item">
                      <span className="seller-account-detail-label">
                        Account Type
                      </span>
                      <span className="seller-account-detail-value">
                        {seller.isStaff || seller.type === "staff" ? "Staff" : "Seller"}
                      </span>
                    </div>
                  </div> */}
                </div>
              )}
            </div>
          </div>

          {/* ── Change Password Card ── */}
          {/* <div className="seller-crm-panel">
            <div className="seller-crm-panel-head mx-3">
              <h2 className="seller-crm-panel-title">Change Password</h2>
            </div>
            <div className="seller-crm-panel-body">
              <form
                className="seller-account-password-form"
                onSubmit={onSubmit}
                noValidate
              >
                <div className="row">
                  <div className="col-md-4">
                    <div className="seller-crm-form-field">
                      <label>Current Password *</label>
                      <input
                        type="password"
                        className="form-control"
                        value={form.currentPassword}
                        onChange={setField("currentPassword")}
                        autoComplete="current-password"
                      />
                      {state.submitted && errors.currentPassword && (
                        <span className="seller-crm-field-error">
                          {errors.currentPassword}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="seller-crm-form-field">
                      <label>New Password *</label>
                      <input
                        type="password"
                        className="form-control"
                        value={form.newPassword}
                        onChange={setField("newPassword")}
                        autoComplete="new-password"
                      />
                      {state.submitted && errors.newPassword && (
                        <span className="seller-crm-field-error">
                          {errors.newPassword}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="seller-crm-form-field">
                      <label>Confirm New Password *</label>
                      <input
                        type="password"
                        className="form-control"
                        value={form.confirmPassword}
                        onChange={setField("confirmPassword")}
                        autoComplete="new-password"
                      />
                      {state.submitted && errors.confirmPassword && (
                        <span className="seller-crm-field-error">
                          {errors.confirmPassword}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {state.error && (
                  <div className="alert alert-danger mt-3">{state.error}</div>
                )}
                {state.ok && (
                  <div className="alert alert-success mt-3">{state.ok}</div>
                )}

                <div className="seller-form-row-actions">
                  <button
                    type="submit"
                    className="site-button"
                    disabled={state.submitting}
                  >
                    <span>
                      {state.submitting ? "Saving..." : "Change Password"}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div> */}
        </SellerDashboardLayout>
      </div>
      <Footer2 />
    </>
  );
}
