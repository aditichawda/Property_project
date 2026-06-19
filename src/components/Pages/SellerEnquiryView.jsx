import React, { useEffect, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import Header2 from "../Common/Header2";
import Footer2 from "../Common/Footer2";
import SellerDashboardLayout from "../Elements/SellerDashboardLayout";
import { safeJsonParse } from "../../utils/safeJsonParse";
import {
  fetchPropertyInquiries,
  fetchPropertyInquiryDetail,
  updatePropertyInquiryFollowUp,
} from "../../api/propertyInquiries";
import { getCurrentSellerId } from "../../api/properties";

const STORAGE_KEY = "property_inquiries_v1";
const FOLLOW_UP_TYPES = ["Email", "Call", "Message"];

function readInquiries() {
  if (typeof window === "undefined") return [];
  const saved = safeJsonParse(localStorage.getItem(STORAGE_KEY), null);
  return Array.isArray(saved) ? saved : [];
}

function normalizeEnquiry(item) {
  if (!item) return null;
  return {
    id: item.id || item.createdAt,
    propertyName:
      item.propertyName || item.property_name || item.service_name || "-",
    propertyId: item.propertyId || item.property_id || item.service_id || "",
    name:
      item.name || item.buyerName || item.buyer_name || item.fullName || "-",
    mobile: item.mobile || item.phone || item.contact || "-",
    email: item.email || "-",
    status: item.status || item.convert_to_lead || "New",
    assignedStaff: item.assignedStaff || item.assigned_staff || "Not assigned",
    message: item.message || item.remark || "-",
    remarks: item.remarks || "",
    createdAt: item.createdAt || item.created_at || item.date || "",
    followUps: Array.isArray(item.followUps)
      ? item.followUps
      : Array.isArray(item.followups)
        ? item.followups
        : [],
  };
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

export default function SellerEnquiryView() {
  const { id } = useParams();
  const [enquiry, setEnquiry] = useState(() =>
    normalizeEnquiry(
      readInquiries().find(
        (item) => String(item.id || item.createdAt) === String(id),
      ),
    ),
  );
  const [loading, setLoading] = useState(!enquiry);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(null);
  const [followupModal, setFollowupModal] = useState(null);
  const [followupSaving, setFollowupSaving] = useState(false);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(null), 2500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const detail = await fetchPropertyInquiryDetail({
          sellerId: getCurrentSellerId(),
          inquiryId: id,
        });
        if (!cancelled) setEnquiry(normalizeEnquiry(detail));
      } catch (detailError) {
        try {
          const response = await fetchPropertyInquiries({
            sellerId: getCurrentSellerId(),
            perPage: 100,
          });
          const found = response.items.find(
            (item) => String(item.id || item.createdAt) === String(id),
          );
          if (!cancelled) setEnquiry(found ? normalizeEnquiry(found) : null);
        } catch {
          if (!cancelled) {
            setEnquiry(null);
            setError(
              detailError?.response?.data?.message ||
                detailError?.message ||
                "Unable to load enquiry details.",
            );
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const openFollowupView = (item) => {
    setFollowupModal({ mode: "view", item });
  };

  const openFollowupEdit = (item) => {
    setFollowupModal({
      mode: "edit",
      item,
      form: {
        types: getFollowupTypes(item),
        remark: item.remark || "",
        date: toDateInput(item.date),
      },
    });
  };

  const toggleFollowType = (type) => {
    setFollowupModal((prev) => {
      if (!prev?.form) return prev;
      const next = prev.form.types.includes(type)
        ? prev.form.types.filter((item) => item !== type)
        : [...prev.form.types, type];
      return { ...prev, form: { ...prev.form, types: next } };
    });
  };

  const saveFollowupEdit = async () => {
    if (!followupModal?.item || !followupModal?.form) return;
    const { item, form } = followupModal;
    if (!item.id) {
      setError("This follow-up cannot be edited because its ID is missing.");
      return;
    }
    try {
      setFollowupSaving(true);
      setError("");
      await updatePropertyInquiryFollowUp({
        sellerId: getCurrentSellerId(),
        followUpId: item.id,
        types: form.types,
        remark: form.remark,
        date: form.date,
      });
      setEnquiry((prev) => ({
        ...prev,
        followUps: (prev.followUps || []).map((follow) =>
          String(follow.id) === String(item.id)
            ? {
                ...follow,
                types: form.types,
                remark: form.remark,
                date: form.date,
              }
            : follow,
        ),
      }));
      setFollowupModal(null);
      setNotice({ type: "success", text: "Follow-up updated successfully." });
    } catch (followupError) {
      const text =
        followupError?.response?.data?.message ||
        followupError?.message ||
        "Unable to update follow-up.";
      setError(text);
      setNotice({ type: "error", text });
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
            <div className="seller-crm-panel-head seller-crm-panel-head--table">
              <div>
                <h2 className="seller-crm-panel-title">Enquiry Details</h2>
              </div>
              <NavLink
                to="/seller-enquiries"
                className="seller-crm-btn-outline"
              >
                <i className="fa fa-arrow-left m-r8 mr-2" /> Back
              </NavLink>
            </div>

            {loading ? (
              <div className="seller-table__empty">Loading enquiry details...</div>
            ) : !enquiry ? (
              <div className="seller-table__empty">
                {error || "Enquiry not found."}
              </div>
            ) : (
              <>
                {error ? (
                  <div className="alert alert-danger m-b15">{error}</div>
                ) : null}
                {notice ? (
                  <div
                    className={`alert ${
                      notice.type === "success" ? "alert-success" : "alert-danger"
                    } m-b15`}
                  >
                    {notice.text}
                  </div>
                ) : null}
                <div className=" p-a10 m-b25">
                  <div className="row">
                    <div className="col-lg-6 m-b20">
                      <div className="seller-crm-detail-list">
                        <div>
                          <span>Name</span>
                          <strong>{enquiry.name}</strong>
                        </div>
                        <div>
                          <span>Mobile</span>
                          <strong>{enquiry.mobile}</strong>
                        </div>
                        <div>
                          <span>Email</span>
                          <strong>{enquiry.email}</strong>
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-6 m-b20">
                      <div className="seller-crm-detail-list">
                        <div>
                          <span>Property</span>
                          <strong>{enquiry.propertyName}</strong>
                        </div>
                        <div>
                          <span>Status</span>
                          <span
                            style={{
                              background: "#fef08a",
                              borderRadius: 8,
                              color: "#111827",
                              display: "inline-flex",
                              fontSize: 15,
                              fontWeight: 800,
                              padding: "8px 16px",
                            }}
                          >
                            {enquiry.status || "New"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="seller-crm-message-box">
                    <span>Message{"   "}:</span>
                    <strong>{enquiry.message}</strong>
                  </div>
                  {enquiry.remarks ? (
                    <div className="seller-crm-message-box m-t15">
                      <span>Seller Remark</span>
                      <p>{enquiry.remarks}</p>
                    </div>
                  ) : null}
                </div>

                <div className="p-a10">
                  <h4 className="m-t0">Follow-up History</h4>
                  {Array.isArray(enquiry.followUps) &&
                  enquiry.followUps.length ? (
                    <div className="seller-crm-table-wrap">
                      <table className="seller-table seller-table--crm">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Date</th>
                            <th>Next Follow-up Date</th>
                            <th>Follow Up Type</th>
                            <th>Remark</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {enquiry.followUps.map((item, index) => (
                            <tr key={item.id || index}>
                              <td>{index + 1}</td>
                              <td>{formatDate(item.createdAt || item.date)}</td>
                              <td>{formatDate(item.date)}</td>
                              <td className="seller-table__strong">
                                {getFollowupTypes(item).join(", ") || "Follow Up"}
                              </td>
                              <td>{item.remark || "-"}</td>
                              <td>
                                <button
                                  type="button"
                                  className="seller-crm-icon-btn seller-crm-icon-btn--view"
                                  title="Edit follow-up"
                                  onClick={() => openFollowupEdit(item)}
                                >
                                  <i className="fa fa-pencil" />
                                </button>
                              </td>
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
              </>
            )}
          </div>
        </SellerDashboardLayout>
      </div>
      <Footer2 />

      {followupModal ? (
        <div
          className="seller-crm-modal-overlay"
          role="dialog"
          aria-modal="true"
        >
          <div className="seller-crm-modal-card seller-crm-modal-card--md">
            <div className="seller-crm-modal-head">
              <h3>
                {followupModal.mode === "edit"
                  ? "Edit Follow Up"
                  : "View Follow Up"}
              </h3>
              <button
                type="button"
                className="seller-crm-modal-close"
                onClick={() => setFollowupModal(null)}
                aria-label="Close"
              >
                x
              </button>
            </div>
            <div className="seller-crm-modal-body">
              {followupModal.mode === "view" ? (
                <div className="bg-gray rounded p-a20 m-b20">
                  <p>
                    <strong>Date :</strong>{" "}
                    {formatDate(
                      followupModal.item.createdAt || followupModal.item.date,
                    )}
                  </p>
                  <p>
                    <strong>FollowUp by :</strong>{" "}
                    {getFollowupTypes(followupModal.item).join(", ") ||
                      "Follow Up"}
                  </p>
                  <p>
                    <strong>Next FollowUp Date:</strong>{" "}
                    {formatDate(followupModal.item.date)}
                  </p>
                  <p className="m-b0">
                    <strong>Remark :</strong>{" "}
                    {followupModal.item.remark || "-"}
                  </p>
                </div>
              ) : (
                <>
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
                            checked={followupModal.form.types.includes(type)}
                            onChange={() => toggleFollowType(type)}
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
                      value={followupModal.form.date}
                      onChange={(event) =>
                        setFollowupModal((prev) => ({
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
                      value={followupModal.form.remark}
                      onChange={(event) =>
                        setFollowupModal((prev) => ({
                          ...prev,
                          form: { ...prev.form, remark: event.target.value },
                        }))
                      }
                    />
                  </div>
                </>
              )}
              <div className="seller-crm-modal-actions">
                <button
                  type="button"
                  className="seller-crm-btn-outline"
                  onClick={() => setFollowupModal(null)}
                >
                  Close
                </button>
                {followupModal.mode === "edit" ? (
                  <button
                    type="button"
                    className="seller-crm-btn-orange"
                    disabled={followupSaving}
                    onClick={saveFollowupEdit}
                  >
                    {followupSaving ? "Saving..." : "Save Follow Up"}
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
