import React, { useState } from "react";
import axios from "axios";
import Header2 from "../Common/Header2";
import Footer2 from "../Common/Footer2";
import SellerDashboardLayout from "../Elements/SellerDashboardLayout";
import { safeJsonParse } from "../../utils/safeJsonParse";
import { SOLAR_ENDPOINTS } from "../../config/api";
import { useAuth } from "../../context/AuthContext";

function readSellerInfo() {
  if (typeof window === "undefined") return null;
  return safeJsonParse(localStorage.getItem("sellerInfo"), null);
}

function getAccountType(sellerInfo, auth) {
  const rawTypes = [
    sellerInfo.accountType,
    sellerInfo.user_type,
    sellerInfo.userType,
    sellerInfo.apiUserType,
    sellerInfo.type,
    sellerInfo.apiType,
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
  return sellerInfo.isStaff || auth?.loginType === "staff" ? "staff" : "seller";
}

export default function SellerChangePassword() {
  const { auth } = useAuth();
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

  // const onSubmit = async (e) => {
  //   e.preventDefault();
  //   setState((prev) => ({ ...prev, submitted: true, error: "", ok: "" }));
  //   if (Object.keys(errors).length) return;

  //   const sellerInfo = readSellerInfo() || {};
  //   const accountEmail = sellerInfo.email || auth?.identifier;
  //   if (!accountEmail) {
  //     setState((prev) => ({
  //       ...prev,
  //       error: "Email not found. Please login again.",
  //     }));
  //     return;
  //   }

  //   try {
  //     setState({ submitting: true, error: "", ok: "", submitted: true });
  //     const accountType = getAccountType(sellerInfo, auth);
  //     const fd = new FormData();
  //     fd.append("email", String(accountEmail).trim());
  //     fd.append("type", accountType);
  //     fd.append("current_password", form.currentPassword);
  //     fd.append("new_password", form.newPassword);

  //     const endpoint =
  //       accountType === "staff"
  //         ? SOLAR_ENDPOINTS.STAFF_CHANGE_PASSWORD
  //         : SOLAR_ENDPOINTS.CHANGE_PASSWORD;
  //     const { data } = await axios.post(endpoint, fd, {
  //       headers: { "Content-Type": "multipart/form-data" },
  //     });

  //     if (!(data?.success || data?.status)) {
  //       setState({
  //         submitting: false,
  //         error:
  //           typeof data?.message === "string"
  //             ? data.message
  //             : "Could not change password.",
  //         ok: "",
  //         submitted: true,
  //       });
  //       return;
  //     }

  //     setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
  //     setState({
  //       submitting: false,
  //       error: "",
  //       ok: data?.message || "Password changed successfully.",
  //       submitted: false,
  //     });
  //   } catch (err) {
  //     const apiMsg = err.response?.data?.message;
  //     setState({
  //       submitting: false,
  //       error:
  //         typeof apiMsg === "string"
  //           ? apiMsg
  //           : err?.message || "Could not change password.",
  //       ok: "",
  //       submitted: true,
  //     });
  //   }
  // };

  const onSubmit = async (e) => {
    e.preventDefault();
    setState((prev) => ({ ...prev, submitted: true, error: "", ok: "" }));
    if (Object.keys(errors).length) return;

    const sellerInfo = readSellerInfo() || {};
    const accountEmail = sellerInfo.email || auth?.identifier;
    if (!accountEmail) {
      setState((prev) => ({
        ...prev,
        error: "Email not found. Please login again.",
      }));
      return;
    }

    try {
      setState({ submitting: true, error: "", ok: "", submitted: true });
      const accountType = getAccountType(sellerInfo, auth);
      const isStaff = accountType === "staff";

      const fd = new FormData();
      fd.append("email", String(accountEmail).trim());
      fd.append("type", accountType);
      fd.append("current_password", form.currentPassword);
      fd.append("new_password", form.newPassword);

      if (isStaff) {
        // Staff login → staff_id bhejo
        const staffId = sellerInfo.staffId || sellerInfo.staff_id || auth?.staffId;
        fd.append("staff_id", staffId);
      } else {
        // Seller login → seller_id bhejo
        const sellerId =
          sellerInfo.sellerId ||
          sellerInfo.seller_id ||
          sellerInfo.solar_user_id ||
          sellerInfo.id ||
          auth?.userId;
        fd.append("seller_id", sellerId);
      }

      // ✅ Dono ke liye ek hi endpoint
      const { data } = await axios.post(SOLAR_ENDPOINTS.CHANGE_PASSWORD, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

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
          <div className="seller-crm-panel">
            <div className="seller-crm-panel-head ml-3">
              <h2 className="seller-crm-panel-title">Change Password</h2>
            </div>
            <div className="seller-crm-panel-body">
              <form
                className="seller-account-password-form"
                onSubmit={onSubmit}
                noValidate
              >
                <div className="seller-crm-form-grid seller-crm-form-grid--2">
                  <div className="seller-crm-form-field">
                    <label>Current password *</label>
                    <input
                      type="password"
                      className="form-control"
                      value={form.currentPassword}
                      onChange={setField("currentPassword")}
                      autoComplete="current-password"
                    />
                    {state.submitted && errors.currentPassword ? (
                      <span className="seller-crm-field-error">
                        {errors.currentPassword}
                      </span>
                    ) : null}
                  </div>
                  <div className="seller-crm-form-field">
                    <label>New password *</label>
                    <input
                      type="password"
                      className="form-control"
                      value={form.newPassword}
                      onChange={setField("newPassword")}
                      autoComplete="new-password"
                    />
                    {state.submitted && errors.newPassword ? (
                      <span className="seller-crm-field-error">
                        {errors.newPassword}
                      </span>
                    ) : null}
                  </div>
                  <div className="seller-crm-form-field">
                    <label>Confirm new password *</label>
                    <input
                      type="password"
                      className="form-control"
                      value={form.confirmPassword}
                      onChange={setField("confirmPassword")}
                      autoComplete="new-password"
                    />
                    {state.submitted && errors.confirmPassword ? (
                      <span className="seller-crm-field-error">
                        {errors.confirmPassword}
                      </span>
                    ) : null}
                  </div>
                </div>
                {state.error ? (
                  <div className="alert alert-danger" style={{ marginTop: 12 }}>
                    {state.error}
                  </div>
                ) : null}
                {state.ok ? (
                  <div
                    className="alert alert-success"
                    style={{ marginTop: 12 }}
                  >
                    {state.ok}
                  </div>
                ) : null}
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
          </div>
        </SellerDashboardLayout>
      </div>
      <Footer2 />
    </>
  );
}
