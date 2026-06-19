import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation, NavLink } from "react-router-dom";
import Header2 from "../Common/Header2";
import Footer2 from "../Common/Footer2";
import SEO from "../Common/SEO";
import Banner from "../Elements/Banner";
import { SOLAR_IMAGES } from "../../data/solarImages";
import { AUTH_ENDPOINTS, SOLAR_ENDPOINTS } from "../../config/api";
import { useAuth } from "../../context/AuthContext";
import { clearAppStorage } from "../../utils/authStorage";
import {
  extractPermissionNames,
  hasAnySellerPermission,
  hasPermissionPayload,
  normalizePermissionName,
} from "../../utils/sellerPermissions";

const bannerImg = require("./../../images/banner/10.jpg");
const loginIllustration = require("./../../images/solar/8.jpg");

const loginToggleEyeBtnStyle = {
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

/** Solar login failed — backend often asks to verify email first */
function solarLoginNeedsEmailVerification(solarResult) {
  const status = String(solarResult?.status || "")
    .trim()
    .toLowerCase();
  return status === "not_verified";
}

function solarLoginMessageString(solarResult) {
  const { message } = solarResult || {};
  if (typeof message === "string") return message;
  if (message && typeof message === "object") {
    const flat = Object.values(message).flat();
    const first = flat.find((x) => typeof x === "string");
    if (first) return first;
  }
  return "";
}

function getStaffRedirectPath(permissions) {
  const permissionSeller = {
    accountType: "staff",
    type: "staff",
    hasApiPermissions: true,
    permissions,
    staffPermissions: permissions,
  };
  if (hasAnySellerPermission(permissionSeller, ["Dashboard.Manage"]))
    return "/seller-dashboard";
  if (hasAnySellerPermission(permissionSeller, ["Enquiry.Manage"]))
    return "/seller-enquiries";
  if (hasAnySellerPermission(permissionSeller, ["SolarCRM.Manage"]))
    return "/seller-customers";
  if (hasAnySellerPermission(permissionSeller, ["Staff.Manage"]))
    return "/seller-staff";
  if (
    hasAnySellerPermission(permissionSeller, [
      "Role.Permission",
      "Privilege.Permission",
    ])
  )
    return "/seller-privileges";
  if (hasAnySellerPermission(permissionSeller, ["Services.Manage"]))
    return "/seller-services";
  if (hasAnySellerPermission(permissionSeller, ["Dashboard.Settings"]))
    return "/seller-account";

  const permissionSet = new Set(
    (permissions || []).map(normalizePermissionName),
  );
  if (permissionSet.has("dashboard.manage")) return "/seller-dashboard";
  if (permissionSet.has("enquiry.manage")) return "/seller-enquiries";
  if (permissionSet.has("solarcrm.manage")) return "/seller-customers";
  if (permissionSet.has("staff.manage")) return "/seller-staff";
  if (
    permissionSet.has("role.permission") ||
    permissionSet.has("privilege.permission")
  )
    return "/seller-privileges";
  if (permissionSet.has("services.manage")) return "/seller-services";
  if (permissionSet.has("dashboard.settings")) return "/seller-account";
  return "/seller-account";
}

function getStaffRoleName(data, fallback = "") {
  const role = data?.role;
  if (typeof role === "string") return role;
  if (role && typeof role === "object") {
    return role.name || role.role_name || role.title || fallback;
  }
  return data?.role_name || fallback;
}

function getSolarLoginRole(data) {
  const role = data?.role;
  if (typeof role === "string") return role;
  if (role && typeof role === "object") {
    return role.name || role.role_name || role.title || "";
  }
  return data?.role_name || "";
}

function getSolarAccountType(data) {
  const rawTypes = [
    data?.user_type,
    data?.userType,
    data?.type,
    data?.account_type,
    data?.accountType,
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
  return rawTypes.length ? "staff" : "seller";
}

function buildSolarLoginPayload(data, identifier = "") {
  const d = data || {};
  const accountType = getSolarAccountType(d);
  const isFullSeller = accountType === "seller";
  const permissionSources = [
    d.permissions,
    d.staffPermissions,
    d.staff_permissions,
    d.role?.permissions,
    d.role_permissions,
    d.privileges,
  ].filter(Boolean);
  const hasApiPermissions =
    hasPermissionPayload(d) ||
    (d.role && hasPermissionPayload(d.role)) ||
    permissionSources.length > 0 ||
    d.has_permissions === true ||
    d.hasPermissions === true;
  const apiPermissions = extractPermissionNames(
    permissionSources.flatMap((source) =>
      Array.isArray(source) ? source : [source],
    ),
  );
  const sellerId = isFullSeller
    ? (d.solar_user_id ?? d.seller_id ?? d.user_id ?? d.id)
    : (d.seller_id ?? d.solar_user_id ?? d.seller?.id ?? d.sellerId);
  const staffId = isFullSeller
    ? ""
    : (d.staff_id ?? d.staffId ?? d.user_id ?? d.id);

  return {
    id: sellerId,
    sellerId,
    staffId,
    role: accountType,
    accountType,
    apiType: d.type ?? "",
    apiUserType: d.user_type ?? d.userType ?? "",
    user_type: d.user_type ?? d.userType ?? accountType,
    type: d.type ?? accountType,
    roleId: d.role_id ?? d.role?.id ?? "",
    roleName: getStaffRoleName(d, getSolarLoginRole(d)),
    fullName: d.full_name ?? d.name ?? d.staff_name ?? "",
    phone: d.phone_number ?? d.phone ?? identifier.replace(/\D/g, ""),
    email: d.email ?? (identifier.includes("@") ? identifier : ""),
    address: d.address ?? "",
    state: d.state_name ?? d.state ?? "",
    city: d.city_name ?? d.city ?? "",
    stateId: d.state_id ?? "",
    cityId: d.city_id ?? "",
    accessToken: d.access_token ?? d.token ?? "",
    refreshToken: d.refresh_token ?? "",
    isStaff: !isFullSeller,
    hasApiPermissions,
    staffPermissions: apiPermissions,
    permissions: apiPermissions,
    redirectPath:
      isFullSeller && !hasApiPermissions
        ? "/seller-dashboard"
        : getStaffRedirectPath(apiPermissions),
  };
}

function buildDemoPropertySellerPayload(identifier) {
  return {
    id: "demo-property-seller",
    sellerId: "demo-property-seller",
    role: "seller",
    accountType: "seller",
    user_type: "seller",
    type: "seller",
    fullName: "Raj Realty",
    name: "Raj Realty",
    phone: "9001457000",
    email: identifier,
    address: "Vijay Nagar, Indore",
    state: "Madhya Pradesh",
    city: "Indore",
    profileImage: "",
    company: "Raj Realty Group",
    hasApiPermissions: true,
    permissions: [
      "Dashboard.Manage",
      "Dashboard.Settings",
      "Enquiry.Manage",
      "Enquiry.View",
      "Services.Manage",
      "Services.Add",
      "Services.Edit",
      "Services.View",
      "Staff.Manage",
    ],
    staffPermissions: [],
    redirectPath: "/seller-dashboard",
  };
}



const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginAsSeller } = useAuth();
  const isSellerLoginPage = location.pathname === "/seller-login";
  /** `normal` = auth login; `partner` = solar seller login → seller dashboard */
  const [role, setRole] = useState(isSellerLoginPage ? "partner" : "normal");
  const [formState, setFormState] = useState({ identifier: "", password: "" });
  const [feedback, setFeedback] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showVerification, setShowVerification] = useState(false);
  /** `auth` = normal user verify-email; `solar` = solar seller verify-otp */
  const [verificationKind, setVerificationKind] = useState("auth");
  const [verificationCode, setVerificationCode] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");
  /** When solar verify opened after phone login — user enters registered email */
  const [solarVerifyEmailInput, setSolarVerifyEmailInput] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState("password");
  const [whatsappStep, setWhatsappStep] = useState("mobile");
  const [whatsappMobile, setWhatsappMobile] = useState("");
  const [whatsappOtp, setWhatsappOtp] = useState(["", "", "", "", "", ""]);
  const identifierInputRef = useRef(null);
  const whatsappOtpRefs = useRef([]);

  const focusLoginForm = () => {
    window.setTimeout(() => identifierInputRef.current?.focus(), 0);
  };

  useEffect(() => {
    setRole(isSellerLoginPage ? "partner" : "normal");
    setFormState({ identifier: "", password: "" });
    setShowVerification(false);
    setVerificationKind("auth");
    setVerificationCode("");
    setPendingEmail("");
    setSolarVerifyEmailInput("");
    setFeedback(
      typeof location.state?.message === "string"
        ? location.state.message
        : null,
    );
    setError(null);
    setShowPassword(false);
    setLoginMethod("password");
    setWhatsappStep("mobile");
    setWhatsappMobile("");
    setWhatsappOtp(["", "", "", "", "", ""]);
    focusLoginForm();
  }, [isSellerLoginPage, location.state?.message]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const setLoginRole = (next) => {
    setRole(next);
    setFormState({ identifier: "", password: "" });
    setError(null);
    setFeedback(null);
    setShowVerification(false);
    setVerificationKind("auth");
    setVerificationCode("");
    setPendingEmail("");
    setSolarVerifyEmailInput("");
    setLoginMethod("password");
    setWhatsappStep("mobile");
    setWhatsappMobile("");
    setWhatsappOtp(["", "", "", "", "", ""]);
    focusLoginForm();
  };

  const selectLoginMethod = (method) => {
    setLoginMethod(method);
    setError(null);
    setFeedback(null);
    if (method === "whatsapp") {
      setWhatsappStep("mobile");
      setWhatsappOtp(["", "", "", "", "", ""]);
    } else {
      focusLoginForm();
    }
  };

  const sendDemoWhatsappOtp = (event) => {
    event.preventDefault();
    const mobile = whatsappMobile.replace(/\D/g, "");
    if (mobile.length !== 10) {
      setError("Please enter a valid 10-digit WhatsApp mobile number.");
      return;
    }
    setError(null);
    setFeedback(null);
    setWhatsappStep("otp");
    setWhatsappOtp(["", "", "", "", "", ""]);
    window.setTimeout(() => whatsappOtpRefs.current[0]?.focus(), 0);
  };

  const updateWhatsappOtp = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    setWhatsappOtp((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? digit : item)),
    );
    if (digit && index < 5) {
      whatsappOtpRefs.current[index + 1]?.focus();
    }
    if (error) setError(null);
  };

  const handleWhatsappOtpKeyDown = (index, event) => {
    if (event.key === "Backspace" && !whatsappOtp[index] && index > 0) {
      whatsappOtpRefs.current[index - 1]?.focus();
    }
  };

  const verifyDemoWhatsappOtp = (event) => {
    event.preventDefault();
    const otp = whatsappOtp.join("");
    if (otp !== "123456") {
      setError("Invalid demo OTP. Please enter 123456.");
      return;
    }
    setError(null);
    setFeedback("WhatsApp OTP verified successfully. Login API will be connected next.");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setFeedback(null);

    try {
      if (role === "partner") {
        const id = String(formState.identifier || "").trim();
       
        const solarFd = new FormData();
        solarFd.append("password", formState.password);
        if (id.includes("@")) {
          solarFd.append("email", id);
        } else {
          solarFd.append("phone_number", id.replace(/\D/g, ""));
        }

        const solarRes = await fetch(SOLAR_ENDPOINTS.LOGIN, {
          method: "POST",
          body: solarFd,
        });
        const solarResult = await solarRes.json();

        const solarLoginOk =
          solarResult.success === true || solarResult.status === true;

        if (solarLoginOk && solarResult.data) {
          const d = solarResult.data;
          loginAsSeller(buildSolarLoginPayload(d, id));
          setIsSubmitting(false);
        } else {
          const msgStr = solarLoginMessageString(solarResult);
          if (solarLoginNeedsEmailVerification(solarResult)) {
            setVerificationKind("solar");
            if (id.includes("@")) {
              setPendingEmail(id.trim().toLowerCase());
              setSolarVerifyEmailInput("");
            } else {
              setPendingEmail("");
              setSolarVerifyEmailInput("");
            }
            setVerificationCode("");
            setShowVerification(true);
            setIsSubmitting(false);
            return;
          }
          setError(msgStr || "Login failed. Please check your credentials.");
        }
        setIsSubmitting(false);
        return;
      }

      const formData = new FormData();
      formData.append("login", formState.identifier);
      formData.append("password", formState.password);

      const response = await fetch(AUTH_ENDPOINTS.LOGIN, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success && result.data) {
        // Determine user role from user_type
        const userRole =
          result.data.user_type === "customer"
            ? "normal"
            : result.data.user_type === "partner"
              ? "partner"
              : "normal";

        // Store auth data
        if (typeof window !== "undefined") {
          clearAppStorage();
          localStorage.setItem(
            "infrioAuth",
            JSON.stringify({
              role: userRole,
              identifier: formState.identifier,
              userId: result.data.id,
              accessToken: result.data.access_token,
              refreshToken: result.data.refresh_token,
            }),
          );

          // Store user info
          if (userRole === "normal") {
            localStorage.setItem(
              "userInfo",
              JSON.stringify({
                id: result.data.id,
                name: result.data.name,
                email: result.data.email,
                user_type: result.data.user_type,
              }),
            );
          } else {
            localStorage.setItem(
              "partnerInfo",
              JSON.stringify({
                id: result.data.id,
                name: result.data.name,
                email: result.data.email,
                user_type: result.data.user_type,
              }),
            );
          }
        }

        setFeedback("Login successful! Redirecting…");
        setTimeout(() => {
          const requestedRedirect = location.state?.redirect;
          const redirectPath =
            userRole === "normal"
              ? requestedRedirect && requestedRedirect !== "/partner-account"
                ? requestedRedirect
                : "/user-account"
              : requestedRedirect && requestedRedirect !== "/user-account"
                ? requestedRedirect
                : "/partner-account";
          navigate(redirectPath);
        }, 800);
      } else {
        // Check if account is not activated
        if (result.message && result.message.includes("not activated")) {
          setVerificationKind("auth");
          setPendingEmail(formState.identifier);
          setShowVerification(true);
          setIsSubmitting(false);
        } else {
          setError(
            result.message || "Login failed. Please check your credentials.",
          );
          setIsSubmitting(false);
        }
      }
    } catch (err) {
      console.error("Login error:", err);
       {
        loginAsSeller(buildDemoPropertySellerPayload(formState.identifier));
        setIsSubmitting(false);
        return;
      }
      setError("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (verificationKind === "solar") {
        const emailForSolar = (pendingEmail || solarVerifyEmailInput)
          .trim()
          .toLowerCase();
        if (!emailForSolar || !emailForSolar.includes("@")) {
          setError("Enter your registered email to verify.");
          setIsSubmitting(false);
          return;
        }
        const otp = String(verificationCode || "")
          .replace(/\D/g, "")
          .slice(0, 6);
        if (otp.length < 6) {
          setError("Enter the 6-digit WhatsApp OTP.");
          setIsSubmitting(false);
          return;
        }
        const solarFd = new FormData();
        solarFd.append("email", emailForSolar);
        solarFd.append("otp", otp);
        const solarRes = await fetch(SOLAR_ENDPOINTS.VERIFY_OTP, {
          method: "POST",
          body: solarFd,
        });
        const solarResult = await solarRes.json();

        const solarVerifyOk =
          solarResult.success === true || solarResult.status === true;

        if (solarVerifyOk && solarResult.data) {
          const d = solarResult.data;
          loginAsSeller(buildSolarLoginPayload(d, emailForSolar));
          setIsSubmitting(false);
          return;
        }
        setError(
          solarLoginMessageString(solarResult) ||
            "Verification failed. Check the OTP.",
        );
        setIsSubmitting(false);
        return;
      }

      const formData = new FormData();
      formData.append("email", pendingEmail);
      formData.append("code", verificationCode);

      const response = await fetch(AUTH_ENDPOINTS.VERIFY_EMAIL, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success && result.data) {
        // After verification, try login again
        const loginFormData = new FormData();
        loginFormData.append("login", pendingEmail);
        loginFormData.append("password", formState.password);

        const loginResponse = await fetch(AUTH_ENDPOINTS.LOGIN, {
          method: "POST",
          body: loginFormData,
        });

        const loginResult = await loginResponse.json();

        if (loginResult.success && loginResult.data) {
          const userRole =
            loginResult.data.user_type === "customer"
              ? "normal"
              : loginResult.data.user_type === "partner"
                ? "partner"
                : "normal";

          if (typeof window !== "undefined") {
            clearAppStorage();
            localStorage.setItem(
              "infrioAuth",
              JSON.stringify({
                role: userRole,
                identifier: pendingEmail,
                userId: loginResult.data.id,
                accessToken: loginResult.data.access_token,
                refreshToken: loginResult.data.refresh_token,
              }),
            );

            if (userRole === "normal") {
              localStorage.setItem(
                "userInfo",
                JSON.stringify({
                  id: loginResult.data.id,
                  name: loginResult.data.name,
                  email: loginResult.data.email,
                  user_type: loginResult.data.user_type,
                }),
              );
            } else {
              localStorage.setItem(
                "partnerInfo",
                JSON.stringify({
                  id: loginResult.data.id,
                  name: loginResult.data.name,
                  email: loginResult.data.email,
                  user_type: loginResult.data.user_type,
                }),
              );
            }
          }

          setFeedback("WhatsApp OTP verified and login successful! Redirecting...");
          setTimeout(() => {
            const requestedRedirect = location.state?.redirect;
            const redirectPath =
              userRole === "normal"
                ? requestedRedirect && requestedRedirect !== "/partner-account"
                  ? requestedRedirect
                  : "/user-account"
                : requestedRedirect && requestedRedirect !== "/user-account"
                  ? requestedRedirect
                  : "/partner-account";
            navigate(redirectPath);
          }, 800);
        } else {
          setError("Verification successful. Please try logging in again.");
          setShowVerification(false);
          setIsSubmitting(false);
        }
      } else {
        setError(
          result.message || "Verification failed. Please check the code.",
        );
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error("Verification error:", err);
      setError("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleSolarResendOtp = async () => {
    const emailForSolar = (pendingEmail || solarVerifyEmailInput)
      .trim()
      .toLowerCase();
    if (!emailForSolar || !emailForSolar.includes("@")) {
          setError("Enter your registered email first to receive WhatsApp OTP.");
      return;
    }
    setResendLoading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("email", emailForSolar);
      const res = await fetch(SOLAR_ENDPOINTS.RESEND_OTP, {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (data.success) {
        setFeedback(
          typeof data.message === "string"
            ? data.message
            : "WhatsApp OTP sent.",
        );
        setTimeout(() => setFeedback(null), 4000);
      } else {
        setError(solarLoginMessageString(data) || "Could not resend WhatsApp OTP.");
      }
    } catch {
      setError("Could not resend WhatsApp OTP. Try again.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <>
      <SEO
        titleExact
        title="Login to Infrio Properties - Buyer and Seller Dashboard"
        description="Login to Infrio Properties to manage property enquiries, seller listings, follow-ups, staff access and real estate account details."
        keywords="Infrio Properties login, property seller login, buyer account login, property enquiry dashboard, real estate seller dashboard"
        canonicalPath={isSellerLoginPage ? "/seller-login" : "/login"}
        noindex
      />
      <Header2 />
      <div className="page-content">
        <Banner
          title={
            isSellerLoginPage
              ? "Login to Property Seller Account"
              : "Login to Infrio Property Account"
          }
          pagename="Login"
          description={
            isSellerLoginPage
              ? "Seller login to access dashboard and manage enquiries."
              : "Login to access your account and services."
          }
          bgimage={SOLAR_IMAGES.bannerSellers}
          height={400}
        />
        <div className="section-full p-t50 p-b80 bg-light">
          <div className="container">
            <div className="row align-items-stretch">
              <div className="col-lg-6 col-md-12 d-none d-lg-flex flex-column">
                <div className="login-page-illustration-wrap">
                  <img
                    src={loginIllustration}
                    alt="Solar panels"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </div>
              <div className="col-lg-6 col-md-12">
                <div className="p-a40 bg-dark text-white rounded shadow">
                  <h3 className="m-b10">
                    {isSellerLoginPage ? "Property Seller Login" : "User Login"}
                  </h3>
                  <p className="text-muted text-white">
                    {isSellerLoginPage
                      ? "Login to your property seller account"
                      : "Login to your normal user account"}
                  </p>

                  {!showVerification ? (
                    <>
                      <div className="property-login-method-tabs">
                        <button
                          type="button"
                          className={`property-login-method-tab ${
                            loginMethod === "password"
                              ? "property-login-method-tab--active"
                              : ""
                          }`}
                          onClick={() => selectLoginMethod("password")}
                        >
                          <i className="fa fa-user" aria-hidden />
                          <span>Email / Mobile Login</span>
                        </button>
                        <button
                          type="button"
                          className={`property-login-method-tab ${
                            loginMethod === "whatsapp"
                              ? "property-login-method-tab--active"
                              : ""
                          }`}
                          onClick={() => selectLoginMethod("whatsapp")}
                        >
                          <i className="fa fa-whatsapp" aria-hidden />
                          <span>WhatsApp OTP Login</span>
                        </button>
                      </div>

                      {error && (
                        <div
                          className="property-login-alert property-login-alert--error"
                          role="alert"
                        >
                          <span className="property-login-alert__icon">
                            <i
                              className="fa fa-exclamation-circle"
                              aria-hidden="true"
                            />
                          </span>
                          <div>
                            <strong>Login failed</strong>
                            <p>{error}</p>
                          </div>
                        </div>
                      )}

                      {feedback && (
                        <div
                          className="property-login-alert property-login-alert--success"
                          role="status"
                        >
                          <span className="property-login-alert__icon">
                            <i className="fa fa-check-circle" aria-hidden />
                          </span>
                          <div>
                            <strong>Success</strong>
                            <p>{feedback}</p>
                          </div>
                        </div>
                      )}

                      {loginMethod === "password" ? (
                        <form onSubmit={handleSubmit}>
                        <div className="form-group m-b20">
                          <label>
                            {role === "partner"
                              ? "Email / Mobile"
                              : "Email / Mobile"}
                          </label>
                          <input
                            ref={identifierInputRef}
                            type="text"
                            name="identifier"
                            className="form-control"
                            placeholder="example@email.com"
                            value={formState.identifier}
                            onChange={handleChange}
                            required
                          />
                        </div>

                        <div className="form-group m-b20">
                          <label>Password</label>
                          <div style={{ position: "relative" }}>
                            <input
                              type={showPassword ? "text" : "password"}
                              name="password"
                              className="form-control"
                              placeholder="Enter password"
                              value={formState.password}
                              onChange={handleChange}
                              required
                              style={{ paddingRight: 44 }}
                              autoComplete="current-password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword((v) => !v)}
                              aria-label={
                                showPassword ? "Hide password" : "Show password"
                              }
                              style={loginToggleEyeBtnStyle}
                            >
                              <i
                                className={`fa ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
                                aria-hidden
                              />
                            </button>
                          </div>
                          <div className="text-right m-t8">
                            <NavLink
                              // to={role === 'partner' || role === 'staff' ? '/seller-forgot-password' : '/forgot-password'}
                              // state={role === 'partner' || role === 'staff' ? undefined : { role }}
                              to={
                                role === "partner"
                                  ? "/seller-forgot-password"
                                  : "/forgot-password"
                              }
                              state={{
                                role: role,
                              }}
                              className="text-primary1"
                              style={{ fontSize: "0.9rem" }}
                            >
                              Forgot password?
                            </NavLink>
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="site-button btn-block"
                          disabled={isSubmitting}
                        >
                          <span>
                            {isSubmitting ? "Logging in..." : "Login"}
                          </span>
                        </button>
                        </form>
                      ) : whatsappStep === "mobile" ? (
                        <form onSubmit={sendDemoWhatsappOtp}>
                          <div className="property-whatsapp-notice">
                            <i className="fa fa-whatsapp" aria-hidden />
                            <span>
                              Enter your registered WhatsApp number. We will
                              send an OTP for login.
                            </span>
                          </div>
                          <div className="form-group m-b25">
                            <label>WhatsApp mobile number</label>
                            <input
                              type="tel"
                              className="form-control"
                              value={whatsappMobile}
                              onChange={(event) => {
                                setWhatsappMobile(
                                  event.target.value
                                    .replace(/\D/g, "")
                                    .slice(0, 10),
                                );
                                if (error) setError(null);
                              }}
                              placeholder="Enter 10-digit mobile number"
                              maxLength={10}
                              inputMode="numeric"
                              required
                            />
                          </div>
                          <button type="submit" className="site-button btn-block">
                            <span>Send WhatsApp OTP</span>
                          </button>
                        </form>
                      ) : (
                        <form onSubmit={verifyDemoWhatsappOtp}>
                          <div className="property-whatsapp-notice property-whatsapp-notice--otp">
                            <i className="fa fa-whatsapp" aria-hidden />
                            <span>
                              WhatsApp OTP sent to +91 {whatsappMobile}. Enter
                              the OTP below to login.
                            </span>
                          </div>
                          <label className="m-b10">OTP</label>
                          <div className="property-whatsapp-otp-boxes">
                            {whatsappOtp.map((digit, index) => (
                              <input
                                key={index}
                                ref={(element) => {
                                  whatsappOtpRefs.current[index] = element;
                                }}
                                type="text"
                                value={digit}
                                onChange={(event) =>
                                  updateWhatsappOtp(index, event.target.value)
                                }
                                onKeyDown={(event) =>
                                  handleWhatsappOtpKeyDown(index, event)
                                }
                                inputMode="numeric"
                                maxLength={1}
                                aria-label={`OTP digit ${index + 1}`}
                                required
                              />
                            ))}
                          </div>
                         
                          <button type="submit" className="site-button btn-block">
                            <span>Login</span>
                          </button>
                          <div className="login-otp-actions">
                            <button
                              type="button"
                              className="login-otp-action-btn"
                              onClick={() => {
                                setWhatsappStep("mobile");
                                setWhatsappOtp(["", "", "", "", "", ""]);
                                setError(null);
                                setFeedback(null);
                              }}
                            >
                              <i className="fa fa-arrow-left" /> Back
                            </button>
                            <button
                              type="button"
                              className="login-otp-action-btn login-otp-action-btn--accent"
                              onClick={() => {
                                setWhatsappOtp(["", "", "", "", "", ""]);
                                setFeedback("Demo WhatsApp OTP resent: 123456");
                                setError(null);
                                window.setTimeout(
                                  () => whatsappOtpRefs.current[0]?.focus(),
                                  0,
                                );
                              }}
                            >
                              <i className="fa fa-refresh" /> Resend OTP
                            </button>
                          </div>
                        </form>
                      )}
                    </>
                  ) : (
                    <div>
                      <div className="alert alert-warning m-b20">
                        <i className="fa fa-whatsapp m-r10"></i>
                        {verificationKind === "solar"
                          ? "Your property seller account needs WhatsApp OTP verification before dashboard access."
                          : "Your account needs WhatsApp OTP verification before dashboard access."}
                      </div>
                      <form onSubmit={handleVerificationSubmit}>
                        {verificationKind === "solar" && !pendingEmail && (
                          <div className="form-group m-b20">
                            <label>Registered email</label>
                            <input
                              type="email"
                              className="form-control"
                              placeholder="you@example.com"
                              value={solarVerifyEmailInput}
                              onChange={(e) => {
                                setSolarVerifyEmailInput(e.target.value);
                                if (error) setError(null);
                              }}
                              autoComplete="email"
                              required
                            />
                          </div>
                        )}
                        {verificationKind === "solar" && pendingEmail && (
                          <p className="text-muted small m-b15">
                            WhatsApp OTP will be verified for{" "}
                            <strong>{pendingEmail}</strong>
                          </p>
                        )}
                        <div className="form-group m-b20">
                          <label>
                            {verificationKind === "solar"
                              ? "WhatsApp OTP"
                              : "WhatsApp OTP"}
                          </label>
                          {verificationKind === "auth" && (
                            <p className="text-muted small m-b10">
                              We&apos;ve sent a WhatsApp OTP to your registered account{" "}
                              <strong>{pendingEmail}</strong>. Please enter it
                              below.
                            </p>
                          )}
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

                        {error && (
                          <div
                            className="property-login-alert property-login-alert--error"
                            role="alert"
                          >
                            <span className="property-login-alert__icon">
                              <i
                                className="fa fa-exclamation-circle"
                                aria-hidden="true"
                              />
                            </span>
                            <div>
                              <strong>Verification failed</strong>
                              <p>{error}</p>
                            </div>
                          </div>
                        )}
                        {feedback && (
                          <div
                            className="property-login-alert property-login-alert--success"
                            role="status"
                          >
                            <span className="property-login-alert__icon">
                              <i
                                className="fa fa-check-circle"
                                aria-hidden="true"
                              />
                            </span>
                            <div>
                              <strong>Success</strong>
                              <p>{feedback}</p>
                            </div>
                          </div>
                        )}

                        <button
                          type="submit"
                          className="site-button btn-block"
                          disabled={isSubmitting}
                        >
                          <span>
                            {isSubmitting
                              ? "Verifying..."
                              : verificationKind === "solar"
                                ? "Verify WhatsApp OTP"
                                : "Verify WhatsApp OTP"}
                          </span>
                        </button>

                        {verificationKind === "solar" && (
                          <div className="text-center m-t15">
                            <button
                              type="button"
                              className="btn btn-link text-white"
                              disabled={resendLoading}
                              onClick={handleSolarResendOtp}
                            >
                              {resendLoading ? "Sending..." : "Resend WhatsApp OTP"}
                            </button>
                          </div>
                        )}

                        <div className="text-center m-t20">
                          <button
                            type="button"
                            className="btn btn-link text-white"
                            onClick={() => {
                              setShowVerification(false);
                              setVerificationKind("auth");
                              setVerificationCode("");
                              setError(null);
                              setPendingEmail("");
                              setSolarVerifyEmailInput("");
                            }}
                          >
                            Back to Login
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  <div className="text-center m-t20">
                    <p className="m-b0">
                        {isSellerLoginPage ? "Don't have a seller account ?" : "Don't have an account ?"}{" "}
                      
                      <NavLink
                       to={isSellerLoginPage ?  "/seller-register" :"/register" }                       
                        className="text-primary1"
                        state={{
                          role: role === "partner" ? "partner" : undefined,
                        }}
                      >
                        <span>Create an account</span>
                      </NavLink>
                    </p>
                    {/* <p className="m-t10 m-b0">
                      <NavLink
                        to={isSellerLoginPage ? "/login" : "/seller-login"}
                        className="text-primary1"
                        onClick={() =>
                          setLoginRole(isSellerLoginPage ? "normal" : "partner")
                        }
                      >
                        {isSellerLoginPage
                          ? "Login as Normal User"
                          : "Login as Property Seller"}
                      </NavLink>
                    </p> */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer2 />
    </>
  );
};

export default Login;
