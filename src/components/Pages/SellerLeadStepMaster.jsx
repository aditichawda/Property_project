import React, { useEffect, useMemo, useState } from "react";
import Header2 from "../Common/Header2";
import Footer2 from "../Common/Footer2";
import SellerDashboardLayout from "../Elements/SellerDashboardLayout";
import { safeJsonParse } from "../../utils/safeJsonParse";
import {
  changeSolarLeadStepStatus,
  fetchSolarLeadSteps,
  storeSolarLeadStep,
  updateSolarLeadStep,
} from "../../api/solarLeadSteps";

function readSellerInfo() {
  if (typeof window === "undefined") return {};
  return safeJsonParse(localStorage.getItem("sellerInfo"), {}) || {};
}

export default function SellerLeadStepMaster() {
  const seller = readSellerInfo();
  const sellerId = seller.solar_user_id || seller.seller_id || seller.id;
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [filters, setFilters] = useState({ search: "", status: "" });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStep, setEditingStep] = useState(null);
  const [stepName, setStepName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [statusChangingId, setStatusChangingId] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const normalizedNames = useMemo(
    () => new Set(steps.map((step) => step.name.trim().toLowerCase())),
    [steps],
  );

  useEffect(() => {
    let cancelled = false;
    async function loadSteps() {
      if (!sellerId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setListError("");
      try {
        const list = await fetchSolarLeadSteps({
          sellerId,
          search: filters.search,
          status: filters.status,
        });
        if (!cancelled) setSteps(list);
      } catch (loadError) {
        if (!cancelled) {
          setSteps([]);
          setListError(loadError?.message || "Unable to load lead steps.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadSteps();
    return () => {
      cancelled = true;
    };
  }, [filters.search, filters.status, reloadKey, sellerId]);

  useEffect(() => {
    if (!successMessage) return undefined;
    const timer = window.setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
    return () => window.clearTimeout(timer);
  }, [successMessage]);

  const openAdd = () => {
    setEditingStep(null);
    setStepName("");
    setError("");
    setModalOpen(true);
  };

  const openEdit = (step) => {
    setEditingStep(step);
    setStepName(step?.name || "");
    setError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditingStep(null);
    setStepName("");
    setError("");
  };

  const reloadSteps = () => setReloadKey((key) => key + 1);

  const saveStep = async (event) => {
    event.preventDefault();
    const name = stepName.trim();
    if (!name) {
      setError("Please enter step name.");
      return;
    }
    const currentName = String(editingStep?.name || "").toLowerCase();
    if (
      normalizedNames.has(name.toLowerCase()) &&
      name.toLowerCase() !== currentName
    ) {
      setError("This step already exists.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (editingStep?.id) {
        await updateSolarLeadStep({ sellerId, id: editingStep.id, name });
        setMessageType("success");
        setSuccessMessage("Lead step updated successfully.");
      } else {
        await storeSolarLeadStep({ sellerId, name });
        setMessageType("success");
        setSuccessMessage("Lead step saved successfully.");
      }
      setModalOpen(false);
      setEditingStep(null);
      setStepName("");
      reloadSteps();
    } catch (saveError) {
      setError(saveError?.message || "Unable to save step.");
    } finally {
      setSaving(false);
    }
  };

  const toggleStepStatus = async (step) => {
    if (!step?.id || statusChangingId) return;
    setStatusChangingId(step.id);
    const previous = steps;
    setSteps((items) =>
      items.map((item) =>
        String(item.id) === String(step.id)
          ? { ...item, status: Number(item.status) === 1 ? 0 : 1 }
          : item,
      ),
    );
    try {
      await changeSolarLeadStepStatus({ sellerId, id: step.id });
      setMessageType("success");
      setSuccessMessage(
        `Lead step ${Number(step.status) === 1 ? "deactivated" : "activated"} successfully.`,
      );
      reloadSteps();
    } catch (statusError) {
      setSteps(previous);
      setMessageType("danger");
      setSuccessMessage(statusError?.message || "Unable to update status.");
    } finally {
      setStatusChangingId("");
    }
  };

  const applyFilters = () => {
    setFilters({ search: search.trim(), status });
    setSuccessMessage("");
  };

  const clearFilters = () => {
    setSearch("");
    setStatus("");
    setFilters({ search: "", status: "" });
    setSuccessMessage("");
  };

  return (
    <>
      <Header2 stickyNo />
      <div className="page-content">
        <SellerDashboardLayout>
          <div className="seller-crm-content seller-crm-content--flush">
            <div className="seller-crm-panel-head seller-crm-panel-head--table">
              <div>
                <h2 className="seller-crm-panel-title">Lead Step Master</h2>
                <div className="seller-crm-subtitle">
                  Manage CRM process steps.
                </div>
              </div>
              <div className="seller-lead-step-actions">
                <button
                  type="button"
                  className="seller-crm-btn-orange"
                  onClick={openAdd}
                >
                  <i className="fa fa-plus m-r8 mr-2" aria-hidden />
                  Add New Step
                </button>
              </div>
            </div>

            <div className="seller-lead-step-filter-row m-b20">
              <div className="seller-crm-form-field">
                <label>Search</label>
                <input
                  className="form-control"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search step name..."
                />
              </div>
              <div className="seller-crm-form-field">
                <label>Status</label>
                <select
                  className="form-control"
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="1">Active</option>
                  <option value="0">Deactive</option>
                </select>
              </div>
              <div className="seller-lead-step-filter-actions">
                <button
                  type="button"
                  className="seller-crm-btn-orange"
                  onClick={applyFilters}
                >
                  <i className="fa fa-search m-r8 mr-2" />
                  Search
                </button>
                <button
                  type="button"
                  className="seller-crm-btn-outline"
                  onClick={clearFilters}
                >
                  Clear
                </button>
              </div>
            </div>

            {successMessage ? (
              <div
                className={`alert alert-${messageType} m-b20`}
                role="status"
                aria-live="polite"
              >
                {successMessage}
              </div>
            ) : null}

            <div className="seller-crm-table-wrap">
              <table className="seller-table seller-table--crm seller-lead-step-table">
                <thead>
                  <tr>
                    <th style={{ width: 80 }}>S.No</th>
                    <th>Step Name</th>
                    <th>Status</th>
                    <th className="seller-table__actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="seller-table__empty">
                        Loading steps...
                      </td>
                    </tr>
                  ) : listError ? (
                    <tr>
                      <td colSpan="4" className="seller-table__empty">
                        {listError}
                      </td>
                    </tr>
                  ) : steps.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="seller-table__empty">
                        No steps found.
                      </td>
                    </tr>
                  ) : (
                    steps.map((step, index) => {
                      const isActive = Number(step.status) === 1;
                      return (
                        <tr key={step.id || `${step.name}-${index}`}>
                          <td>{index + 1}</td>
                          <td className="seller-table__strong">{step.name}</td>
                          <td>
                            <button
                              type="button"
                              className={`seller-crm-lead-switch ${isActive ? "is-on" : ""}`}
                              onClick={() => toggleStepStatus(step)}
                              disabled={String(statusChangingId) === String(step.id)}
                              title={isActive ? "Active" : "Deactive"}
                            >
                              <span className="seller-crm-lead-switch__track">
                                <span className="seller-crm-lead-switch__thumb" />
                              </span>
                            </button>
                          </td>
                          <td className="seller-table__actions">
                            <button
                              type="button"
                              className="seller-crm-icon-btn seller-crm-icon-btn--assign"
                              title="Edit"
                              onClick={() => openEdit(step)}
                            >
                              <i className="fa fa-pencil" aria-hidden />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </SellerDashboardLayout>
      </div>
      <Footer2 />

      {modalOpen ? (
        <div
          className="seller-crm-modal-overlay"
          role="dialog"
          aria-modal="true"
          onMouseDown={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="seller-crm-modal-card seller-crm-modal-card--md">
            <div className="seller-crm-modal-head">
              <h3>{editingStep ? "Edit Step" : "Add New Step"}</h3>
              <button
                type="button"
                className="seller-crm-modal-close"
                onClick={closeModal}
                aria-label="Close"
              >
                x
              </button>
            </div>
            <form className="seller-crm-modal-body" onSubmit={saveStep}>
              <div className="seller-crm-form-field">
                <label>Step Name *</label>
                <input
                  className="form-control"
                  value={stepName}
                  onChange={(e) => {
                    setStepName(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter step name"
                  disabled={saving}
                />
              </div>
              {error ? (
                <div className="alert alert-danger m-t15">{error}</div>
              ) : null}
              <div className="seller-crm-modal-actions">
                <button
                  type="button"
                  className="seller-crm-btn-outline"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="seller-crm-btn-orange"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
