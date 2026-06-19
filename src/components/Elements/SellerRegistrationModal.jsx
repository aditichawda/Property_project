import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { SOLAR_ENDPOINTS } from "../../config/api";
import { fetchSolarStates, fetchSolarCities } from "../../api/solarLocations";
import SearchableSelect from "./SearchableSelect";

const modalToggleEyeBtnStyle = {
  position: "absolute",
  right: 8,
  top: "50%",
  transform: "translateY(-50%)",
  width: 36,
  height: 36,
  padding: 0,
  border: "none",
  background: "transparent",
  color: "#666",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 6,
};

const PHONE_DIGITS_ONLY = /^\d+$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function digitsOnly(value) {
  return String(value || "").replace(/\D/g, "");
}

function validateForm(values, cityOptions) {
  const errors = {};

  const fullName = String(values.fullName || "").trim();
  if (!fullName) errors.fullName = "Full Name is required.";

  const phoneDigits = digitsOnly(values.phone);
  if (!phoneDigits) errors.phone = "Phone Number is required.";
  else if (!PHONE_DIGITS_ONLY.test(phoneDigits))
    errors.phone = "Phone must contain digits only.";
  else if (phoneDigits.length !== 10)
    errors.phone = "Phone must be exactly 10 digits.";
  else if (!/^[6-9]\d{9}$/.test(phoneDigits)) {
    errors.phone = "Enter a valid Indian mobile number (starts with 6–9).";
  }

  const email = String(values.email || "").trim();
  if (!email) errors.email = "Email is required.";
  else if (!EMAIL_RE.test(email))
    errors.email = "Please enter a valid email address.";

  const address = String(values.address || "").trim();
  if (!address) errors.address = "Address is required.";

  const stateId = String(values.stateId || "").trim();
  if (!stateId) errors.stateId = "State is required.";

  const cityId = String(values.cityId || "").trim();
  if (!cityId) errors.cityId = "City is required.";
  else if (!cityOptions.some((c) => String(c.id) === cityId)) {
    errors.cityId = "Please select a city from the dropdown.";
  }

  const password = String(values.password || "");
  if (!password) errors.password = "Password is required.";
  else if (password.length < 6)
    errors.password = "Password must be at least 6 characters.";

  return errors;
}

