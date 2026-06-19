import React, { useEffect, useMemo, useState } from "react";
import Header2 from "../Common/Header2";
import Footer2 from "../Common/Footer2";
import SellerDashboardLayout from "../Elements/SellerDashboardLayout";
import { SOLAR_ENDPOINTS } from "../../config/api";
import { safeJsonParse } from "../../utils/safeJsonParse";
import {
  assignPermission,
  fetchRolePermissions,
  fetchSolarPermission,
} from "../../api/solarPermission";

function readSellerInfo() {
  if (typeof window === "undefined") return null;
  return safeJsonParse(localStorage.getItem("sellerInfo"), null);
}

function normalizePermissions(apiSections) {
  return (Array.isArray(apiSections) ? apiSections : [])
    .map((section, index) => {
      const sectionName =
        section.section_name || section.name || `Section ${index + 1}`;
      const permissions = Array.isArray(section.permissions)
        ? section.permissions
        : [];
      return {
        key: `${sectionName}-${index}`,
        name: sectionName,
        permissions: permissions
          .map((permission) => ({
            id: permission.id ?? permission.permission_id,
            name: permission.name || permission.permission_name || "",
          }))
          .filter((permission) => permission.id != null && permission.name),
      };
    })
    .filter((section) => section.permissions.length);
}

function normalizeSelectedPermissions(apiPermissions) {
  return new Set(
    (Array.isArray(apiPermissions) ? apiPermissions : [])
      .map((permission) => permission.id ?? permission.permission_id)
      .filter((id) => id != null)
      .map((id) => String(id)),
  );
}

