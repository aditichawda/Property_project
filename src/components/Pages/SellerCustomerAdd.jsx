import React, { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import { NavLink, useNavigate } from "react-router-dom";
import Header2 from "../Common/Header2";
import Footer2 from "../Common/Footer2";
import SellerDashboardLayout from "../Elements/SellerDashboardLayout";
import { fetchSolarStates, fetchSolarCities } from "../../api/solarLocations";
import { fetchSolarSellerServicesForUser } from "../../api/solarSellerServices";
import { fetchSolarServiceFormOptions } from "../../api/solarServiceOptions";
import { storeSolarConvertedEnquiryLead } from "../../api/solarEnquiries";
import { useAuth } from "../../context/AuthContext";
import { safeJsonParse } from "../../utils/safeJsonParse";

const PHONE_RE = /^\d{10}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const selectPortalTarget =
  typeof document !== "undefined" ? document.body : null;
const selectStyles = {
  menuPortal: (base) => ({ ...base, zIndex: 20000 }),
};

function readSellerInfo() {
  if (typeof window === "undefined") return {};
  return safeJsonParse(localStorage.getItem("sellerInfo"), {}) || {};
}

export default function SellerCustomerAdd() {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const seller = readSellerInfo();
  const currentSellerId =
    seller.solar_user_id ||
    seller.seller_id ||
    auth?.solar_user_id ||
    auth?.sellerId ||
    auth?.userId ||
    seller.id;
  const isStaffLogin =
    auth?.loginType === "staff" ||
    auth?.type === "staff" ||
    seller?.isStaff === true ||
    seller?.type === "staff";
  const currentStaffId =
    auth?.staffId || seller?.staffId || seller?.staff_id || seller?.id;

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
    systemSize: "",
    dealAmount: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [stateOptions, setStateOptions] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);
  const [serviceOptions, setServiceOptions] = useState([]);
  const [systemSizes, setSystemSizes] = useState([]);
  const [loading, setLoading] = useState({
    states: false,
    cities: false,
    services: false,
    systemSizes: false,
  });

  const systemSizeOptions = useMemo(
    () => systemSizes.map((size) => ({ value: size, label: size })),
    [systemSizes],
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

  useEffect(() => {
    let alive = true;
    async function loadLookups() {
      if (!currentSellerId) return;
      setLoading((prev) => ({
        ...prev,
        states: true,
        services: true,
        systemSizes: true,
      }));
      try {
        const [states, servicesResponse, optionsResponse] = await Promise.all([
          fetchSolarStates(),
          fetchSolarSellerServicesForUser(currentSellerId),
          fetchSolarServiceFormOptions(),
        ]);
        if (!alive) return;
        setStateOptions(
          states.map((item) => ({
            value: String(item.id),
            label: item.name,
          })),
        );
        const servicesList = Array.isArray(servicesResponse?.data)
          ? servicesResponse.data
          : [];
        setServiceOptions(
          servicesList
            .filter((service) => service?.id)
            .map((service) => ({
              value: String(service.id),
              label:
                service.title ||
                service.name ||
                service.service_title ||
                `Service ${service.id}`,
            })),
        );
        const optionData = optionsResponse?.data || {};
        const sizes = (optionData.solar_service_categories || [])
          .map((item) => item?.name)
          .filter(Boolean);
        setSystemSizes(
          sizes.length ? sizes : ["1KW", "2KW", "3KW", "5KW", "10KW"],
        );
      } catch (error) {
        console.error("Failed to load add lead options", error);
        if (alive) setSystemSizes(["1KW", "2KW", "3KW", "5KW", "10KW"]);
      } finally {
        if (alive) {
          setLoading((prev) => ({
            ...prev,
            states: false,
            services: false,
            systemSizes: false,
          }));
        }
      }
    }
    loadLookups();
    return () => {
      alive = false;
    };
  }, [currentSellerId]);

  const loadCities = async (stateId) => {
    setCityOptions([]);
    if (!stateId) return;
    setLoading((prev) => ({ ...prev, cities: true }));
    try {
      const cities = await fetchSolarCities(stateId);
      setCityOptions(
        cities.map((item) => ({ value: String(item.id), label: item.name })),
      );
    } catch (error) {
      console.error("Failed to load cities", error);
      setCityOptions([]);
    } finally {
      setLoading((prev) => ({ ...prev, cities: false }));
    }
  };

  const errors = useMemo(() => {
    const next = {};
    const phone = String(form.phone || "").replace(/\D/g, "");
    if (!form.name.trim()) next.name = "Name is required.";
    if (!phone) next.phone = "Phone is required.";
    else if (!PHONE_RE.test(phone)) next.phone = "Enter 10-digit phone number.";
    if (!form.email.trim()) next.email = "Email is required.";
    else if (!EMAIL_RE.test(form.email.trim())) next.email = "Invalid email.";
    // if (!form.address.trim()) next.address = "Address is required.";
    if (!form.stateId) next.stateId = "State is required.";
    if (!form.cityId) next.cityId = "City is required.";
    if (!form.serviceId) next.serviceId = "Service is required.";
    if (!form.systemSize) next.systemSize = "System size is required.";
    if (!form.dealAmount.trim()) next.dealAmount = "Deal amount is required.";
    else if (isNaN(Number(form.dealAmount)))
      next.dealAmount = "Deal amount must be a number.";
    if (!form.installationAddress.trim())
      next.installationAddress = "Installation address is required.";
    if (!form.message.trim()) next.message = "Message is required.";
    return next;
  }, [form]);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSubmitError("");
  };

  const submitLead = async (event) => {
    event.preventDefault();
    setSubmitted(true);
    if (Object.keys(errors).length || saving) return;
    setSaving(true);
    setSubmitError("");
    try {
      await storeSolarConvertedEnquiryLead({
        sellerId: currentSellerId,
        createdByStaffId: isStaffLogin ? currentStaffId : "",
        name: form.name,
        phone: String(form.phone).replace(/\D/g, ""),
        email: form.email.trim().toLowerCase(),
        cityId: form.cityId,
        stateId: form.stateId,
        // address: form.address,
        message: form.message,
        services: selectedService?.label ? [selectedService.label] : [],
        dealAmount: form.dealAmount,
        systemSize: form.systemSize,
        installationAddress: form.installationAddress,
        serviceId: form.serviceId,
      });
      setSuccessMessage("Lead added successfully.");
      window.setTimeout(() => {
        navigate("/seller-customers");
      }, 1800);
    } catch (error) {
      setSubmitError(error?.message || "Unable to add lead right now.");
    } finally {
      setSaving(false);
    }
  };

  const renderError = (key) =>
    submitted && errors[key] ? (
      <span className="seller-crm-field-error">{errors[key]}</span>
    ) : null;

  return (
    <>
      <Header2 stickyNo />
      <div className="page-content">
        <SellerDashboardLayout>
          <div className="seller-crm-content seller-crm-content--flush seller-crm-add-lead-page">
            <div className="seller-crm-panel-head seller-crm-panel-head--table">
              <div>
                <h2 className="seller-crm-panel-title">Add Lead</h2>
              </div>
              <NavLink
                to="/seller-customers"
                className="seller-crm-btn-outline"
              >
                <i className="fa fa-arrow-left m-r8 mr-2" aria-hidden /> Back
              </NavLink>
            </div>

            <form onSubmit={submitLead}>
              <div className="seller-crm-form-grid seller-crm-form-grid--3">
                <div className="col-md-4">
                  <label>Name *</label>
                  <input
                    className="form-control"
                    placeholder="Enter customer name"
                    value={form.name}
                    onChange={(event) => setField("name", event.target.value)}
                  />
                  {renderError("name")}
                </div>
                <div className="col-md-4">
                  <label>Phone *</label>
                  <input
                    className="form-control"
                    inputMode="numeric"
                    placeholder="Enter 10-digit phone number"
                    value={form.phone}
                    onChange={(event) =>
                      setField(
                        "phone",
                        event.target.value.replace(/\D/g, "").slice(0, 10),
                      )
                    }
                  />
                  {renderError("phone")}
                </div>
                <div className="col-md-4">
                  <label>Email *</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Enter email address"
                    value={form.email}
                    onChange={(event) => setField("email", event.target.value)}
                  />
                  {renderError("email")}
                </div>
                <div className="col-md-4">
                  <label>Service *</label>
                  <Select
                    classNamePrefix="seller-crm-select"
                    options={serviceOptions}
                    value={selectedService}
                    onChange={(selected) =>
                      setField("serviceId", selected ? selected.value : "")
                    }
                    isClearable
                    isSearchable
                    isLoading={loading.services}
                    placeholder="Search service..."
                    menuPortalTarget={selectPortalTarget}
                    menuPosition="fixed"
                    menuShouldBlockScroll
                    styles={selectStyles}
                  />
                  {renderError("serviceId")}
                </div>
                <div className="col-md-4">
                  <label>State *</label>
                  <Select
                    classNamePrefix="seller-crm-select"
                    options={stateOptions}
                    value={
                      stateOptions.find(
                        (option) => option.value === form.stateId,
                      ) || null
                    }
                    onChange={(selected) => {
                      const stateId = selected ? selected.value : "";
                      setForm((prev) => ({ ...prev, stateId, cityId: "" }));
                      setSubmitError("");
                      loadCities(stateId);
                    }}
                    isClearable
                    isSearchable
                    isLoading={loading.states}
                    placeholder="Search state..."
                    menuPortalTarget={selectPortalTarget}
                    menuPosition="fixed"
                    menuShouldBlockScroll
                    styles={selectStyles}
                  />
                  {renderError("stateId")}
                </div>
                <div className="col-md-4">
                  <label>City *</label>
                  <Select
                    classNamePrefix="seller-crm-select"
                    options={cityOptions}
                    value={selectedCity}
                    onChange={(selected) =>
                      setField("cityId", selected ? selected.value : "")
                    }
                    isClearable
                    isSearchable
                    isLoading={loading.cities}
                    isDisabled={!form.stateId}
                    placeholder={
                      form.stateId ? "Search city..." : "Select state first"
                    }
                    menuPortalTarget={selectPortalTarget}
                    menuPosition="fixed"
                    menuShouldBlockScroll
                    styles={selectStyles}
                  />
                  {renderError("cityId")}
                </div>
                <div className="col-md-6">
                  <label>Deal Amount *</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Enter deal amount"
                    value={form.dealAmount}
                    onChange={(event) =>
                      setField("dealAmount", event.target.value)
                    }
                  />
                  {renderError("dealAmount")}
                </div>
                <div className="col-md-6">
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
                      setField("systemSize", selected ? selected.value : "")
                    }
                    isClearable
                    isSearchable
                    isLoading={loading.systemSizes}
                    placeholder={
                      loading.systemSizes
                        ? "Loading system sizes..."
                        : "Search system size..."
                    }
                    menuPortalTarget={selectPortalTarget}
                    menuPosition="fixed"
                    menuShouldBlockScroll
                    styles={selectStyles}
                  />
                  {renderError("systemSize")}
                </div>
                {/* <div className="col-md-4">
                  <label>Address *</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    placeholder="Enter address"
                    value={form.address}
                    onChange={(event) =>
                      setField("address", event.target.value)
                    }
                  />
                  {renderError("address")}
                </div> */}
                <div className="col-md-6">
                  <label>Address *</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    placeholder="Enter address"
                    value={form.installationAddress}
                    onChange={(event) =>
                      setField("installationAddress", event.target.value)
                    }
                  />
                  {renderError("installationAddress")}
                </div>
                <div className="col-md-6">
                  <label>Message *</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Enter message"
                    value={form.message}
                    onChange={(event) =>
                      setField("message", event.target.value)
                    }
                  />
                  {renderError("message")}
                </div>
              </div>

              {submitError ? (
                <div className="alert alert-danger m-t15">{submitError}</div>
              ) : null}

              <div className="seller-crm-modal-actions">
                <NavLink
                  to="/seller-customers"
                  className="seller-crm-btn-outline"
                >
                  Cancel
                </NavLink>
                <button
                  type="submit"
                  className="seller-crm-btn-orange"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Add Lead"}
                </button>
              </div>
            </form>
          </div>
        </SellerDashboardLayout>
      </div>
      <Footer2 />
      {successMessage ? (
        <div
          className="seller-lead-step-toast"
          role="status"
          aria-live="polite"
        >
          <i className="fa fa-check-circle" aria-hidden />
          <span>{successMessage}</span>
        </div>
      ) : null}
    </>
  );
}
