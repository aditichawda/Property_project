import React, { useState, useEffect, useMemo } from "react";
import SearchableSelect from "../Elements/SearchableSelect";
import Select from "react-select";

// ─── Field config per status ────────────────────────────────
const STATUS_FORM_CONFIG = {
  Won: {
    title: "🎉 Deal Won",
    fields: [
      { key: "date", label: "Deal Date", type: "date", required: true },
      {
        key: "dealAmount",
        label: "Deal Amount (₹)",
        type: "number",
        required: true,
        placeholder: "e.g. 250000",
      },
      {
        key: "remark",
        label: "Remark",
        type: "textarea",
        placeholder: "Any notes...",
      },
    ],
  },
  Loss: {
    title: "❌ Deal Lost",
    fields: [
      { key: "date", label: "Date", type: "date", required: true },
      {
        key: "lossReason",
        label: "Loss Reason",
        type: "select",
        required: true,
        options: [
          "Price too high",
          "Competitor won",
          "Customer not interested",
          "No financing",
          "Other",
        ],
      },
      {
        key: "remark",
        label: "Remark",
        type: "textarea",
        placeholder: "Additional notes...",
      },
    ],
  },
  "Document Collected": {
    title: "📄 Document Collected",
    fields: [
      { key: "date", label: "Collection Date", type: "date", required: true },
      {
        key: "docsChecklist",
        label: "Documents Received",
        type: "checklist",
        options: [
          "Aadhar Card",
          "PAN Card",
          "Electricity Bill",
          "Bank Statement",
          "NOC from Society",
        ],
      },
      { key: "remark", label: "Remark", type: "textarea" },
    ],
  },
  "Portal Registration": {
    title: "🌐 Portal Registration",
    fields: [
      { key: "date", label: "Registration Date", type: "date", required: true },
      {
        key: "portalName",
        label: "Portal Name",
        type: "text",
        placeholder: "e.g. DISCOM Portal",
      },
      {
        key: "applicationNo",
        label: "Application No.",
        type: "text",
        placeholder: "Reference number",
      },
      { key: "remark", label: "Remark", type: "textarea" },
    ],
  },
  "Loan Application Submitted": {
    title: "🏦 Loan Application",
    fields: [
      { key: "date", label: "Submission Date", type: "date", required: true },
      {
        key: "bankName",
        label: "Bank / NBFC Name",
        type: "text",
        required: true,
        placeholder: "e.g. SBI, HDFC",
      },
      {
        key: "loanAmount",
        label: "Applied Amount (₹)",
        type: "number",
        placeholder: "e.g. 200000",
      },
      { key: "remark", label: "Remark", type: "textarea" },
    ],
  },
  "Loan Approved": {
    title: "✅ Loan Approved",
    fields: [
      { key: "date", label: "Approval Date", type: "date", required: true },
      {
        key: "approvedAmount",
        label: "Approved Amount (₹)",
        type: "number",
        required: true,
      },
      {
        key: "emi",
        label: "EMI (₹/month)",
        type: "number",
        placeholder: "Optional",
      },
      { key: "remark", label: "Remark", type: "textarea" },
    ],
  },
  "Loan Disbursed": {
    title: "💰 Loan Disbursed",
    fields: [
      { key: "date", label: "Disbursal Date", type: "date", required: true },
      {
        key: "disbursedAmount",
        label: "Disbursed Amount (₹)",
        type: "number",
        required: true,
      },
      { key: "remark", label: "Remark", type: "textarea" },
    ],
  },
  "Material Dispatch": {
    title: "🚚 Material Dispatch",
    fields: [
      { key: "date", label: "Dispatch Date", type: "date", required: true },
      {
        key: "vehicleNo",
        label: "Vehicle / Tracking No.",
        type: "text",
        placeholder: "Optional",
      },
      { key: "remark", label: "Remark", type: "textarea" },
    ],
  },
  "Installation Done": {
    title: "🔧 Installation Done",
    fields: [
      { key: "date", label: "Installation Date", type: "date", required: true },
      {
        key: "teamMembers",
        label: "Team Members",
        type: "text",
        placeholder: "e.g. Ramesh, Suresh",
      },
      {
        key: "systemCapacity",
        label: "System Capacity (KW)",
        type: "text",
        placeholder: "e.g. 5KW",
      },
      { key: "remark", label: "Remark", type: "textarea" },
    ],
  },
  "EB File Ready": {
    title: "⚡ EB File Ready",
    fields: [
      { key: "date", label: "Date", type: "date", required: true },
      { key: "fileNo", label: "File / Reference No.", type: "text" },
      { key: "remark", label: "Remark", type: "textarea" },
    ],
  },
  "NoC Done": {
    title: "📋 NoC Done",
    fields: [
      { key: "date", label: "NoC Date", type: "date", required: true },
      { key: "nocNo", label: "NoC Number", type: "text" },
      { key: "remark", label: "Remark", type: "textarea" },
    ],
  },
  "Plant Started": {
    title: "🌱 Plant Started",
    fields: [
      { key: "date", label: "Start Date", type: "date", required: true },
      {
        key: "meterReading",
        label: "Initial Meter Reading (kWh)",
        type: "number",
      },
      { key: "remark", label: "Remark", type: "textarea" },
    ],
  },
  "Balance Payment Follow-up": {
    title: "💳 Balance Payment Follow-up",
    fields: [
      { key: "date", label: "Follow-up Date", type: "date", required: true },
      { key: "pendingAmount", label: "Pending Amount (₹)", type: "number" },
      { key: "nextFollowUp", label: "Next Follow-up Date", type: "date" },
      { key: "remark", label: "Remark", type: "textarea" },
    ],
  },
  "Subsidy Request Done": {
    title: "🏛️ Subsidy Request Done",
    fields: [
      { key: "date", label: "Submission Date", type: "date", required: true },
      { key: "subsidyAmount", label: "Subsidy Amount (₹)", type: "number" },
      { key: "referenceNo", label: "Reference No.", type: "text" },
      { key: "remark", label: "Remark", type: "textarea" },
    ],
  },
};

