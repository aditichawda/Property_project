import React, { useRef, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Header2 from "../Common/Header2";
import Footer2 from "../Common/Footer2";
import SEO from "../Common/SEO";
import Banner from "../Elements/Banner";
import SearchableSelect from "../Elements/SearchableSelect";
import { AUTH_ENDPOINTS, SOLAR_ENDPOINTS } from "../../config/api";
import { fetchSolarStates, fetchSolarCities } from "../../api/solarLocations";
import { PROPERTY_IMAGES } from "../../data/propertyImages";
import { useAuth } from "../../context/AuthContext";
import { clearAppStorage } from "../../utils/authStorage";

const timelineOptions = ["15 Days", "1 Month", "2 Months"].map((option) => ({
  value: option,
  label: option,
}));

function phoneDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

function isValidIndiaMobile10(digits) {
  return digits.length === 10 && /^[6-9]\d{9}$/.test(digits);
}

function isTechnicalApiMessage(message) {
  return /\\|app\\http|exception|controller|class .* not found|stack|trace|\/home\//i.test(
    String(message || ""),
  );
}

function friendlyApiError(err, fallback) {
  const data = err?.response?.data;
  const apiMsg = data?.message;

  if (apiMsg && typeof apiMsg === "object") {
    const first = Object.values(apiMsg)
      .flat()
      .find((m) => typeof m === "string");
    if (first && !isTechnicalApiMessage(first)) return first;
  }

  if (
    typeof apiMsg === "string" &&
    apiMsg.trim() &&
    !isTechnicalApiMessage(apiMsg)
  ) {
    return apiMsg;
  }

  if (err?.response?.status >= 500) {
    return (
      fallback ||
      "Unable to process your request right now. Please try again later."
    );
  }

  return fallback || "Something went wrong. Please try again.";
}

function apiSucceeded(data) {
  return (
    data?.success === true ||
    data?.status === true ||
    data?.success === "true" ||
    data?.status === "true"
  );
}

function getApiMessage(data, fallback) {
  const message = data?.message;
  if (message && typeof message === "object") {
    const first = Object.values(message)
      .flat()
      .find((m) => typeof m === "string");
    return first || fallback;
  }
  return message || fallback;
}