export default function SellerPrivileges() {
  const sellerId = readSellerInfo()?.id;
  const [sections, setSections] = useState([]);
  const [permissionsError, setPermissionsError] = useState("");
  const [loadingPermissions, setLoadingPermissions] = useState(true);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState(new Set());
  const [rolePermissionsLoading, setRolePermissionsLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);
  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [rolesError, setRolesError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadPermissions() {
      try {
        setLoadingPermissions(true);
        setPermissionsError("");
        const data = await fetchSolarPermission();
        if (!cancelled) setSections(normalizePermissions(data));
      } catch (error) {
        if (!cancelled) {
          console.error(error);
          setPermissionsError(
            "Unable to load permissions. Please try again later.",
          );
        }
      } finally {
        if (!cancelled) setLoadingPermissions(false);
      }
    }

    loadPermissions();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadRoles() {
      setRolesLoading(true);
      setRolesError("");
      try {
        const response = await fetch(SOLAR_ENDPOINTS.ROLES_GET);
        const result = await response.json();
        const apiRoles = Array.isArray(result?.data) ? result.data : [];
        const normalizedRoles = apiRoles.map((role) => ({
          id: role.id,
          name: role.name || `Role ${role.id}`,
        }));

        if (!cancelled) setRoles(normalizedRoles);
      } catch (error) {
        if (!cancelled) {
          console.error(error);
          setRoles([]);
          setRolesError("Unable to load roles right now.");
        }
      } finally {
        if (!cancelled) setRolesLoading(false);
      }
    }

    loadRoles();
    return () => {
      cancelled = true;
    };
  }, []);

  const openRole = async (role) => {
    setSelectedRole(role);
    setSelectedPermissionIds(new Set());
    setSaveMessage("");
    setSaveError("");

    if (!sellerId) {
      setSaveError("Seller id not found. Please login again.");
      return;
    }

    try {
      setRolePermissionsLoading(true);
      const data = await fetchRolePermissions({ sellerId, roleId: role.name });
      setSelectedPermissionIds(normalizeSelectedPermissions(data));
    } catch (error) {
      console.error(error);
      setSaveError(" ");
    } finally {
      setRolePermissionsLoading(false);
    }
  };

  const filteredRoles = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return roles;
    return roles.filter((role) => role.name.toLowerCase().includes(q));
  }, [query, roles]);

  const toggleSection = (sectionKey, checked) => {
    const section = sections.find((item) => item.key === sectionKey);
    if (!section) return;
    setSelectedPermissionIds((prev) => {
      const next = new Set(prev);
      section.permissions.forEach((permission) => {
        if (checked) next.add(String(permission.id));
        else next.delete(String(permission.id));
      });
      return next;
    });
  };

  const togglePermission = (permissionId, checked) => {
    setSelectedPermissionIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(String(permissionId));
      else next.delete(String(permissionId));
      return next;
    });
  };

  const saveCurrentRolePermissions = async () => {
    if (!selectedRole || !sellerId) {
      setSaveError("Seller id or role name not found.");
      return;
    }

    try {
      setSaving(true);
      setSaveError("");
      setSaveMessage("");
      const result = await assignPermission({
        sellerId,
        roleId: selectedRole.name,
        permissionIds: Array.from(selectedPermissionIds),
      });
      setSaveMessage(
        result?.message || `Permissions saved for ${selectedRole.name}.`,
      );
      window.setTimeout(() => setSaveMessage(""), 2200);
    } catch (error) {
      console.error(error);
      setSaveError(error?.message || "Unable to save permissions.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Header2 stickyNo />
      <div className="page-content">
        <SellerDashboardLayout>
          <div className="seller-crm-content seller-crm-content--flush">
            {!selectedRole ? (
              <>
                <div className="seller-crm-panel-head seller-crm-panel-head--table seller-privilege-head">
                  <h2 className="seller-crm-panel-title">Roles</h2>
                  <div className="seller-privilege-search">
                    <input
                      className="form-control"
                      placeholder="Search by role..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="seller-crm-table-wrap">
                  <table className="seller-table seller-table--crm seller-privilege-list-table">
                    <thead>
                      <tr>
                        <th>S.No</th>
                        <th>Role</th>
                        <th className="seller-table__actions">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rolesLoading ? (
                        <tr>
                          <td colSpan="3" className="seller-table__empty">
                            Loading roles...
                          </td>
                        </tr>
                      ) : rolesError ? (
                        <tr>
                          <td colSpan="3" className="seller-table__empty">
                            {rolesError}
                          </td>
                        </tr>
                      ) : filteredRoles.length === 0 ? (
                        <tr>
                          <td colSpan="3" className="seller-table__empty">
                            No role found.
                          </td>
                        </tr>
                      ) : (
                        filteredRoles.map((role, index) => (
                          <tr key={role.id}>
                            <td>{index + 1}</td>
                            <td className="seller-table__strong">
                              {role.name}
                            </td>
                            <td className="seller-table__actions">
                              <button
                                type="button"
                                className="seller-crm-icon-btn"
                                onClick={() => openRole(role)}
                              >
                                <i className="fa fa-eye" aria-hidden />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <>
                <div className="seller-crm-panel-head seller-crm-panel-head--table seller-privilege-head">
                  <div>
                    <h2 className="seller-crm-panel-title">
                      Assign Permissions
                    </h2>
                    <div className="seller-crm-subtitle">
                      Role: {selectedRole.name}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="seller-crm-btn-outline"
                    onClick={() => setSelectedRole(null)}
                  >
                    <i className="fa fa-arrow-left m-r6 mr-2" aria-hidden />{" "}
                    Back
                  </button>
                </div>

                <div className="seller-privilege-table-wrap">
                  <table className="seller-table seller-table--crm seller-privilege-table">
                    <thead>
                      <tr>
                        <th>Section</th>
                        <th>Select All</th>
                        <th>Available Permissions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loadingPermissions || rolePermissionsLoading ? (
                        <tr>
                          <td colSpan="3" className="seller-table__empty">
                            Loading permissions...
                          </td>
                        </tr>
                      ) : permissionsError ? (
                        <tr>
                          <td colSpan="3" className="seller-table__empty">
                            {permissionsError}
                          </td>
                        </tr>
                      ) : sections.length === 0 ? (
                        <tr>
                          <td colSpan="3" className="seller-table__empty">
                            No permissions found.
                          </td>
                        </tr>
                      ) : (
                        sections.map((section) => {
                          const allChecked = section.permissions.every(
                            (permission) =>
                              selectedPermissionIds.has(String(permission.id)),
                          );
                          const someChecked = section.permissions.some(
                            (permission) =>
                              selectedPermissionIds.has(String(permission.id)),
                          );
                          return (
                            <tr key={section.key}>
                              <td className="seller-table__strong">
                                {section.name}
                              </td>
                              <td>
                                <label className="seller-privilege-checkbox">
                                  <input
                                    type="checkbox"
                                    checked={allChecked}
                                    ref={(node) => {
                                      if (node)
                                        node.indeterminate =
                                          someChecked && !allChecked;
                                    }}
                                    onChange={(e) =>
                                      toggleSection(
                                        section.key,
                                        e.target.checked,
                                      )
                                    }
                                  />
                                  <span>Select All</span>
                                </label>
                              </td>
                              <td>
                                <div className="seller-privilege-permission-list">
                                  {section.permissions.map((permission) => (
                                    <label
                                      key={permission.id}
                                      className="seller-privilege-checkbox"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={selectedPermissionIds.has(
                                          String(permission.id),
                                        )}
                                        onChange={(e) =>
                                          togglePermission(
                                            permission.id,
                                            e.target.checked,
                                          )
                                        }
                                      />
                                      <span>{permission.name}</span>
                                    </label>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
                {saveError ? (
                  <div className="seller-privilege-save-message seller-privilege-save-message--error">
                    {saveError}
                  </div>
                ) : null}
                {saveMessage ? (
                  <div className="seller-privilege-save-message">
                    {saveMessage}
                  </div>
                ) : null}
                <div className="seller-privilege-actions">
                  <button
                    type="button"
                    className="seller-crm-btn-orange"
                    onClick={saveCurrentRolePermissions}
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save Permissions"}
                  </button>
                </div>
              </>
            )}
          </div>
        </SellerDashboardLayout>
      </div>
      <Footer2 />
    </>
  );
}
