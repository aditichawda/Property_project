import React, { useMemo, useState } from "react";
import { useLocation, useNavigate, NavLink } from "react-router-dom";
import Header2 from "../Common/Header2";
import Footer2 from "../Common/Footer2";
import SEO from "../Common/SEO";
import Banner from "../Elements/Banner";
import { SOLAR_IMAGES } from "../../data/solarImages";
import { AUTH_ENDPOINTS, SOLAR_ENDPOINTS } from "../../config/api";

const bannerImg = require("./../../images/banner/10.jpg");
const THEME_PRIMARY = "#ff6b00";

const ForgotPassword = ({ forceRole } = {}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const resetType = useMemo(() => {
    const roleFromState = location.state?.role;
    if (forceRole === "staff" || roleFromState === "staff") return "staff";
    if (
      forceRole === "seller" ||
      forceRole === "partner" ||
      roleFromState === "seller" ||
      roleFromState === "partner"
    ) {
      return "seller";
    }
    return "";
  }, [forceRole, location.state?.role]);

  const isSolarSeller = useMemo(() => {
    if (
      forceRole === "seller" ||
      forceRole === "partner" ||
      forceRole === "staff"
    ) {
      return true;
    }
    const r = location.state?.role;

    return r === "partner" || r === "seller" || r === "staff";
  }, [forceRole, location.state?.role]);

  const API_FORGOT_PASSWORD = isSolarSeller
    ? SOLAR_ENDPOINTS.FORGOT_PASSWORD
    : AUTH_ENDPOINTS.FORGOT_PASSWORD;
  const API_CHANGE_PASSWORD = isSolarSeller
    ? SOLAR_ENDPOINTS.CHANGE_PASSWORD
    : AUTH_ENDPOINTS.CHANGE_PASSWORD;
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("email", email.trim());
      if (isSolarSeller) formData.append("type", resetType);

      const response = await fetch(API_FORGOT_PASSWORD, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setStep("verify");
        setCode("");
        setNewPassword("");
        setConfirmPassword("");
        setShowNewPassword(false);
        setShowConfirmPassword(false);
      } else {
        setError(
          result.message ||
            "Could not send verification code. Please try again.",
        );
      }
    } catch (err) {
      console.error("Forgot password error:", err);
      setError("Unable to send OTP. Please try again or contact support.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email.trim()) return;
    setIsResending(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("email", email.trim());
      if (isSolarSeller) formData.append("type", resetType);
      const response = await fetch(API_FORGOT_PASSWORD, {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (!result.success) {
        setError(result.message || "Could not resend code.");
      }
    } catch (err) {
      setError("Could not resend code. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (!code.trim()) {
      setError("Please enter the verification code from your email.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("email", email.trim());
      if (isSolarSeller) {
        formData.append("verification_code", code.trim());
        formData.append("new_password", newPassword);
        formData.append("type", resetType);
      } else {
        formData.append("code", code.trim());
        formData.append("password", newPassword);
      }

      const response = await fetch(API_CHANGE_PASSWORD, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setSuccessMessage(result.message || "Password changed successfully");
        setShowSuccessModal(true);
      } else {
        setError(
          result.message ||
            "Could not change password. Please check the code and try again.",
        );
      }
    } catch (err) {
      console.error("Change password error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const goBackToEmail = () => {
    setStep("email");
    setError(null);
    setCode("");
    setNewPassword("");
    setConfirmPassword("");
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <>
      <SEO title="Forgot Password" noindex />
      <Header2 />
      <div className="page-content">
        <Banner
          title="Forgot Password"
          pagename="Reset your password"
          description="Enter your email and we'll send you a verification code to reset your password."
          bgimage={SOLAR_IMAGES.bannerSellers}
        />
        <div className="section-full p-t80 p-b80 bg-light">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-5 col-md-7">
                <div className="p-a40 bg-white rounded shadow">
                  {step === "email" && (
                    <>
                      <h3 className="m-b10">Reset Password</h3>
                      <p className="text-muted m-b20">
                        Enter the email address associated with your account.
                      </p>
                      <form onSubmit={handleSendOtp}>
                        <div className="form-group m-b20">
                          <label>Email address</label>
                          <input
                            type="email"
                            className="form-control"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              if (error) setError(null);
                            }}
                            required
                          />
                        </div>
                        {error && <p className="text-danger m-b15">{error}</p>}
                        <button
                          type="submit"
                          className="site-button btn-block"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? "Sending..." : "Send OTP On Email"}
                        </button>
                      </form>
                    </>
                  )}

                  {step === "verify" && (
                    <>
                      <h3 className="m-b10">Verify &amp; set new password</h3>
                      <p className="text-muted m-b20">
                        We sent a verification code to <strong>{email}</strong>.
                        Enter the code and your new password below.
                      </p>
                      <form onSubmit={handleChangePassword}>
                        <div className="form-group m-b15">
                          <label>Verification code (OTP)</label>
                          <input
                            type="text"
                            className="form-control text-center"
                            placeholder="Enter code from email"
                            value={code}
                            onChange={(e) => {
                              setCode(e.target.value.replace(/\s/g, ""));
                              if (error) setError(null);
                            }}
                            maxLength={8}
                            autoComplete="one-time-code"
                            required
                            style={{ letterSpacing: "0.15em", fontWeight: 600 }}
                          />
                        </div>
                        <div className="form-group m-b15">
                          <label>New password</label>
                          <div style={{ position: "relative" }}>
                            <input
                              type={showNewPassword ? "text" : "password"}
                              className="form-control"
                              placeholder="Enter new password"
                              value={newPassword}
                              onChange={(e) => {
                                setNewPassword(e.target.value);
                                if (error) setError(null);
                              }}
                              minLength={6}
                              required
                              style={{ paddingRight: 44 }}
                              autoComplete="new-password"
                            />
                            <button
                              type="button"
                              className="forgot-password-toggle-visibility"
                              onClick={() => setShowNewPassword((v) => !v)}
                              aria-label={
                                showNewPassword
                                  ? "Hide password"
                                  : "Show password"
                              }
                              style={toggleEyeBtnStyle}
                            >
                              <i
                                className={`fa ${showNewPassword ? "fa-eye-slash" : "fa-eye"}`}
                                aria-hidden
                              />
                            </button>
                          </div>
                        </div>
                        <div className="form-group m-b20">
                          <label>Confirm new password</label>
                          <div style={{ position: "relative" }}>
                            <input
                              type={showConfirmPassword ? "text" : "password"}
                              className="form-control"
                              placeholder="Confirm new password"
                              value={confirmPassword}
                              onChange={(e) => {
                                setConfirmPassword(e.target.value);
                                if (error) setError(null);
                              }}
                              minLength={6}
                              required
                              style={{ paddingRight: 44 }}
                              autoComplete="new-password"
                            />
                            <button
                              type="button"
                              className="forgot-password-toggle-visibility"
                              onClick={() => setShowConfirmPassword((v) => !v)}
                              aria-label={
                                showConfirmPassword
                                  ? "Hide password"
                                  : "Show password"
                              }
                              style={toggleEyeBtnStyle}
                            >
                              <i
                                className={`fa ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"}`}
                                aria-hidden
                              />
                            </button>
                          </div>
                        </div>
                        {error && <p className="text-danger m-b15">{error}</p>}
                        <button
                          type="submit"
                          className="site-button btn-block m-b15"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? "Updating..." : "Reset password"}
                        </button>
                        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                          <button
                            type="button"
                            className="btn btn-link p-0"
                            onClick={handleResendOtp}
                            disabled={isResending}
                          >
                            {isResending ? "Sending..." : "Resend OTP"}
                          </button>
                          <button
                            type="button"
                            className="btn btn-link p-0"
                            onClick={goBackToEmail}
                          >
                            Change email
                          </button>
                        </div>
                      </form>
                    </>
                  )}

                  <div className="text-center m-t20">
                    <NavLink to="/login" className="text-primary">
                      Back to Login
                    </NavLink>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer2 />

      {showSuccessModal && (
        <div
          className="forgot-password-success-overlay"
          style={overlayStyle}
          onClick={() => {
            setShowSuccessModal(false);
            navigate("/login");
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Password updated"
        >
          <div
            className="forgot-password-success-card"
            style={successCardStyle}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={successIconWrapStyle}>
              <span style={successIconStyle}>✓</span>
            </div>
            <h3 style={successTitleStyle}>Success</h3>
            <p style={successMessageStyle}>{successMessage}</p>
            <button
              type="button"
              onClick={() => {
                setShowSuccessModal(false);
                navigate("/login");
              }}
              style={successBtnStyle}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </>
  );
};

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.5)",
  backdropFilter: "blur(4px)",
  zIndex: 4000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 20,
};

const successCardStyle = {
  background: "#fff",
  borderRadius: 16,
  boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
  padding: "36px 32px",
  maxWidth: 400,
  width: "100%",
  textAlign: "center",
};

const successIconWrapStyle = {
  width: 64,
  height: 64,
  borderRadius: "50%",
  background: "#dcfce7",
  margin: "0 auto 20px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const successIconStyle = {
  fontSize: 32,
  color: "#16a34a",
  fontWeight: 700,
  lineHeight: 1,
};

const successTitleStyle = {
  margin: "0 0 10px",
  fontSize: "1.5rem",
  fontWeight: 700,
  color: "#1a1a1a",
};

const successMessageStyle = {
  margin: "0 0 24px",
  fontSize: "1.05rem",
  color: "#444",
  lineHeight: 1.5,
};

const successBtnStyle = {
  padding: "12px 40px",
  borderRadius: 10,
  border: "none",
  background: THEME_PRIMARY,
  color: "#fff",
  fontWeight: 600,
  fontSize: "1rem",
  cursor: "pointer",
};

const toggleEyeBtnStyle = {
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

export default ForgotPassword;