export default function SellerRegistrationModal() {
  const navigate = useNavigate();
  const {
    sellerRegistrationOpen,
    closeSellerRegistration,
    auth,
    loginAsSeller,
  } = useAuth();
  const initialForm = {
    fullName: "",
    phone: "",
    email: "",
    address: "",
    stateId: "",
    cityId: "",
    password: "",
  };
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    stateId: "",
    cityId: "",
    password: "",
  });

  const [statesList, setStatesList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);
  const [statesLoading, setStatesLoading] = useState(false);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [locationsError, setLocationsError] = useState(null);

  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (!sellerRegistrationOpen) return undefined;
    let cancelled = false;
    (async () => {
      try {
        setStatesLoading(true);
        setLocationsError(null);
        const list = await fetchSolarStates();
        if (!cancelled) setStatesList(list);
      } catch {
        if (!cancelled) {
          setStatesList([]);
          setLocationsError("Could not load states. Please try again.");
        }
      } finally {
        if (!cancelled) setStatesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sellerRegistrationOpen]);

  useEffect(() => {
    if (!sellerRegistrationOpen || !form.stateId) {
      setCitiesList([]);
      return undefined;
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
  }, [sellerRegistrationOpen, form.stateId]);

  const errors = useMemo(
    () => validateForm(form, citiesList),
    [form, citiesList],
  );
  const isValid = Object.keys(errors).length === 0;
  const stateOptions = useMemo(
    () => statesList.map((s) => ({ value: String(s.id), label: s.name })),
    [statesList],
  );
  const cityOptions = useMemo(
    () => citiesList.map((c) => ({ value: String(c.id), label: c.name })),
    [citiesList],
  );

  const shouldShow = (field) => Boolean(submitAttempted && fieldErrors[field]);

  if (!sellerRegistrationOpen) return null;

  if (auth?.role === "seller") {
    closeSellerRegistration();
    return null;
  }

  const setField = (key) => (e) => {
    const value = e.target.value;
    setForm((prev) => {
      if (key === "stateId") return { ...prev, stateId: value, cityId: "" };
      return { ...prev, [key]: value };
    });
    setSubmitError(null);
    setSubmitSuccess(null);
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const resetAndClose = () => {
    setForm(initialForm);
    setSubmitAttempted(false);
    setFieldErrors({});
    setCitiesList([]);
    setShowPassword(false);
    setShowVerification(false);
    setRegisteredEmail("");
    setVerificationCode("");
    setVerifying(false);
    setSubmitting(false);
    setSubmitError(null);
    setSubmitSuccess(null);
    closeSellerRegistration();
  };

  const loginVerifiedSeller = (sellerData) => {
    const data = sellerData || {};
    const sellerId =
      data.solar_user_id || data.seller_id || data.user_id || data.id;
    const selectedState = statesList.find(
      (item) => String(item.id) === String(form.stateId),
    );
    const selectedCity = citiesList.find(
      (item) => String(item.id) === String(form.cityId),
    );

    loginAsSeller({
      id: sellerId,
      sellerId,
      role: "seller",
      accountType: "seller",
      user_type: data.user_type || "seller",
      type: data.type || "seller",
      fullName: data.full_name || data.name || form.fullName,
      name: data.name || data.full_name || form.fullName,
      phone: data.phone_number || data.phone || digitsOnly(form.phone),
      email: data.email || registeredEmail,
      address: data.address || form.address,
      state: data.state_name || data.state || selectedState?.name || "",
      city: data.city_name || data.city || selectedCity?.name || "",
      stateId: data.state_id || form.stateId,
      cityId: data.city_id || form.cityId,
      accessToken: data.access_token || data.token || "",
      refreshToken: data.refresh_token || "",
      redirectPath: "/seller-dashboard",
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);
    setSubmitError(null);
    setSubmitSuccess(null);
    setFieldErrors(errors);

    if (!isValid) {
      setSubmitError("Please fill all required fields correctly.");
      return;
    }

    const stateId = String(form.stateId || "").trim();
    const cityId = String(form.cityId || "").trim();
    if (!stateId || !cityId) {
      setSubmitError("Please select state and city.");
      return;
    }

    try {
      setSubmitting(true);
      const body = new FormData();
      body.append("full_name", form.fullName.trim());
      body.append("phone_number", digitsOnly(form.phone));
      body.append("email", form.email.trim().toLowerCase());
      body.append("password", form.password);
      body.append("address", form.address.trim());
      body.append("state_id", stateId);
      body.append("city_id", cityId);

      const { data: result } = await axios.post(SOLAR_ENDPOINTS.STORE, body, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (result.success) {
        const email = form.email.trim().toLowerCase();
        const successMessage =
          typeof result.message === "string"
            ? result.message
            : "Registration submitted successfully. Please verify OTP.";
        setSubmitAttempted(false);
        setFieldErrors({});
        setShowPassword(false);
        setRegisteredEmail(email);
        setVerificationCode("");
        setShowVerification(true);
        setSubmitSuccess(successMessage);
        setSubmitting(false);
        return;
      }

      if (result.message && typeof result.message === "object") {
        const first = Object.values(result.message)
          .flat()
          .find((m) => typeof m === "string");
        setSubmitError(
          first || "Registration failed. Please check your details.",
        );
      } else {
        setSubmitError(
          result.message || "Registration failed. Please try again.",
        );
      }
      setSubmitting(false);
    } catch (err) {
      const apiMsg = err.response?.data?.message;
      if (apiMsg && typeof apiMsg === "object") {
        const first = Object.values(apiMsg)
          .flat()
          .find((m) => typeof m === "string");
        setSubmitError(first || "Registration failed. Please try again.");
      } else if (typeof apiMsg === "string") {
        setSubmitError(apiMsg);
      } else {
        setSubmitError(
          err?.message || "Registration failed. Please try again.",
        );
      }
      setSubmitting(false);
    }
  };

  const onVerifyOtp = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);

    const otp = String(verificationCode || "")
      .replace(/\D/g, "")
      .slice(0, 5);
    if (!registeredEmail) {
      setSubmitError("Email missing. Please register again.");
      return;
    }
    if (otp.length < 5) {
      setSubmitError("Please enter the 5-digit OTP.");
      return;
    }

    try {
      setVerifying(true);
      const body = new FormData();
      body.append("email", registeredEmail);
      body.append("otp", otp);
      const { data: result } = await axios.post(
        SOLAR_ENDPOINTS.VERIFY_OTP,
        body,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      if (result.success === true || result.status === true) {
        setSubmitSuccess(
          typeof result.message === "string"
            ? result.message
            : "Email verified successfully. Redirecting to dashboard...",
        );
        setTimeout(() => {
          loginVerifiedSeller(result.data || {});
        }, 1000);
        return;
      }

      setSubmitError(
        typeof result.message === "string"
          ? result.message
          : "Invalid or expired OTP. Please try again.",
      );
    } catch (err) {
      const apiMsg = err.response?.data?.message;
      setSubmitError(
        typeof apiMsg === "string"
          ? apiMsg
          : "Unable to verify OTP right now. Please try again.",
      );
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div
      className="seller-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Seller Registration"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) resetAndClose();
      }}
    >
      <div className="seller-modal-card">
        <div className="seller-modal-header">
          <div>
            <h3 className="seller-modal-title">
              {showVerification ? "Verify OTP" : "Become a Property Seller"}
            </h3>
            <p className="seller-modal-subtitle">
              {showVerification
                ? `Enter the OTP sent to ${registeredEmail}.`
                : "Register as a solar partner to access your dashboard."}
            </p>
          </div>
          <button
            type="button"
            className="seller-modal-close"
            onClick={resetAndClose}
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {showVerification ? (
          <form className="seller-modal-form" onSubmit={onVerifyOtp} noValidate>
            {submitError && (
              <div className="seller-form-error seller-form-error--global">
                {submitError}
              </div>
            )}
            {submitSuccess && (
              <div className="seller-form-success seller-form-success--global">
                {submitSuccess}
              </div>
            )}

            <div className="seller-form-field seller-form-field--full">
              <label>OTP *</label>
              <input
                type="text"
                className="form-control text-center"
                value={verificationCode}
                onChange={(e) => {
                  setVerificationCode(
                    e.target.value.replace(/\D/g, "").slice(0, 5),
                  );
                  setSubmitError(null);
                  setSubmitSuccess(null);
                }}
                inputMode="numeric"
                maxLength={5}
                autoComplete="one-time-code"
                placeholder="Enter 5-digit OTP"
                style={{ fontSize: 22, letterSpacing: 6, fontWeight: 700 }}
              />
            </div>

            <div className="seller-modal-actions">
              <button
                type="submit"
                className="site-button"
                disabled={verifying}
                aria-disabled={verifying}
              >
                <span>{verifying ? "Verifying..." : "Verify OTP"}</span>
              </button>
              <button
                type="button"
                className="site-button-secondry"
                onClick={() => {
                  setShowVerification(false);
                  setVerificationCode("");
                  setSubmitError(null);
                  setSubmitSuccess(null);
                }}
                disabled={verifying}
              >
                Back
              </button>
            </div>
          </form>
        ) : (
          <form className="seller-modal-form" onSubmit={onSubmit} noValidate>
            {locationsError && (
              <div className="seller-form-error seller-form-error--global">
                {locationsError}
              </div>
            )}
            <div className="seller-form-grid">
              <div className="seller-form-field">
                <label>Full Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.fullName}
                  onChange={setField("fullName")}
                />
                {shouldShow("fullName") && (
                  <div className="seller-form-error">
                    {fieldErrors.fullName}
                  </div>
                )}
              </div>

              <div className="seller-form-field">
                <label>Phone Number *</label>
                <input
                  type="text"
                  className="form-control"
                  inputMode="numeric"
                  maxLength={10}
                  autoComplete="tel"
                  value={form.phone}
                  onChange={(e) => {
                    const value = e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 10);
                    setForm((prev) => ({ ...prev, phone: value }));
                    setSubmitError(null);
                    setSubmitSuccess(null);
                    setFieldErrors((prev) => {
                      if (!prev.phone) return prev;
                      const next = { ...prev };
                      delete next.phone;
                      return next;
                    });
                  }}
                />
                {shouldShow("phone") && (
                  <div className="seller-form-error">{fieldErrors.phone}</div>
                )}
              </div>

              <div className="seller-form-field">
                <label>Email *</label>
                <input
                  type="email"
                  className="form-control"
                  value={form.email}
                  onChange={setField("email")}
                />
                {shouldShow("email") && (
                  <div className="seller-form-error">{fieldErrors.email}</div>
                )}
              </div>

              <div className="seller-form-field">
                <label>Address *</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.address}
                  onChange={setField("address")}
                />
                {shouldShow("address") && (
                  <div className="seller-form-error">{fieldErrors.address}</div>
                )}
              </div>

              <div className="seller-form-field">
                <label>State *</label>
                <SearchableSelect
                  value={form.stateId}
                  options={stateOptions}
                  onChange={(value) =>
                    setField("stateId")({ target: { value } })
                  }
                  placeholder={
                    statesLoading ? "Loading states..." : "Search state..."
                  }
                  isDisabled={statesLoading || statesList.length === 0}
                  isLoading={statesLoading}
                />
                {shouldShow("stateId") && (
                  <div className="seller-form-error">{fieldErrors.stateId}</div>
                )}
              </div>

              <div className="seller-form-field">
                <label>City *</label>
                <SearchableSelect
                  value={form.cityId}
                  options={cityOptions}
                  onChange={(value) =>
                    setField("cityId")({ target: { value } })
                  }
                  placeholder={
                    !form.stateId
                      ? "Select state first"
                      : citiesLoading
                        ? "Loading cities..."
                        : "Search city..."
                  }
                  isDisabled={!form.stateId || citiesLoading}
                  isLoading={citiesLoading}
                />
                {shouldShow("cityId") && (
                  <div className="seller-form-error">{fieldErrors.cityId}</div>
                )}
              </div>

              <div className="seller-form-field seller-form-field--full">
                <label>Password *</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control"
                    value={form.password}
                    onChange={setField("password")}
                    autoComplete="new-password"
                    style={{ paddingRight: 44 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    style={modalToggleEyeBtnStyle}
                  >
                    <i
                      className={`fa ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
                      aria-hidden
                    />
                  </button>
                </div>
                {shouldShow("password") && (
                  <div className="seller-form-error">
                    {fieldErrors.password}
                  </div>
                )}
              </div>
            </div>

            {submitError && (
              <div className="seller-form-error seller-form-error--global">
                {submitError}
              </div>
            )}
            {submitSuccess && (
              <div className="seller-form-success seller-form-success--global">
                {submitSuccess}
              </div>
            )}

            <div className="seller-modal-actions">
              <button
                type="submit"
                className="site-button"
                disabled={submitting}
                aria-disabled={submitting}
              >
                <span>{submitting ? "Submitting..." : "Register"}</span>
              </button>
              <button
                type="button"
                className="site-button-secondry"
                onClick={resetAndClose}
              >
                Cancel
              </button>
            </div>
            <div className="text-center m-t15 align-items-center d-flex justify-content-center">
              <span className="text-white">Already have an account? </span>
              <button
                type="button"
                className="btn btn-link p-0 text-primary"
                onClick={() => {
                  resetAndClose();
                  navigate("/seller-login");
                }}
              >
                {" "}
                Sign In
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
