import React, { useState, useCallback } from "react";
import { NavLink } from "react-router-dom";
import Header2 from "../Common/Header2";
import Footer2 from "../Common/Footer2";
import SellerDashboardLayout from "../Elements/SellerDashboardLayout";
import {
  loadCrmStages,
  saveCrmStages,
  loadCrmRoles,
  saveCrmRoles,
  DEFAULT_CRM_PROGRESS_STEPS,
  DEFAULT_CRM_ROLES,
} from "../../data/sellerCrmCustomers";

// ─── Drag helpers ───────────────────────────────────────────
function reorder(list, fromIdx, toIdx) {
  const result = [...list];
  const [removed] = result.splice(fromIdx, 1);
  result.splice(toIdx, 0, removed);
  return result;
}

// ─── Stage Row ───────────────────────────────────────────────
function StageRow({ label, idx, total, onMove, onRemove }) {
  return (
    <div className="crm-admin-stage-row">
      <span className="crm-admin-stage-num">{idx + 1}</span>
      <span className="crm-admin-stage-label">{label}</span>
      <div className="crm-admin-stage-actions">
        <button
          className="crm-admin-icon-btn"
          title="Move up"
          disabled={idx === 0}
          onClick={() => onMove(idx, idx - 1)}
        >
          <i className="fa fa-arrow-up" />
        </button>
        <button
          className="crm-admin-icon-btn"
          title="Move down"
          disabled={idx === total - 1}
          onClick={() => onMove(idx, idx + 1)}
        >
          <i className="fa fa-arrow-down" />
        </button>
        <button
          className="crm-admin-icon-btn crm-admin-icon-btn--danger"
          title="Remove"
          onClick={() => onRemove(idx)}
        >
          <i className="fa fa-trash" />
        </button>
      </div>
    </div>
  );
}

