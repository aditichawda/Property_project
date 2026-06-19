import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Header2 from "../Common/Header2";
import Footer2 from "../Common/Footer2";
import SellerDashboardLayout from "../Elements/SellerDashboardLayout";
import SellerStaffModal from "../Elements/SellerStaffModal";
import {
  fetchSolarStaffAll,
  createSolarStaff,
  deleteSolarStaff,
  updateSolarStaff,
  toggleSolarStaffStatus,
} from "../../api/solarStaff";
import { useAuth } from "../../context/AuthContext";
import { SOLAR_ENDPOINTS } from "../../config/api";
import { safeJsonParse } from "../../utils/safeJsonParse";
import { hasAnySellerPermission } from "../../utils/sellerPermissions";

function normalizeRoleOptions(apiData) {
  const candidates = [
    apiData?.data?.roles,
    apiData?.data?.role_list,
    apiData?.data?.staff_roles,
    apiData?.roles,
    apiData?.role_list,
    apiData?.staff_roles,
  ];
  const source = candidates.find((x) => Array.isArray(x)) || [];
  const options = source
    .map((item) => {
      if (typeof item === "string") return { id: item, name: item };
      if (item && typeof item === "object") {
        const id = item.id ?? item.role_id ?? item.value ?? item.name;
        const name =
          item.name || item.role_name || item.title || String(id || "");
        if (id == null || !name) return null;
        return { id: String(id), name: String(name).trim() };
      }
      return null;
    })
    .filter(Boolean);
  return Array.from(new Map(options.map((opt) => [opt.id, opt])).values());
}

