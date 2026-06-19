import React, { useEffect, useState, useMemo } from "react";
import { NavLink } from "react-router-dom";
import SellerDashboardLayout from "../Elements/SellerDashboardLayout";
import { safeJsonParse } from "../../utils/safeJsonParse";
import Header2 from "../Common/Header2";
import Footer2 from "../Common/Footer2";
import { fetchSolarStates, fetchSolarCities } from "../../api/solarLocations";
import { useAuth } from "../../context/AuthContext";
import {
  fetchSolarUserDetail,
  fetchSolarStaffDetail,
  updateSolarUserProfile,
  persistSellerInfoFromApi,
} from "../../api/solarSellerProfile";
import { updateSolarStaff } from "../../api/solarStaff";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function digitsOnly(value) {
  return String(value || "").replace(/\D/g, "");
}

function readSellerInfo() {
  if (typeof window === "undefined") return null;
  return safeJsonParse(localStorage.getItem("sellerInfo"), null);
}

function getAccountType(seller, auth) {
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

function mergeFilled(base = {}, patch = {}) {
  const next = { ...base };
  Object.entries(patch || {}).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (typeof value === "string" && value.trim() === "") return;
    next[key] = value;
  });
  return next;
}

export default function SellerProfile() {
  const { auth } = useAuth();
  const seller = readSellerInfo() || {};
  const solarUserId =
    seller.sellerId || seller.seller_id || seller.solar_user_id || seller.id;
  const isStaffLogin = getAccountType(seller, auth) === "staff";
  const staffId = seller.staffId || seller.staff_id || auth?.staffId || "";
  const profileAccountId = isStaffLogin ? staffId : solarUserId;

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    stateId: "",
    cityId: "",
  });

  const [statesList, setStatesList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);
  const [statesLoading, setStatesLoading] = useState(true);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(true);
  const [detailError, setDetailError] = useState(null);
  const [touched, setTouched] = useState({});
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setStatesLoading(true);
        const list = await fetchSolarStates();
        if (!cancelled) setStatesList(list);
      } catch {
        if (!cancelled) setStatesList([]);
      } finally {
        if (!cancelled) setStatesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // useEffect(() => {
  //   if (!solarUserId || (isStaffLogin && !staffId)) {
  //     setDetailLoading(false);
  //     setDetailError("Missing account detail. Please log in again.");
  //     const s = readSellerInfo() || {};
  //     setForm({
  //       fullName: s.fullName || "",
  //       phone: s.phone || "",
  //       email: s.email || "",
  //       address: s.address || "",
  //       stateId: s.stateId || "",
  //       cityId: s.cityId || "",
  //     });
  //     return;
  //   }
  //   let cancelled = false;
  //   (async () => {
  //     try {
  //       setDetailLoading(true);
  //       setDetailError(null);
  //       if (isStaffLogin) {
  //         const currentSeller = readSellerInfo() || {};
  //         const mappedStaff = await fetchSolarStaffDetail(staffId);
  //         if (cancelled) return;
  //         const nextStaff = {
  //           ...currentSeller,
  //           ...mappedStaff,
  //           id: solarUserId,
  //           sellerId: solarUserId,
  //           staffId,
  //           isStaff: true,
  //           type: "staff",
  //           user_type: "staff",
  //           role: "staff",
  //           fullName: mappedStaff.fullName || mappedStaff.name || "",
  //           roleName: mappedStaff.role || currentSeller.roleName || "",
  //           permissions:
  //             Array.isArray(mappedStaff.permissions) &&
  //             mappedStaff.permissions.length
  //               ? mappedStaff.permissions
  //               : currentSeller.permissions,
  //           staffPermissions:
  //             Array.isArray(mappedStaff.staffPermissions) &&
  //             mappedStaff.staffPermissions.length
  //               ? mappedStaff.staffPermissions
  //               : currentSeller.staffPermissions,
  //           hasApiPermissions:
  //             mappedStaff.hasApiPermissions ||
  //             currentSeller.hasApiPermissions ||
  //             false,
  //         };
  //         localStorage.setItem("sellerInfo", JSON.stringify(nextStaff));
  //         setForm({
  //           fullName: nextStaff.fullName || "",
  //           phone: nextStaff.phone || "",
  //           email: nextStaff.email || "",
  //           address: nextStaff.address || "",
  //           stateId: nextStaff.stateId || "",
  //           cityId: nextStaff.cityId || "",
  //         });
  //         return;
  //       }
  //       const mapped = await fetchSolarUserDetail(solarUserId);
  //       if (cancelled) return;
  //       persistSellerInfoFromApi(mapped);
  //       setForm({
  //         fullName: mapped.fullName || "",
  //         phone: mapped.phone || "",
  //         email: mapped.email || "",
  //         address: mapped.address || "",
  //         stateId: mapped.stateId || "",
  //         cityId: mapped.cityId || "",
  //       });
  //     } catch (e) {
  //       if (!cancelled) {
  //         setDetailError(e?.message || "Could not load profile.");
  //         const s = readSellerInfo() || {};
  //         setForm({
  //           fullName: s.fullName || "",
  //           phone: s.phone || "",
  //           email: s.email || "",
  //           address: s.address || "",
  //           stateId: s.stateId || "",
  //           cityId: s.cityId || "",
  //         });
  //       }
  //     } finally {
  //       if (!cancelled) setDetailLoading(false);
  //     }
  //   })();
  //   return () => {
  //     cancelled = true;
  //   };
  // }, [solarUserId, isStaffLogin, staffId]);

  useEffect(() => {
    const info = readSellerInfo() || {};

    // seller login ho to seller id
    const loginId = isStaffLogin ? staffId : solarUserId;

    if (!loginId) {
      setDetailLoading(false);
      setDetailError("Missing account detail. Please log in again.");

      setForm({
        fullName: info.fullName || "",
        phone: info.phone || "",
        email: info.email || "",
        address: info.address || "",
        stateId: info.stateId || "",
        cityId: info.cityId || "",
      });

      return;
    }

    let cancelled = false;

    (async () => {
      try {
        setDetailLoading(true);
        setDetailError(null);

        const mapped = isStaffLogin
          ? await fetchSolarStaffDetail(loginId)
          : await fetchSolarUserDetail(loginId);

        if (cancelled) return;

        let displayDetail = mapped || {};
        if (isStaffLogin) {
          const nextStaff = {
            ...mergeFilled(info, mapped || {}),
            id: mapped?.sellerId || solarUserId || info?.id,
            sellerId: mapped?.sellerId || solarUserId || info?.sellerId,
            staffId,
            isStaff: true,
            type: "staff",
            user_type: "staff",
          };
          displayDetail = nextStaff;
          localStorage.setItem(
            "sellerInfo",
            JSON.stringify(nextStaff),
          );
          window.dispatchEvent(new Event("seller-info-updated"));
        } else {
          persistSellerInfoFromApi(mapped);
        }

        setForm({
          fullName: displayDetail.fullName || displayDetail.name || "",
          phone: displayDetail.phone || "",
          email: displayDetail.email || "",
          address: displayDetail.address || "",
          stateId: displayDetail.stateId || "",
          cityId: displayDetail.cityId || "",
        });
      } catch (e) {
        if (!cancelled) {
          setDetailError(e?.message || "Could not load profile.");

          setForm({
            fullName: info.fullName || "",
            phone: info.phone || "",
            email: info.email || "",
            address: info.address || "",
            stateId: info.stateId || "",
            cityId: info.cityId || "",
          });
        }
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [solarUserId, staffId, isStaffLogin]);
  useEffect(() => {
    if (!form.stateId) {
      setCitiesList([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setCitiesLoading(true);
        const list = await fetchSolarCities(form.stateId);
        if (!cancelled) setCitiesList(list);
      } catch {
        if (!cancelled) setCitiesList([]);
      } finally {
        if (!cancelled) setCitiesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [form.stateId]);

  const errors = useMemo(() => {
    const e = {};
    if (!String(form.fullName || "").trim())
      e.fullName = "Full Name is required.";
    const phoneDigits = digitsOnly(form.phone);
    if (!phoneDigits) e.phone = "Phone Number is required.";
    else if (phoneDigits.length !== 10)
      e.phone = "Phone must be exactly 10 digits.";
    else if (!/^[6-9]\d{9}$/.test(phoneDigits))
      e.phone = "Enter a valid Indian mobile number (starts with 6–9).";
    if (!String(form.email || "").trim()) e.email = "Email is required.";
    else if (!EMAIL_RE.test(String(form.email || "").trim()))
      e.email = "Please enter a valid email address.";
    if (!String(form.address || "").trim()) e.address = "Address is required.";
    if (!String(form.stateId || "").trim()) e.stateId = "State is required.";
    if (!String(form.cityId || "").trim()) e.cityId = "City is required.";
    else if (!citiesList.some((c) => String(c.id) === String(form.cityId)))
      e.cityId = "Please select a valid city for the chosen state.";
    return e;
  }, [form, citiesList]);

  const isValid = Object.keys(errors).length === 0;

  const setField = (key) => (e) => {
    const value = e.target.value;
    setForm((prev) => {
      if (key === "stateId") return { ...prev, stateId: value, cityId: "" };
      return { ...prev, [key]: value };
    });
    setTouched((prev) => ({ ...prev, [key]: true }));
    setSubmitError(null);
    setSubmitSuccess(null);
  };

  const showError = (key) => touched[key];

  const onSave = async (e) => {
    e.preventDefault();
    setTouched({
      fullName: true,
      phone: true,
      email: true,
      address: true,
      stateId: true,
      cityId: true,
    });
    setSubmitError(null);
    setSubmitSuccess(null);
    if (!isValid || !profileAccountId) return;

    let shouldRedirect = false;
    try {
      setSaving(true);
      if (isStaffLogin) {
        const data = await updateSolarStaff(staffId, {
          name: form.fullName.trim(),
          phone: digitsOnly(form.phone),
          email: form.email.trim().toLowerCase(),
          roleName: seller.roleName || seller.role || auth?.staffRole || "",
          address: form.address.trim(),
          stateId: form.stateId,
          cityId: form.cityId,
        });

        if (!(data?.success || data?.status)) {
          setSubmitError(
            typeof data?.message === "string"
              ? data.message
              : "Update failed. Please try again.",
          );
          return;
        }

        let nextStaff = {
          ...seller,
          staffId,
          isStaff: true,
          type: "staff",
          fullName: form.fullName.trim(),
          phone: digitsOnly(form.phone),
          email: String(form.email || "")
            .trim()
            .toLowerCase(),
          address: form.address.trim(),
          stateId: form.stateId,
          cityId: form.cityId,
        };
        try {
          const refreshed = await fetchSolarStaffDetail(staffId);
          nextStaff = {
            ...mergeFilled(nextStaff, refreshed || {}),
            id: refreshed.sellerId || solarUserId,
            sellerId: refreshed.sellerId || solarUserId,
            staffId,
            isStaff: true,
            type: "staff",
            user_type: "staff",
            role: "staff",
            roleName: seller.roleName || auth?.staffRole || "",
            permissions: seller.permissions || [],
            staffPermissions: seller.staffPermissions || [],
            hasApiPermissions: seller.hasApiPermissions || false,
          };
        } catch {
          // Keep the just-saved values if the refresh endpoint is unavailable.
        }
        localStorage.setItem("sellerInfo", JSON.stringify(nextStaff));
        window.dispatchEvent(new Event("seller-info-updated"));
        setForm({
          fullName: form.fullName.trim(),
          phone: digitsOnly(form.phone),
          email: form.email.trim().toLowerCase(),
          address: form.address.trim(),
          stateId: String(form.stateId),
          cityId: String(form.cityId),
        });
        setSubmitSuccess("Profile updated successfully.");
        return;
      }

      const data = await updateSolarUserProfile({
        solarUserId,
        full_name: form.fullName,
        phone_number: digitsOnly(form.phone),
        address: form.address,
        state_id: form.stateId,
        city_id: form.cityId,
      });

      if (data?.success || data?.status) {
        const submittedProfile = {
          id: solarUserId,
          sellerId: solarUserId,
          fullName: form.fullName.trim(),
          phone: digitsOnly(form.phone),
          email: form.email.trim().toLowerCase(),
          address: form.address.trim(),
          stateId: String(form.stateId),
          cityId: String(form.cityId),
        };

        persistSellerInfoFromApi(submittedProfile);
        setForm((prev) => ({ ...prev, ...submittedProfile }));
        setSubmitSuccess(
          typeof data?.message === "string"
            ? data.message
            : "Profile updated successfully.",
        );

        try {
          const refreshed = await fetchSolarUserDetail(solarUserId);
          const latestProfile = {
            ...submittedProfile,
            ...refreshed,
            email: refreshed.email || submittedProfile.email,
          };
          persistSellerInfoFromApi(latestProfile);
          setForm((prev) => ({
            ...prev,
            fullName: latestProfile.fullName || "",
            phone: latestProfile.phone || "",
            email: latestProfile.email || "",
            address: latestProfile.address || "",
            stateId: latestProfile.stateId || "",
            cityId: latestProfile.cityId || "",
          }));
        } catch {
          // Submitted values remain visible when detail refresh is unavailable.
        }
      } else {
        setSubmitError(
          typeof data?.message === "string"
            ? data.message
            : "Update failed. Please try again.",
        );
      }
    } catch (err) {
      const apiMsg = err.response?.data?.message;
      setSubmitError(
        typeof apiMsg === "string"
          ? apiMsg
          : err?.message || "Failed to save profile.",
      );
    } finally {
      if (!shouldRedirect) setSaving(false);
    }
  };

  return (
    <>
      <Header2 stickyNo />
      <div className="page-content">
        <SellerDashboardLayout>
          <div className="seller-crm-content">
            <div className="seller-crm-panel-head">
              <h2 className="seller-crm-panel-title">My Profile</h2>
              <NavLink
                to="/seller-account"
                className="site-button"
                style={{ padding: "8px 16px", borderRadius: "6px" }}
              >
                <i className="fa fa-arrow-left m-r8 mr-2" aria-hidden />
                Back
              </NavLink>
            </div>

            {detailLoading && (
              <p className="text-muted mt-3">Loading profile…</p>
            )}
            {detailError && !detailLoading && (
              <div className="alert alert-warning mt-3">{detailError}</div>
            )}

            {!detailLoading && (
              <div className="seller-profile-form-wrap">
                {saving && (
                  <div className="seller-crm-loading-overlay">
                    <div className="seller-crm-spinner" />
                  </div>
                )}

                <form onSubmit={onSave} noValidate>
                  <div className="row">
                    <div className="col-md-4">
                      <div className="form-group">
                        <label>Full Name *</label>
                        <input
                          className="form-control"
                          value={form.fullName}
                          onChange={setField("fullName")}
                        />
                        {errors.fullName && showError("fullName") && (
                          <div className="seller-form-error">
                            {errors.fullName}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div className="form-group">
                        <label>Phone Number *</label>
                        <input
                          className="form-control"
                          inputMode="numeric"
                          maxLength={10}
                          value={form.phone}
                          onChange={(e) => {
                            const v = e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 10);
                            setForm((prev) => ({ ...prev, phone: v }));
                            setTouched((prev) => ({ ...prev, phone: true }));
                            setSubmitError(null);
                            setSubmitSuccess(null);
                          }}
                        />
                        {errors.phone && showError("phone") && (
                          <div className="seller-form-error">
                            {errors.phone}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div className="form-group">
                        <label>Email</label>
                        <input
                          className="form-control"
                          value={form.email}
                          readOnly
                          disabled
                        />
                        <small className="text-muted">
                          Email cannot be changed here.
                        </small>
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div className="form-group">
                        <label>State *</label>
                        <select
                          className="form-control"
                          value={form.stateId}
                          onChange={setField("stateId")}
                          disabled={statesLoading || statesList.length === 0}
                        >
                          <option value="">
                            {statesLoading ? "Loading states…" : "Select state"}
                          </option>
                          {statesList.map((s) => (
                            <option key={s.id} value={String(s.id)}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                        {errors.stateId && showError("stateId") && (
                          <div className="seller-form-error">
                            {errors.stateId}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div className="form-group">
                        <label>City *</label>
                        <select
                          className="form-control"
                          value={form.cityId}
                          onChange={setField("cityId")}
                          disabled={!form.stateId || citiesLoading}
                        >
                          <option value="">
                            {!form.stateId
                              ? "Select state first"
                              : citiesLoading
                                ? "Loading cities…"
                                : "Select city"}
                          </option>
                          {citiesList.map((c) => (
                            <option key={c.id} value={String(c.id)}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                        {errors.cityId && showError("cityId") && (
                          <div className="seller-form-error">
                            {errors.cityId}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div className="form-group">
                        <label>Address *</label>
                        <input
                          className="form-control"
                          value={form.address}
                          onChange={setField("address")}
                        />
                        {errors.address && showError("address") && (
                          <div className="seller-form-error">
                            {errors.address}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {submitError && (
                    <div className="crm-alert crm-alert-danger mt-3">
                      {submitError}
                    </div>
                  )}
                  {submitSuccess && (
                    <div className="crm-alert crm-alert-success mt-3">
                      {submitSuccess}
                    </div>
                  )}

                  <div className="seller-form-row-actions">
                    <button
                      type="submit"
                      className="site-button"
                      disabled={!isValid || saving || !profileAccountId}
                    >
                      <span>{saving ? "Saving..." : "Save Changes"}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </SellerDashboardLayout>
      </div>
      <Footer2 />
    </>
  );
}