// ─── Role Row ────────────────────────────────────────────────
function RoleRow({ role, onChange, onRemove }) {
  return (
    <div className="crm-admin-role-row">
      <input
        className="form-control crm-admin-role-input"
        value={role.name}
        onChange={(e) => onChange({ ...role, name: e.target.value })}
        placeholder="Role name"
      />
      <label className="crm-admin-toggle-label">
        <input
          type="checkbox"
          checked={role.canEdit}
          onChange={(e) => onChange({ ...role, canEdit: e.target.checked })}
        />
        <span>Can Edit</span>
      </label>
      <label className="crm-admin-toggle-label">
        <input
          type="checkbox"
          checked={role.canViewDeal}
          onChange={(e) => onChange({ ...role, canViewDeal: e.target.checked })}
        />
        <span>View Deal Amount</span>
      </label>
      <button
        className="crm-admin-icon-btn crm-admin-icon-btn--danger"
        onClick={onRemove}
        title="Remove role"
      >
        <i className="fa fa-trash" />
      </button>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────
export default function SellerCrmAdminPanel() {
  const [stages, setStages] = useState(() => loadCrmStages());
  const [roles, setRoles] = useState(() => loadCrmRoles());
  const [newStage, setNewStage] = useState("");
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("stages"); // 'stages' | 'roles'

  // ── Stages handlers ──────────────────────────────────────
  const handleAddStage = () => {
    const trimmed = newStage.trim();
    if (!trimmed || stages.includes(trimmed)) return;
    setStages((prev) => [...prev, trimmed]);
    setNewStage("");
  };

  const handleMoveStage = useCallback((from, to) => {
    setStages((prev) => reorder(prev, from, to));
  }, []);

  const handleRemoveStage = useCallback((idx) => {
    setStages((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const handleResetStages = () => {
    if (
      window.confirm("Default stages restore karo? Aapke changes hat jayenge.")
    ) {
      setStages([...DEFAULT_CRM_PROGRESS_STEPS]);
    }
  };

  // ── Roles handlers ───────────────────────────────────────
  const handleAddRole = () => {
    const id = "r" + Date.now();
    setRoles((prev) => [
      ...prev,
      { id, name: "New Role", canEdit: false, canViewDeal: false },
    ]);
  };

  const handleChangeRole = (id, updated) => {
    setRoles((prev) => prev.map((r) => (r.id === id ? updated : r)));
  };

  const handleRemoveRole = (id) => {
    setRoles((prev) => prev.filter((r) => r.id !== id));
  };

  const handleResetRoles = () => {
    if (window.confirm("Default roles restore karo?")) {
      setRoles([...DEFAULT_CRM_ROLES]);
    }
  };

  // ── Save ────────────────────────────────────────────────
  const handleSave = () => {
    saveCrmStages(stages);
    saveCrmRoles(roles);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <>
      <Header2 stickyNo />
      <div className="page-content">
        <SellerDashboardLayout>
          <div className="seller-crm-content seller-crm-content--flush">
            {/* Header */}
            <div className="seller-crm-panel-head seller-crm-panel-head--table">
              <h2 className="seller-crm-panel-title">
                <i className="fa fa-cog m-r8 mx-2" /> CRM Settings
              </h2>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {saved && (
                  <span className="crm-admin-saved-badge">
                    <i className="fa fa-check m-r4 mx-2" /> Saved!
                  </span>
                )}
                <button className="seller-crm-btn" onClick={handleSave}>
                  <i className="fa fa-save m-r8 mx-2" /> Save Changes
                </button>
                <NavLink
                  to="/seller-customers"
                  className="seller-crm-btn-outline"
                >
                  <i className="fa fa-arrow-left m-r8 mr-2" /> Back
                </NavLink>
              </div>
            </div>

            {/* Tabs */}
            <div className="seller-crm-card m-t20">
              <div className="seller-crm-tabs">
                <button
                  className={
                    activeTab === "stages"
                      ? "seller-crm-tab is-active"
                      : "seller-crm-tab"
                  }
                  onClick={() => setActiveTab("stages")}
                >
                  <i className="fa fa-list-ol m-r8 mx-2" /> Progress Stages
                </button>
                <button
                  className={
                    activeTab === "roles"
                      ? "seller-crm-tab is-active"
                      : "seller-crm-tab"
                  }
                  onClick={() => setActiveTab("roles")}
                >
                  <i className="fa fa-users m-r8 mx-2" /> Roles & Permissions
                </button>
              </div>

              <div className="seller-crm-card__body">
                {/* ── STAGES TAB ── */}
                {activeTab === "stages" && (
                  <div className="crm-admin-section">
                    <div className="crm-admin-section__head">
                      <p className="crm-admin-section__desc">
                        Progress tracker ke stages yahan se add, remove ya
                        reorder karo. Har state ke alag stages ho sakte hain.
                      </p>
                      <button
                        className="crm-admin-reset-btn"
                        onClick={handleResetStages}
                      >
                        <i className="fa fa-refresh m-r4 mx-2" /> Reset to
                        Default
                      </button>
                    </div>

                    {/* Add new stage */}
                    <div className="crm-admin-add-row">
                      <input
                        className="form-control"
                        placeholder="Naya stage naam likho (e.g. AMC Visit)"
                        value={newStage}
                        onChange={(e) => setNewStage(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddStage()}
                      />
                      <button
                        className="seller-crm-btn"
                        onClick={handleAddStage}
                      >
                        <i className="fa fa-plus m-r8 mx-2" /> Add Stage
                      </button>
                    </div>

                    {/* Stages list */}
                    <div className="crm-admin-stages-list">
                      {stages.length === 0 && (
                        <div className="seller-table__empty">
                          Koi stage nahi hai. Upar se add karo.
                        </div>
                      )}
                      {stages.map((s, idx) => (
                        <StageRow
                          key={s + idx}
                          label={s}
                          idx={idx}
                          total={stages.length}
                          onMove={handleMoveStage}
                          onRemove={handleRemoveStage}
                        />
                      ))}
                    </div>

                    <div className="crm-admin-info-box">
                      <i className="fa fa-info-circle m-r8 mx-2" />
                      <strong>Won / Loss</strong> stage special hai — isko do
                      statuses (Won aur Loss) mein split kiya jata hai
                      automatically.
                    </div>
                  </div>
                )}

                {/* ── ROLES TAB ── */}
                {activeTab === "roles" && (
                  <div className="crm-admin-section">
                    <div className="crm-admin-section__head">
                      <p className="crm-admin-section__desc">
                        Roles aur unke permissions yahan manage karo.
                      </p>
                      <button
                        className="crm-admin-reset-btn"
                        onClick={handleResetRoles}
                      >
                        <i className="fa fa-refresh m-r4 mx-2" /> Reset to
                        Default
                      </button>
                    </div>

                    <div className="crm-admin-roles-list">
                      {/* Header row */}
                      <div className="crm-admin-role-row crm-admin-role-row--header">
                        <span>Role Name</span>
                        <span>Can Edit Status</span>
                        <span>View Deal Amount</span>
                        <span></span>
                      </div>

                      {roles.map((role) => (
                        <RoleRow
                          key={role.id}
                          role={role}
                          onChange={(updated) =>
                            handleChangeRole(role.id, updated)
                          }
                          onRemove={() => handleRemoveRole(role.id)}
                        />
                      ))}
                    </div>

                    <button
                      className="seller-crm-btn-outline m-t16"
                      onClick={handleAddRole}
                    >
                      <i className="fa fa-plus m-r8 mr-2" /> Add New Role
                    </button>

                    <div className="crm-admin-info-box m-t16">
                      <i className="fa fa-info-circle m-r8 mx-2" />
                      <strong>View Deal Amount</strong> permission wale roles ko
                      hi deal ki value customer view mein dikhegi.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </SellerDashboardLayout>
      </div>
      <Footer2 />
    </>
  );
}
