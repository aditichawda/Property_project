import React, { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import { NavLink, useParams, useNavigate } from "react-router-dom";
import Header2 from "../Common/Header2";
import Footer2 from "../Common/Footer2";
import SellerDashboardLayout from "../Elements/SellerDashboardLayout";
import { CRM_DUMMY_CUSTOMERS } from "../../data/sellerCrmCustomers";
import { fetchSolarStates, fetchSolarCities } from "../../api/solarLocations";
import { fetchSolarSellerServicesForUser } from "../../api/solarSellerServices";
import { safeJsonParse } from "../../utils/safeJsonParse";
import { fetchSolarServiceFormOptions } from "../../api/solarServiceOptions";
import {
  fetchSolarConvertedEnquiryDetails,
  mapApiEnquiryToCrmCustomer,
  storeSolarConvertedFollowUp,
  updateSolarConvertedEnquiryLead,
  updateSolarConvertedFollowUp,
} from "../../api/solarEnquiries";
import { useAuth } from "../../context/AuthContext";

const IS_ADMIN_OR_OWNER = true; // 🔴 apne auth se replace karo

const CRM_STORAGE_KEY = "seller_crm_customers_v1";
const SYSTEM_SIZES = ["3KW", "5KW", "10KW"];
const selectPortalTarget =
  typeof document !== "undefined" ? document.body : null;
const selectStyles = {
  menuPortal: (base) => ({ ...base, zIndex: 20000 }),
};

function readSellerInfo() {
  if (typeof window === "undefined") return {};
  return safeJsonParse(localStorage.getItem("sellerInfo"), {}) || {};
}

function findStoredCustomer(id) {
  if (typeof window === "undefined") return null;
  const stored = safeJsonParse(localStorage.getItem(CRM_STORAGE_KEY), []);
  if (!Array.isArray(stored)) return null;
  return stored.find(
    (c) =>
      String(c.id) === String(id) ||
      String(c.sourceEnquiryId || c.enquiryId || "") === String(id),
  );
}

export default function SellerCustomerEdit() {
  const { id } = useParams();
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

  const storedCustomer = useMemo(
    () =>
      findStoredCustomer(id) ||
      CRM_DUMMY_CUSTOMERS.find((c) => c.id === id) ||
      null,
    [id],
  );
  const [apiCustomer, setApiCustomer] = useState(null);
  const customer = apiCustomer || storedCustomer;

  const [form, setForm] = useState(() => ({
    name: storedCustomer?.name || "",
    phone: storedCustomer?.phone || "",
    email: storedCustomer?.email || "",
    city: storedCustomer?.city || "",
    cityId: storedCustomer?.cityId || "",
    stateId: storedCustomer?.stateId || "",
    dealAmount: storedCustomer?.dealAmount || "",

    installationAddress: storedCustomer?.installationAddress || "",
    message: storedCustomer?.message || "",
    serviceId: storedCustomer?.serviceId || "",
    services: storedCustomer?.services || [],
    followUps: storedCustomer?.followUps || [],
    systemSize: storedCustomer?.systemSize || "3KW",
  }));
  const [systemSizes, setSystemSizes] = useState([]);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState({});
  const [stateOptions, setStateOptions] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);
  const [serviceOptions, setServiceOptions] = useState([]);
  const [lookupLoading, setLookupLoading] = useState({
    states: false,
    cities: false,
    services: false,
  });

  const [loadingDetail, setLoadingDetail] = useState(true);
  const [submitError, setSubmitError] = useState("");
  const [savingFollowupIndex, setSavingFollowupIndex] = useState(null);
  const apiEnquiryId =
    storedCustomer?.sourceEnquiryId ||
    storedCustomer?.enquiryId ||
    storedCustomer?.id ||
    id;

  // systemSizeOptions useMemo update karo:
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
    async function loadOptions() {
      if (!currentSellerId) return;
      setLookupLoading((prev) => ({ ...prev, states: true, services: true }));
      try {
        const [states, servicesResponse] = await Promise.all([
          fetchSolarStates(),
          fetchSolarSellerServicesForUser(currentSellerId),
        ]);
        if (!alive) return;
        setStateOptions(
          states.map((item) => ({ value: String(item.id), label: item.name })),
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
      } catch (error) {
        console.error("Failed to load CRM edit options", error);
      } finally {
        if (alive) {
          setLookupLoading((prev) => ({
            ...prev,
            states: false,
            services: false,
          }));
        }
      }
    }
    loadOptions();
    return () => {
      alive = false;
    };
  }, [currentSellerId]);

  const loadCities = async (stateId) => {
    setCityOptions([]);
    if (!stateId) return;
    setLookupLoading((prev) => ({ ...prev, cities: true }));
    try {
      const cities = await fetchSolarCities(stateId);
      setCityOptions(
        cities.map((item) => ({ value: String(item.id), label: item.name })),
      );
    } catch (error) {
      console.error("Failed to load CRM edit cities", error);
      setCityOptions([]);
    } finally {
      setLookupLoading((prev) => ({ ...prev, cities: false }));
    }
  };

  useEffect(() => {
    let cancelled = false;
    async function loadDetail() {
      if (!currentSellerId || !/^\d+$/.test(String(apiEnquiryId || ""))) {
        setLoadingDetail(false);
        return;
      }
      try {
        setLoadingDetail(true);
        setSubmitError("");
        const detail = await fetchSolarConvertedEnquiryDetails({
          sellerId: currentSellerId,
          convertedId: apiEnquiryId,
        });
        if (cancelled) return;
        const mapped = mapApiEnquiryToCrmCustomer(detail);
        setApiCustomer(mapped);
        setForm({
          name: mapped.name || "",
          phone: mapped.phone || "",
          email: mapped.email || "",
          city: mapped.city || "",
          cityId: mapped.cityId || "",
          stateId: mapped.stateId || "",
          dealAmount: mapped.dealAmount || "",

          installationAddress: mapped.installationAddress || "",
          message: mapped.message || "",
          serviceId: mapped.serviceId || "",
          services: mapped.services || [],
          followUps: mapped.followUps || [],
          systemSize: mapped.systemSize || "3KW",
        });
        if (mapped.stateId) loadCities(mapped.stateId);
      } catch (error) {
        if (!cancelled) {
          setSubmitError(error?.message || "Unable to load lead details.");
        }
      } finally {
        if (!cancelled) setLoadingDetail(false);
      }
    }
    loadDetail();
    return () => {
      cancelled = true;
    };
  }, [apiEnquiryId, currentSellerId]);
  useEffect(() => {
    let alive = true;
    async function loadOptions() {
      if (!currentSellerId) return;
      setLookupLoading((prev) => ({ ...prev, states: true, services: true }));
      try {
        const [states, servicesResponse, optionsResponse] = await Promise.all([
          fetchSolarStates(),
          fetchSolarSellerServicesForUser(currentSellerId),
          fetchSolarServiceFormOptions(), // ✅ Add kiya
        ]);
        if (!alive) return;

        setStateOptions(
          states.map((item) => ({ value: String(item.id), label: item.name })),
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

        // ✅ Dynamic system sizes
        const optionData = optionsResponse?.data || {};
        const sizes = (optionData.solar_service_categories || [])
          .map((item) => item?.name)
          .filter(Boolean);
        setSystemSizes(
          sizes.length ? sizes : ["1KW", "2KW", "3KW", "5KW", "10KW"],
        );
      } catch (error) {
        console.error("Failed to load CRM edit options", error);
        if (alive) setSystemSizes(["1KW", "2KW", "3KW", "5KW", "10KW"]);
      } finally {
        if (alive) {
          setLookupLoading((prev) => ({
            ...prev,
            states: false,
            services: false,
          }));
        }
      }
    }
    loadOptions();
    return () => {
      alive = false;
    };
  }, [currentSellerId]);
  if (!customer && !loadingDetail) {
    return (
      <>
        <Header2 stickyNo />
        <div className="page-content">
          <SellerDashboardLayout>
            <div className="seller-table__empty">Customer not found.</div>
          </SellerDashboardLayout>
        </div>
        <Footer2 />
      </>
    );
  }

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name required ";
    if (!form.phone.trim()) errs.phone = "Phone required ";
    if (!form.email.trim()) errs.email = "Email required ";
    if (!form.stateId) errs.stateId = "State select ";
    if (!form.cityId) errs.cityId = "City select ";
    if (!form.serviceId) errs.serviceId = "Service select";

    if (!form.installationAddress.trim())
      errs.installationAddress = "Installation address required ";
    if (!form.message.trim()) errs.message = "Message required ";
    if (!form.systemSize) errs.systemSize = "System size select";
    if (
      IS_ADMIN_OR_OWNER &&
      form.dealAmount &&
      isNaN(Number(form.dealAmount))
    ) {
      errs.dealAmount = "Valid amount daalo";
    }
    return errs;
  };

  const persistEditedCustomer = (patch) => {
    if (typeof window === "undefined") return;
    const stored = safeJsonParse(localStorage.getItem(CRM_STORAGE_KEY), []);
    const source = Array.isArray(stored) && stored.length ? stored : [];
    const next = source.map((item) =>
      String(item.id) === String(id) ||
      String(item.sourceEnquiryId || item.enquiryId || "") ===
        String(apiEnquiryId)
        ? { ...item, ...patch }
        : item,
    );
    localStorage.setItem(CRM_STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("seller-crm-updated"));
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSubmitError("");

    if (/^\d+$/.test(String(apiEnquiryId || ""))) {
      try {
        await updateSolarConvertedEnquiryLead({
          sellerId: currentSellerId,
          convertedId: apiEnquiryId,
          name: form.name,
          phone: form.phone,
          email: form.email,
          cityId: form.cityId,
          stateId: form.stateId,

          message: form.message,
          services: selectedService?.label
            ? [selectedService.label]
            : form.services,
          dealAmount: form.dealAmount,
          systemSize: form.systemSize,
          installationAddress: form.installationAddress,
          serviceId: form.serviceId,
        });
      } catch (error) {
        setSubmitError(
          error?.message || "Unable to update lead details right now.",
        );
        return;
      }
    }

    // Dummy update — backend call yahan lagana
    const idx = CRM_DUMMY_CUSTOMERS.findIndex((c) => c.id === id);
    if (idx !== -1) {
      CRM_DUMMY_CUSTOMERS[idx] = {
        ...CRM_DUMMY_CUSTOMERS[idx],
        name: form.name,
        phone: form.phone,
        email: form.email,
        city: form.city,
        cityId: form.cityId,
        stateId: form.stateId,

        installationAddress: form.installationAddress,
        message: form.message,
        serviceId: form.serviceId,
        services: selectedService?.label
          ? [selectedService.label]
          : form.services,
        systemSize: form.systemSize,
        followUps: form.followUps,
        ...(IS_ADMIN_OR_OWNER && form.dealAmount
          ? { dealAmount: Number(form.dealAmount) }
          : {}),
      };
    }
    persistEditedCustomer({
      name: form.name,
      phone: form.phone,
      email: form.email,
      city: form.city,
      cityId: form.cityId,
      stateId: form.stateId,

      installationAddress: form.installationAddress,
      message: form.message,
      serviceId: form.serviceId,
      services: selectedService?.label
        ? [selectedService.label]
        : form.services,
      systemSize: form.systemSize,
      followUps: form.followUps,
      ...(IS_ADMIN_OR_OWNER && form.dealAmount
        ? { dealAmount: Number(form.dealAmount) }
        : {}),
    });

    setSaved(true);
    setTimeout(() => {
      navigate(`/seller-customers/${id}`);
    }, 1000);
  };

  const saveFollowup = async (idx) => {
    const item = form.followUps[idx];
    if (!item) return;
    if (!item.followUpby?.length || !item.remark?.trim() || !item.date) {
      setSubmitError("Follow-up type, remark and date are required.");
      return;
    }
    setSubmitError("");
    setSavingFollowupIndex(idx);
    try {
      if (/^\d+$/.test(String(apiEnquiryId || ""))) {
        if (item.id && !String(item.id).startsWith("local-")) {
          await updateSolarConvertedFollowUp({
            followUpId: item.id,
            types: item.followUpby,
            remark: item.remark,
            nextFollowUpDate: item.date,
          });
        } else {
          await storeSolarConvertedFollowUp({
            sellerId: currentSellerId,
            convertedId: apiEnquiryId,
            types: item.followUpby,
            remark: item.remark,
            nextFollowUpDate: item.date,
          });
        }
      }
      persistEditedCustomer({
        followUps: form.followUps,
        followupMethods: item.followUpby,
        followupNote: item.remark,
        nextFollowupDate: item.date,
      });
      window.alert(`Follow-up ${idx + 1} saved!`);
    } catch (error) {
      setSubmitError(error?.message || "Unable to save follow-up right now.");
    } finally {
      setSavingFollowupIndex(null);
    }
  };

  return (
    <>
      <Header2 stickyNo />
      <div className="page-content">
        <SellerDashboardLayout>
          <div className="seller-crm-content seller-crm-content--flush">
            {/* Header */}
            <div className="seller-crm-panel-head seller-crm-panel-head--table">
              <div>
                <h2 className="seller-crm-panel-title">Edit Details</h2>
              </div>
              <NavLink
                onClick={() => window.history.back()}
                className="seller-crm-btn-outline"
              >
                <i className="fa fa-arrow-left m-r8 mr-2" aria-hidden /> Back
              </NavLink>
            </div>

            <div className="seller-crm-card m-t20">
              <div>
                {loadingDetail ? (
                  <div className="alert alert-info">
                    Loading lead details...
                  </div>
                ) : null}
                {submitError ? (
                  <div className="alert alert-danger">{submitError}</div>
                ) : null}
                {/* Editable fields */}
                <div className="crm-edit-form">
                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <div className="crm-edit-field">
                        <label className="crm-edit-label">
                          Name <span className="crm-modal__req">*</span>
                        </label>
                        <input
                          className={`form-control ${errors.name ? "is-invalid" : ""}`}
                          type="text"
                          value={form.name}
                          onChange={(e) => {
                            setForm((p) => ({ ...p, name: e.target.value }));
                            setErrors((p) => ({ ...p, name: "" }));
                          }}
                        />
                        {errors.name && (
                          <div className="crm-edit-error">{errors.name}</div>
                        )}
                      </div>
                    </div>

                    <div className="col-md-4 mb-3">
                      <div className="crm-edit-field">
                        <label className="crm-edit-label">
                          Phone <span className="crm-modal__req">*</span>
                        </label>
                        <input
                          className={`form-control ${errors.phone ? "is-invalid" : ""}`}
                          type="text"
                          value={form.phone}
                          onChange={(e) => {
                            setForm((p) => ({ ...p, phone: e.target.value }));
                            setErrors((p) => ({ ...p, phone: "" }));
                          }}
                        />
                        {errors.phone && (
                          <div className="crm-edit-error">{errors.phone}</div>
                        )}
                      </div>
                    </div>

                    <div className="col-md-4 mb-3">
                      <div className="crm-edit-field">
                        <label className="crm-edit-label">
                          Email <span className="crm-modal__req">*</span>
                        </label>
                        <input
                          className={`form-control ${errors.email ? "is-invalid" : ""}`}
                          type="email"
                          value={form.email}
                          onChange={(e) => {
                            setForm((p) => ({ ...p, email: e.target.value }));
                            setErrors((p) => ({ ...p, email: "" }));
                          }}
                        />
                        {errors.email && (
                          <div className="crm-edit-error">{errors.email}</div>
                        )}
                      </div>
                    </div>

                    {IS_ADMIN_OR_OWNER && (
                      <div className="col-md-4 mb-3">
                        <div className="crm-edit-field">
                          <label className="crm-edit-label">
                            Deal Amount (₹)
                          </label>
                          <input
                            className={`form-control ${errors.dealAmount ? "is-invalid" : ""}`}
                            type="number"
                            placeholder="e.g. 250000"
                            value={form.dealAmount}
                            onChange={(e) => {
                              setForm((p) => ({
                                ...p,
                                dealAmount: e.target.value,
                              }));
                              setErrors((p) => ({ ...p, dealAmount: "" }));
                            }}
                          />
                          {errors.dealAmount && (
                            <div className="crm-edit-error">
                              {errors.dealAmount}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="col-md-4 mb-3">
                      <div className="crm-edit-field">
                        <label className="crm-edit-label">
                          Service <span className="crm-modal__req">*</span>
                        </label>
                        <Select
                          classNamePrefix="seller-crm-select"
                          options={serviceOptions}
                          value={selectedService}
                          onChange={(selected) => {
                            setForm((p) => ({
                              ...p,
                              serviceId: selected ? selected.value : "",
                              services: selected?.label ? [selected.label] : [],
                            }));
                            setErrors((p) => ({ ...p, serviceId: "" }));
                          }}
                          isClearable
                          isSearchable
                          isLoading={lookupLoading.services}
                          placeholder="Search service..."
                          menuPortalTarget={selectPortalTarget}
                          menuPosition="fixed"
                          menuShouldBlockScroll
                          styles={selectStyles}
                        />
                        {errors.serviceId && (
                          <div className="crm-edit-error">
                            {errors.serviceId}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="col-md-4 mb-3">
                      <div className="crm-edit-field">
                        <label className="crm-edit-label">
                          State <span className="crm-modal__req">*</span>
                        </label>
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
                            setForm((p) => ({
                              ...p,
                              stateId,
                              cityId: "",
                              city: "",
                            }));
                            setErrors((p) => ({
                              ...p,
                              stateId: "",
                              cityId: "",
                            }));
                            loadCities(stateId);
                          }}
                          isClearable
                          isSearchable
                          isLoading={lookupLoading.states}
                          placeholder="Search state..."
                          menuPortalTarget={selectPortalTarget}
                          menuPosition="fixed"
                          menuShouldBlockScroll
                          styles={selectStyles}
                        />
                        {errors.stateId && (
                          <div className="crm-edit-error">{errors.stateId}</div>
                        )}
                      </div>
                    </div>

                    <div className="col-md-4 mb-3">
                      <div className="crm-edit-field">
                        <label className="crm-edit-label">
                          City <span className="crm-modal__req">*</span>
                        </label>
                        <Select
                          classNamePrefix="seller-crm-select"
                          options={cityOptions}
                          value={selectedCity}
                          onChange={(selected) => {
                            setForm((p) => ({
                              ...p,
                              cityId: selected ? selected.value : "",
                              city: selected ? selected.label : "",
                            }));
                            setErrors((p) => ({ ...p, cityId: "" }));
                          }}
                          isClearable
                          isSearchable
                          isLoading={lookupLoading.cities}
                          isDisabled={!form.stateId}
                          placeholder={
                            form.stateId
                              ? "Search city..."
                              : "Select state first"
                          }
                          menuPortalTarget={selectPortalTarget}
                          menuPosition="fixed"
                          menuShouldBlockScroll
                          styles={selectStyles}
                        />
                        {errors.cityId && (
                          <div className="crm-edit-error">{errors.cityId}</div>
                        )}
                      </div>
                    </div>

                    <div className="col-md-4 mb-3">
                      <div className="crm-edit-field">
                        <label className="crm-edit-label">
                          System Size <span className="crm-modal__req">*</span>
                        </label>
                        <Select
                          classNamePrefix="seller-crm-select"
                          options={systemSizeOptions}
                          value={
                            systemSizeOptions.find(
                              (option) => option.value === form.systemSize,
                            ) || null
                          }
                          onChange={(selected) => {
                            setForm((p) => ({
                              ...p,
                              systemSize: selected ? selected.value : "",
                            }));
                            setErrors((p) => ({ ...p, systemSize: "" }));
                          }}
                          isSearchable
                          placeholder="Search system size..."
                          menuPortalTarget={selectPortalTarget}
                          menuPosition="fixed"
                          menuShouldBlockScroll
                          styles={selectStyles}
                        />
                        {errors.systemSize && (
                          <div className="crm-edit-error">
                            {errors.systemSize}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="col-md-4 mb-3">
                      <div className="crm-edit-field">
                        <label className="crm-edit-label">
                          Address <span className="crm-modal__req">*</span>
                        </label>
                        <textarea
                          className={`form-control ${errors.installationAddress ? "is-invalid" : ""}`}
                          rows={3}
                          placeholder="Installation address"
                          value={form.installationAddress}
                          onChange={(e) => {
                            setForm((p) => ({
                              ...p,
                              installationAddress: e.target.value,
                            }));
                            setErrors((p) => ({
                              ...p,
                              installationAddress: "",
                            }));
                          }}
                        />
                        {errors.installationAddress && (
                          <div className="crm-edit-error">
                            {errors.installationAddress}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-md-4 mb-3">
                      <div className="crm-edit-field">
                        <label className="crm-edit-label">
                          Message <span className="crm-modal__req">*</span>
                        </label>
                        <textarea
                          className={`form-control ${errors.message ? "is-invalid" : ""}`}
                          rows={3}
                          placeholder="Message likho"
                          value={form.message}
                          onChange={(e) => {
                            setForm((p) => ({ ...p, message: e.target.value }));
                            setErrors((p) => ({ ...p, message: "" }));
                          }}
                        />
                        {errors.message && (
                          <div className="crm-edit-error">{errors.message}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Save button */}
                <div className="crm-edit-actions">
                  {saved && (
                    <span className="crm-admin-saved-badge">
                      <i className="fa fa-check m-r4" /> Saved! Redirecting...
                    </span>
                  )}
                  <NavLink
                    to={`/seller-customers/${id}`}
                    className="seller-crm-btn-outline"
                  >
                    Cancel
                  </NavLink>
                  <button
                    className="seller-crm-btn"
                    onClick={handleSave}
                    disabled={saved}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </SellerDashboardLayout>
      </div>
      <Footer2 />
    </>
  );
}
