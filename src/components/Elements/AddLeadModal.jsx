import React, { useMemo, useState, useEffect } from "react";
import Select from "react-select";

const PHONE_RE = /^\d{10}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SYSTEM_SIZES = ["3KW", "5KW", "10KW"];
const selectPortalTarget =
  typeof document !== "undefined" ? document.body : null;
const modalSelectStyles = {
  menuPortal: (base) => ({ ...base, zIndex: 20000 }),
};

export default function AddLeadModal({
  open,
  onClose,
  onSave,
  isSaving = false,
  staffOptions = [],
  stateOptions = [],
  cityOptions = [],
  serviceOptions = [],
  loadingStates = false,
  loadingCities = false,
  loadingServices = false,
  onStateChange,
  error = "",
}) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    stateId: "",
    cityId: "",
    installationAddress: "",
    message: "",
    serviceId: "",
    systemSize: "3KW",
    dealAmount: "",
  });

  useEffect(() => {
    if (open) {
      setIsSubmitted(false);
      setForm({
        name: "",
        phone: "",
        email: "",
        address: "",
        stateId: "",
        cityId: "",
        installationAddress: "",
        message: "",
        serviceId: "",
        systemSize: "3KW",
        dealAmount: "",
      });
    }
  }, [open, staffOptions]);

  const fieldErrors = useMemo(() => {
    const e = {};
    if (!String(form.name || "").trim()) e.name = "Name is required.";
    const p = String(form.phone || "").replace(/\D/g, "");
    if (!p) e.phone = "Phone is required.";
    else if (!PHONE_RE.test(p)) e.phone = "Enter 10-digit phone number.";
    if (!String(form.email || "").trim()) e.email = "Email is required.";
    else if (!EMAIL_RE.test(String(form.email || "").trim()))
      e.email = "Invalid email.";
    if (!String(form.address || "").trim()) e.address = "Address is required.";
    if (!form.stateId) e.stateId = "State is required.";
    if (!form.cityId) e.cityId = "City is required.";
    if (!String(form.installationAddress || "").trim())
      e.installationAddress = "Installation address is required.";
    if (!String(form.message || "").trim()) e.message = "Message is required.";
    if (!form.serviceId) e.serviceId = "Service is required.";
    if (!form.systemSize) e.systemSize = "System size is required.";

    if (!String(form.dealAmount || "").trim())
      e.dealAmount = "Deal amount is required.";
    else if (isNaN(Number(form.dealAmount)))
      e.dealAmount = "Deal amount must be a number.";

    return e;
  }, [form]);

  const isValid = Object.keys(fieldErrors).length === 0;
  const systemSizeOptions = useMemo(
    () => SYSTEM_SIZES.map((size) => ({ value: size, label: size })),
    [],
  );
  const selectedCity = useMemo(
    () => cityOptions.find((option) => option.value === form.cityId) || null,
    [cityOptions, form.cityId],
  );
  const selectedService = useMemo(
    () =>
      serviceOptions.find((option) => option.value === form.serviceId) || null,
    [serviceOptions, form.serviceId],
  );

  const handleSubmit = (ev) => {
    ev.preventDefault();
    setIsSubmitted(true);
    if (!isValid || isSaving) return;
    onSave({
      name: form.name.trim(),
      phone: String(form.phone).replace(/\D/g, ""),
      email: form.email.trim().toLowerCase(),
      address: form.address.trim(),
      stateId: form.stateId,
      cityId: form.cityId,
      city: selectedCity?.label || "",
      installationAddress: form.installationAddress.trim(),
      message: form.message.trim(),
      serviceId: form.serviceId,
      serviceName: selectedService?.label || "",
      services: selectedService?.label ? [selectedService.label] : [],
      systemSize: form.systemSize,
      dealAmount: Number(form.dealAmount),
    });
  };

  if (!open) return null;

  return (
    <div className="seller-crm-modal-overlay" role="dialog" aria-modal="true">
      <div className="seller-crm-modal-card seller-crm-modal-card--md">
        <div className="seller-crm-modal-head">
          <h3>Add Lead</h3>
          <button
            type="button"
            className="seller-crm-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        <form className="seller-crm-modal-body" onSubmit={handleSubmit}>
          <div className="seller-crm-form-grid">
            <div className="seller-crm-form-field">
              <label>Name *</label>
              <input
                className="form-control"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
              />
              {isSubmitted && fieldErrors.name && (
                <span className="seller-crm-field-error">
                  {fieldErrors.name}
                </span>
              )}
            </div>
            <div className="seller-crm-form-field">
              <label>Phone *</label>
              <input
                className="form-control"
                inputMode="numeric"
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                  }))
                }
              />
              {isSubmitted && fieldErrors.phone && (
                <span className="seller-crm-field-error">
                  {fieldErrors.phone}
                </span>
              )}
            </div>
            <div className="seller-crm-form-field">
              <label>Email *</label>
              <input
                type="email"
                className="form-control"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
              />
              {isSubmitted && fieldErrors.email && (
                <span className="seller-crm-field-error">
                  {fieldErrors.email}
                </span>
              )}
            </div>
            <div className="seller-crm-form-field">
              <label>Address *</label>
              <input
                className="form-control"
                value={form.address}
                onChange={(e) =>
                  setForm((f) => ({ ...f, address: e.target.value }))
                }
              />
              {isSubmitted && fieldErrors.address && (
                <span className="seller-crm-field-error">
                  {fieldErrors.address}
                </span>
              )}
            </div>
            <div className="seller-crm-form-field">
              <label>State *</label>
              <Select
                classNamePrefix="seller-crm-select"
                options={stateOptions}
                value={
                  stateOptions.find((option) => option.value === form.stateId) ||
                  null
                }
                onChange={(selected) => {
                  const nextStateId = selected ? selected.value : "";
                  setForm((f) => ({
                    ...f,
                    stateId: nextStateId,
                    cityId: "",
                  }));
                  onStateChange?.(nextStateId);
                }}
                isClearable
                isSearchable
                isLoading={loadingStates}
                placeholder="Search state..."
                menuPortalTarget={selectPortalTarget}
                menuPosition="fixed"
                menuShouldBlockScroll
                styles={modalSelectStyles}
              />
              {isSubmitted && fieldErrors.stateId && (
                <span className="seller-crm-field-error">
                  {fieldErrors.stateId}
                </span>
              )}
            </div>
            <div className="seller-crm-form-field">
              <label>City *</label>
              <Select
                classNamePrefix="seller-crm-select"
                options={cityOptions}
                value={selectedCity}
                onChange={(selected) =>
                  setForm((f) => ({
                    ...f,
                    cityId: selected ? selected.value : "",
                  }))
                }
                isClearable
                isSearchable
                isLoading={loadingCities}
                isDisabled={!form.stateId}
                placeholder={form.stateId ? "Search city..." : "Select state first"}
                menuPortalTarget={selectPortalTarget}
                menuPosition="fixed"
                menuShouldBlockScroll
                styles={modalSelectStyles}
              />
              {isSubmitted && fieldErrors.cityId && (
                <span className="seller-crm-field-error">
                  {fieldErrors.cityId}
                </span>
              )}
            </div>
            <div className="seller-crm-form-field">
              <label>Deal Amount *</label>
              <input
                type="number"
                className="form-control"
                value={form.dealAmount}
                onChange={(e) =>
                  setForm((f) => ({ ...f, dealAmount: e.target.value }))
                }
              />
              {isSubmitted && fieldErrors.dealAmount && (
                <span className="seller-crm-field-error">
                  {fieldErrors.dealAmount}
                </span>
              )}
            </div>
            <div className="seller-crm-form-field">
              <label>Service *</label>
              <Select
                classNamePrefix="seller-crm-select"
                options={serviceOptions}
                value={selectedService}
                onChange={(selected) =>
                  setForm((f) => ({
                    ...f,
                    serviceId: selected ? selected.value : "",
                  }))
                }
                isClearable
                isSearchable
                isLoading={loadingServices}
                placeholder="Search service..."
                menuPortalTarget={selectPortalTarget}
                menuPosition="fixed"
                menuShouldBlockScroll
                styles={modalSelectStyles}
              />
              {isSubmitted && fieldErrors.serviceId && (
                <span className="seller-crm-field-error">
                  {fieldErrors.serviceId}
                </span>
              )}
            </div>
            <div className="seller-crm-form-field">
              <label>System Size *</label>
              <Select
                classNamePrefix="seller-crm-select"
                options={systemSizeOptions}
                value={
                  systemSizeOptions.find(
                    (option) => option.value === form.systemSize,
                  ) || null
                }
                onChange={(selected) =>
                  setForm((f) => ({
                    ...f,
                    systemSize: selected ? selected.value : "",
                  }))
                }
                isSearchable
                placeholder="Search system size..."
                menuPortalTarget={selectPortalTarget}
                menuPosition="fixed"
                menuShouldBlockScroll
                styles={modalSelectStyles}
              />
              {isSubmitted && fieldErrors.systemSize && (
                <span className="seller-crm-field-error">
                  {fieldErrors.systemSize}
                </span>
              )}
            </div>
            <div className="seller-crm-form-field seller-crm-form-field--full">
              <label>Installation Address *</label>
              <input
                className="form-control"
                value={form.installationAddress}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    installationAddress: e.target.value,
                  }))
                }
              />
              {isSubmitted && fieldErrors.installationAddress && (
                <span className="seller-crm-field-error">
                  {fieldErrors.installationAddress}
                </span>
              )}
            </div>
            <div className="seller-crm-form-field seller-crm-form-field--full">
              <label>Message *</label>
              <textarea
                className="form-control"
                rows={3}
                value={form.message}
                onChange={(e) =>
                  setForm((f) => ({ ...f, message: e.target.value }))
                }
              />
              {isSubmitted && fieldErrors.message && (
                <span className="seller-crm-field-error">
                  {fieldErrors.message}
                </span>
              )}
            </div>
          </div>
          {error ? <div className="alert alert-danger m-t15">{error}</div> : null}
          <div className="seller-crm-modal-actions">
            <button
              type="button"
              className="site-button-secondry"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button type="submit" className="site-button" disabled={isSaving}>
              <span>{isSaving ? "Saving..." : "Add Lead"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
