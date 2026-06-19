import React, { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import Select from "react-select";
import {
  getCurrentInquiryUserId,
  submitSolarInquiry,
} from "../../api/solarInquiry";
import { fetchSolarStates, fetchSolarCities } from "../../api/solarLocations";
import { useAuth } from "../../context/AuthContext";

const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  state: "",
  stateId: "",
  city: "",
  cityId: "",
  address: "",
  message: "",
};

const PHONE_RE = /^\d{10}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SolarEnquiryModal({
  open,
  onClose,
  sellerId,
  serviceId,
  sellerName = "",
  serviceName = "",
}) {
  const { auth, isLoggedIn } = useAuth();
  const loggedInUserId = auth?.userId || getCurrentInquiryUserId();
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showThankYou, setShowThankYou] = useState(false);
  const [statesList, setStatesList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  const selectStyles = {
    menuPortal: (base) => ({ ...base, zIndex: 20000 }),
  };

  useEffect(() => {
    let alive = true;
    async function loadStates() {
      setLoadingStates(true);
      try {
        const data = await fetchSolarStates();
        if (alive) {
          setStatesList(data.map((s) => ({ value: s.id, label: s.name })));
        }
      } catch (e) {
        console.error("Failed to load states", e);
      } finally {
        if (alive) setLoadingStates(false);
      }
    }
    loadStates();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    setForm((prev) => ({
      ...EMPTY_FORM,
      message: serviceName ? `I am interested in ${serviceName}.` : "",
      ...prev,
    }));
    setSubmitted(false);
    setSaving(false);
    setError("");
    setShowThankYou(false);
  }, [open, serviceName]);

  const fieldErrors = useMemo(() => {
    const next = {};
    const name = form.name.trim();
    const email = form.email.trim();
    const phone = form.phone.replace(/\D/g, "");

    if (!name) next.name = "Name is required.";
    if (!phone) next.phone = "Phone is required.";
    else if (!PHONE_RE.test(phone)) next.phone = "Enter 10-digit phone number.";
    if (!email) next.email = "Email is required.";
    else if (!EMAIL_RE.test(email)) next.email = "Enter a valid email.";
    if (!String(form.stateId || "").trim()) next.state = "State is required.";
    if (!String(form.cityId || "").trim()) next.city = "City is required.";
    if (!form.address.trim()) next.address = "Address is required.";
    if (!form.message.trim()) next.message = "Message is required.";
    return next;
  }, [form]);

  const isValid = Object.keys(fieldErrors).length === 0;

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleStateChange = async (option) => {
    const stateId = option ? option.value : "";
    const stateName = option ? option.label : "";
    setForm((prev) => ({
      ...prev,
      state: stateName,
      stateId,
      city: "",
      cityId: "",
    }));
    setCitiesList([]);
    if (!stateId) return;
    setLoadingCities(true);
    try {
      const data = await fetchSolarCities(stateId);
      setCitiesList(data.map((c) => ({ value: c.id, label: c.name })));
    } catch (e) {
      console.error("Failed to load cities", e);
    } finally {
      setLoadingCities(false);
    }
  };

  const handleCityChange = (option) => {
    setForm((prev) => ({
      ...prev,
      city: option ? option.label : "",
      cityId: option ? option.value : "",
    }));
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setSubmitted(true);
    setError("");
    const userId = loggedInUserId;
    if (!userId) {
      setError("Please login first to submit enquiry.");
      return;
    }
    if (!isValid || saving) return;

    setSaving(true);
    try {
      const selectedServices = [
        serviceName ||
          (sellerName
            ? `General enquiry for ${sellerName}`
            : "General Solar Enquiry"),
      ];

      await submitSolarInquiry(
        {
          ...form,
          address: form.address,
          phone: form.phone.replace(/\D/g, ""),
          sellerId,
          serviceId,
          propertyId: serviceId,
          service: selectedServices,
          userId,
        },
        userId,
      );
      setForm(EMPTY_FORM);
      setSubmitted(false);
      setShowThankYou(true);
    } catch (err) {
      setError(
        err?.message || "Unable to submit enquiry right now. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  if (showThankYou) {
    return (
      <div
        className="modal fade show"
        role="dialog"
        aria-modal="true"
        style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header border-0">
              <button
                type="button"
                className="close"
                onClick={() => {
                  setShowThankYou(false);
                  onClose();
                }}
                aria-label="Close"
              >
                <span>&times;</span>
              </button>
            </div>
            <div className="modal-body text-center p-4">
              <div className="mb-3">
                <i
                  className="fa fa-check-circle"
                  style={{ fontSize: "60px", color: "#28a745" }}
                />
              </div>
              <h3 style={{ color: "#28a745", marginBottom: "20px" }}>
                Thank You!
              </h3>
              <p>Your property enquiry has been submitted successfully</p>
              <p>We'll get back to you soon!</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="seller-crm-modal-overlay"
      role="dialog"
      aria-modal="true"
      onMouseDown={(ev) => ev.target === ev.currentTarget && onClose()}
    >
      <div className="seller-crm-modal-card seller-crm-modal-card--md">
        <div className="seller-crm-modal-head">
          <h3>Send Enquiry</h3>
          <button
            type="button"
            className="seller-crm-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        <form
          className="seller-crm-modal-body"
          onSubmit={handleSubmit}
          noValidate
        >
          {error ? <div className="alert alert-warning">{error}</div> : null}

          {!isLoggedIn && !loggedInUserId ? (
            <div className="seller-crm-login-required">
              <p>Please login first to submit enquiry.</p>
              <NavLink className="seller-crm-btn-orange" to="/login">
                Login
              </NavLink>
            </div>
          ) : (
            <>
              <div className="seller-crm-form-grid">
                <div className="seller-crm-form-field">
                  <label>Name *</label>
                  <input
                    className="form-control"
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={form.name}
                    onChange={(ev) => setField("name", ev.target.value)}
                  />
                  {submitted && fieldErrors.name ? (
                    <span className="seller-crm-field-error">
                      {fieldErrors.name}
                    </span>
                  ) : null}
                </div>
                <div className="seller-crm-form-field">
                  <label>Phone *</label>
                  <input
                    className="form-control"
                    inputMode="numeric"
                    placeholder="Mobile no."
                    value={form.phone}
                    onChange={(ev) =>
                      setField(
                        "phone",
                        ev.target.value.replace(/\D/g, "").slice(0, 10),
                      )
                    }
                  />
                  {submitted && fieldErrors.phone ? (
                    <span className="seller-crm-field-error">
                      {fieldErrors.phone}
                    </span>
                  ) : null}
                </div>
                <div className="seller-crm-form-field">
                  <label>Email *</label>
                  <input
                    className="form-control"
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={(ev) => setField("email", ev.target.value)}
                  />
                  {submitted && fieldErrors.email ? (
                    <span className="seller-crm-field-error">
                      {fieldErrors.email}
                    </span>
                  ) : null}
                </div>
                <div className="seller-crm-form-field">
                  <label>State *</label>
                  <Select
                    options={statesList}
                    isLoading={loadingStates}
                    value={
                      form.stateId
                        ? { value: form.stateId, label: form.state }
                        : null
                    }
                    onChange={handleStateChange}
                    placeholder="Select state"
                    isClearable
                    menuPortalTarget={document.body}
                    styles={selectStyles}
                  />
                  {submitted && fieldErrors.state ? (
                    <span className="seller-crm-field-error">
                      {fieldErrors.state}
                    </span>
                  ) : null}
                </div>
                <div className="seller-crm-form-field">
                  <label>City *</label>
                  <Select
                    options={citiesList}
                    isLoading={loadingCities}
                    value={
                      form.cityId
                        ? { value: form.cityId, label: form.city }
                        : null
                    }
                    onChange={handleCityChange}
                    placeholder={
                      !form.stateId ? "Select state first" : "Select city"
                    }
                    isDisabled={!form.stateId}
                    isClearable
                    menuPortalTarget={document.body}
                    styles={selectStyles}
                  />
                  {submitted && fieldErrors.city ? (
                    <span className="seller-crm-field-error">
                      {fieldErrors.city}
                    </span>
                  ) : null}
                </div>
                <div className="seller-crm-form-field">
                  <label>Address *</label>
                  <input
                    className="form-control"
                    value={form.address}
                    onChange={(ev) => setField("address", ev.target.value)}
                  />
                  {submitted && fieldErrors.address ? (
                    <span className="seller-crm-field-error">
                      {fieldErrors.address}
                    </span>
                  ) : null}
                </div>
                <div className="seller-crm-form-field seller-crm-form-field--full">
                  <label>Message *</label>
                  <textarea
                    className="form-control"
                    rows={4}
                    value={form.message}
                    onChange={(ev) => setField("message", ev.target.value)}
                  />
                  {submitted && fieldErrors.message ? (
                    <span className="seller-crm-field-error">
                      {fieldErrors.message}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="seller-crm-modal-actions">
                <button
                  type="button"
                  className="seller-crm-btn-outline"
                  onClick={onClose}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="seller-crm-btn-orange"
                  disabled={saving}
                >
                  {saving ? "Submitting..." : "Submit"}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