const registerToggleEyeBtnStyle = {
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

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  useAuth();
  const isSellerRegisterPage = location.pathname === "/seller-register";
  const [role, setRole] = useState(() =>
    isSellerRegisterPage || location.state?.role === "partner"
      ? "partner"
      : "normal",
  );
  const [formState, setFormState] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    timeline: "15 Days",
    password: "",
    address: "",
    sellerStateId: "",
    sellerCityId: "",
  });
  const [solarStatesList, setSolarStatesList] = useState([]);
  const [solarCitiesList, setSolarCitiesList] = useState([]);
  const [solarLocationsLoading, setSolarLocationsLoading] = useState(false);
  const [solarCitiesLoading, setSolarCitiesLoading] = useState(false);
  const [solarLocationsError, setSolarLocationsError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState(null);
  const [showSellerVerifiedModal, setShowSellerVerifiedModal] = useState(false);
  const [showUserVerifiedModal, setShowUserVerifiedModal] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const nameInputRef = useRef(null);

  const focusRegistrationForm = () => {
    window.setTimeout(() => nameInputRef.current?.focus(), 0);
  };

  const currentPhoneDigits = phoneDigits(formState.phone);
  const phoneFieldError =
    phoneTouched && !isValidIndiaMobile10(currentPhoneDigits)
      ? "Enter a valid 10-digit Indian mobile number (starts with 6–9)."
      : null;

  useEffect(() => {
    setRole(isSellerRegisterPage ? "partner" : "normal");
    setError(null);
    setShowVerification(false);
    setVerificationCode("");
    focusRegistrationForm();
  }, [isSellerRegisterPage]);

  useEffect(() => {
    if (role !== "partner") return undefined;
    let cancelled = false;
    (async () => {
      try {
        setSolarLocationsLoading(true);
        setSolarLocationsError(null);
        const list = await fetchSolarStates();
        if (!cancelled) setSolarStatesList(list);
      } catch {
        if (!cancelled) {
          setSolarStatesList([]);
          setSolarLocationsError("Could not load states. Please try again.");
        }
      } finally {
        if (!cancelled) setSolarLocationsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [role]);

  useEffect(() => {
    if (role !== "partner" || !formState.sellerStateId) {
      setSolarCitiesList([]);
      return undefined;
    }
    let cancelled = false;
    (async () => {
      try {
        setSolarCitiesLoading(true);
        const list = await fetchSolarCities(formState.sellerStateId);
        if (!cancelled) setSolarCitiesList(list);
      } catch {
        if (!cancelled) setSolarCitiesList([]);
      } finally {
        if (!cancelled) setSolarCitiesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [role, formState.sellerStateId]);

  useEffect(() => {
    const pending = location.state?.pendingVerifyEmail;
    if (!pending || typeof pending !== "string") return undefined;
    setRole("partner");
    setRegisteredEmail(pending.trim());
    setShowVerification(true);
    setVerificationCode("");
    navigate("/seller-register", { replace: true, state: { role: "partner" } });
    return undefined;
  }, [location.state, location.pathname, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "sellerStateId") {
      setFormState((prev) => ({
        ...prev,
        sellerStateId: value,
        sellerCityId: "",
      }));
    } else {
      setFormState((prev) => ({ ...prev, [name]: value }));
    }
    if (error) setError(null);
  };

  const loginVerifiedNormalUser = async () => {
    const loginFormData = new FormData();
    loginFormData.append("login", registeredEmail);
    loginFormData.append("password", formState.password);

    const { data: loginResult } = await axios.post(
      AUTH_ENDPOINTS.LOGIN,
      loginFormData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );

    if (!apiSucceeded(loginResult) || !loginResult.data) {
      throw new Error("Verification successful. Please try logging in again.");
    }

    const d = loginResult.data;
    const userRole =
      d.user_type === "partner" ? "partner" : "normal";

    if (typeof window !== "undefined") {
      clearAppStorage();
      localStorage.setItem(
        "infrioAuth",
        JSON.stringify({
          role: userRole,
          identifier: registeredEmail,
          userId: d.id,
          accessToken: d.access_token || d.token || "",
          refreshToken: d.refresh_token || "",
        }),
      );

      const storageKey = userRole === "normal" ? "userInfo" : "partnerInfo";
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          id: d.id,
          name: d.name || formState.name,
          email: d.email || registeredEmail,
          phone: d.phone || phoneDigits(formState.phone),
          city: d.city || formState.city,
          user_type: d.user_type || (userRole === "normal" ? "customer" : "partner"),
          email_verified_at: d.email_verified_at,
        }),
      );
    }

    return userRole;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const mobile = phoneDigits(formState.phone);
    if (!isValidIndiaMobile10(mobile)) {
      setPhoneTouched(true);
      setIsSubmitting(false);
      return;
    }

    if (role === "partner") {
      const addr = String(formState.address || "").trim();
      const stateId = String(formState.sellerStateId || "").trim();
      const cityId = String(formState.sellerCityId || "").trim();
      if (!addr) {
        setError("Address is required.");
        setIsSubmitting(false);
        return;
      }
      if (!stateId) {
        setError("State is required.");
        setIsSubmitting(false);
        return;
      }
      if (!cityId || !solarCitiesList.some((c) => String(c.id) === cityId)) {
        setError("Please select a valid city for the chosen state.");
        setIsSubmitting(false);
        return;
      }
    }

    try {
      if (role === "partner") {
        const addr = String(formState.address || "").trim();
        const stateId = String(formState.sellerStateId || "").trim();
        const cityId = String(formState.sellerCityId || "").trim();
        const solarForm = new FormData();
        solarForm.append("full_name", String(formState.name || "").trim());
        solarForm.append("phone_number", mobile);
        solarForm.append("email", String(formState.email || "").trim());
        solarForm.append("password", formState.password);
        solarForm.append("address", addr);
        solarForm.append("state_id", stateId);
        solarForm.append("city_id", cityId);

        const { data: result } = await axios.post(
          SOLAR_ENDPOINTS.STORE,
          solarForm,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );

        if (apiSucceeded(result)) {
          setRegisteredEmail(String(formState.email || "").trim());
          setVerificationCode("");
          setShowVerification(true);
          setResendMessage(
          getApiMessage(
            result,
              "WhatsApp OTP sent successfully.",
          ),
          );
          setIsSubmitting(false);
          return;
        }

        setError(
          getApiMessage(
            result,
            "Registration failed. Please check your details.",
          ),
        );
        setIsSubmitting(false);
        return;
      }

      const formData = new FormData();
      formData.append("name", formState.name);
      formData.append("phone", mobile);
      formData.append("email", formState.email);
      formData.append("city", formState.city);
      formData.append("password", formState.password);
      formData.append("user_type", "customer");

      const serviceTypeMap = {
        "15 Days": "15",
        "1 Month": "30",
        "2 Months": "60",
      };
      formData.append(
        "our_service_type",
        serviceTypeMap[formState.timeline] || "15",
      );

      const { data: result } = await axios.post(
        AUTH_ENDPOINTS.REGISTER,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      if (apiSucceeded(result)) {
        setRegisteredEmail(String(formState.email || "").trim());
        setVerificationCode("");
        setShowVerification(true);
        setResendMessage(
          getApiMessage(
            result,
            "WhatsApp OTP sent successfully.",
          ),
        );
        setIsSubmitting(false);
      } else {
        setError(
          getApiMessage(
            result,
            "Registration failed. Please check your details.",
          ),
        );
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError(
        friendlyApiError(
          err,
          "Registration failed. Please check your details and try again.",
        ),
      );
      setIsSubmitting(false);
    }
  };

  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setResendMessage(null);

    try {
      const isSolarSeller = role === "partner";
      let result;

      if (isSolarSeller) {
        const formData = new FormData();
        formData.append("email", registeredEmail);
        formData.append("otp", String(verificationCode || "").trim());
        const response = await axios.post(
          SOLAR_ENDPOINTS.VERIFY_OTP,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );
        result = response.data;
      } else {
        const formData = new FormData();
        formData.append("email", registeredEmail);
        formData.append("code", verificationCode);
        const response = await axios.post(
          AUTH_ENDPOINTS.VERIFY_EMAIL,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );
        result = response.data;
      }

      if (apiSucceeded(result)) {
        const verifiedUser = result.data || {};
        if (isSolarSeller) {
          localStorage.removeItem("sellerInfo");
          localStorage.removeItem("infrioAuth");
          setIsSubmitting(false);
          setShowSellerVerifiedModal(true);
          return;
        }

        const verifiedRole = await loginVerifiedNormalUser();
        if (verifiedRole === "normal") {
          setShowVerification(false);
          setShowUserVerifiedModal(true);
        } else {
          navigate("/partner-account", { replace: true });
        }
        setIsSubmitting(false);
      } else {
        const nextMessage =
          typeof result.message === "string" &&
          !isTechnicalApiMessage(result.message)
            ? result.message
            : "Invalid or expired code. Please enter a valid OTP.";
        setError(nextMessage);
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error("Verification error:", err);
      setError(
        err?.message && !isTechnicalApiMessage(err.message)
          ? err.message
          : friendlyApiError(
              err,
              role === "partner"
                ? "Unable to verify OTP right now. Please enter a valid OTP or try again later."
                : "Unable to verify WhatsApp OTP right now. Please enter a valid OTP or try again later.",
            ),
      );
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (!registeredEmail) return;
    setResendLoading(true);
    setError(null);
    setResendMessage(null);
    try {
      const fd = new FormData();
      fd.append("email", registeredEmail);
      const url =
        role === "partner"
          ? SOLAR_ENDPOINTS.RESEND_OTP
          : AUTH_ENDPOINTS.RESEND_OTP;
      const { data } = await axios.post(url, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (apiSucceeded(data)) {
        setResendMessage(
          typeof data.message === "string" && data.message
            ? data.message
            : "WhatsApp OTP sent.",
        );
      } else {
        setError(data.message || "Could not resend WhatsApp OTP.");
      }
    } catch (err) {
      setError(
        friendlyApiError(err, "Could not resend WhatsApp OTP. Please try again later."),
      );
    } finally {
      setResendLoading(false);
    }
  };

  const sellerStateOptions = solarStatesList.map((s) => ({
    value: String(s.id),
    label: s.name,
  }));
  const sellerCityOptions = solarCitiesList.map((c) => ({
    value: String(c.id),
    label: c.name,
  }));

  const normalFields = (
    <>
      <div className="form-group">
        <label>How soon do you want our service?</label>
        <SearchableSelect
          value={formState.timeline}
          options={timelineOptions}
          onChange={(value) =>
            handleChange({ target: { name: "timeline", value } })
          }
          placeholder="Search timeline..."
        />
      </div>
    </>
  );

  const partnerSellerFields = (
    <>
      {solarLocationsError && (
        <div className="alert alert-warning" role="alert">
          {solarLocationsError}
        </div>
      )}
      <div className="form-row">
        <div className="form-group col-md-6">
          <label>State *</label>
          <SearchableSelect
            value={formState.sellerStateId}
            options={sellerStateOptions}
            onChange={(value) =>
              handleChange({ target: { name: "sellerStateId", value } })
            }
            placeholder={
              solarLocationsLoading ? "Loading states..." : "Search state..."
            }
            isDisabled={solarLocationsLoading || solarStatesList.length === 0}
            isLoading={solarLocationsLoading}
          />
        </div>
        <div className="form-group col-md-6">
          <label>City *</label>
          <SearchableSelect
            value={formState.sellerCityId}
            options={sellerCityOptions}
            onChange={(value) =>
              handleChange({ target: { name: "sellerCityId", value } })
            }
            placeholder={
              !formState.sellerStateId
                ? "Select state first"
                : solarCitiesLoading
                  ? "Loading cities..."
                  : "Search city..."
            }
            isDisabled={!formState.sellerStateId || solarCitiesLoading}
            isLoading={solarCitiesLoading}
          />
        </div>
      </div>
    </>
  );

  return (
    <>
      <SEO
        titleExact
        title="Register with Infrio Properties - Buyer and Seller Accounts"
        description="Create your Infrio Properties account to send property enquiries, manage seller listings, track buyer leads and access your real estate dashboard."
        keywords="Infrio Properties register, property seller registration, buyer account signup, real estate marketplace registration, property enquiry account"
        canonicalPath={isSellerRegisterPage ? "/seller-register" : "/register"}
        noindex
      />
      <Header2 />
      <div className="page-content">
        <Banner
          title={
            isSellerRegisterPage
              ? "Property Seller Registration"
              : "Create Account"
          }
          pagename="Register"
          description={
            isSellerRegisterPage
              ? "Create your  Property seller account and access the Property seller dashboard."
              : "Create your normal user account and get started with services."
          }
          bgimage={PROPERTY_IMAGES.bannerSellers}
          height={400}
        />
        <div className="section-full p-t40 p-b40">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-8 col-md-10">
                <div className="bg-white p-a40 shadow rounded solar-register-page">
                  <div className="text-center m-b30">
                    <h3>
                      {isSellerRegisterPage
                        ? "Create Property Seller Account"
                        : "Create User Account"}
                    </h3>
                    <p className="text-muted">
                      {isSellerRegisterPage
                        ? "Sign up as a property seller to list your properties and connect with potential buyers."
                        : "Create your user account to access our real estate services."}
                    </p>
                   
                  </div>

                  {!showVerification ? (
                    <form onSubmit={handleSubmit}>
                      <div className="form-row">
                        <div className="form-group col-md-6">
                          <label>Name</label>
                          <input
                            ref={nameInputRef}
                            type="text"
                            name="name"
                            className={`form-control ${error && error.includes("name") ? "is-invalid" : ""}`}
                            value={formState.name}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="form-group col-md-6">
                          <label>Phone</label>
                          <input
                            type="text"
                            name="phone"
                            className={`form-control ${phoneFieldError ? "is-invalid" : ""}`}
                            value={formState.phone}
                            onChange={(e) => {
                              const v = e.target.value
                                .replace(/\D/g, "")
                                .slice(0, 10);
                              setFormState((prev) => ({ ...prev, phone: v }));
                              if (error) setError(null);
                            }}
                            onBlur={() => setPhoneTouched(true)}
                            inputMode="numeric"
                            maxLength={10}
                            autoComplete="tel"
                            required
                          />
                          {phoneFieldError && (
                            <div className="invalid-feedback d-block">
                              {phoneFieldError}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="form-row">
                        <div
                          className={`form-group ${role === "normal" ? "col-md-6" : "col-md-6"}`}
                        >
                          <label>Email</label>
                          <input
                            type="email"
                            name="email"
                            className={`form-control ${error && error.includes("email") ? "is-invalid" : ""}`}
                            value={formState.email}
                            onChange={handleChange}
                            required
                          />
                          {error && error.includes("email") && (
                            <div className="invalid-feedback d-block">
                              {error}
                            </div>
                          )}
                        </div>
                        {role === "normal" ? (
                          <div className="form-group col-md-6">
                            <label>City</label>
                            <input
                              type="text"
                              name="city"
                              className={`form-control ${error && error.includes("city") ? "is-invalid" : ""}`}
                              value={formState.city}
                              onChange={handleChange}
                              required
                            />
                          </div>
                        ) : (
                          <div className="form-group col-md-6">
                            <label>Address *</label>
                            <input
                              type="text"
                              name="address"
                              className="form-control"
                              value={formState.address}
                              onChange={handleChange}
                              required={role === "partner"}
                              autoComplete="street-address"
                            />
                          </div>
                        )}
                      </div>

                      {role === "normal" ? normalFields : partnerSellerFields}

                      <div className="form-group">
                        <label>Password</label>
                        <div style={{ position: "relative" }}>
                          <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            className={`form-control ${error && error.includes("password") ? "is-invalid" : ""}`}
                            value={formState.password}
                            onChange={handleChange}
                            required
                            style={{ paddingRight: 44 }}
                            autoComplete="new-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            aria-label={
                              showPassword ? "Hide password" : "Show password"
                            }
                            style={registerToggleEyeBtnStyle}
                          >
                            <i
                              className={`fa ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
                              aria-hidden
                            />
                          </button>
                        </div>
                      </div>

                      {error && !error.includes("email") && (
                        <div className="alert alert-danger" role="alert">
                          {error}
                        </div>
                      )}

                      <button
                        type="submit"
                        className="site-button btn-block"
                        disabled={isSubmitting}
                      >
                        <span>
                          {isSubmitting
                            ? "Creating Account..."
                            : "Create Account"}
                        </span>
                      </button>
                      <div className="text-center m-t20">
                        <p className="m-b0">
                          Already have an account?{" "}
                          <button
                            type="button"
                            className="btn btn-link p-0 text-primary"
                            onClick={() =>
                              navigate(
                                isSellerRegisterPage
                                  ? "/seller-login"
                                  : "/login",
                              )
                            }
                          >
                            Login
                          </button>
                        </p>
                       
                      </div>
                    </form>
                  ) : (
                    <div>
                      <div className="alert alert-success m-b20">
                        <i className="fa fa-check-circle m-r10"></i>
                        {role === "partner"
                          ? "WhatsApp OTP sent. Enter the code below to verify."
                          : "Registration successful! Please verify with WhatsApp OTP."}
                      </div>
                      <form onSubmit={handleVerificationSubmit}>
                        <div className="form-group">
                          <label>
                            WhatsApp OTP
                          </label>
                          <p className="text-muted small m-b10">
                            We&apos;ve sent a WhatsApp OTP to your registered account{" "}
                            <strong>{registeredEmail}</strong>. Enter it below.
                          </p>
                          <div className="property-otp-demo m-b10">
                            Demo WhatsApp OTP: <strong>123456</strong>
                          </div>
                          <input
                            type="text"
                            className="form-control text-center"
                            style={{
                              fontSize: "24px",
                              letterSpacing: "8px",
                              fontWeight: "bold",
                            }}
                            value={verificationCode}
                            onChange={(e) => {
                              const v = e.target.value
                                .replace(/\D/g, "")
                                .slice(0, 6);
                              setVerificationCode(v);
                              if (error) setError(null);
                            }}
                            placeholder="123456"
                            maxLength={6}
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            required
                          />
                        </div>

                        {resendMessage && (
                          <div className="alert alert-info m-b15" role="status">
                            {resendMessage}
                          </div>
                        )}

                        {error && (
                          <div className="alert alert-danger" role="alert">
                            {error}
                          </div>
                        )}

                        <button
                          type="submit"
                          className="site-button btn-block"
                          disabled={isSubmitting}
                        >
                          <span>
                            {isSubmitting ? "Verifying..." : "Verify WhatsApp OTP"}
                          </span>
                        </button>

                        <div className="text-center m-t15">
                          <button
                            type="button"
                            className="btn btn-link"
                            disabled={resendLoading}
                            onClick={handleResendCode}
                          >
                            {resendLoading ? "Sending..." : "Resend WhatsApp OTP"}
                          </button>
                        </div>

                        <div className="text-center m-t10">
                          <button
                            type="button"
                            className="btn btn-link"
                            onClick={() => {
                              setShowVerification(false);
                              setVerificationCode("");
                              setError(null);
                              setResendMessage(null);
                            }}
                          >
                            Back to Registration
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer2 />
      {role === "normal" && showUserVerifiedModal && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="email-verified-title"
          style={{
            position: "fixed",
            inset: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.55)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "clamp(12px, 4vw, 24px)",
          }}
        >
          <div
            className="modal-content bg-white"
            style={{
              borderRadius: 12,
              width: "min(95vw, 440px)",
              maxWidth: "100%",
              padding: "clamp(20px, 5vw, 32px)",
              position: "relative",
              boxShadow: "0 12px 48px rgba(0,0,0,0.18)",
            }}
          >
            <div className="text-center">
              <div
                className="d-inline-flex align-items-center justify-content-center rounded-circle m-b20"
                style={{
                  width: 64,
                  height: 64,
                  background: "rgba(25, 135, 84, 0.12)",
                }}
                aria-hidden
              >
                <i
                  className="fa fa-check text-success"
                  style={{ fontSize: 28 }}
                />
              </div>
              <h4
                id="email-verified-title"
                className="m-b10"
                style={{ fontWeight: 700, color: "#1a1a1a" }}
              >
                WhatsApp OTP verified successfully
              </h4>
              <p
                className="m-b0 m-t10"
                style={{
                  color: "#444",
                  fontSize: 14,
                  lineHeight: 1.5,
                  marginBottom: 20,
                }}
              >
                Your account is ready. Continue to your dashboard.
              </p>
              <button
                type="button"
                className="site-button btn-block m-t25"
                style={{ minHeight: 48 }}
                onClick={() => navigate("/user-account", { replace: true })}
              >
                Continue to dashboard
              </button>
            </div>
          </div>
        </div>
      )}
      {role === "partner" && showSellerVerifiedModal && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="property-verified-title"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.55)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "clamp(12px, 4vw, 24px)",
          }}
        >
          <div
            className="modal-content bg-white"
            onClick={(e) => e.stopPropagation()}
            style={{
              borderRadius: 12,
              width: "min(95vw, 440px)",
              maxWidth: "100%",
              padding: "clamp(20px, 5vw, 32px)",
              position: "relative",
              boxShadow: "0 12px 48px rgba(0,0,0,0.18)",
            }}
          >
           <div className="text-center">
            <div
              className="d-inline-flex align-items-center justify-content-center rounded-circle m-b20"
                style={{
                  width: 64,
                  height: 64,
                  background: "rgba(255, 159, 0, 0.14)",
                }}
                aria-hidden
            >
              <i
                className="fa fa-clock-o"
                style={{ fontSize: 28, color: "#d97706" }}
              />
            </div>
            <h3 id="property-verified-title" 
                className="m-b10"
                style={{ fontWeight: 600,fontSize: 22, color: "#1a1a1a" }}>
              Account Verified - Admin Approval Pending
            </h3>
            <p
                className="m-b0 m-t10"
                style={{
                  color: "#444",
                  fontSize: 14,
                  lineHeight: 1.5,marginBottom: 20,
                }}
              >
                Your account is verified and awaiting admin approval. You can
                log in once it is approved by admin.
              </p>
            <button
              type="button"  
              className="site-button btn-block m-t25"
              style={{ minHeight: 48 }}
              onClick={() =>
                navigate("/seller-login", {
                  replace: true,
                  // state: {
                  //   message:
                  //     "Your account is verified, but admin approval is still pending. You can log in after the administrator approves your account.",
                  // },
                })
              }
            >
              OK
            </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Register;