// Default form for stages not in config
const DEFAULT_FORM = {
  title: "Update Details",
  fields: [
    { key: "date", label: "Date", type: "date", required: true },
    { key: "remark", label: "Remark", type: "textarea" },
  ],
};

const selectPortalTarget =
  typeof document !== "undefined" ? document.body : null;
const modalSelectStyles = {
  menuPortal: (base) => ({ ...base, zIndex: 20000 }),
};

export function getFormConfig(status) {
  return STATUS_FORM_CONFIG[status] || DEFAULT_FORM;
}

export default function CrmStatusModal({
  isOpen,
  status,
  statuses = [],
  onConfirm,
  onClose,
}) {
  const [internalStatus, setInternalStatus] = useState(status || "");
  const [form, setForm] = useState({});
  const [userSelected, setUserSelected] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setInternalStatus(status || "");
      setForm({});
      setUserSelected(false); // reset on open
    }
  }, [isOpen, status]);
  useEffect(() => {
    if (isOpen) {
      setInternalStatus(status || "");
      setForm({});
    }
  }, [isOpen, status]);

  const config = useMemo(() => getFormConfig(internalStatus), [internalStatus]);

  const statusOptions = useMemo(() => {
    const list = [];
    statuses.forEach((s) => {
      list.push({ value: s, label: s });
    });
    return list;
  }, [statuses]);

  if (!isOpen) return null;

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleChecklistToggle = (key, option) => {
    setForm((prev) => {
      const current = prev[key] || [];
      return {
        ...prev,
        [key]: current.includes(option)
          ? current.filter((x) => x !== option)
          : [...current, option],
      };
    });
  };

  const handleSubmit = () => {
    if (!internalStatus) {
      alert("Please select a status first.");
      return;
    }
    // Required field check
    const missing = config.fields.filter((f) => f.required && !form[f.key]);
    if (missing.length > 0) {
      alert(`Please fill: ${missing.map((f) => f.label).join(", ")}`);
      return;
    }
    onConfirm({ ...form, status: internalStatus });
  };

  return (
    <div className="crm-modal-overlay" onClick={onClose}>
      <div
        className="crm-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="crm-modal__head">
          <h3 className="crm-modal__title">Update Status</h3>
          <button
            className="crm-modal__close"
            onClick={onClose}
            aria-label="Close"
          >
            <i className="fa fa-times" />
          </button>
        </div>

        {/* Body */}
        <div className="crm-modal__body">
          {/* Status Selection */}
          <div className="crm-modal__field m-b20">
            <label className="crm-modal__label">Select Status *</label>
            <Select
              classNamePrefix="seller-crm-select"
              options={statusOptions}
              value={statusOptions.find((o) => o.value === internalStatus)}
              onChange={(opt) => {
                setInternalStatus(opt ? opt.value : "");
                setUserSelected(true); // user ne select kiya
                setForm({}); // Reset details when status changes
              }}
              placeholder="Search and select status..."
              menuPortalTarget={selectPortalTarget}
              menuPosition="fixed"
              styles={modalSelectStyles}
            />
          </div>

          {internalStatus && userSelected && (
            <div className="crm-status-details-section">
              <h5 className="m-b15 sx-text-primary border-bottom p-b10">
                {config.title}
              </h5>
              {config.fields.map((field) => (
                <div key={field.key} className="crm-modal__field">
                  <label className="crm-modal__label">
                    {field.label}
                    {field.required && (
                      <span className="crm-modal__req"> *</span>
                    )}
                  </label>

                  {field.type === "textarea" && (
                    <textarea
                      className="form-control"
                      rows={3}
                      placeholder={field.placeholder || ""}
                      value={form[field.key] || ""}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                    />
                  )}

                  {field.type === "select" && (
                    <SearchableSelect
                      value={form[field.key] || ""}
                      options={field.options.map((o) => ({
                        value: o,
                        label: o,
                      }))}
                      onChange={(value) => handleChange(field.key, value)}
                      placeholder="Search and select..."
                      isClearable
                    />
                  )}

                  {field.type === "checklist" && (
                    <div className="crm-modal__checklist">
                      {field.options.map((o) => (
                        <label key={o} className="crm-modal__check-item">
                          <input
                            type="checkbox"
                            checked={(form[field.key] || []).includes(o)}
                            onChange={() => handleChecklistToggle(field.key, o)}
                          />
                          <span>{o}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {["text", "number", "date"].includes(field.type) && (
                    <input
                      className="form-control"
                      type={field.type}
                      placeholder={field.placeholder || ""}
                      value={form[field.key] || ""}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="crm-modal__foot">
          <button className="seller-crm-btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button className="seller-crm-btn" onClick={handleSubmit}>
            <i className="fa fa-check m-r8 mr-2" /> Submit
          </button>
        </div>
      </div>
    </div>
  );
}
