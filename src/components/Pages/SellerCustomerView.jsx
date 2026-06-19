import React, { useMemo, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import Header2 from "../Common/Header2";
import Footer2 from "../Common/Footer2";
import SellerDashboardLayout from "../Elements/SellerDashboardLayout";
import {
  CRM_DUMMY_CUSTOMERS,
  CRM_PROGRESS_STEPS,
  CRM_STATUS_BADGE_CLASS,
  getCompletedStepIndexByStatus,
  CRM_STATUS_TO_STEP,
  getBadgeClass,
} from "../../data/sellerCrmCustomers";
import CrmStatusModal from "./CrmStatusModal";
import {
  fetchSolarConvertedEnquiryDetails,
  mapApiEnquiryToCrmCustomer,
} from "../../api/solarEnquiries";
import { useAuth } from "../../context/AuthContext";
import { safeJsonParse } from "../../utils/safeJsonParse";

const IS_ADMIN_OR_OWNER = true;

// ── Stepper ──────────────────────────────────────────────────
function Stepper({ status }) {
  const doneIdx =
    status === "Pending" ? -1 : getCompletedStepIndexByStatus(status);
  return (
    <div
      className="seller-crm-stepper"
      role="list"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(7, 1fr)",
        gap: "20px 10px",
      }}
    >
      {CRM_PROGRESS_STEPS.map((label, idx) => {
        const done = doneIdx >= 0 && idx <= doneIdx;
        const isCurrent = idx === doneIdx;
        return (
          <div
            key={label}
            className={[
              "seller-crm-step",
              done ? "is-done" : "",
              isCurrent ? "is-current" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            role="listitem"
            style={{ textAlign: "center", position: "relative" }}
          >
            <div
              className="seller-crm-step__dot"
              aria-hidden
              style={{
                width: 20,
                height: 20,
                margin: "0 auto",
                fontSize: 10,
                position: "relative",
                zIndex: 2,
              }}
            >
              {done ? <i className="fa fa-check" /> : <span />}
            </div>
            <div
              className="seller-crm-step__label"
              style={{
                fontSize: "11px",
                marginTop: "6px",
                whiteSpace: "normal",
                lineHeight: "1.2",
              }}
            >
              {label}
            </div>
            {idx !== CRM_PROGRESS_STEPS.length - 1 && (idx + 1) % 7 !== 0 && (
              <div
                className="seller-crm-step__line"
                aria-hidden
                style={{ top: 10, left: "50%", width: "100%", zIndex: 1 }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Edit Modal ───────────────────────────────────────────────
function EditCustomerModal({ isOpen, customer, onConfirm, onClose }) {
  const [form, setForm] = useState({});

  React.useEffect(() => {
    if (isOpen && customer) {
      setForm({
        dealAmount: customer.dealAmount || "",
        address: customer.address || "",
        systemSize: customer.systemSize || "",
      });
    }
  }, [isOpen, customer]);

  if (!isOpen) return null;

  return (
    <div className="crm-modal-overlay" onClick={onClose}>
      <div
        className="crm-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
      >
        <div className="crm-modal__head">
          <h3 className="crm-modal__title">✏️ Edit Customer Details</h3>
          <button className="crm-modal__close" onClick={onClose}>
            <i className="fa fa-times" />
          </button>
        </div>
        <div className="crm-modal__body">
          {IS_ADMIN_OR_OWNER && (
            <div className="crm-modal__field">
              <label className="crm-modal__label">
                <i className="fa fa-lock m-r4" /> Deal Amount (₹)
              </label>
              <input
                className="form-control"
                type="number"
                placeholder="e.g. 250000"
                value={form.dealAmount}
                onChange={(e) =>
                  setForm((p) => ({ ...p, dealAmount: e.target.value }))
                }
              />
            </div>
          )}
          <div className="crm-modal__field">
            <label className="crm-modal__label">Address</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="Full address"
              value={form.address}
              onChange={(e) =>
                setForm((p) => ({ ...p, address: e.target.value }))
              }
            />
          </div>
          <div className="crm-modal__field">
            <label className="crm-modal__label">System Size</label>
            <select
              className="form-control"
              value={form.systemSize}
              onChange={(e) =>
                setForm((p) => ({ ...p, systemSize: e.target.value }))
              }
            >
              {["1KW", "2KW", "3KW", "5KW", "7KW", "10KW", "15KW", "20KW"].map(
                (s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ),
              )}
            </select>
          </div>
        </div>
        <div className="crm-modal__foot">
          <button className="seller-crm-btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button className="seller-crm-btn" onClick={() => onConfirm(form)}>
            <i className="fa fa-save m-r8 mr-2" /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Format date ──────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return null;

  const d = new Date(dateStr);

  if (isNaN(d)) return null;

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  return `${day}-${month}-${year}`;
}
// ── Main Component ───────────────────────────────────────────
function displayValue(value) {
  if (value === null || value === undefined || value === "") return "-";
  if (Array.isArray(value)) return value.length ? value.join(", ") : "-";
  return String(value);
}

function formatMoney(value) {
  if (value === null || value === undefined || value === "") return "-";
  const number = Number(value);
  if (!Number.isFinite(number)) return displayValue(value);
  return `Rs. ${number.toLocaleString("en-IN")}`;
}

function getServiceText(customer) {
  if (Array.isArray(customer?.services) && customer.services.length) {
    return customer.services.join(", ");
  }
  return displayValue(
    customer?.serviceName ||
      customer?.service_title ||
      customer?.service ||
      customer?.requirement,
  );
}

function getRawValue(customer, keys) {
  const raw = customer?.raw || {};
  for (const key of keys) {
    if (raw[key] !== null && raw[key] !== undefined && raw[key] !== "") {
      return raw[key];
    }
  }
  return "";
}

function DetailItem({ label, value, wide = false }) {
  return (
    <div style={wide ? { gridColumn: "1 / -1" } : undefined}>
      <div className="seller-crm-k">{label}</div>
      <div className="seller-crm-v">{displayValue(value)}</div>
    </div>
  );
}

export default function SellerCustomerView() {
  const { id } = useParams();
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

  const [customers, setCustomers] = useState(() => CRM_DUMMY_CUSTOMERS);
  const [apiCustomer, setApiCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const customer = useMemo(() => {
    if (apiCustomer) return apiCustomer;
    return customers.find((c) => String(c.id) === String(id)) || null;
  }, [apiCustomer, customers, id]);

  // ✅ Direct initialize — useEffect pe depend mat karo
  const [currentStatus, setCurrentStatus] = useState(
    () => CRM_DUMMY_CUSTOMERS.find((c) => c.id === id)?.status || "",
  );
  const [stageData, setStageData] = useState({});
  const [tab, setTab] = useState(() => {
    const s = CRM_DUMMY_CUSTOMERS.find((c) => c.id === id)?.status || "";
    return CRM_STATUS_TO_STEP[s] || CRM_PROGRESS_STEPS[0];
  });

  const [modal, setModal] = useState({ open: false, nextStatus: "" });
  const [editModal, setEditModal] = useState(false);
  const [followUps, setFollowUps] = useState(() => customer?.followUps || []);

  React.useEffect(() => {
    let cancelled = false;

    async function loadCustomerDetail() {
      setLoading(true);
      setLoadError("");
      try {
        const detail = await fetchSolarConvertedEnquiryDetails({
          sellerId: currentSellerId,
          convertedId: id,
        });
        if (cancelled) return;
        setApiCustomer(mapApiEnquiryToCrmCustomer(detail));
      } catch (error) {
        if (!cancelled) {
          console.error(error);
          setApiCustomer(null);
          setLoadError("Unable to load CRM detail.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadCustomerDetail();
    return () => {
      cancelled = true;
    };
  }, [currentSellerId, id]);

  // Sync when id changes (navigation)
  React.useEffect(() => {
    if (customer) {
      setCurrentStatus(customer.status || "");
      setTab(CRM_STATUS_TO_STEP[customer.status] || CRM_PROGRESS_STEPS[0]);
      setStageData({});
      setFollowUps(customer.followUps || []);
    }
  }, [customer?.id]); // ✅ id change pe hi reset ho

  // ── Status change confirm ────────────────────────────────
  const handleModalConfirm = (formData) => {
    const newStatus = modal.nextStatus;
    setCurrentStatus(newStatus);
    setStageData((prev) => ({ ...prev, [newStatus]: formData }));

    const correspondingTab = CRM_STATUS_TO_STEP[newStatus] || newStatus;
    if (CRM_PROGRESS_STEPS.includes(correspondingTab)) setTab(correspondingTab);

    // ✅ Won pe dealAmount update
    if (newStatus === "Won" && formData.dealAmount) {
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                status: newStatus,
                dealAmount: Number(formData.dealAmount),
              }
            : c,
        ),
      );
    } else {
      setCustomers((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c)),
      );
    }

    setModal({ open: false, nextStatus: "" });
  };

  // ── Edit confirm ─────────────────────────────────────────
  const handleEditConfirm = (formData) => {
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              address: formData.address,
              systemSize: formData.systemSize,
              ...(IS_ADMIN_OR_OWNER && formData.dealAmount
                ? { dealAmount: Number(formData.dealAmount) }
                : {}),
            }
          : c,
      ),
    );
    setEditModal(false);
  };

  // ── isPending check ──────────────────────────────────────
  // Detail page me Pending par tracker visible rahega; list page me Pending hidden hai.
  const activeStatus = currentStatus || customer?.status || "";
  const HIDE_PROGRESS_STATUSES = ["New Enquiry", "New Lead", ""];
  const isPending = HIDE_PROGRESS_STATUSES.includes(activeStatus);
  const doneIdx = getCompletedStepIndexByStatus(activeStatus);
  const visibleTabs = isPending
    ? []
    : CRM_PROGRESS_STEPS.slice(0, doneIdx + 1).filter((t) => t !== "Pending");

  // ✅ Valid statuses — Pending filter out karo dropdown se
  const assignedStaffName =
    customer?.assignedStaff ||
    getRawValue(customer, [
      "assign_staff_name",
      "assigned_staff_name",
      "staff_name",
    ]);
  const assignedStaffPhone =
    customer?.assignedStaffPhone ||
    getRawValue(customer, ["assign_staff_phone", "assigned_staff_phone"]);
  const createdByName =
    customer?.createdBy ||
    getRawValue(customer, [
      "created_staff_name",
      "created_by_staff_name",
      "created_by_name",
      "created_by",
    ]);
  const installationAddress =
    customer?.installationAddress ||
    getRawValue(customer, [
      "installation_address",
      "installationAddress",
      "install_address",
      "site_address",
    ]);
  const leadState =
    customer?.interestStatusLabel || customer?.leadState || "Interested";

  return (
    <>
      <Header2 stickyNo />
      <div className="page-content">
        <SellerDashboardLayout>
          <div className="seller-crm-content seller-crm-content--flush">
            {/* Header */}
            <div className="seller-crm-panel-head seller-crm-panel-head--table">
              <h2 className="seller-crm-panel-title">Solar CRM Detail</h2>
              <NavLink
                to="/seller-customers"
                className="seller-crm-btn-outline"
              >
                <i className="fa fa-arrow-left m-r8 mr-2" aria-hidden /> Back
              </NavLink>
            </div>

            {loading && !customer ? (
              <div className="seller-table__empty">Loading CRM detail...</div>
            ) : loadError && !customer ? (
              <div className="seller-table__empty">{loadError}</div>
            ) : !customer ? (
              <div className="seller-table__empty">Customer not found.</div>
            ) : (
              <>
                {/* ── Top Card ── */}
                <div className="seller-crm-card seller-crm-card--top">
                  <div className="seller-crm-cust-top">
                    <div className="seller-crm-cust-top__left">
                      <div className="seller-crm-cust-name">
                        {customer.name}
                      </div>
                      <div className="seller-crm-cust-sub">
                        <span>
                          <i className="fa fa-phone m-r8 mr-2" aria-hidden />
                          {customer.phone}
                        </span>
                        <span>
                          <i
                            className="fa fa-map-marker m-r8 mr-2"
                            aria-hidden
                          />
                          {customer.city}
                        </span>
                      </div>
                      {/* Created date */}
                      <div className="seller-crm-cust-created">
                        <i className="fa fa-calendar m-r4 mr-2" aria-hidden />
                        Created:{" "}
                        {formatDate(customer.createdAt) ||
                          displayValue(customer.createdAt)}
                      </div>
                    </div>

                    <div className="seller-crm-cust-top__right">
                      <div className="seller-crm-kpi">
                        <div className="seller-crm-kpi__k">System Size</div>
                        <div className="seller-crm-kpi__v">
                          {customer.systemSize}
                        </div>
                      </div>

                      {IS_ADMIN_OR_OWNER && customer.dealAmount != null && (
                        <div className="seller-crm-kpi seller-crm-kpi--deal">
                          <div className="seller-crm-kpi__k">
                            <i className="fa fa-lock m-r4 mr-2" aria-hidden />{" "}
                            Deal Amount
                          </div>
                          <div className="seller-crm-kpi__v seller-crm-kpi__v--deal">
                            ₹
                            {Number(customer.dealAmount || 0).toLocaleString(
                              "en-IN",
                            )}
                          </div>
                        </div>
                      )}

                      <div className="seller-crm-kpi">
                        <div className="seller-crm-kpi__k">Status</div>
                        <div className="seller-crm-kpi__v">
                          {/* ✅ Badge — getBadgeClass use karo */}
                          <span
                            className={
                              getBadgeClass(activeStatus) ||
                              CRM_STATUS_BADGE_CLASS[activeStatus] ||
                              "seller-crm-status"
                            }
                          >
                            {activeStatus}
                          </span>
                          {/* <div style={{ marginTop: 8 }}>
                            <select
                              className="form-control seller-crm-status-select"
                              value={activeStatus}
                              onChange={(e) =>
                                setModal({
                                  open: true,
                                  nextStatus: e.target.value,
                                })
                              }
                            >
                              {validStatuses.map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
                          </div> */}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Follow-up History ── */}
                <div className="seller-crm-card m-t20">
                  <div className="seller-crm-card__head">
                    {/* <div className="seller-crm-card__title">
                      Customer & Lead Details
                    </div> */}
                  </div>
                  <div
                    className="seller-crm-card__body"
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(220px, 1fr))",
                      gap: "18px 24px",
                    }}
                  >
                    <DetailItem label="Email" value={customer.email} />
                    <DetailItem
                      label="City / State"
                      value={`${displayValue(customer.city)} / ${displayValue(
                        customer.state ||
                          getRawValue(customer, ["state_name", "state"]),
                      )}`}
                    />
                    <DetailItem
                      label="Service"
                      value={getServiceText(customer)}
                    />

                    <DetailItem
                      label="System Size"
                      value={customer.systemSize}
                    />

                    <DetailItem label="Lead State" value={leadState} />
                    <DetailItem
                      label="Created Date"
                      value={
                        formatDate(customer.createdAt) || customer.createdAt
                      }
                    />
                    <DetailItem label="Created By" value={createdByName} />
                    <DetailItem
                      label="Assigned Staff"
                      value={assignedStaffName || "Unassigned"}
                    />
                    <DetailItem
                      label="Assigned Staff Phone"
                      value={assignedStaffPhone}
                    />
                    <DetailItem
                      label="Created By Staff ID"
                      value={customer.createdByStaffId}
                    />
                    <DetailItem
                      label="Address"
                      value={installationAddress}
                      wide
                    />
                    <DetailItem label="Message" value={customer.message} wide />
                  </div>
                </div>

                <div className="seller-crm-card m-t20">
                  <div className="seller-crm-card__head">
                    <div className="seller-crm-card__title">
                      Follow-up History
                    </div>
                  </div>
                  <div
                    className="seller-crm-card__body"
                    style={{ maxHeight: "300px", overflowY: "auto" }}
                  >
                    {followUps.length > 0 ? (
                      <div className="seller-crm-timeline">
                        {followUps.map((f, idx) => (
                          <div
                            key={idx}
                            className="seller-crm-timeline-item"
                            style={{
                              paddingLeft: "24px",
                              borderLeft: "2px solid #f16522",
                              position: "relative",
                              paddingBottom: "20px",
                            }}
                          >
                            <div
                              style={{
                                width: "10px",
                                height: "10px",
                                background: "#f16522",
                                borderRadius: "50%",
                                position: "absolute",
                                left: "-6px",
                                top: "6px",
                              }}
                            ></div>
                            <div
                              className="seller-crm-v"
                              style={{ fontWeight: "600", fontSize: "14px" }}
                            >
                              {f.remark}
                            </div>

                            {/* ✅ Follow Up Methods */}
                            {Array.isArray(f.followUpby) &&
                              f.followUpby.length > 0 && (
                                <div
                                  style={{
                                    display: "flex",
                                    gap: "8px",
                                    margin: "6px 0",
                                  }}
                                >
                                  {f.followUpby.map((method) => (
                                    <span
                                      key={method}
                                      style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "4px",
                                        padding: "2px 10px",
                                        borderRadius: "20px",
                                        fontSize: "11px",
                                        fontWeight: "600",
                                        background:
                                          method === "Email"
                                            ? "#fff3e0"
                                            : method === "Call"
                                              ? "#e8f5e9"
                                              : "#e3f2fd",
                                        color:
                                          method === "Email"
                                            ? "#f97316"
                                            : method === "Call"
                                              ? "#22c55e"
                                              : "#3b82f6",
                                        border: `1px solid ${
                                          method === "Email"
                                            ? "#f97316"
                                            : method === "Call"
                                              ? "#22c55e"
                                              : "#3b82f6"
                                        }`,
                                      }}
                                    >
                                      <i
                                        className={
                                          method === "Email"
                                            ? "fa fa-envelope"
                                            : method === "Call"
                                              ? "fa fa-phone"
                                              : "fa fa-comment"
                                        }
                                      />
                                      {method}
                                    </span>
                                  ))}
                                </div>
                              )}

                            <div
                              className="seller-crm-k"
                              style={{ fontSize: "12px", marginTop: "2px" }}
                            >
                              <i
                                className="fa fa-calendar m-r4 mr-2"
                                aria-hidden
                              />{" "}
                              {f.date?.substring(0, 10)}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="seller-table__empty">
                        No follow-up history found.
                      </div>
                    )}
                  </div>
                </div>

                {/* ── Progress Tracker — New Enquiry pe hide ── */}
                <div className="seller-crm-card m-t20">
                  <div className="seller-crm-card__head">
                    <div className="seller-crm-card__title">
                      Progress Tracker
                    </div>
                  </div>
                  <div className="seller-crm-card__body">
                    <Stepper status={activeStatus} />
                  </div>
                </div>

                {/* ── Tabs — New Enquiry pe hide ── */}
                {visibleTabs.length > 0 && (
                  <div className="seller-crm-card m-t20">
                    <div
                      className="seller-crm-tabs"
                      style={{
                        display: "flex",
                        overflowX: "auto",
                        flexWrap: "nowrap",
                        paddingBottom: 5,
                      }}
                    >
                      {visibleTabs.map((t) => (
                        <button
                          key={t}
                          type="button"
                          className={
                            t === tab
                              ? "seller-crm-tab is-active"
                              : "seller-crm-tab"
                          }
                          style={{ whiteSpace: "nowrap" }}
                          onClick={() => setTab(t)}
                        >
                          {t}
                        </button>
                      ))}
                    </div>

                    <div className="seller-crm-card__body">
                      {Object.keys(stageData).some(
                        (st) => (CRM_STATUS_TO_STEP[st] || st) === tab,
                      ) ? (
                        <div
                          className="seller-crm-dummy"
                          style={{ marginBottom: 20 }}
                        >
                          <h4
                            style={{
                              fontSize: 14,
                              color: "#f16522",
                              marginBottom: 10,
                            }}
                          >
                            Stage Details: {tab}
                          </h4>
                          {Object.entries(stageData).map(([st, data]) => {
                            if ((CRM_STATUS_TO_STEP[st] || st) !== tab)
                              return null;
                            return (
                              <div
                                key={st}
                                style={{
                                  background: "#f8f9fa",
                                  padding: 15,
                                  borderRadius: 8,
                                  marginBottom: 10,
                                }}
                              >
                                {Object.entries(data).map(([k, v]) => (
                                  <div
                                    className="seller-crm-dummy__row"
                                    key={k}
                                  >
                                    <div
                                      className="seller-crm-k"
                                      style={{ textTransform: "capitalize" }}
                                    >
                                      {k.replace(/([A-Z])/g, " $1")}
                                    </div>
                                    <div className="seller-crm-v">
                                      {Array.isArray(v)
                                        ? v.join(", ")
                                        : v || "—"}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div
                          className="seller-table__empty"
                          style={{ padding: "40px 0", color: "#888" }}
                        >
                          No details submitted for "{tab}" stage yet.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </SellerDashboardLayout>
      </div>
      <Footer2 />

      {/* Status Change Modal */}
      <CrmStatusModal
        isOpen={modal.open}
        status={modal.nextStatus}
        onConfirm={handleModalConfirm}
        onClose={() => setModal({ open: false, nextStatus: "" })}
      />

      {/* Edit Customer Modal */}
      <EditCustomerModal
        isOpen={editModal}
        customer={customer}
        onConfirm={handleEditConfirm}
        onClose={() => setEditModal(false)}
      />
    </>
  );
}
// import React, { useMemo, useState } from 'react';
// import { NavLink, useParams } from 'react-router-dom';
// import Header2 from '../Common/Header2';
// import Footer2 from '../Common/Footer2';
// import SellerDashboardLayout from '../Elements/SellerDashboardLayout';
// import {
//   CRM_DUMMY_CUSTOMERS,
//   CRM_PROGRESS_STEPS,
//   CRM_DYNAMIC_STAGES,
//   CRM_STATUS_BADGE_CLASS,
//   CRM_STATUSES,
//   getCompletedStepIndexByStatus,
// } from '../../data/sellerCrmCustomers';

// const TABS = ['Lead Info', 'Site Survey', 'Proposal', 'Installation', 'Documents'];

// function Stepper({ status }) {
//   const doneIdx = getCompletedStepIndexByStatus(status);
//   return (
//     <div className="seller-crm-stepper" role="list">
//       {CRM_DYNAMIC_STAGES.map((stage, idx) => {
//         const done = idx <= doneIdx;
//         return (
//           <div key={stage.id} className={done ? 'seller-crm-step is-done' : 'seller-crm-step'} role="listitem">
//             <div className="seller-crm-step__dot" aria-hidden>
//               {done ? <i className="fa fa-check" /> : <span />}
//             </div>
//             <div className="seller-crm-step__label">{stage.name}</div>
//             {idx !== CRM_DYNAMIC_STAGES.length - 1 && <div className="seller-crm-step__line" aria-hidden />}
//           </div>
//         );
//       })}
//     </div>
//   );
// }

// export default function SellerCustomerView() {
//   const { id } = useParams();
//   const [tab, setTab] = useState(TABS[0]);

//   const customer = useMemo(() => CRM_DUMMY_CUSTOMERS.find((c) => c.id === id) || null, [id]);
//   const [currentStatus, setCurrentStatus] = useState('');

//   React.useEffect(() => {
//     setCurrentStatus(customer?.status || '');
//   }, [customer?.status, id]);

//   return (
//     <>
//       <Header2 stickyNo />
//       <div className="page-content">
//         <SellerDashboardLayout>
//           <div className="seller-crm-content seller-crm-content--flush">
//             <div className="seller-crm-panel-head seller-crm-panel-head--table">
//               <h2 className="seller-crm-panel-title">Customer</h2>
//               <NavLink to="/seller-customers" className="seller-crm-btn-outline">
//                 <i className="fa fa-arrow-left m-r8" aria-hidden />
//                 Back
//               </NavLink>
//             </div>

//             {!customer ? (
//               <div className="seller-table__empty">Customer not found.</div>
//             ) : (
//               <>
//                 <div className="seller-crm-card seller-crm-card--top">
//                   <div className="seller-crm-cust-top">
//                     <div className="seller-crm-cust-top__left">
//                       <div className="seller-crm-cust-name">{customer.name}</div>
//                       <div className="seller-crm-cust-sub">
//                         <span>
//                           <i className="fa fa-phone m-r8" aria-hidden /> {customer.phone}
//                         </span>
//                         <span className="seller-crm-dot-sep" aria-hidden>
//                           •
//                         </span>
//                         <span>
//                           <i className="fa fa-map-marker m-r8" aria-hidden /> {customer.city}
//                         </span>
//                       </div>
//                     </div>

//                     <div className="seller-crm-cust-top__right">
//                       <div className="seller-crm-kpi">
//                         <div className="seller-crm-kpi__k">System Size</div>
//                         <div className="seller-crm-kpi__v">{customer.systemSize}</div>
//                       </div>
//                       <div className="seller-crm-kpi">
//                         <div className="seller-crm-kpi__k">Status</div>
//                         <div className="seller-crm-kpi__v">
//                           <span className={CRM_STATUS_BADGE_CLASS[currentStatus] || 'seller-crm-status'}>
//                             {currentStatus || customer.status}
//                           </span>
//                           <div style={{ marginTop: 8 }}>
//                             <select
//                               className="form-control seller-crm-status-select"
//                               value={currentStatus || customer.status}
//                               onChange={(e) => setCurrentStatus(e.target.value)}
//                             >
//                               {CRM_STATUSES.map((s) => (
//                                 <option key={s} value={s}>
//                                   {s}
//                                 </option>
//                               ))}
//                             </select>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="seller-crm-cust-meta">
//                     <div>
//                       <div className="seller-crm-k">Address</div>
//                       <div className="seller-crm-v">{customer.address}</div>
//                     </div>
//                     <div>
//                       <div className="seller-crm-k">Assigned Staff</div>
//                       <div className="seller-crm-v">{customer.assignedStaff}</div>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="seller-crm-card m-t20">
//                   <div className="seller-crm-card__head">
//                     <div className="seller-crm-card__title">Progress tracker</div>
//                   </div>
//                   <div className="seller-crm-card__body">
//                     <Stepper status={currentStatus || customer.status} />
//                   </div>
//                 </div>

//                 <div className="seller-crm-card m-t20">
//                   <div className="seller-crm-tabs">
//                     {TABS.map((t) => (
//                       <button
//                         key={t}
//                         type="button"
//                         className={t === tab ? 'seller-crm-tab is-active' : 'seller-crm-tab'}
//                         onClick={() => setTab(t)}
//                       >
//                         {t}
//                       </button>
//                     ))}
//                   </div>
//                   <div className="seller-crm-card__body">
//                     {tab === 'Lead Info' && (
//                       <div className="seller-crm-dummy">
//                         <div className="seller-crm-dummy__row">
//                           <div className="seller-crm-k">Lead source</div>
//                           <div className="seller-crm-v">Website enquiry</div>
//                         </div>
//                         <div className="seller-crm-dummy__row">
//                           <div className="seller-crm-k">Notes</div>
//                           <div className="seller-crm-v seller-crm-v--desc">
//                             Customer requested a callback and basic ROI estimate. (Demo content)
//                           </div>
//                         </div>
//                       </div>
//                     )}

//                     {tab === 'Site Survey' && (
//                       <div className="seller-crm-dummy">
//                         <div className="seller-crm-dummy__row">
//                           <div className="seller-crm-k">Survey date</div>
//                           <div className="seller-crm-v">—</div>
//                         </div>
//                         <div className="seller-crm-dummy__row">
//                           <div className="seller-crm-k">Roof type</div>
//                           <div className="seller-crm-v">RCC</div>
//                         </div>
//                         <div className="seller-crm-dummy__row">
//                           <div className="seller-crm-k">Observations</div>
//                           <div className="seller-crm-v seller-crm-v--desc">
//                             Shade check and mounting points to be confirmed. (Demo content)
//                           </div>
//                         </div>
//                       </div>
//                     )}

//                     {tab === 'Proposal' && (
//                       <div className="seller-crm-dummy">
//                         <div className="seller-crm-dummy__row">
//                           <div className="seller-crm-k">Proposal version</div>
//                           <div className="seller-crm-v">v1</div>
//                         </div>
//                         <div className="seller-crm-dummy__row">
//                           <div className="seller-crm-k">Estimated savings</div>
//                           <div className="seller-crm-v">₹ 2,500 / month</div>
//                         </div>
//                         <div className="seller-crm-dummy__row">
//                           <div className="seller-crm-k">Message</div>
//                           <div className="seller-crm-v seller-crm-v--desc">
//                             Shared proposal PDF on WhatsApp & email. (Demo content)
//                           </div>
//                         </div>
//                       </div>
//                     )}

//                     {tab === 'Installation' && (
//                       <div className="seller-crm-dummy">
//                         <div className="seller-crm-dummy__row">
//                           <div className="seller-crm-k">Start date</div>
//                           <div className="seller-crm-v">—</div>
//                         </div>
//                         <div className="seller-crm-dummy__row">
//                           <div className="seller-crm-k">Team</div>
//                           <div className="seller-crm-v">2 technicians</div>
//                         </div>
//                         <div className="seller-crm-dummy__row">
//                           <div className="seller-crm-k">Updates</div>
//                           <div className="seller-crm-v seller-crm-v--desc">
//                             Wiring + inverter placement in progress. (Demo content)
//                           </div>
//                         </div>
//                       </div>
//                     )}

//                     {tab === 'Documents' && (
//                       <div className="seller-crm-dummy">
//                         <div className="seller-crm-dummy__row">
//                           <div className="seller-crm-k">KYC</div>
//                           <div className="seller-crm-v">Pending</div>
//                         </div>
//                         <div className="seller-crm-dummy__row">
//                           <div className="seller-crm-k">Net metering</div>
//                           <div className="seller-crm-v">In review</div>
//                         </div>
//                         <div className="seller-crm-dummy__row">
//                           <div className="seller-crm-k">Attachments</div>
//                           <div className="seller-crm-v seller-crm-v--desc">Upload UI can be added later. (Demo content)</div>
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </>
//             )}
//           </div>
//         </SellerDashboardLayout>
//       </div>
//       <Footer2 />
//     </>
//   );
// }