export default function SellerStaff() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { auth } = useAuth();
  const seller =
    typeof window !== "undefined"
      ? safeJsonParse(localStorage.getItem("sellerInfo"), null) || {}
      : {};
  const canCreateStaff = hasAnySellerPermission(seller, ["Staff.Create"]);
  const canEditStaff = hasAnySellerPermission(seller, ["Staff.Edit"]);
  const canActiveStaff = hasAnySellerPermission(seller, ["Staff.Active"]);
  const [staff, setStaff] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [roleOptions, setRoleOptions] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [pageMessage, setPageMessage] = useState({ type: "", text: "" });
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") === "roles" ? "roles" : "staff",
  );
  // State add karo
  const [deleteConfirm, setDeleteConfirm] = useState(null); // staff object store hoga

  // Delete button click pe - pehle confirm dikhao
  const openDeleteConfirm = (staff) => {
    setDeleteConfirm(staff);
  };

  // Confirm ke baad actual delete
  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    await handleDelete(deleteConfirm.id);
    setDeleteConfirm(null);
  };
  useEffect(() => {
    if (!pageMessage.text) return undefined;
    const timer = setTimeout(() => {
      setPageMessage({ type: "", text: "" });
    }, 3000);
    return () => clearTimeout(timer);
  }, [pageMessage.text]);

  useEffect(() => {
    setActiveTab(searchParams.get("tab") === "roles" ? "roles" : "staff");
  }, [searchParams]);

  useEffect(() => {
    let alive = true;
    async function loadRoles() {
      setRolesLoading(true);
      try {
        const response = await fetch(SOLAR_ENDPOINTS.ROLES_GET);
        const result = await response.json();
        const apiRoles = normalizeRoleOptions(result);
        if (!alive) return;
        setRoleOptions(apiRoles);
      } catch (error) {
        if (!alive) return;
        console.error(error);
        setRoleOptions([]);
      } finally {
        if (alive) setRolesLoading(false);
      }
    }
    loadRoles();
    return () => {
      alive = false;
    };
  }, []);

  const mergedRoleOptions = useMemo(() => {
    const all = Array.isArray(roleOptions) ? roleOptions : [];
    const deduped = [];
    const seen = new Set();
    all.forEach((item) => {
      if (!item || typeof item !== "object") return;
      const id = String(item.id ?? "");
      const name = String(item.name ?? "").trim();
      if (!id || !name) return;
      if (seen.has(id)) return;
      seen.add(id);
      deduped.push({ id, name });
    });
    return deduped;
  }, [roleOptions]);

  const roleNameById = useMemo(() => {
    const map = {};
    mergedRoleOptions.forEach((item) => {
      if (item && typeof item === "object") map[String(item.id)] = item.name;
    });
    return map;
  }, [mergedRoleOptions]);

  const displayRoles = useMemo(() => {
    if (mergedRoleOptions.length) return mergedRoleOptions;
    return [
      { id: "sales-manager", name: "Sales Manager" },
      { id: "enquiry-executive", name: "Enquiry Executive" },
      { id: "property-viewer", name: "Property Viewer" },
    ];
  }, [mergedRoleOptions]);

  useEffect(() => {
    let alive = true;
    async function loadStaff() {
      if (!auth?.userId) {
        setStaff([]);
        setLoadError("Seller login required to view staff.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setLoadError("");
      try {
        const list = await fetchSolarStaffAll(auth.userId, roleNameById);
        if (!alive) return;
        setStaff(list);
        setLoadError("");
      } catch (error) {
        if (!alive) return;
        console.error(error);
        setLoadError("Unable to load staff right now.");
        setStaff([]);
      } finally {
        if (alive) setLoading(false);
      }
    }
    loadStaff();
    return () => {
      alive = false;
    };
  }, [auth?.userId, roleNameById]);

  const openAdd = () => {
    setEditing(null);
    setSubmitError("");
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setSubmitError("");
    setModalOpen(true);
  };

  const handleSave = async (payload) => {
    if (!auth?.userId) {
      setSubmitError("Seller login required.");
      return;
    }
    setIsSaving(true);
    setSubmitError("");
    const wasEditing = Boolean(editing);
    try {
      if (editing) {
        await updateSolarStaff(editing.id, payload);
      } else {
        await createSolarStaff({
          ...payload,
          sellerId: auth.userId,
        });
      }
      const refreshed = await fetchSolarStaffAll(auth.userId, roleNameById);
      setStaff(refreshed);
      setModalOpen(false);
      setEditing(null);
      setPageMessage({
        type: "success",
        text: wasEditing
          ? "Staff updated successfully."
          : "Staff added successfully.",
      });
    } catch (error) {
      console.error(error);
      setSubmitError(
        error?.apiData || error?.message || "Unable to save staff member.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!auth?.userId) {
      setSubmitError("Seller login required.");
      return;
    }
    try {
      await deleteSolarStaff(auth.userId, id);
      const refreshed = await fetchSolarStaffAll(auth.userId, roleNameById);
      setStaff(refreshed);
    } catch (error) {
      console.error(error);
      setSubmitError(error?.message || "Unable to delete staff member.");
    }
  };

  const handleToggleStatus = async (staffMember) => {
    if (!auth?.userId) return;
    const newStatus = staffMember.status === 1 ? 0 : 1;
    try {
      await toggleSolarStaffStatus(staffMember.id, newStatus);
      const refreshed = await fetchSolarStaffAll(auth.userId, roleNameById);
      setStaff(refreshed);
      setPageMessage({
        type: "success",
        text:
          newStatus === 1
            ? "Staff activated successfully."
            : "Staff deactivated successfully.",
      });
    } catch (error) {
      console.error(error);
      setPageMessage({
        type: "danger",
        text: "Unable to update staff status.",
      });
    }
  };
  return (
    <>
      <Header2 stickyNo />
      <div className="page-content">
        <SellerDashboardLayout>
          <div className="seller-crm-content">
            <div className="seller-crm-panel-head seller-crm-panel-head--table">
              <div>
                <h2 className="seller-crm-panel-title">Staff Management</h2>
                <p className="m-b0 text-muted">
                  Manage staff list and role-wise permissions from one place.
                </p>
              </div>
            </div>

            {pageMessage.text ? (
              <div
                className={`alert ${
                  pageMessage.type === "danger"
                    ? "alert-danger"
                    : "alert-success"
                } m-b20`}
              >
                {pageMessage.text}
              </div>
            ) : null}
            {activeTab === "staff" ? (
              <div className="seller-crm-table-wrap">
                <table className="seller-table seller-table--crm">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Phone</th>
                      <th>Email</th>
                      <th>Active</th>
                      <th>Role</th>
                      <th className="seller-table__actions">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="6" className="seller-table__empty">
                          Loading staff...
                        </td>
                      </tr>
                    ) : loadError ? (
                      <tr>
                        <td
                          colSpan="6"
                          className="seller-table__empty text-center"
                        >
                          {loadError}
                        </td>
                      </tr>
                    ) : staff.length === 0 ? (
                      <tr>
                        <td
                          colSpan="6"
                          className="seller-table__empty text-center"
                        >
                          No staff data found. Click &quot;Add staff&quot; to
                          create one.
                        </td>
                      </tr>
                    ) : (
                      staff.map((s) => (
                        <tr key={s.id}>
                          <td className="seller-table__strong">{s.name}</td>
                          <td>{s.phone}</td>
                          <td>{s.email}</td>
                          <td>
                            {canActiveStaff ? (
                              <label className="switch">
                                <input
                                  type="checkbox"
                                  checked={s.status === 1}
                                  onChange={() => handleToggleStatus(s)}
                                />
                                <span className="slider round"></span>
                              </label>
                            ) : (
                              <span>
                                {s.status === 1 ? "Active" : "Inactive"}
                              </span>
                            )}
                          </td>

                          <td>{s.role || "-"}</td>
                          <td className="seller-table__actions">
                            {canEditStaff && (
                              <button
                                type="button"
                                className="seller-crm-btn-small seller-crm-btn-small--edit"
                                title="Edit"
                                onClick={() => openEdit(s)}
                              >
                                <i className="fa fa-pencil" aria-hidden />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="seller-crm-table-wrap">
                <table className="seller-table seller-table--crm">
                  <thead>
                    <tr>
                      <th>Role</th>
                      <th>Permission Access</th>
                      <th className="seller-table__actions">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rolesLoading ? (
                      <tr>
                        <td colSpan="3" className="seller-table__empty">
                          Loading roles...
                        </td>
                      </tr>
                    ) : (
                      displayRoles.map((role) => (
                        <tr key={role.id}>
                          <td className="seller-table__strong">{role.name}</td>
                          <td>
                            Dashboard, enquiries, properties, staff and account
                            access can be controlled role-wise.
                          </td>
                          <td className="seller-table__actions">
                            <a
                              href="/seller-privileges"
                              className="seller-crm-btn-small seller-crm-btn-small--edit"
                              title="Manage permissions"
                            >
                              <i className="fa fa-key" aria-hidden />
                            </a>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </SellerDashboardLayout>
      </div>
      {deleteConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
          onClick={() => setDeleteConfirm(null)} // bahar click se close
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "1.5rem",
              maxWidth: "340px",
              width: "90%",
              textAlign: "center",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()} // andar click se close nahi hoga
          >
            {/* Cross icon */}
            <button
              onClick={() => setDeleteConfirm(null)}
              style={{
                position: "absolute",
                top: "12px",
                right: "12px",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#888",
                fontSize: "18px",
                lineHeight: 1,
                padding: "2px 6px",
              }}
            >
              &#x2715;
            </button>

            {/* Trash icon */}
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                background: "#fde8e8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 12px",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"
                  stroke="#A32D2D"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M10 11v5M14 11v5"
                  stroke="#A32D2D"
                  stroke-width="1.8"
                  stroke-linecap="round"
                />
              </svg>
            </div>

            {/* Title */}
            <h3
              style={{
                fontSize: "16px",
                fontWeight: "600",
                margin: "0 0 8px",
                color: "#111",
              }}
            >
              Delete staff member?
            </h3>

            {/* Message */}
            <p
              style={{
                fontSize: "13px",
                color: "#666",
                margin: "0 0 1.25rem",
                lineHeight: "1.6",
              }}
            >
              Are you sure you want to delete{" "}
              <strong style={{ color: "#111" }}>{deleteConfirm.name}</strong>?
              This action cannot be undone.
            </p>

            {/* Buttons */}
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => setDeleteConfirm(null)}
                style={{
                  flex: 1,
                  padding: "9px",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  background: "#fff",
                  color: "#333",
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                No, cancel
              </button>
              <button
                onClick={confirmDelete}
                style={{
                  flex: 1,
                  padding: "9px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#A32D2D",
                  color: "#fff",
                  fontSize: "13px",
                  fontWeight: "500",
                  cursor: "pointer",
                }}
              >
                Yes, delete
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer2 />

      <SellerStaffModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initial={editing}
        roleOptions={mergedRoleOptions}
        isSaving={isSaving}
        submitError={submitError}
      />
    </>
  );
}
