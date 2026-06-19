import React, { useEffect, useMemo, useState } from "react";
import { useSolarRoles } from "../../hooks/useSolarRoles";
import { fetchSolarCities, fetchSolarStates } from "../../api/solarLocations";
import SearchableSelect from "./SearchableSelect";

const PHONE_RE = /^\d{10}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SellerStaffModal({
  open,
  onClose,
  onSave,
  initial,
  roleOptions: providedRoleOptions = [],
  isSaving = false,
  submitError = "",
}) {
  // ✅ Hook ab andar hai
  const { roles: apiRoleOptions, loading: rolesLoading } = useSolarRoles();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    role: "",
    password: "",
    address: "",
    cityId: "",
    stateId: "",
  });
  const [stateOptions, setStateOptions] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);
  const [locationLoading, setLocationLoading] = useState({
    states: false,
    cities: false,
  });
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const normalizedRoles = useMemo(
    () =>
      (apiRoleOptions.length ? apiRoleOptions : providedRoleOptions).map((r) =>
        typeof r === "object"
          ? { id: String(r.id), name: r.name || String(r.id) }
          : { id: String(r), name: String(r) },
      ),
    [apiRoleOptions, providedRoleOptions],
  );
  const roleSelectOptions = useMemo(
    () => normalizedRoles.map((r) => ({ value: r.id, label: r.name })),
    [normalizedRoles],
  );

  useEffect(() => {
    if (!open) return undefined;
    let alive = true;
    async function loadStates() {
      setLocationLoading((prev) => ({ ...prev, states: true }));
      try {
        const states = await fetchSolarStates();
        if (!alive) return;
        setStateOptions(
          states.map((state) => ({
            value: String(state.id),
            label: state.name,
          })),
        );
      } catch (error) {
        if (!alive) return;
        console.error("Failed to load staff states", error);
        setStateOptions([]);
      } finally {
        if (alive) {
          setLocationLoading((prev) => ({ ...prev, states: false }));
        }
      }
    }
    loadStates();
    return () => {
      alive = false;
    };
  }, [open]);

  useEffect(() => {
    if (!open || !form.stateId) {
      setCityOptions([]);
      return undefined;
    }
    let alive = true;
    async function loadCities() {
      setLocationLoading((prev) => ({ ...prev, cities: true }));
      try {
        const cities = await fetchSolarCities(form.stateId);
        if (!alive) return;
        setCityOptions(
          cities.map((city) => ({
            value: String(city.id),
            label: city.name,
          })),
        );
      } catch (error) {
        if (!alive) return;
        console.error("Failed to load staff cities", error);
        setCityOptions([]);
      } finally {
        if (alive) {
          setLocationLoading((prev) => ({ ...prev, cities: false }));
        }
      }
    }
    loadCities();
    return () => {
      alive = false;
    };
  }, [form.stateId, open]);

  useEffect(() => {
    if (open && normalizedRoles.length) {
      setHasSubmitted(false); // Reset submit state on open
      if (initial) {
        setForm({
          name: initial.name || "",
          phone: String(initial.phone || "")
            .replace(/\D/g, "")
            .slice(0, 10),
          email: initial.email || "",
          role: String(initial.roleId || normalizedRoles[0]?.id || ""),
          password: "",
          address: initial.address || "",
          cityId: initial.cityId ? String(initial.cityId) : "",
          stateId: initial.stateId ? String(initial.stateId) : "",
        });
      } else {
        setForm({
          name: "",
          phone: "",
          email: "",
          role: normalizedRoles[0]?.id || "",
          password: "",
          address: "",
          cityId: "",
          stateId: "",
        });
      }
    }
  }, [open, initial, normalizedRoles]);

  const fieldErrors = useMemo(() => {
    const e = {};
    if (!String(form.name || "").trim()) e.name = "Name is required.";
    const p = String(form.phone || "").replace(/\D/g, "");
    if (!p) e.phone = "Phone is required.";
    else if (!PHONE_RE.test(p)) e.phone = "Enter 10-digit phone number.";
    if (!String(form.email || "").trim()) e.email = "Email is required.";
    else if (!EMAIL_RE.test(String(form.email || "").trim()))
      e.email = "Invalid email.";
    if (!form.role) e.role = "Role is required.";
    else if (!normalizedRoles.some((role) => role.id === String(form.role))) {
      e.role = "Please select a valid staff role from role list.";
    }
    if (!form.stateId) e.stateId = "State is required.";
    if (!form.cityId) e.cityId = "City is required.";
    if (!String(form.address || "").trim()) e.address = "Address is required.";
    if (!initial) {
      const pwd = String(form.password || "").trim();
      if (!pwd) {
        e.password = "Password is required.";
      } else if (pwd.length < 6) {
        e.password = "Password kam se kam 6 characters ka hona chahiye.";
      }
    }
    // if (!initial && !String(form.password || "").trim())
    //   e.password = "Password is required.";
    return e;
  }, [form, initial, normalizedRoles]);

  const isValid = Object.keys(fieldErrors).length === 0;

  const handleSubmit = (ev) => {
    ev.preventDefault();
    setHasSubmitted(true);
    if (!isValid || isSaving) return;
    const payload = {
      name: form.name.trim(),
      phone: String(form.phone).replace(/\D/g, ""),
      email: form.email.trim().toLowerCase(),
      role:
        normalizedRoles.find((r) => r.id === String(form.role))?.name ||
        String(form.role),
      roleId: String(form.role),
      password: form.password.trim(),
      address: form.address.trim(),
      stateId: String(form.stateId),
      cityId: String(form.cityId),
    };
    onSave(payload);
  };

  if (!open) return null;

  return (
    <div
      className="seller-crm-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="staff-modal-title"
    >
      <div className="seller-crm-modal-card seller-crm-modal-card--md">
        <div className="seller-crm-modal-head">
          <h3 id="staff-modal-title">
            {initial ? "Edit staff member" : "Add staff member"}
          </h3>
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
          {submitError ? (
            <div className="alert alert-warning">
              {typeof submitError === "object"
                ? Object.values(submitError)
                    .map((val) => (Array.isArray(val) ? val.join(", ") : val))
                    .join(" | ")
                : String(submitError)}
            </div>
          ) : null}
          <div className="seller-crm-form-grid">
            <div className="seller-crm-form-field">
              <label>Name *</label>
              <input
                className="form-control"
                value={form.name}
                required
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
              />
              {hasSubmitted && fieldErrors.name && (
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
              {hasSubmitted && fieldErrors.phone && (
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
                readOnly={!!initial}
                style={
                  initial
                    ? { backgroundColor: "#f5f5f5", cursor: "not-allowed" }
                    : {}
                }
                onChange={(e) =>
                  !initial && setForm((f) => ({ ...f, email: e.target.value }))
                }
              />
              {hasSubmitted && fieldErrors.email && (
                <span className="seller-crm-field-error">
                  {fieldErrors.email}
                </span>
              )}
            </div>
            <div className="seller-crm-form-field">
              <label>Role *</label>
              {rolesLoading ? (
                <SearchableSelect
                  value=""
                  options={[]}
                  onChange={() => {}}
                  placeholder="Loading roles..."
                  isDisabled
                  isLoading
                />
              ) : normalizedRoles.length ? (
                <SearchableSelect
                  value={form.role}
                  options={roleSelectOptions}
                  onChange={(value) => setForm((f) => ({ ...f, role: value }))}
                  placeholder="Search role..."
                />
              ) : (
                <SearchableSelect
                  value=""
                  options={[]}
                  onChange={() => {}}
                  placeholder="No roles found"
                  isDisabled
                />
              )}
              {hasSubmitted && fieldErrors.role && (
                <span className="seller-crm-field-error">
                  {fieldErrors.role}
                </span>
              )}
            </div>
            {!initial ? (
              <div className="seller-crm-form-field">
                <label>Password *</label>
                <input
                  // type="password"
                  className="form-control"
                  value={form.password}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, password: e.target.value }))
                  }
                  placeholder={initial ? "password" : ""}
                />
                {hasSubmitted && fieldErrors.password && (
                  <span className="seller-crm-field-error">
                    {fieldErrors.password}
                  </span>
                )}
              </div>
            ) : null}
            <div className="seller-crm-form-field">
              <label>State *</label>
              <SearchableSelect
                value={form.stateId}
                options={stateOptions}
                onChange={(value) =>
                  setForm((f) => ({ ...f, stateId: value, cityId: "" }))
                }
                placeholder="Search state..."
                isLoading={locationLoading.states}
                isClearable
              />
              {hasSubmitted && fieldErrors.stateId && (
                <span className="seller-crm-field-error">
                  {fieldErrors.stateId}
                </span>
              )}
            </div>
            <div className="seller-crm-form-field">
              <label>City *</label>
              <SearchableSelect
                value={form.cityId}
                options={cityOptions}
                onChange={(value) =>
                  setForm((f) => ({ ...f, cityId: value }))
                }
                placeholder={form.stateId ? "Search city..." : "Select state first"}
                isDisabled={!form.stateId}
                isLoading={locationLoading.cities}
                isClearable
              />
              {hasSubmitted && fieldErrors.cityId && (
                <span className="seller-crm-field-error">
                  {fieldErrors.cityId}
                </span>
              )}
            </div>
            <div className="seller-crm-form-field">
              <label>Address *</label>
              <textarea
                className="form-control"
                rows={2}
                value={form.address}
                onChange={(e) =>
                  setForm((f) => ({ ...f, address: e.target.value }))
                }
                placeholder="Enter address"
              />
              {hasSubmitted && fieldErrors.address && (
                <span className="seller-crm-field-error">
                  {fieldErrors.address}
                </span>
              )}
            </div>
          </div>
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
              <span>
                {isSaving
                  ? "Saving..."
                  : initial
                    ? "Save changes"
                    : "Add staff"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
