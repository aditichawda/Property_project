import React, { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import { NavLink } from "react-router-dom";
import Header2 from "../Common/Header2";
import Footer2 from "../Common/Footer2";
import SellerDashboardLayout from "../Elements/SellerDashboardLayout";
import CrmStatusModal from "./CrmStatusModal";
import {
  CRM_DUMMY_CUSTOMERS,
  CRM_STATUSES,
  getBadgeClass,
} from "../../data/sellerCrmCustomers";
import { fetchSolarStaffAll } from "../../api/solarStaff";
import {
  assignSolarConvertedEnquiryStaff,
  changeSolarConvertedInterestStatus,
  fetchSolarConvertedEnquiries,
  mapApiEnquiryToCrmCustomer,
  storeSolarConvertedFollowUp,
  updateSolarConvertedFollowUp,
} from "../../api/solarEnquiries";
import { useAuth } from "../../context/AuthContext";
import { safeJsonParse } from "../../utils/safeJsonParse";
import { hasAnySellerPermission } from "../../utils/sellerPermissions";
import { fetchSolarLeadSteps } from "../../api/solarLeadSteps";

const SYSTEM_SIZES = ["3KW", "5KW", "10KW"];
const CRM_STORAGE_KEY = "seller_crm_customers_v1";
const CRM_PER_PAGE = 10;
const selectPortalTarget =
  typeof document !== "undefined" ? document.body : null;
const modalSelectStyles = {
  menuPortal: (base) => ({ ...base, zIndex: 20000 }),
};

function openNativeDatePicker(event) {
  const input = event.currentTarget;
  if (
    input.disabled ||
    input.readOnly ||
    typeof input.showPicker !== "function"
  ) {
    return;
  }
  try {
    input.showPicker();
  } catch {
    // Browser may ignore repeated showPicker calls while the picker is open.
  }
}

function getCustomerServices(customer) {
  if (Array.isArray(customer?.services) && customer.services.length) {
    return customer.services.join(", ");
  }
  return (
    customer?.serviceName ||
    customer?.service_title ||
    customer?.service ||
    customer?.requirement ||
    "-"
  );
}

function formatDealAmount(amount) {
  if (amount === null || amount === undefined || amount === "") return "-";
  const number = Number(amount);
  if (!Number.isFinite(number)) return String(amount);
  return `₹${number.toLocaleString("en-IN")}`;
}

export default function SellerCustomers() {
  const { auth } = useAuth();
  const seller =
    typeof window !== "undefined"
      ? safeJsonParse(localStorage.getItem("sellerInfo"), null) || {}
      : {};
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
  const canViewCrm = hasAnySellerPermission(seller, ["SolarCRM.View"]);
  const canEditCrm = hasAnySellerPermission(seller, ["SolarCRM.Edit"]);
  const canAddLead = hasAnySellerPermission(seller, ["SolarCRM.Lead.Add"]);
  const shouldShowAssignedControls = !isStaffLogin;
  const canAssignCrm = canEditCrm && shouldShowAssignedControls;
  const canAddFollowup = canEditCrm && isStaffLogin;
  const canChangeStatus = canEditCrm && isStaffLogin;
  const canShowViewFollowup = canViewCrm || canEditCrm;
  const crmTableColSpan = shouldShowAssignedControls ? 11 : 9;
  const [customers, setCustomers] = useState(() => {
    if (typeof window === "undefined") return CRM_DUMMY_CUSTOMERS;
    const stored = safeJsonParse(localStorage.getItem(CRM_STORAGE_KEY), []);
    if (!Array.isArray(stored) || !stored.length) return CRM_DUMMY_CUSTOMERS;
    const existingIds = new Set(
      CRM_DUMMY_CUSTOMERS.map((item) => String(item.id)),
    );
    const extras = stored.filter((item) => !existingIds.has(String(item.id)));
    return [...extras, ...CRM_DUMMY_CUSTOMERS];
  });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [interestStatus, setInterestStatus] = useState("");
  const [assignedStaffFilter, setAssignedStaffFilter] = useState("");
  const [city, setCity] = useState("");
  const [systemSize, setSystemSize] = useState("");
  const [page, setPage] = useState(1);
  const [apiMeta, setApiMeta] = useState({
    total: 0,
    current_page: 1,
    last_page: 1,
    per_page: CRM_PER_PAGE,
  });
  const [pageMessage, setPageMessage] = useState({ type: "", text: "" });
  const [crmStatuses, setCrmStatuses] = useState(CRM_STATUSES);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [bulkAssignStaff, setBulkAssignStaff] = useState("");
  const [staffList, setStaffList] = useState([]);
  const [statusDetailsModal, setStatusDetailsModal] = useState({
    open: false,
    customerId: "",
    nextStatus: "",
  });
  // const [statusPickerModal, setStatusPickerModal] = useState({
  //   open: false,
  //   customerId: "",
  //   currentStatus: "",
  // });
  const [assignModal, setAssignModal] = useState({
    open: false,
    customerId: "",
    enquiryId: "",
    currentStaffId: "",
    currentStaff: "",
    submitting: false,
    error: "",
  });
  const [followupModal, setFollowupModal] = useState({
    open: false,
    mode: "add",
    isEditing: false,
    customerId: "",
    enquiryId: "",
    followUpId: "",
    customerName: "",
    methods: [],
    note: "",
    nextDate: "",
    submitting: false,
    error: "",
  });

  useEffect(() => {
    if (!pageMessage.text) return undefined;
    const timer = setTimeout(() => {
      setPageMessage({ type: "", text: "" });
    }, 3000);
    return () => clearTimeout(timer);
  }, [pageMessage.text]);

  useEffect(() => {
    let alive = true;
    async function loadStaff() {
      if (!currentSellerId) return;
      try {
        const list = await fetchSolarStaffAll(currentSellerId, {});
        if (alive) setStaffList(list);
      } catch (e) {
        console.error("Failed to load staff", e);
      }
    }
    loadStaff();
    return () => {
      alive = false;
    };
  }, [currentSellerId]);

  useEffect(() => {
    let cancelled = false;

    async function loadCrmLeads() {
      if (!currentSellerId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setLoadError("");
      try {
        const result = await fetchSolarConvertedEnquiries({
          page,
          perPage: CRM_PER_PAGE,
          sellerId: currentSellerId,
          search: query.trim(),
          assignStaffId: isStaffLogin ? currentStaffId : assignedStaffFilter,
          interestStatus,
        });
        if (cancelled) return;
        const apiCustomers = result.items.map(mapApiEnquiryToCrmCustomer);
        setCustomers(apiCustomers);
        setApiMeta(result.meta);
        if (typeof window !== "undefined") {
          localStorage.setItem(CRM_STORAGE_KEY, JSON.stringify(apiCustomers));
        }
      } catch (error) {
        if (cancelled) return;
        console.error(error);
        setLoadError("CRM data not found");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadCrmLeads();
    return () => {
      cancelled = true;
    };
  }, [
    assignedStaffFilter,
    currentSellerId,
    currentStaffId,
    interestStatus,
    isStaffLogin,
    page,
    query,
  ]);

  const staffOptions = useMemo(() => {
    const names = staffList.map((s) => s.name).filter(Boolean);
    return names.length > 0
      ? names
      : ["Demo Manager", "Sales Executive", "Technician"];
  }, [staffList]);
  const staffSelectOptions = useMemo(() => {
    const apiOptions = staffList
      .filter((staff) => staff.id && staff.name)
      .map((staff) => ({
        value: String(staff.id),
        label: staff.name,
      }));
    if (apiOptions.length) return apiOptions;
    return staffOptions.map((name) => ({ value: "", label: name }));
  }, [staffList, staffOptions]);
  const totalPages = useMemo(
    () => Math.max(1, Number(apiMeta.last_page || 1)),
    [apiMeta.last_page],
  );
  const cities = useMemo(() => {
    const set = new Set(customers.map((c) => c.city).filter(Boolean));
    return Array.from(set).sort();
  }, [customers]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return customers.filter((c) => {
      if (status && c.status !== status) return false;
      if (city && c.city !== city) return false;
      if (systemSize && c.systemSize !== systemSize) return false;
      if (!q) return true;
      return (
        String(c.name || "")
          .toLowerCase()
          .includes(q) ||
        String(c.phone || "").includes(q) ||
        String(c.city || "")
          .toLowerCase()
          .includes(q)
      );
    });
  }, [customers, query, status, city, systemSize]);

  useEffect(() => {
    setPage(1);
  }, [assignedStaffFilter, city, interestStatus, query, status, systemSize]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const toggleSelectAll = (checked) => {
    setSelectedCustomers(checked ? filtered.map((c) => c.id) : []);
  };

  const toggleSelect = (id, checked) => {
    setSelectedCustomers((prev) =>
      checked ? [...prev, id] : prev.filter((item) => item !== id),
    );
  };

  const handleBulkAssign = async () => {
    if (!bulkAssignStaff) {
      window.alert("Please select a staff member to assign.");
      return;
    }
    if (!selectedCustomers.length) {
      window.alert("Please select at least one customer.");
      return;
    }
    const selectedStaff = staffSelectOptions.find(
      (option) => option.value === bulkAssignStaff,
    );
    const rowsToAssign = customers.filter((c) =>
      selectedCustomers.includes(c.id),
    );
    try {
      await Promise.all(
        rowsToAssign
          .map((row) => row.sourceEnquiryId || row.enquiryId || row.id)
          .filter((rowId) => /^\d+$/.test(String(rowId)))
          .map((rowId) =>
            assignSolarConvertedEnquiryStaff({
              sellerId: currentSellerId,
              convertedId: rowId,
              staffId: bulkAssignStaff,
            }),
          ),
      );
    } catch (error) {
      window.alert(error?.message || "Unable to assign staff right now.");
      return;
    }
    setCustomers((prev) =>
      prev.map((c) =>
        selectedCustomers.includes(c.id)
          ? {
              ...c,
              assignedStaff: selectedStaff?.label || c.assignedStaff,
              assignedStaffId: bulkAssignStaff,
            }
          : c,
      ),
    );
    setSelectedCustomers([]);
    setBulkAssignStaff("");
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onStorage = () => {
      const stored = safeJsonParse(localStorage.getItem(CRM_STORAGE_KEY), []);
      if (Array.isArray(stored) && stored.length) setCustomers(stored);
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("seller-crm-updated", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("seller-crm-updated", onStorage);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadCrmStatuses() {
      if (!currentSellerId) return;
      try {
        const steps = await fetchSolarLeadSteps({
          sellerId: currentSellerId,
          status: 1,
        });
        if (cancelled) return;
        const names = steps
          .filter((step) => Number(step.status) === 1 && step.name)
          .sort((a, b) => Number(a.id || 0) - Number(b.id || 0))
          .map((step) => step.name);
        setCrmStatuses(names.length ? names : CRM_STATUSES);
      } catch (error) {
        if (!cancelled) setCrmStatuses(CRM_STATUSES);
      }
    }
    loadCrmStatuses();
    window.addEventListener("seller-lead-steps-updated", loadCrmStatuses);
    return () => {
      cancelled = true;
      window.removeEventListener("seller-lead-steps-updated", loadCrmStatuses);
    };
  }, [currentSellerId]);

  /*
    Keep the old shape nearby for AddLeadModal fields:
    {
        {
          id, name, phone, city, systemSize, assignedStaff, createdBy, status
        }
    }
  */

  const openAssignModal = (row) => {
    setAssignModal({
      open: true,
      customerId: row.id,
      enquiryId: row.sourceEnquiryId || row.enquiryId || row.id,
      currentStaffId: row.assignedStaffId ? String(row.assignedStaffId) : "",
      currentStaff: row.assignedStaff || "",
      submitting: false,
      error: "",
    });
  };

  const closeAssignModal = () => {
    setAssignModal((m) => ({ ...m, open: false }));
  };

  const saveAssignModal = async () => {
    if (!assignModal.currentStaffId) {
      setAssignModal((m) => ({ ...m, error: "Please select staff." }));
      return;
    }
    const apiEnquiryId = assignModal.enquiryId;
    setAssignModal((m) => ({ ...m, submitting: true, error: "" }));
    if (/^\d+$/.test(String(apiEnquiryId))) {
      try {
        await assignSolarConvertedEnquiryStaff({
          sellerId: currentSellerId,
          convertedId: apiEnquiryId,
          staffId: assignModal.currentStaffId,
        });
      } catch (error) {
        setAssignModal((m) => ({
          ...m,
          submitting: false,
          error: error?.message || "Unable to assign staff right now.",
        }));
        return;
      }
    }
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === assignModal.customerId
          ? {
              ...c,
              assignedStaff: assignModal.currentStaff,
              assignedStaffId: assignModal.currentStaffId,
            }
          : c,
      ),
    );
    closeAssignModal();
  };

  const openStatusPickerModal = (row) => {
    setStatusDetailsModal({
      open: true,
      customerId: row.id,
      nextStatus: row.status || crmStatuses[0] || CRM_STATUSES[0],
    });
  };
  // const closeStatusPickerModal = () => {
  //   setStatusPickerModal((m) => ({ ...m, open: false }));
  // };

  // const continueStatusChange = () => {
  //   if (!statusPickerModal.currentStatus) return;
  //   setStatusDetailsModal({
  //     open: true,
  //     customerId: statusPickerModal.customerId,
  //     nextStatus: statusPickerModal.currentStatus,
  //   });
  //   closeStatusPickerModal();
  // };

  // const handleStatusModalConfirm = (formData) => {
  //   setCustomers((prev) =>
  //     prev.map((c) =>
  //       c.id === statusDetailsModal.customerId
  //         ? {
  //             ...c,
  //             status: statusDetailsModal.nextStatus,
  //             ...(statusDetailsModal.nextStatus === "Won" && formData.dealAmount
  //               ? { dealAmount: Number(formData.dealAmount) }
  //               : {}),
  //             stageHistory: [
  //               ...(c.stageHistory || []),
  //               {
  //                 status: statusDetailsModal.nextStatus,
  //                 ...formData,
  //                 savedAt: new Date().toISOString(),
  //               },
  //             ],
  //           }
  //         : c,
  //     ),
  //   );
  //   setStatusDetailsModal({ open: false, customerId: "", nextStatus: "" });
  // };
  const handleStatusModalConfirm = (formData) => {
    const finalStatus = formData.status || statusDetailsModal.nextStatus;
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === statusDetailsModal.customerId
          ? {
              ...c,
              status: finalStatus,
              ...(finalStatus === "Won" && formData.dealAmount
                ? { dealAmount: Number(formData.dealAmount) }
                : {}),
              stageHistory: [
                ...(c.stageHistory || []),
                {
                  status: finalStatus,
                  ...formData,
                  savedAt: new Date().toISOString(),
                },
              ],
            }
          : c,
      ),
    );
    setStatusDetailsModal({ open: false, customerId: "", nextStatus: "" });
  };
  const openFollowupModal = (mode, row) => {
    const latestFollowup = Array.isArray(row.followUps)
      ? row.followUps[0]
      : null;
    setFollowupModal({
      open: true,
      mode,
      isEditing: mode === "add",
      customerId: row.id,
      enquiryId: row.sourceEnquiryId || row.enquiryId || row.id,
      followUpId: "",
      customerName: row.name || "",
      note: row.followupNote || latestFollowup?.remark || "",
      methods:
        Array.isArray(row.followupMethods) && row.followupMethods.length
          ? row.followupMethods
          : latestFollowup?.followUpby || [],
      nextDate: row.nextFollowupDate || latestFollowup?.date || "",
      history: Array.isArray(row.followUps) ? row.followUps : [],
      submitting: false,
      error: "",
    });
  };

  const editFollowupFromHistory = (item) => {
    if (!item?.id) {
      setFollowupModal((m) => ({
        ...m,
        error: "This follow-up cannot be edited because its ID is missing.",
      }));
      return;
    }
    setFollowupModal((m) => ({
      ...m,
      isEditing: true,
      followUpId: item.id,
      methods: Array.isArray(item.followUpby) ? item.followUpby : [],
      note: item.remark || "",
      nextDate:
        item.nextFollowUpDate?.substring?.(0, 10) ||
        item.date?.substring?.(0, 10) ||
        "",
      error: "",
    }));
  };

  const closeFollowupModal = () => {
    setFollowupModal((m) => ({ ...m, open: false }));
  };

  const submitFollowupModal = async (ev) => {
    ev.preventDefault();
    if (followupModal.mode === "view" && !followupModal.isEditing) return;
    if (!followupModal.methods.length) {
      setFollowupModal((m) => ({
        ...m,
        error: "Please select at least one follow-up type.",
      }));
      return;
    }
    if (!followupModal.note.trim() || !followupModal.nextDate) {
      setFollowupModal((m) => ({
        ...m,
        error: "Please fill remark and next follow-up date.",
      }));
      return;
    }
    setFollowupModal((m) => ({ ...m, submitting: true, error: "" }));
    try {
      if (followupModal.followUpId) {
        await updateSolarConvertedFollowUp({
          followUpId: followupModal.followUpId,
          types: followupModal.methods,
          remark: followupModal.note,
          nextFollowUpDate: followupModal.nextDate,
        });
      } else {
        await storeSolarConvertedFollowUp({
          sellerId: currentSellerId,
          convertedId: followupModal.enquiryId,
          types: followupModal.methods,
          remark: followupModal.note,
          nextFollowUpDate: followupModal.nextDate,
        });
      }
    } catch (error) {
      setFollowupModal((m) => ({
        ...m,
        submitting: false,
        error: error?.message || "Unable to save follow-up right now.",
      }));
      return;
    }
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === followupModal.customerId
          ? {
              ...c,
              followupMethods: followupModal.methods,
              followupNote: followupModal.note,
              nextFollowupDate: followupModal.nextDate,
              followUps: followupModal.followUpId
                ? (followupModal.history || []).map((item) =>
                    String(item.id) === String(followupModal.followUpId)
                      ? {
                          ...item,
                          date: followupModal.nextDate,
                          nextFollowUpDate: followupModal.nextDate,
                          remark: followupModal.note,
                          followUpby: followupModal.methods,
                        }
                      : item,
                  )
                : [
                    {
                      id: `local-${Date.now()}`,
                      date: followupModal.nextDate,
                      nextFollowUpDate: followupModal.nextDate,
                      remark: followupModal.note,
                      followUpby: followupModal.methods,
                    },
                    ...(followupModal.history || []),
                  ],
            }
          : c,
      ),
    );
    setPageMessage({
      type: "success",
      text: followupModal.followUpId
        ? "Follow-up updated successfully."
        : "Follow-up saved successfully.",
    });
    closeFollowupModal();
  };

  const clearFilters = () => {
    setStatus("");
    setInterestStatus("");
    setAssignedStaffFilter("");
    setCity("");
    setSystemSize("");
    setQuery("");
    setPage(1);
  };

  function formatDate(dateStr) {
    if (!dateStr) return null;

    const d = new Date(dateStr);

    if (isNaN(d)) return null;

    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();

    return `${day}-${month}-${year}`;
  }

  const isNotInterestedStatus = (value) =>
    String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[_-]+/g, " ") === "not interested";

  const getLeadState = (row) => {
    if (String(row?.interestStatusId || "") === "2") return "Not Interested";
    if (String(row?.interestStatusId || "") === "1") return "Interested";
    if (row.leadState) return row.leadState;
    return isNotInterestedStatus(row.status) ? "Not Interested" : "Interested";
  };

  const handleLeadStateChange = async (customerId, nextState) => {
    const row = customers.find((c) => String(c.id) === String(customerId));
    const convertedId = row?.sourceEnquiryId || row?.enquiryId || row?.id;
    const previousState = row
      ? row.leadState || getLeadState(row)
      : "Interested";
    const nextInterestStatusId = nextState === "Not Interested" ? "2" : "1";
    setCustomers((prev) => {
      const next = prev.map((c) =>
        c.id === customerId
          ? {
              ...c,
              leadState: nextState,
              interestStatusId: nextInterestStatusId,
              interestStatusLabel: nextState,
            }
          : c,
      );
      if (typeof window !== "undefined") {
        localStorage.setItem(CRM_STORAGE_KEY, JSON.stringify(next));
      }
      return next;
    });
    if (!/^\d+$/.test(String(convertedId || ""))) {
      setPageMessage({
        type: "success",
        text:
          nextState === "Not Interested"
            ? "Lead marked as not interested."
            : "Lead marked as interested.",
      });
      return;
    }
    try {
      await changeSolarConvertedInterestStatus({
        sellerId: currentSellerId,
        convertedId,
      });
      setPageMessage({
        type: "success",
        text:
          nextState === "Not Interested"
            ? "Lead marked as not interested."
            : "Lead marked as interested.",
      });
    } catch (error) {
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === customerId
            ? {
                ...c,
                leadState: previousState,
                interestStatusId:
                  previousState === "Not Interested" ? "2" : "1",
                interestStatusLabel: previousState,
              }
            : c,
        ),
      );
      setPageMessage({
        type: "danger",
        text: error?.message || "Unable to update interest status.",
      });
    }
  };

  return (
    <>
      <Header2 stickyNo />
      <div className="page-content">
        <SellerDashboardLayout>
          <div className="seller-crm-content seller-crm-content--flush seller-crm-customers-page">
            <div
              className="seller-crm-panel-head seller-crm-panel-head--table"
              style={{ padding: "0px 0px 5px" }}
            >
              <div>
                <h2 className="seller-crm-panel-title">Solar CRM</h2>
              </div>
              {/* {canAddLead && isStaffLogin && ( */}
              <NavLink
                to="/seller-customers/new"
                className="seller-crm-btn-orange"
              >
                <i className="fa fa-plus m-r8 mr-2" aria-hidden />
                Add Lead
              </NavLink>
              {/* )} */}
            </div>

            {pageMessage.text ? (
              <div
                className={`alert alert-${pageMessage.type || "success"} m-b20`}
                role="alert"
              >
                {pageMessage.text}
              </div>
            ) : null}

            <div className="seller-crm-filters seller-crm-filters--compact">
              {/* <div className="seller-crm-filter">
                <label>Status</label>
                <select
                  className="form-control"
                  style={{ height: "44px" }}
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="">All</option>
                  {crmStatuses.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div> */}
              <div className="seller-crm-filter">
                <label>Lead State</label>
                <select
                  className="form-control"
                  style={{ height: "44px" }}
                  value={interestStatus}
                  onChange={(e) => setInterestStatus(e.target.value)}
                >
                  <option value="">All</option>
                  <option value="1">Interested</option>
                  <option value="2">Not Interested</option>
                </select>
              </div>
              {!isStaffLogin ? (
                <div className="seller-crm-filter">
                  <label>Assigned Staff</label>
                  <select
                    className="form-control"
                    style={{ height: "44px" }}
                    value={assignedStaffFilter}
                    onChange={(e) => setAssignedStaffFilter(e.target.value)}
                  >
                    <option value="">All</option>
                    {staffSelectOptions
                      .filter((option) => option.value)
                      .map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                  </select>
                </div>
              ) : null}
              {/* <div className="seller-crm-filter">
                <label>City</label>
                <select
                  className="form-control"
                  style={{ height: "44px" }}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                >
                  <option value="">All</option>
                  {cities.map((ct) => (
                    <option key={ct} value={ct}>
                      {ct}
                    </option>
                  ))}
                </select>
              </div> */}

              <div className="seller-crm-filter seller-crm-filter--search">
                <label>Search</label>
                <div style={{ display: "flex", gap: "10px" }}>
                  <input
                    className="form-control"
                    placeholder="Search by name / phone..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  <button
                    type="button"
                    className="seller-crm-btn-outline"
                    onClick={clearFilters}
                    style={{ whiteSpace: "nowrap" }}
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
            <div className="seller-crm-filters seller-crm-filters--compact">
              {canAssignCrm && (
                <div className="seller-crm-filter seller-crm-filter--bulk">
                  <label>Bulk Assign</label>
                  <div className="seller-crm-bulk-row">
                    <Select
                      className="seller-crm-bulk-select"
                      classNamePrefix="seller-crm-select"
                      options={staffSelectOptions}
                      value={
                        staffSelectOptions.find(
                          (option) => option.value === bulkAssignStaff,
                        ) || null
                      }
                      onChange={(selected) =>
                        setBulkAssignStaff(selected ? selected.value : "")
                      }
                      isClearable
                      isSearchable
                      placeholder="Search staff..."
                      menuPortalTarget={selectPortalTarget}
                      menuPosition="fixed"
                      styles={modalSelectStyles}
                    />
                    <button
                      type="button"
                      className="seller-crm-btn-orange"
                      onClick={handleBulkAssign}
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="seller-crm-table-wrap seller-crm-table-wrap--compact">
              <table className="seller-table seller-table--crm seller-table--compact-crm">
                <thead>
                  <tr>
                    {shouldShowAssignedControls ? (
                      <th
                        className="seller-crm-check-col"
                        style={{ width: "4%" }}
                      >
                        <input
                          type="checkbox"
                          checked={
                            filtered.length > 0 &&
                            selectedCustomers.length === filtered.length
                          }
                          onChange={(e) => toggleSelectAll(e.target.checked)}
                        />
                      </th>
                    ) : null}
                    <th style={{ width: "12%" }}>User Info</th>
                    <th style={{ width: "10%" }}>Service</th>
                    <th style={{ width: "9%" }}>System</th>
                    <th style={{ width: "8%" }}>Deal Amount</th>
                    {shouldShowAssignedControls ? (
                      <th style={{ width: "5%" }}>Assigned Staff</th>
                    ) : null}
                    <th style={{ width: "5%" }}>Created By</th>
                    <th style={{ width: "15%" }}>Status</th>
                    <th style={{ width: "11%" }}>Lead State</th>
                    <th style={{ width: "11%" }}>Follow up</th>
                    {/* <th style={{ width: "9%" }}>Created Date</th> */}
                    <th
                      className="seller-table__actions"
                      style={{ textAlign: "left", width: "15%" }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={crmTableColSpan}
                        className="seller-table__empty"
                      >
                        Loading CRM leads...
                      </td>
                    </tr>
                  ) : loadError ? (
                    <tr>
                      <td
                        colSpan={crmTableColSpan}
                        className="seller-table__empty"
                      >
                        {loadError}
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td
                        colSpan={crmTableColSpan}
                        className="seller-table__empty"
                      >
                        No customers match your filters.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((c) => {
                      const leadState = getLeadState(c);
                      const isNotInterested =
                        isNotInterestedStatus(leadState) ||
                        isNotInterestedStatus(c.status);

                      return (
                        <tr key={c.id}>
                          {shouldShowAssignedControls ? (
                            <td
                              className="seller-crm-check-col"
                              data-label="Select"
                            >
                              <input
                                type="checkbox"
                                checked={selectedCustomers.includes(c.id)}
                                onChange={(e) =>
                                  toggleSelect(c.id, e.target.checked)
                                }
                              />
                            </td>
                          ) : null}
                          <td
                            className="seller-crm-customer-cell"
                            data-label="User Info"
                          >
                            <div className="seller-crm-customer-name">
                              {c.name}
                            </div>
                            <div className="seller-crm-customer-meta">
                              <span>
                                {c.city || "-"}
                                <br></br>
                                {c.phone || "-"}
                              </span>
                            </div>
                          </td>
                          <td data-label="Service">
                            <span
                              style={{
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                maxWidth: "180px",
                                whiteSpace: "normal",
                              }}
                              title={getCustomerServices(c)}
                            >
                              {getCustomerServices(c)}
                            </span>
                          </td>
                          <td data-label="System">{c.systemSize}</td>
                          <td data-label="Deal Amount">
                            {formatDealAmount(c.dealAmount)}
                          </td>
                          {shouldShowAssignedControls ? (
                            <td data-label="Assigned">
                              {c.assignedStaff || "---"}
                            </td>
                          ) : null}
                          <td data-label="Created">{c.createdBy}</td>
                          <td data-label="Status">
                            <button
                              type="button"
                              className={`seller-crm-status-chip ${getBadgeClass(c.status)}`}
                              onClick={() =>
                                canChangeStatus &&
                                !isNotInterested &&
                                openStatusPickerModal(c)
                              }
                              title={
                                canChangeStatus && !isNotInterested
                                  ? "Change status"
                                  : "Status"
                              }
                              disabled={!canChangeStatus || isNotInterested}
                            >
                              {c.status || "Pending"}
                            </button>
                          </td>
                          <td data-label="Lead State">
                            {isStaffLogin ? (
                              <label
                                className={`seller-crm-lead-switch ${
                                  leadState === "Interested"
                                    ? "is-on"
                                    : "is-off"
                                }`}
                                title={
                                  leadState === "Interested"
                                    ? "Interested"
                                    : "Not Interested"
                                }
                              >
                                <input
                                  type="checkbox"
                                  checked={
                                    String(c.interestStatusId || "") === "1"
                                  }
                                  disabled={!canEditCrm}
                                  onChange={(event) =>
                                    handleLeadStateChange(
                                      c.id,
                                      event.target.checked
                                        ? "Interested"
                                        : "Not Interested",
                                    )
                                  }
                                />
                                <span className="seller-crm-lead-switch__track">
                                  <span className="seller-crm-lead-switch__thumb" />
                                </span>
                              </label>
                            ) : (
                              <span
                                className={`seller-crm-status ${
                                  leadState === "Interested"
                                    ? "seller-crm-status--interested"
                                    : "seller-crm-status--not-interested"
                                }`}
                              >
                                {c.interestStatusLabel || leadState}
                              </span>
                            )}
                          </td>
                          <td
                            className="seller-table__actions"
                            data-label="Actions"
                          >
                            <div className="seller-enquiry-actions seller-crm-actions-compact">
                              {/* {canAddFollowup && !isNotInterested ? ( */}
                              {!isNotInterested ? (
                                <button
                                  type="button"
                                  className="seller-crm-icon-btn seller-crm-icon-btn--follow-add"
                                  aria-label="Follow-up"
                                  title="Add follow-up"
                                  onClick={() => openFollowupModal("add", c)}
                                >
                                  <i className="fa fa-plus" aria-hidden />
                                </button>
                              ) : null}
                              {canShowViewFollowup ? (
                                <button
                                  type="button"
                                  className="seller-crm-icon-btn seller-crm-icon-btn--follow-history"
                                  aria-label="View follow-up"
                                  title="View follow-up"
                                  onClick={() => openFollowupModal("view", c)}
                                >
                                  <i className="fa fa-eye" aria-hidden />
                                </button>
                              ) : null}
                            </div>
                          </td>
                          {/* <td data-label="Created Date">{c.createdAt}</td> */}
                          <td
                            className="seller-table__actions"
                            data-label="Actions"
                          >
                            <div className="seller-enquiry-actions seller-crm-actions-compact">
                              
                              {canAssignCrm && !isNotInterested ? (
                                <button
                                  type="button"
                                  className="seller-crm-icon-btn seller-crm-icon-btn--assign"
                                  aria-label="Assign staff"
                                  title="Assign staff"
                                  onClick={() => openAssignModal(c)}
                                >
                                  <i className="fa fa-user-plus" aria-hidden />
                                </button>
                              ) : null}
                              {/* {canChangeStatus && !isNotInterested ? ( */}
                              {!isNotInterested ? (
                                <button
                                  type="button"
                                  className="seller-crm-icon-btn seller-crm-icon-btn--convert"
                                  aria-label="Status"
                                  title="Status"
                                  onClick={() => openStatusPickerModal(c)}
                                >
                                  <i className="fa fa-exchange" aria-hidden />
                                </button>
                              ) : null}
                              {canEditCrm && !isNotInterested ? (
                                <>
                                  <NavLink
                                    to={`/seller-customers/${c.id}/edit`}
                                    className="seller-crm-icon-btn seller-crm-icon-btn--assign"
                                    aria-label="Edit"
                                    title="Edit"
                                  >
                                    <i className="fa fa-pencil" aria-hidden />
                                  </NavLink>
                                </>
                              ) : null}
                              {canViewCrm && (
                                <NavLink
                                  to={`/seller-customers/${c.id}`}
                                  className="seller-crm-icon-btn seller-crm-icon-btn--view"
                                  aria-label="View"
                                  title="View"
                                >
                                  <i className="fa fa-eye" aria-hidden />
                                </NavLink>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            {!loading && !loadError && filtered.length > 0 ? (
              <div className="seller-enquiry-pagination">
                <div className="seller-enquiry-page-info">
                  Showing {(page - 1) * CRM_PER_PAGE + 1}-
                  {Math.min(
                    page * CRM_PER_PAGE,
                    Number(apiMeta.total || filtered.length),
                  )}{" "}
                  of {Number(apiMeta.total || filtered.length)}
                </div>
                <div className="seller-enquiry-page-actions">
                  <button
                    type="button"
                    className="seller-crm-btn-outline"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                  >
                    Previous
                  </button>
                  <span className="seller-enquiry-page-count">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    type="button"
                    className="seller-crm-btn-outline"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                  >
                    Next
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </SellerDashboardLayout>
      </div>
      <Footer2 />

      {/* <CrmStatusModal
        isOpen={statusDetailsModal.open}
        status={statusDetailsModal.nextStatus}
        onConfirm={handleStatusModalConfirm}
        onClose={() =>
          setStatusDetailsModal({ open: false, customerId: "", nextStatus: "" })
        }
      /> */}
      <CrmStatusModal
        isOpen={statusDetailsModal.open}
        status={statusDetailsModal.nextStatus}
        statuses={crmStatuses}
        onConfirm={handleStatusModalConfirm}
        onClose={() =>
          setStatusDetailsModal({ open: false, customerId: "", nextStatus: "" })
        }
      />
      {assignModal.open ? (
        <div
          className="seller-crm-modal-overlay"
          role="dialog"
          aria-modal="true"
          onMouseDown={(e) =>
            e.target === e.currentTarget && closeAssignModal()
          }
        >
          <div className="seller-crm-modal-card seller-crm-modal-card--md">
            <div className="seller-crm-modal-head">
              <h3>Assign to Staff</h3>
              <button
                type="button"
                className="seller-crm-modal-close"
                onClick={closeAssignModal}
                aria-label="Close"
              >
                x
              </button>
            </div>
            <div className="seller-crm-modal-body">
              <div className="seller-crm-form-field">
                <label>Assigned Staff</label>
                <Select
                  classNamePrefix="seller-crm-select"
                  options={staffSelectOptions}
                  value={
                    staffSelectOptions.find(
                      (option) => option.value === assignModal.currentStaffId,
                    ) || null
                  }
                  onChange={(selected) =>
                    setAssignModal((m) => ({
                      ...m,
                      currentStaffId: selected ? selected.value : "",
                      currentStaff: selected ? selected.label : "",
                      error: "",
                    }))
                  }
                  isClearable
                  isSearchable
                  placeholder="Search staff..."
                  menuPortalTarget={selectPortalTarget}
                  menuPosition="fixed"
                  menuShouldBlockScroll
                  styles={modalSelectStyles}
                  isDisabled={assignModal.submitting}
                />
              </div>
              {assignModal.error ? (
                <div className="alert alert-danger m-t15">
                  {assignModal.error}
                </div>
              ) : null}
              <div className="seller-crm-modal-actions">
                <button
                  type="button"
                  className="seller-crm-btn-outline"
                  onClick={closeAssignModal}
                  disabled={assignModal.submitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="seller-crm-btn-orange"
                  onClick={saveAssignModal}
                  disabled={assignModal.submitting}
                >
                  {assignModal.submitting ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* {statusPickerModal.open ? (
        <div
          className="seller-crm-modal-overlay"
          role="dialog"
          aria-modal="true"
          onMouseDown={(e) =>
            e.target === e.currentTarget && closeStatusPickerModal()
          }
        >
          <div className="seller-crm-modal-card seller-crm-modal-card--md">
            <div className="seller-crm-modal-head">
              <h3>Update Status</h3>
              <button
                type="button"
                className="seller-crm-modal-close"
                onClick={closeStatusPickerModal}
                aria-label="Close"
              >
                x
              </button>
            </div>
            <div className="seller-crm-modal-body">
              <div className="seller-crm-form-field">
                <label>Status</label>
                <Select
                  classNamePrefix="seller-crm-select"
                  options={statusSelectOptions}
                  value={
                    statusSelectOptions.find(
                      (option) =>
                        option.value === statusPickerModal.currentStatus,
                    ) || null
                  }
                  onChange={(selected) =>
                    setStatusPickerModal((m) => ({
                      ...m,
                      currentStatus: selected ? selected.value : "",
                    }))
                  }
                  isSearchable
                  placeholder="Search status..."
                  menuPortalTarget={selectPortalTarget}
                  menuPosition="fixed"
                  menuShouldBlockScroll
                  styles={modalSelectStyles}
                />
              </div>
              <div className="seller-crm-modal-actions">
                <button
                  type="button"
                  className="seller-crm-btn-outline"
                  onClick={closeStatusPickerModal}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="seller-crm-btn-orange"
                  onClick={continueStatusChange}
                >
                  submit
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null} */}

      {followupModal.open ? (
        <div
          className="seller-crm-modal-overlay"
          role="dialog"
          aria-modal="true"
          onMouseDown={(e) =>
            e.target === e.currentTarget && closeFollowupModal()
          }
        >
          <div className="seller-crm-modal-card seller-crm-modal-card--md">
            <div className="seller-crm-modal-head">
              <h3>
                {followupModal.mode === "view"
                  ? "View Follow Up"
                  : "Add Follow Up"}
              </h3>
              <button
                type="button"
                className="seller-crm-modal-close"
                onClick={closeFollowupModal}
                aria-label="Close"
              >
                x
              </button>
            </div>
            <form
              className="seller-crm-modal-body"
              onSubmit={submitFollowupModal}
            >
              {followupModal.mode === "view" &&
              Array.isArray(followupModal.history) &&
              followupModal.history.length ? (
                <div className="seller-followup-history">
                  {followupModal.history.map((item, index) => (
                    <div
                      className="seller-followup-history__item"
                      key={item.id || index}
                      style={{ position: "relative", paddingRight: 44 }}
                    >
                      {/* <button
                        type="button"
                        className="seller-crm-icon-btn seller-crm-icon-btn--edit"
                        title="Edit follow-up"
                        aria-label="Edit follow-up"
                        onClick={() => editFollowupFromHistory(item)}
                        style={{ position: "absolute", right: 0, top: 0 }}
                      >
                        <i className="fa fa-pencil" aria-hidden />
                      </button> */}
                      <div className="seller-followup-history__date">
                        <strong>Date :</strong> {item.date?.substring(0, 10)}
                      </div>
                      <div className="seller-followup-history__date">
                        <strong>FollowUp by :</strong>{" "}
                        {(item.followUpby || []).join(", ") || "Follow-up"}
                      </div>
                      <div className="seller-followup-history__date">
                        <strong>Remark :</strong> {item.remark || "-"}
                      </div>
                      <div className="seller-followup-history__date">
                        <strong>Next FollowUp Date:</strong>{" "}
                        {item.nextFollowUpDate?.substring(0, 10) || "-"}
                      </div>
                    </div>
                  ))}
                </div>
              ) : followupModal.mode === "view" ? (
                <div className="seller-table__empty">
                  No follow-up data found.
                </div>
              ) : null}
              {followupModal.mode === "view" && !followupModal.isEditing ? (
                <div className="seller-crm-modal-actions">
                  <button
                    type="button"
                    className="seller-crm-btn-outline"
                    onClick={closeFollowupModal}
                    disabled={followupModal.submitting}
                  >
                    Close
                  </button>
                </div>
              ) : (
                <>
                  <div className="seller-crm-form-field">
                    <label>Follow Up Type</label>
                    <div
                      style={{
                        display: "flex",
                        gap: "16px",
                        flexWrap: "wrap",
                        marginTop: "6px",
                      }}
                    >
                      {["Email", "Call", "Message"].map((method) => (
                        <label
                          key={method}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            cursor:
                              followupModal.submitting ||
                              (followupModal.mode === "view" &&
                                !followupModal.isEditing)
                                ? "default"
                                : "pointer",
                            fontSize: "14px",
                            fontWeight: "500",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={(followupModal.methods || []).includes(
                              method,
                            )}
                            disabled={
                              followupModal.submitting ||
                              (followupModal.mode === "view" &&
                                !followupModal.isEditing)
                            }
                            onChange={() => {
                              if (
                                followupModal.submitting ||
                                (followupModal.mode === "view" &&
                                  !followupModal.isEditing)
                              )
                                return;
                              setFollowupModal((m) => ({
                                ...m,
                                methods: m.methods.includes(method)
                                  ? m.methods.filter((x) => x !== method)
                                  : [...m.methods, method],
                                error: "",
                              }));
                            }}
                          />

                          {method}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="seller-crm-form-field">
                    <label>Remark *</label>
                    <textarea
                      className="form-control"
                      rows={4}
                      placeholder="Type here..."
                      value={followupModal.note}
                      readOnly={
                        followupModal.submitting ||
                        (followupModal.mode === "view" &&
                          !followupModal.isEditing)
                      }
                      onChange={(e) =>
                        setFollowupModal((m) => ({
                          ...m,
                          note: e.target.value,
                          error: "",
                        }))
                      }
                    />
                  </div>
                  <div className="seller-crm-form-field">
                    <label>Next Follow-up Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={followupModal.nextDate}
                      onClick={openNativeDatePicker}
                      onFocus={openNativeDatePicker}
                      readOnly={
                        followupModal.submitting ||
                        (followupModal.mode === "view" &&
                          !followupModal.isEditing)
                      }
                      onChange={(e) =>
                        setFollowupModal((m) => ({
                          ...m,
                          nextDate: e.target.value,
                          error: "",
                        }))
                      }
                    />
                  </div>
                  {followupModal.error ? (
                    <div className="alert alert-danger m-t15">
                      {followupModal.error}
                    </div>
                  ) : null}
                  <div className="seller-crm-modal-actions">
                    <button
                      type="button"
                      className="seller-crm-btn-outline"
                      onClick={closeFollowupModal}
                      disabled={followupModal.submitting}
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      className="seller-crm-btn-orange"
                      disabled={followupModal.submitting}
                    >
                      {followupModal.submitting ? "Saving..." : "Save"}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
