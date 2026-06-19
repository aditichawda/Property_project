import React, { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import SellerDashboardLayout from "../Elements/SellerDashboardLayout";
import Header2 from "../Common/Header2";
import Footer2 from "../Common/Footer2";
import SearchableSelect from "../Elements/SearchableSelect";
import SimplePagination from "../Elements/SimplePagination";
import {
  fetchPropertyInquiries,
  fetchPropertyInquiryDetail,
  changePropertyInquiryStatus,
  storePropertyInquiryFollowUp,
  updatePropertyInquiryFollowUp,
} from "../../api/propertyInquiries";
import { getCurrentSellerId } from "../../api/properties";

const STORAGE_KEY = "property_inquiries_v1";
const STATUS_OPTIONS = [
  { value: "0", label: "New" },
  { value: "1", label: "Contacted" },
  { value: "2", label: "Follow-up" },
  { value: "3", label: "Closed" },
];
const FOLLOW_UP_TYPES = ["Email", "Call", "Message"];

function statusLabelToApi(status) {
  const found = STATUS_OPTIONS.find((item) => item.label === status);
  return found?.value ?? status;
}

function saveInquiries(list) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function formatDate(input) {
  if (!input) return "-";
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return input;
  return `${String(date.getDate()).padStart(2, "0")}-${String(
    date.getMonth() + 1,
  ).padStart(2, "0")}-${date.getFullYear()}`;
}

function toDateInput(input) {
  if (!input) return "";
  const raw = String(input).trim();
  const ddmmyyyy = raw.match(/^(\d{2})-(\d{2})-(\d{4})/);
  if (ddmmyyyy) {
    const [, dd, mm, yyyy] = ddmmyyyy;
    return `${yyyy}-${mm}-${dd}`;
  }
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(date.getDate()).padStart(2, "0")}`;
}

function getFollowupTypes(item = {}) {
  const raw =
    item.types ||
    item.followUpby ||
    item.follow_up_by ||
    item.followUp ||
    item.type ||
    "";
  if (Array.isArray(raw)) return raw.filter(Boolean);
  return String(raw || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function canAddFollowUp(status) {
  const text = String(status || "").trim().toLowerCase();
  return text !== "closed" && text !== "contacted";
}

export default function SellerEnquiries() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiMessage, setApiMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [propertyFilter, setPropertyFilter] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    perPage: 20,
    total: 0,
    lastPage: 1,
  });
  const [followUpItem, setFollowUpItem] = useState(null);
  const [historyItem, setHistoryItem] = useState(null);
  const [assignItem, setAssignItem] = useState(null);
  const [followUpForm, setFollowUpForm] = useState({
    types: [],
    remark: "",
    date: "",
  });
  const [assignStaff, setAssignStaff] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionNotice, setActionNotice] = useState(null);
  const [followupView, setFollowupView] = useState(null);
  const [followupEdit, setFollowupEdit] = useState(null);
  const [followupSaving, setFollowupSaving] = useState(false);

  useEffect(() => {
    if (!actionNotice) return undefined;
    const timer = window.setTimeout(() => setActionNotice(null), 2500);
    return () => window.clearTimeout(timer);
  }, [actionNotice]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setApiMessage("");
        const response = await fetchPropertyInquiries({
          sellerId: getCurrentSellerId(),
          propertyId: propertyFilter,
          status: statusFilter === "all" ? "" : statusFilter,
          name: query.trim(),
          page,
          perPage: pagination.perPage,
        });
        if (!cancelled) {
          setItems(response.items);
          setPagination(response.pagination);
          saveInquiries(response.items);
        }
      } catch (error) {
        if (!cancelled) {
          setItems([]);
          setApiMessage(
            error?.response?.data?.message ||
              error?.message ||
              "Unable to load property enquiries.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [page, propertyFilter, pagination.perPage, query, statusFilter]);

  const propertyOptions = useMemo(() => {
    const map = new Map();
    items.forEach((item) => {
      if (item.propertyId && item.propertyName) {
        map.set(String(item.propertyId), item.propertyName);
      }
    });
    return Array.from(map.entries()).map(([value, label]) => ({
      value,
      label,
    }));
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchesProperty =
        !propertyFilter || String(item.propertyId) === String(propertyFilter);
      return matchesProperty;
    });
  }, [items, propertyFilter]);

  const updateItem = (id, patch) => {
    const next = items.map((item) =>
      String(item.id || item.createdAt) === String(id)
        ? { ...item, ...patch }
        : item,
    );
    setItems(next);
    saveInquiries(next);
  };

  const updateStatus = async (item, status) => {
    const key = item.id || item.createdAt;
    const previous = item.status;
    updateItem(key, { status });
    setActionError("");
    try {
      await changePropertyInquiryStatus({
        sellerId: getCurrentSellerId(),
        inquiryId: key,
        status: statusLabelToApi(status),
      });
      setActionNotice({
        type: "success",
        text: "Enquiry status updated successfully.",
      });
    } catch (error) {
      updateItem(key, { status: previous });
      const text =
        error?.response?.data?.message ||
          error?.message ||
          "Unable to change enquiry status.";
      setActionError(text);
      setActionNotice({ type: "error", text });
    }
  };

  const changePropertyFilter = (event) => {
    setPropertyFilter(event || "");
    setPage(1);
  };

  const clearFilters = () => {
    setQuery("");
    setPropertyFilter("");
    setStatusFilter("all");
    setPage(1);
  };

  const openFollowUp = (item) => {
    setFollowUpItem(item);
    setFollowUpForm({ types: [], remark: "", date: "" });
  };

  const toggleFollowType = (type) => {
    setFollowUpForm((prev) => ({
      ...prev,
      types: prev.types.includes(type)
        ? prev.types.filter((item) => item !== type)
        : [...prev.types, type],
    }));
  };

  const saveFollowUp = async () => {
    if (!followUpItem) return;
    const key = followUpItem.id || followUpItem.createdAt;
    if (!followUpForm.types.length || !followUpForm.remark.trim()) {
      setActionError("Please select follow-up type and enter remark.");
      return;
    }
    const entry = {
      id: `followup-${Date.now()}`,
      types: followUpForm.types,
      remark: followUpForm.remark,
      date: followUpForm.date || new Date().toISOString().slice(0, 10),
      createdAt: new Date().toISOString(),
    };
    try {
      setActionError("");
      await storePropertyInquiryFollowUp({
        sellerId: getCurrentSellerId(),
        inquiryId: key,
        types: followUpForm.types,
        remark: followUpForm.remark,
        date: entry.date,
      });
      const history = Array.isArray(followUpItem.followUps)
        ? followUpItem.followUps
        : [];
      updateItem(key, {
        followUps: [entry, ...history],
        remarks: followUpForm.remark,
        status: "Follow-up",
      });
      setActionNotice({
        type: "success",
        text: "Follow-up saved successfully.",
      });
      setFollowUpItem(null);
    } catch (error) {
      const text =
        error?.response?.data?.message ||
          error?.message ||
          "Unable to save follow-up.";
      setActionError(text);
      setActionNotice({ type: "error", text });
    }
  };

  const openAssign = (item) => {
    setAssignItem(item);
    setAssignStaff(item.assignedStaff || "");
  };

  const saveAssign = () => {
    if (!assignItem) return;
    const key = assignItem.id || assignItem.createdAt;
    updateItem(key, { assignedStaff: assignStaff });
    setAssignItem(null);
  };

  const openHistory = async (item) => {
    setHistoryItem(item);
    const key = item.id || item.createdAt;
    try {
      const detail = await fetchPropertyInquiryDetail({
        sellerId: getCurrentSellerId(),
        inquiryId: key,
      });
      setHistoryItem(detail || item);
    } catch {
      setHistoryItem(item);
    }
  };

  const openFollowupEdit = (parent, item) => {
    setFollowupEdit({
      parent,
      item,
      form: {
        types: getFollowupTypes(item),
        date: toDateInput(item.date),
        remark: item.remark || "",
      },
    });
  };

  const toggleEditFollowType = (type) => {
    setFollowupEdit((prev) => {
      if (!prev?.form) return prev;
      const next = prev.form.types.includes(type)
        ? prev.form.types.filter((item) => item !== type)
        : [...prev.form.types, type];
      return { ...prev, form: { ...prev.form, types: next } };
    });
  };

  const saveFollowupEdit = async () => {
    if (!followupEdit?.item || !followupEdit?.parent) return;
    if (!followupEdit.item.id) {
      setActionError("This follow-up cannot be edited because its ID is missing.");
      return;
    }
    const types = followupEdit.form.types;
    try {
      setFollowupSaving(true);
      setActionError("");
      await updatePropertyInquiryFollowUp({
        sellerId: getCurrentSellerId(),
        followUpId: followupEdit.item.id,
        types,
        remark: followupEdit.form.remark,
        date: followupEdit.form.date,
      });
      const parentKey = followupEdit.parent.id || followupEdit.parent.createdAt;
      const updatedFollowUps = (followupEdit.parent.followUps || []).map((item) =>
        String(item.id) === String(followupEdit.item.id)
          ? {
              ...item,
              types,
              remark: followupEdit.form.remark,
              date: followupEdit.form.date,
            }
          : item,
      );
      updateItem(parentKey, { followUps: updatedFollowUps });
      setHistoryItem((prev) =>
        prev ? { ...prev, followUps: updatedFollowUps } : prev,
      );
      setFollowupEdit(null);
      setActionNotice({
        type: "success",
        text: "Follow-up updated successfully.",
      });
    } catch (error) {
      const text =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to update follow-up.";
      setActionError(text);
      setActionNotice({ type: "error", text });
    } finally {
      setFollowupSaving(false);
    }
  };

  return (
    <>
      <Header2 stickyNo />
      <div className="page-content">
        <SellerDashboardLayout>
          <div className="seller-crm-content seller-crm-content--flush">
            <div
              className="seller-crm-panel-head seller-crm-panel-head--table"
              style={{ padding: "0 0 20px" }}
            >
              <div>
                <h2 className="seller-crm-panel-title">Property enquiries</h2>
              </div>
              <NavLink to="/seller-services" className="seller-crm-btn-orange">
                <i className="fa fa-home m-r8 mr-2" /> View Properties
              </NavLink>
            </div>

            <div className="row m-b20">
              <div className="col-lg-5 col-md-6 m-b10">
                <input
                  className="form-control"
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search name, mobile, email, property "
                />
              </div>
              {/* <div className="col-lg-3 col-md-6 m-b10">
                <SearchableSelect
                  value={propertyFilter}
                  options={propertyOptions}
                  onChange={changePropertyFilter}
                  placeholder="All properties"
                  isClearable
                />
              </div> */}
              <div className="col-lg-2 col-md-6 m-b10">
                <select
                  className="form-control"
                  value={statusFilter}
                  onChange={(event) => {
                    setStatusFilter(event.target.value);
                    setPage(1);
                  }}
                >
                  <option value="all">All status</option>
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-lg-2 col-md-6 m-b10">
                <button
                  type="button"
                  className="seller-crm-btn-outline"
                  onClick={clearFilters}
                  style={{ width: "100%", minHeight: 46 }}
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="seller-crm-table-wrap">
              {apiMessage ? (
                <div className="alert alert-danger m-b15">{apiMessage}</div>
              ) : null}
              {actionNotice ? (
                <div
                  className={`alert ${
                    actionNotice.type === "success"
                      ? "alert-success"
                      : "alert-danger"
                  } m-b15`}
                >
                  {actionNotice.text}
                </div>
              ) : null}
              {actionError ? (
                <div className="alert alert-danger m-b15">{actionError}</div>
              ) : null}
              {loading ? (
                <div className="seller-table__empty">Loading enquiries...</div>
              ) : null}
              <table className="seller-table seller-table--crm">
                <thead>
                  <tr>
                    <th>Property</th>
                    <th>User Details</th>
                    {/* <th>Message</th> */}
                    <th>Status</th>
                    {/* <th>Assigned Staff</th> */}
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="seller-table__empty">
                        {loading ? "Loading enquiries..." : "No enquiries found."}
                      </td>
                    </tr>
                  ) : (
                    filtered.map((item) => {
                      const key = item.id || item.createdAt;
                      return (
                        <tr key={key}>
                          <td data-label="Property" className="seller-table__strong">
                            {item.propertyName || "-"}
                          </td>
                          <td data-label="User Details">
                            <strong>{item.name || "-"}</strong>
                            <div>{item.mobile || "-"}</div>
                            <div>{item.email || "-"}</div>
                            <div>{item.city || "-"}</div>
                          </td>
                          {/* <td style={{ minWidth: 220 }}>
                            {item.message || "-"}
                          </td> */}
                          <td data-label="Status">
                            <select
                              className="form-control"
                              value={item.status || "New"}
                              onChange={(event) =>
                                updateStatus(item, event.target.value)
                              }
                            >
                              {STATUS_OPTIONS.map((status) => (
                                <option key={status.value} value={status.label}>
                                  {status.label}
                                </option>
                              ))}
                            </select>
                          </td>
                          {/* <td>{item.assignedStaff || "Not assigned"}</td> */}
                          <td data-label="Action">
                            {canAddFollowUp(item.status) ? (
                              <button
                                type="button"
                                className="seller-crm-icon-btn seller-crm-icon-btn--view"
                                title="Add Follow Up"
                                onClick={() => openFollowUp(item)}
                              >
                                <i className="fa fa-plus" />
                              </button>
                            ) : null}
                            <button
                              type="button"
                              className="seller-crm-icon-btn"
                              title="View Follow Ups"
                              onClick={() => openHistory(item)}
                            >
                              <i className="fa fa-list" />
                            </button>
                            {/* <button
                              type="button"
                              className="seller-crm-icon-btn"
                              title="Assign Staff"
                              onClick={() => openAssign(item)}
                            >
                              <i className="fa fa-user-plus" />
                            </button> */}
                            <NavLink
                              to={`/seller-enquiries/${key}`}
                              className="seller-crm-icon-btn seller-crm-icon-btn--view"
                              title="View enquiry"
                            >
                              <i className="fa fa-eye" />
                            </NavLink>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
              <SimplePagination
                page={pagination.currentPage || page}
                perPage={pagination.perPage || 20}
                total={pagination.total || filtered.length}
                lastPage={pagination.lastPage || 1}
                loading={loading}
                onPageChange={setPage}
              />
            </div>
          </div>
        </SellerDashboardLayout>
      </div>
      <Footer2 />

      {followUpItem ? (
        <div
          className="seller-crm-modal-overlay"
          role="dialog"
          aria-modal="true"
        >
          <div className="seller-crm-modal-card seller-crm-modal-card--md">
            <div className="seller-crm-modal-head">
              <h3>Follow Up</h3>
              <button
                type="button"
                className="seller-crm-modal-close"
                onClick={() => setFollowUpItem(null)}
                aria-label="Close"
              >
                x
              </button>
            </div>
            <div className="seller-crm-modal-body">
              <p className="m-b15">
                <strong>{followUpItem.name}</strong> -{" "}
                {followUpItem.propertyName}
              </p>
              <div className="seller-crm-form-field m-b15">
                <label>Follow Up Type</label>
                <div className="seller-followup-methods">
                  {FOLLOW_UP_TYPES.map((type) => (
                    <label 
                      style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            cursor:
                              followUpForm.submitting ||
                              (followUpForm.mode === "view" &&
                                !followUpForm.isEditing)
                                ? "default"
                                : "pointer",
                            fontSize: "14px",
                            fontWeight: "500",
                          }}
                     key={type}>
                      <input
                        type="checkbox"
                        checked={followUpForm.types.includes(type)}
                        onChange={() => toggleFollowType(type)}
                      />
                      {type}
                    </label>
                  ))}
                </div>
              </div>
              <div className="seller-crm-form-field m-b15">
                <label>Follow Up Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={followUpForm.date}
                  onChange={(event) =>
                    setFollowUpForm((prev) => ({
                      ...prev,
                      date: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="seller-crm-form-field">
                <label>Remark</label>
                <textarea
                  className="form-control"
                  rows={4}
                  value={followUpForm.remark}
                  onChange={(event) =>
                    setFollowUpForm((prev) => ({
                      ...prev,
                      remark: event.target.value,
                    }))
                  }
                  placeholder="Add remark"
                />
              </div>
              <div className="seller-crm-modal-actions">
                <button
                  type="button"
                  className="seller-crm-btn-outline"
                  onClick={() => setFollowUpItem(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="seller-crm-btn-orange"
                  onClick={saveFollowUp}
                >
                  Save Follow Up
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {historyItem ? (
        <div
          className="seller-crm-modal-overlay"
          role="dialog"
          aria-modal="true"
        >
          <div className="seller-crm-modal-card seller-crm-modal-card--md">
            <div className="seller-crm-modal-head">
              <h3>Follow Up History</h3>
              <button
                type="button"
                className="seller-crm-modal-close"
                onClick={() => setHistoryItem(null)}
                aria-label="Close"
              >
                x
              </button>
            </div>
            <div className="seller-crm-modal-body">
              {Array.isArray(historyItem.followUps) &&
              historyItem.followUps.length ? (
                <div className="seller-crm-table-wrap">
                  <table className="seller-table seller-table--crm">
                    <thead>
                      <tr>
                       
                        <th>Date</th>
                        <th>Next Follow-up Date</th>
                        <th>Follow Up Type</th>
                        <th>Remark</th>
                      
                      </tr>
                    </thead>
                    <tbody>
                      {historyItem.followUps.map((item, index) => (
                        <tr key={item.id || index}>
                          <td>{formatDate(item.createdAt || item.date)}</td>
                          <td>{formatDate(item.date)}</td>
                          <td className="seller-table__strong">
                            {getFollowupTypes(item).join(", ") || "Follow Up"}
                          </td>
                          <td>{item.remark || "-"}</td>
                         
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="seller-table__empty">
                  No follow-up history found.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {followupView ? (
        <div className="seller-crm-modal-overlay" role="dialog" aria-modal="true">
          <div className="seller-crm-modal-card seller-crm-modal-card--md">
            <div className="seller-crm-modal-head">
              <h3>View Follow Up</h3>
              <button
                type="button"
                className="seller-crm-modal-close"
                onClick={() => setFollowupView(null)}
                aria-label="Close"
              >
                x
              </button>
            </div>
            <div className="seller-crm-modal-body">
              <div className="bg-gray rounded p-a20 m-b20">
                <p>
                  <strong>Date :</strong>{" "}
                  {formatDate(followupView.createdAt || followupView.date)}
                </p>
                <p>
                  <strong>FollowUp by :</strong>{" "}
                  {getFollowupTypes(followupView).join(", ") || "Follow Up"}
                </p>
                <p>
                  <strong>Next FollowUp Date:</strong>{" "}
                  {formatDate(followupView.date)}
                </p>
                <p className="m-b0">
                  <strong>Remark :</strong> {followupView.remark || "-"}
                </p>
              </div>
              <div className="seller-crm-modal-actions">
                <button
                  type="button"
                  className="seller-crm-btn-orange"
                  onClick={() => setFollowupView(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {followupEdit ? (
        <div className="seller-crm-modal-overlay" role="dialog" aria-modal="true">
          <div className="seller-crm-modal-card seller-crm-modal-card--md">
            <div className="seller-crm-modal-head">
              <h3>Edit Follow Up</h3>
              <button
                type="button"
                className="seller-crm-modal-close"
                onClick={() => setFollowupEdit(null)}
                aria-label="Close"
              >
                x
              </button>
            </div>
            <div className="seller-crm-modal-body">
              <div className="seller-crm-form-field m-b15">
                <label>Follow Up Type</label>
                <div className="seller-followup-methods">
                  {FOLLOW_UP_TYPES.map((type) => (
                    <label
                      key={type}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        fontWeight: 600,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={followupEdit.form.types.includes(type)}
                        onChange={() => toggleEditFollowType(type)}
                      />
                      {type}
                    </label>
                  ))}
                </div>
              </div>
              <div className="seller-crm-form-field m-b15">
                <label>Next Follow Up Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={followupEdit.form.date}
                  onChange={(event) =>
                    setFollowupEdit((prev) => ({
                      ...prev,
                      form: { ...prev.form, date: event.target.value },
                    }))
                  }
                />
              </div>
              <div className="seller-crm-form-field">
                <label>Remark</label>
                <textarea
                  className="form-control"
                  rows={4}
                  value={followupEdit.form.remark}
                  onChange={(event) =>
                    setFollowupEdit((prev) => ({
                      ...prev,
                      form: { ...prev.form, remark: event.target.value },
                    }))
                  }
                />
              </div>
              <div className="seller-crm-modal-actions">
                <button
                  type="button"
                  className="seller-crm-btn-outline"
                  onClick={() => setFollowupEdit(null)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="seller-crm-btn-orange"
                  disabled={followupSaving}
                  onClick={saveFollowupEdit}
                >
                  {followupSaving ? "Saving..." : "Save Follow Up"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
