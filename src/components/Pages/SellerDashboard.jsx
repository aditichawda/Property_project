import React, { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import SellerDashboardLayout from "../Elements/SellerDashboardLayout";
import Header2 from "../Common/Header2";
import Footer2 from "../Common/Footer2";
import { safeJsonParse } from "../../utils/safeJsonParse";
import {
  fetchSellerDashboard,
  fetchSellerDetail,
} from "../../api/sellerDashboard";
import { getCurrentSellerId } from "../../api/properties";
import {
  fetchPropertyInquiries,
  fetchPropertyInquiryFollowUpReport,
} from "../../api/propertyInquiries";
import {
  getSellerPackageUsage,
  hasActiveSellerPackage,
  readSellerPackage,
  extractSellerPackageHistory,
  syncSellerPackageFromApi,
} from "../../data/sellerPackages";

function readSellerInfo() {
  if (typeof window === "undefined") return {};
  return safeJsonParse(localStorage.getItem("sellerInfo"), {}) || {};
}

function pad2(value) {
  return String(value).padStart(2, "0");
}

function todayInputValue() {
  const now = new Date();
  return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
}

function formatDisplayDate(input) {
  const date = parseFollowupDate(input);
  if (!date) return input || "-";
  return `${pad2(date.getDate())}-${pad2(date.getMonth() + 1)}-${date.getFullYear()}`;
}

function formatPackagePrice(value) {
  if (value === null || value === undefined || value === "") return "-";
  const raw = String(value).trim();
  if (raw.includes("₹")) return raw;
  const numeric = Number(raw.replace(/,/g, ""));
  return Number.isFinite(numeric)
    ? `₹${numeric.toLocaleString("en-IN")}`
    : raw;
}

function formatPaymentMethod(value) {
  if (!value || value === "-") return "-";
  return String(value)
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function parseFollowupDate(input) {
  if (!input) return null;
  if (input instanceof Date && !Number.isNaN(input.getTime())) return input;
  const raw = String(input).trim();
  const ddmmyyyy = raw.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (ddmmyyyy) {
    const [, dd, mm, yyyy] = ddmmyyyy;
    return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  }
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toInputDate(input) {
  const date = parseFollowupDate(input);
  if (!date) return "";
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function isDateInRange(input, from, to) {
  const value = toInputDate(input);
  if (!value) return false;
  return (!from || value >= from) && (!to || value <= to);
}

function enquiryFollowupsForRange(inquiries, from, to) {
  return inquiries.flatMap((enquiry) =>
    (Array.isArray(enquiry.followUps) ? enquiry.followUps : [])
      .filter((item) => isDateInRange(item.date || item.createdAt, from, to))
      .map((item, index) => ({
        id: item.id || `${enquiry.id || enquiry.createdAt}-enquiry-followup-${index}`,
        name: enquiry.name,
        phone: enquiry.mobile,
        title: enquiry.propertyName,
        date: item.date || item.createdAt,
        methods: item.types || item.followUpby || [],
        remark: item.remark || "-",
        to: `/seller-enquiries/${enquiry.id || enquiry.createdAt}`,
      })),
  );
}

function normalizeReportFollowup(item = {}, index = 0) {
  const methods =
    item.methods || item.types || item.follow_up_types ||
    item.followUpTypes || item.followUpby || [];
  return {
    id: item.id || `${item.inquiryId || item.inquiry_id || "followup"}-${item.date || index}`,
    name: item.name || "-",
    phone: item.phone || item.mobile || "-",
    title: item.title || item.propertyName || item.property_name || "-",
    date: item.nextFollowUpDate || item.next_follow_up_date || item.date || item.createdAt || "",
    methods: Array.isArray(methods) ? methods : [methods].filter(Boolean),
    remark: item.remark || "-",
    to: `/seller-enquiries/${item.inquiryId || item.inquiry_id || item.id || ""}`,
  };
}

const statCards = (allProperties, activeProperties, inquiries, newInquiries, apiStats = {}) => [
  {
    to: "/seller-services",
    icon: "fa-home",
    value: apiStats.totalProperties ?? allProperties.length,
    label: "Total Properties",
    sub: "Added listings",
    color: "#0ea5e9",
    bg: "#f0f9ff",
    border: "#bae6fd",
  },
  {
    to: "/seller-services",
    icon: "fa-check-circle",
    value: apiStats.activeProperties ?? activeProperties.length,
    label: "Active Properties",
    sub: "Visible on website",
    color: "#f59e0b",
    bg: "#fffbeb",
    border: "#fde68a",
  },
  {
    to: "/seller-enquiries",
    icon: "fa-comments",
    value: apiStats.totalEnquiries ?? inquiries.length,
    label: "Total Enquiries",
    sub: "Buyer lead requests",
    color: "#8b5cf6",
    bg: "#f5f3ff",
    border: "#ddd6fe",
  },
  {
    to: "/seller-enquiries",
    icon: "fa-bell",
    value: apiStats.newEnquiries ?? newInquiries.length,
    label: "New Enquiries",
    sub: "Need attention",
    color: "#10b981",
    bg: "#ecfdf5",
    border: "#a7f3d0",
  },
];

const quickActions = [
  { to: "/seller-services/new", title: "Add Property", icon: "fa-plus-circle", text: "Create a new listing", color: "#f59e0b", bg: "#fffbeb" },
  { to: "/seller-services", title: "My Properties", icon: "fa-home", text: "Edit, delete, activate", color: "#0ea5e9", bg: "#f0f9ff" },
  { to: "/seller-enquiries", title: "Enquiry List", icon: "fa-comments", text: "View buyer messages", color: "#8b5cf6", bg: "#f5f3ff" },
  { to: "/seller-account", title: "Seller Profile", icon: "fa-user-circle", text: "Update account info", color: "#10b981", bg: "#ecfdf5" },
];

function statusBadge(status) {
  const map = {
    Active: { bg: "#ecfdf5", color: "#059669", label: "Active" },
    Inactive: { bg: "#fef2f2", color: "#dc2626", label: "Inactive" },
    Pending: { bg: "#fffbeb", color: "#d97706", label: "Pending" },
    Sold: { bg: "#f5f3ff", color: "#7c3aed", label: "Sold" },
  };
  const s = map[status] || { bg: "#f3f4f6", color: "#6b7280", label: status };
  return (
    <span style={{ background: s.bg, color: s.color, padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
      {s.label}
    </span>
  );
}

function inquiryStatusBadge(status) {
  const map = {
    New: { bg: "#eff6ff", color: "#2563eb" },
    Contacted: { bg: "#fffbeb", color: "#d97706" },
    Closed: { bg: "#ecfdf5", color: "#059669" },
  };
  const s = map[status] || { bg: "#f3f4f6", color: "#6b7280" };
  return (
    <span style={{ background: s.bg, color: s.color, padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
      {status || "New"}
    </span>
  );
}

// ── Empty state component ──
function EmptyState({ icon, message }) {
  return (
    <div style={{ padding: "32px 24px", textAlign: "center", color: "#94a3b8" }}>
      <i className={`fa ${icon}`} style={{ fontSize: 32, marginBottom: 10, display: "block", color: "#e2e8f0" }} />
      <div style={{ fontSize: 13 }}>{message}</div>
    </div>
  );
}

export default function SellerDashboard() {
  const seller = readSellerInfo();
  const today = todayInputValue();
  const [followupFrom, setFollowupFrom] = useState(today);
  const [followupTo, setFollowupTo] = useState(today);
  const [appliedFollowupFrom, setAppliedFollowupFrom] = useState(today);
  const [appliedFollowupTo, setAppliedFollowupTo] = useState(today);
  const [dashboardData, setDashboardData] = useState(null);
  const [dashboardInquiries, setDashboardInquiries] = useState([]);
  const [reportFollowups, setReportFollowups] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState("");
  const [packageHistory, setPackageHistory] = useState([]);
  const [showPackageHistory, setShowPackageHistory] = useState(false);
  const [, setPackageVersion] = useState(0);
  const sellerPackage = readSellerPackage();
  const hasPackage = hasActiveSellerPackage();
  const hasPurchasedPackage = sellerPackage?.id && sellerPackage.id !== "free";
  const packageExpiryTime = sellerPackage?.expiresAt
    ? new Date(sellerPackage.expiresAt).getTime()
    : 0;
  const packageDaysRemaining = packageExpiryTime
    ? Math.max(
        Math.ceil((packageExpiryTime - Date.now()) / (24 * 60 * 60 * 1000)),
        0,
      )
    : 0;
  const packageStartTime = sellerPackage?.purchasedAt
    ? new Date(sellerPackage.purchasedAt).getTime()
    : 0;
  const packageTotalDays =
    packageStartTime && packageExpiryTime > packageStartTime
      ? Math.max(
          Math.ceil(
            (packageExpiryTime - packageStartTime) / (24 * 60 * 60 * 1000),
          ),
          1,
        )
      : 365;
  const packageValidityUsedPercent = Math.min(
    Math.max(
      Math.round(
        ((packageTotalDays - packageDaysRemaining) / packageTotalDays) * 100,
      ),
      0,
    ),
    100,
  );
  const showExpiryWarning =
    hasPackage && packageDaysRemaining > 0 && packageDaysRemaining <= 30;

  // ✅ Sirf API data — dummy nahi
  const allProperties = dashboardData?.recentProperties || [];
  const activeProperties = allProperties.filter((p) => p.status === "Active");
  const inquiries = dashboardInquiries;
  const unfilteredInquiries = inquiries;
  const newInquiries = unfilteredInquiries.filter((i) => i.status === "New");
  const sellerName = seller.fullName || seller.name || "Property Seller";

  const enquiryFollowups = useMemo(
    () => enquiryFollowupsForRange(unfilteredInquiries, appliedFollowupFrom, appliedFollowupTo),
    [unfilteredInquiries, appliedFollowupFrom, appliedFollowupTo],
  );

  // ✅ Sirf API data — dummy fallback nahi
  const recentProperties = dashboardData?.recentProperties || [];
  const sellerTotalProperties = Number(
    dashboardData?.stats?.totalProperties ?? recentProperties.length,
  );
  const packageUsage = getSellerPackageUsage(sellerTotalProperties);
  const packageUsedPosts = packageUsage.usedPosts;
  const packageTotalPosts = packageUsage.postLimit;
  const packageRemainingPosts = packageUsage.remainingPosts;
  const packageStartDate = sellerPackage?.purchasedAt
    ? new Date(sellerPackage.purchasedAt).toLocaleDateString("en-IN")
    : "Free by default";
  const packageExpiryDate = sellerPackage?.expiresAt
    ? new Date(sellerPackage.expiresAt).toLocaleDateString("en-IN")
    : "-";
  const recentEnquiries = dashboardData?.recentEnquiries?.length
    ? dashboardData.recentEnquiries
    : dashboardInquiries;

  const apiFollowups = dashboardData?.todayFollowups?.length ? dashboardData.todayFollowups : [];
  const visibleFollowups = reportFollowups.length
    ? reportFollowups
    : apiFollowups.length
    ? apiFollowups
    : enquiryFollowups;

  const clearFollowupFilters = () => {
    setFollowupFrom(today);
    setFollowupTo(today);
    setAppliedFollowupFrom(today);
    setAppliedFollowupTo(today);
  };

  useEffect(() => {
    let cancelled = false;
    const sellerId = getCurrentSellerId();
    if (!sellerId) return undefined;
    (async () => {
      try {
        setDashboardLoading(true);
        setDashboardError("");
        const response = await fetchSellerDashboard({
          sellerId,
          from: appliedFollowupFrom || today,
          to: appliedFollowupTo || appliedFollowupFrom || today,
        });
        if (!cancelled) setDashboardData(response);
      } catch (error) {
        if (!cancelled) {
          setDashboardData(null);
          setDashboardError(error?.response?.data?.message || error?.message || "Unable to load dashboard data.");
        }
      } finally {
        if (!cancelled) setDashboardLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [appliedFollowupFrom, appliedFollowupTo, today]);

  useEffect(() => {
    let cancelled = false;
    const sellerId = getCurrentSellerId();
    if (!sellerId) return undefined;
    fetchSellerDetail(sellerId)
      .then((detail) => {
        if (cancelled) return;
        setPackageHistory(extractSellerPackageHistory(detail));
        const syncedPackage = syncSellerPackageFromApi(
          detail,
          Number(
            detail?.property_count ||
              detail?.total_properties ||
              detail?.active_property_count ||
              detail?.properties?.length ||
              0,
          ),
        );
        if (syncedPackage) setPackageVersion((value) => value + 1);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const sellerId = getCurrentSellerId();
    if (!sellerId) return undefined;
    (async () => {
      try {
        setDashboardLoading(true);
        setDashboardError("");
        const response = await fetchPropertyInquiryFollowUpReport({
          sellerId,
          from: appliedFollowupFrom || today,
          to: appliedFollowupTo || appliedFollowupFrom || today,
        });
        if (!cancelled) setReportFollowups(response.map(normalizeReportFollowup));
      } catch (error) {
        if (!cancelled) {
          setReportFollowups([]);
          setDashboardError(error?.response?.data?.message || error?.message || "Unable to load follow-up report.");
        }
      } finally {
        if (!cancelled) setDashboardLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [appliedFollowupFrom, appliedFollowupTo, today]);

  useEffect(() => {
    let cancelled = false;
    const sellerId = getCurrentSellerId();
    if (!sellerId) return undefined;
    (async () => {
      try {
        const response = await fetchPropertyInquiries({ sellerId, page: 1, perPage: 5 });
        if (!cancelled) setDashboardInquiries(response.items || []);
      } catch {
        if (!cancelled) setDashboardInquiries([]);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <>
      <Header2 stickyNo />
      <div className="page-content">
        <SellerDashboardLayout>
          <div style={{ padding: "0 0 32px" }}>

            {/* ── WELCOME BANNER ── */}
            <div style={{ background: "linear-gradient(120deg, #0f172a 0%, #1e293b 60%, #1c1917 100%)", borderRadius: 16, padding: "28px 32px", marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", right: -40, top: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(245,158,11,0.08)", pointerEvents: "none" }} />
              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#f59e0b", textTransform: "uppercase", marginBottom: 6 }}>Property Seller Dashboard</div>
                <h2 style={{ color: "#fff", fontSize: 26, fontWeight: 700, margin: "0 0 6px" }}>Welcome back, {sellerName} 👋</h2>
                <p style={{ color: "rgba(255,255,255,0.6)", margin: 0, fontSize: 14 }}>Manage listings, track enquiries and grow your property business.</p>
              </div>
              <NavLink to="/seller-services/new" style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)", color: "#fff", padding: "11px 22px", borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: "none", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 4px 14px rgba(245,158,11,0.35)", position: "relative", zIndex: 1 }}>
                <i className="fa fa-plus" /> Add Property
              </NavLink>
            </div>

            {/* ── QUICK ACTIONS ── */}
            {!hasPackage ? (
              <div style={{ background: "#fff7ed", border: "1.5px solid #fed7aa", borderRadius: 14, padding: "20px 22px", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 46, height: 46, borderRadius: 12, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: "#f97316", boxShadow: "0 6px 18px rgba(249,115,22,0.16)" }}>
                    <i className="fa fa-shopping-bag" style={{ fontSize: 20 }} />
                  </div>
                  <div>
                    <div style={{ color: "#9a3412", fontWeight: 900 }}>
                      {hasPurchasedPackage
                        ? `${sellerPackage.name || "Package"} expired`
                        : "Free plan: 2 property posts"}
                    </div>
                    <div style={{ color: "#7c2d12", fontSize: 13 }}>
                      {hasPurchasedPackage
                        ? `Expired on ${packageExpiryDate}. Renew to continue using package benefits.`
                        : "Each property can include up to 10 images. Upgrade when your free posts are used."}
                    </div>
                  </div>
                </div>
                <NavLink to="/property-seller-packages" style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)", color: "#fff", padding: "10px 18px", borderRadius: 8, fontWeight: 800, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <i className={`fa ${hasPurchasedPackage ? "fa-refresh" : "fa-credit-card"}`} />
                  {hasPurchasedPackage ? "Renew Package" : "View Packages"}
                </NavLink>
                {packageHistory.length ? (
                  <button
                    type="button"
                    className="seller-crm-btn-outline"
                    onClick={() => setShowPackageHistory(true)}
                  >
                    <i className="fa fa-history m-r8 mx-2" aria-hidden /> Purchase History
                  </button>
                ) : null}
              </div>
            ) : (
              <>
              {showExpiryWarning ? (
                <div style={{ background: "#fff7ed", border: "1px solid #fdba74", color: "#9a3412", borderRadius: 10, padding: "10px 14px", marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                  <strong>
                    <i className="fa fa-clock-o" style={{ marginRight: 8 }} />
                    Package expires in {packageDaysRemaining} {packageDaysRemaining === 1 ? "day" : "days"}
                  </strong>
                  <NavLink to="/property-seller-packages" style={{ color: "#9a3412", fontWeight: 800 }}>
                    Renew now
                  </NavLink>
                </div>
              ) : null}
              <div style={{ background: "#fffcf5", border: "1px solid #f1e5c9", borderLeft: "5px solid #f59e0b", borderRadius: 14, marginBottom: 18, boxShadow: "0 8px 24px rgba(15,23,42,0.08)", overflow: "hidden" }}>
                <div style={{ padding: "13px 18px", display: "flex", justifyContent: "space-between", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 10, background: "#f59e0b", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                      <i className="fa fa-diamond" />
                    </div>
                    <div>
                      <div style={{ color: "#172033", fontWeight: 900, fontSize: 18 }}>
                        Active Package: {sellerPackage?.name || "Seller Package"}
                      </div>
                      <div style={{ color: "#7c7c7c", fontSize: 12, fontWeight: 600, marginTop: 2 }}>
                        {packageDaysRemaining} days remaining 
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <span style={{ color: "#087a49", background: "#eafaf1", border: "1px solid #91dfb7", borderRadius: 20, padding: "5px 13px", fontSize: 12, fontWeight: 800 }}>
                      <i className="fa fa-check" style={{ marginRight: 7 }} /> Active
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowPackageHistory(true)}
                      style={{
                        color: "#475569",
                        background: "#fff",
                        border: "1px solid #dbe2ea",
                        padding: "7px 12px",
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 800,
                      }}
                    >
                      
                      Purchase History
                    </button>
                    <NavLink to="/property-seller-packages" style={{ color: "#9a6a00", background: "#fffaf0", border: "1px solid #eadbb8", padding: "7px 12px", borderRadius: 8, fontSize: 12, fontWeight: 800, textDecoration: "none" }}>
                      <i className="fa fa-refresh" style={{ marginRight: 7 }} />
                      Renew
                    </NavLink>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(100px, 1fr))", borderTop: "1px solid #eadfc8", overflowX: "auto" }}>
                  {[
                    ["Start date", packageStartDate],
                    ["Valid till", packageExpiryDate],
                    ["Total posts", packageUsage.isUnlimited ? "Unlimited" : packageTotalPosts],
                    ["Used posts", packageUsedPosts],
                    ["Remaining", packageUsage.isUnlimited ? "Unlimited" : packageRemainingPosts],
                    ["Usage", packageUsage.isUnlimited ? `${packageUsedPosts} used` : `${packageUsedPosts} / ${packageTotalPosts}`],
                  ].map(([label, value], index) => (
                    <div key={label} style={{ padding: "11px 14px", borderRight: index < 5 ? "1px solid #eadfc8" : "none" }}>
                      <div style={{ color: "#ef8f00", fontSize: 10, fontWeight: 900, textTransform: "uppercase" }}>{label}</div>
                      <div style={{ color: label === "Remaining" ? "#15804f" : "#172033", fontSize: 15, fontWeight: 900, marginTop: 3 }}>{value}</div>
                    </div>
                  ))}
                </div>

                <div style={{ padding: "9px 18px 11px", borderTop: "1px solid #eadfc8" }}>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "76px minmax(0, 1fr)",
                      gap: 16,
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        width: 68,
                        height: 68,
                        borderRadius: "50%",
                        background: `conic-gradient(#f59e0b ${packageValidityUsedPercent}%, #f4e7c8 0)`,
                        display: "grid",
                        placeItems: "center",
                      }}
                      aria-label={`${packageValidityUsedPercent}% package validity used`}
                    >
                      <div
                        style={{
                          width: 54,
                          height: 54,
                          borderRadius: "50%",
                          background: "#fffdf8",
                          display: "grid",
                          placeItems: "center",
                          color: "#ef8f00",
                          fontSize: 13,
                          fontWeight: 900,
                        }}
                      >
                        {packageValidityUsedPercent}%
                      </div>
                    </div>
                    <div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "baseline",
                          gap: 12,
                          marginBottom: 8,
                        }}
                      >
                        <div>
                          <strong style={{ color: "#172033", fontSize: 16 }}>
                            {packageDaysRemaining} days left
                          </strong>
                          
                        </div>
                       
                      </div>
                      <div
                        style={{
                          height: 7,
                          borderRadius: 10,
                          background: "#eee4c9",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${packageValidityUsedPercent}%`,
                            minWidth: packageValidityUsedPercent ? 8 : 0,
                            height: "100%",
                            borderRadius: 10,
                            background:
                              "linear-gradient(90deg,#f59e0b,#ef7d18)",
                          }}
                        />
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          color: "#8b8b8b",
                          fontSize: 11,
                          marginTop: 7,
                        }}
                      >
                        <span>Start: {packageStartDate}</span>
                        <span>Expires: {packageExpiryDate}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: "none" }}>
                  {[
                    packageUsage.isUnlimited
                      ? "Unlimited property posts"
                      : `Up to ${packageTotalPosts} property posts`,
                    "10 images per property",
                    "Enquiry management",
                    "Seller profile page",
                  ].map((feature) => (
                    <span key={feature} style={{ color: "#087a49", background: "#effbf5", border: "1px solid #a8e5c4", borderRadius: 10, padding: "8px 15px", fontSize: 13, fontWeight: 700 }}>
                      <i className="fa fa-check" style={{ marginRight: 8 }} /> {feature}
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ display: "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                  <div>
                    <div style={{ color: "#fff", fontWeight: 900, fontSize: 19 }}>
                      <i className="fa fa-check-circle" style={{ marginRight: 8, color: "#f59e0b" }} />
                      Active Package: {sellerPackage?.name || "Seller Package"}
                    </div>
                    <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, marginTop: 5 }}>
                      Valid for 1 year 
                    </div>
                  </div>
                  <NavLink to="/property-seller-packages" style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)", color: "#fff", padding: "10px 18px", borderRadius: 9, fontWeight: 900, textDecoration: "none", boxShadow: "0 6px 18px rgba(245,158,11,0.28)" }}>
                    <i className="fa fa-refresh" style={{ marginRight: 7 }} />
                    Renew / Change Package
                  </NavLink>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(135px, 1fr))", gap: 12, marginTop: 18 }}>
                  {[
                    ["Start date", packageStartDate],
                    ["Valid till", packageExpiryDate],
                    ["Validity", "1 year"],
                    ["Total posts", packageTotalPosts],
                    ["Used posts", packageUsedPosts],
                    ["Remaining", packageRemainingPosts],
                  ].map(([label, value]) => (
                    <div key={label} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(245,158,11,0.24)", borderRadius: 11, padding: "12px 14px" }}>
                      <div style={{ color: "#fbbf24", fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
                      <div style={{ color: "#fff", fontSize: 15, fontWeight: 900, marginTop: 4 }}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>
              </>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 16, marginBottom: 24 }}>
              {quickActions.map(({ to, title, icon, text, color, bg }) => (
                <NavLink key={to} to={to} style={{ background: "#fff", border: "1.5px solid #f1f5f9", borderRadius: 14, padding: "20px 18px", textDecoration: "none", color: "#111827", display: "flex", alignItems: "flex-start", gap: 14, transition: "box-shadow 0.2s, transform 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.1)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)"; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <i className={`fa ${icon}`} style={{ fontSize: 20, color }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3 }}>{title}</div>
                    <div style={{ color: "#6b7280", fontSize: 12 }}>{text}</div>
                  </div>
                </NavLink>
              ))}
            </div>

            {/* ── STAT CARDS ── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 28 }}>
              {statCards(allProperties, activeProperties, unfilteredInquiries, newInquiries, dashboardData?.stats).map((s) => (
                <NavLink key={s.to + s.label} to={s.to} style={{ background: s.bg, border: `1.5px solid ${s.border}`, borderRadius: 14, padding: "20px 20px 16px", textDecoration: "none", color: "#111827", display: "flex", flexDirection: "column", gap: 4, transition: "transform 0.2s, box-shadow 0.2s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 8px 24px ${s.color}22`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8, boxShadow: `0 2px 8px ${s.color}33` }}>
                    <i className={`fa ${s.icon}`} style={{ fontSize: 18, color: s.color }} />
                  </div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#1e293b" }}>{s.label}</div>
                  <div style={{ fontSize: 12, color: "#94a3b8" }}>{s.sub}</div>
                </NavLink>
              ))}
            </div>

            {/* ── RECENT PROPERTIES + ENQUIRIES ── */}
            <div className="seller-dash-recent-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

              {/* Recent Properties */}
              <div style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #f1f5f9", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", overflow: "hidden" }}>
                <div style={{ padding: "18px 22px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f1f5f9" }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "#0f172a" }}>
                    <i className="fa fa-home" style={{ color: "#f59e0b", marginRight: 8 }} />
                    Recent Properties
                  </div>
                  <NavLink to="/seller-services" style={{ fontSize: 12, fontWeight: 600, color: "#f59e0b", textDecoration: "none", padding: "4px 12px", border: "1px solid #fde68a", borderRadius: 20, background: "#fffbeb" }}>
                    View All
                  </NavLink>
                </div>
                <div style={{ padding: "0 0 8px" }}>
                  {/* ✅ Empty state */}
                  {dashboardLoading ? (
                    <EmptyState icon="fa-spinner fa-spin" message="Loading properties..." />
                  ) : recentProperties.length === 0 ? (
                    <EmptyState icon="fa-home" message="No properties added yet." />
                  ) : (
                    recentProperties.slice(0, 5).map((p, i) => (
                      <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 22px", borderBottom: i < 4 ? "1px solid #f8fafc" : "none", gap: 12 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: 13, color: "#1e293b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.title}</div>
                          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                            <i className="fa fa-map-marker" style={{ marginRight: 4 }} />{p.location}
                          </div>
                        </div>
                        {statusBadge(p.status)}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Recent Enquiries */}
              <div style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #f1f5f9", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", overflow: "hidden" }}>
                <div style={{ padding: "18px 22px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f1f5f9" }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "#0f172a" }}>
                    <i className="fa fa-comments" style={{ color: "#8b5cf6", marginRight: 8 }} />
                    Recent Enquiries
                  </div>
                  <NavLink to="/seller-enquiries" style={{ fontSize: 12, fontWeight: 600, color: "#8b5cf6", textDecoration: "none", padding: "4px 12px", border: "1px solid #ddd6fe", borderRadius: 20, background: "#f5f3ff" }}>
                    View All
                  </NavLink>
                </div>
                <div style={{ padding: "8px 16px" }}>
                  {/* ✅ Empty state */}
                  {dashboardLoading ? (
                    <EmptyState icon="fa-spinner fa-spin" message="Loading enquiries..." />
                  ) : recentEnquiries.length === 0 ? (
                    <EmptyState icon="fa-comments" message="No enquiries received yet." />
                  ) : (
                    recentEnquiries.slice(0, 4).map((item, i) => (
                      <div key={item.id || i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 6px", borderBottom: i < 3 ? "1px solid #f8fafc" : "none" }}>
                        <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#f5f3ff", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 15, color: "#8b5cf6" }}>
                          {(item.name || "?")[0].toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                            <span style={{ fontWeight: 700, fontSize: 13, color: "#1e293b" }}>{item.name}</span>
                            {inquiryStatusBadge(item.status)}
                          </div>
                          <div style={{ fontSize: 11, color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.propertyName}</div>
                          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                            <i className="fa fa-phone" style={{ marginRight: 4 }} />{item.mobile}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* ── TODAY'S FOLLOW-UPS ── */}
            <div className="seller-dash-section-header">
              <i className="fa fa-calendar-check-o" />
              Today's Follow-ups - {formatDisplayDate(today)}
            </div>

            <div className="seller-dash-followups-card m-b30">
              <div className="seller-dash-followups-header">
                <button type="button" className="seller-dash-followup-tab is-active">
                  <i className="fa fa-envelope seller-dash-followup-tab-icon" />
                  Enquiry
                </button>
              </div>

              <div className="seller-dash-followup-content">
                <div className="seller-dash-followup-filters">
                  <div className="seller-dash-filter-group">
                    <label>From</label>
                    <input type="date" value={followupFrom} onChange={(e) => setFollowupFrom(e.target.value)} />
                  </div>
                  <div className="seller-dash-filter-group">
                    <label>To</label>
                    <input type="date" value={followupTo} onChange={(e) => setFollowupTo(e.target.value)} />
                  </div>
                  <div className="seller-dash-followup-actions">
                    <button type="button" className="seller-crm-btn-orange"
                      onClick={() => {
                        const from = followupFrom || today;
                        const to = followupTo || from;
                        setFollowupFrom(from); setFollowupTo(to);
                        setAppliedFollowupFrom(from); setAppliedFollowupTo(to);
                      }}
                    >
                      <i className="fa fa-search m-r8 mx-2" /> Search
                    </button>
                    <button type="button" className="seller-crm-btn-orange" onClick={clearFollowupFilters}>
                      <i className="fa fa-times m-r8 mx-2" /> Clear
                    </button>
                  </div>
                </div>

                {dashboardError ? (
                  <div className="alert alert-danger m-a20">{dashboardError}</div>
                ) : null}

                {/* ✅ Empty state for followups */}
                {dashboardLoading ? (
                  <div className="seller-dash-followup-empty">Loading dashboard data...</div>
                ) : visibleFollowups.length === 0 ? (
                  <div className="seller-dash-followup-empty">
                    <i className="fa fa-calendar-o" style={{ fontSize: 28, display: "block", marginBottom: 8, color: "#e2e8f0" }} />
                    No follow-ups for selected date range.
                  </div>
                ) : (
                  <div className="seller-crm-table-wrap seller-dash-mobile-table" style={{ padding: "0 12px 18px" }}>
                    <table className="seller-table seller-table--crm seller-table--followups" style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ background: "#f8fafc" }}>
                          {["#", "Customer Info", "Date", "Follow up", "Remark", "Actions"].map((heading) => (
                            <th key={heading} style={{ padding: "14px 16px", color: "#475569", fontSize: 14, fontWeight: 800, textAlign: heading === "Actions" ? "center" : "left" }}>
                              {heading}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {visibleFollowups.slice(0, 6).map((item, index) => (
                          <tr key={item.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                            <td data-label="#" style={{ padding: "16px", color: "#1e3a8a", fontWeight: 800 }}>{index + 1}</td>
                            <td data-label="Customer" style={{ padding: "16px" }}>
                              <div style={{ color: "#111827", fontWeight: 800 }}>{item.name || "-"}</div>
                              <div style={{ color: "#64748b", fontSize: 14 }}>{item.phone || "-"}</div>
                            </td>
                            <td data-label="Date" style={{ padding: "16px", color: "#020617", fontWeight: 800 }}>{formatDisplayDate(item.date)}</td>
                            <td data-label="Follow up" style={{ padding: "16px" }}>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#fff7ed", color: "#f97316", border: "1px solid #fb923c", borderRadius: 999, padding: "6px 14px", fontSize: 13, fontWeight: 800 }}>
                                <i className="fa fa-envelope" />
                                {(item.methods || []).join(", ") || "Follow-up"}
                              </span>
                            </td>
                            <td data-label="Remark" style={{ padding: "16px", color: "#111827" }}>{item.remark || "-"}</td>
                            <td data-label="Actions" style={{ padding: "16px", textAlign: "center" }}>
                              <NavLink to={item.to} style={{ width: 48, height: 48, borderRadius: 8, display: "inline-flex", alignItems: "center", justifyContent: "center", background: "#0ea5e9", color: "#fff", textDecoration: "none", boxShadow: "0 4px 12px rgba(14,165,233,0.25)" }} title="View enquiry detail">
                                <i className="fa fa-eye" />
                              </NavLink>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

          </div>
        </SellerDashboardLayout>
      </div>
      <Footer2 />

      {showPackageHistory ? (
        <div className="seller-crm-modal-overlay" role="dialog" aria-modal="true">
          <div className="seller-crm-modal-card seller-crm-modal-card--md">
            <div className="seller-crm-modal-head">
              <h3>Package Purchase History</h3>
              <button
                type="button"
                className="seller-crm-modal-close"
                onClick={() => setShowPackageHistory(false)}
                aria-label="Close"
              >
                x
              </button>
            </div>
            <div className="seller-crm-modal-body">
              {!packageHistory.length ? (
                <div className="seller-table__empty">
                  No package purchase history found.
                </div>
              ) : packageHistory.map((item) => (
                <div
                  key={item.id}
                  style={{
                    borderBottom: "1px solid #e5e7eb",
                    padding: "14px 0",
                    display: "grid",
                    gridTemplateColumns: "1.3fr 0.8fr 0.9fr 0.9fr auto",
                    gap: 12,
                    alignItems: "center",
                  }}
                >
                  <div>
                    <strong>{item.name}</strong>
                    <small className="text-muted d-block">Price</small>
                    <div>{formatPackagePrice(item.price)}</div>
                  </div>
                  <div>
                    <small className="text-muted">Payment</small>
                    <div>{formatPaymentMethod(item.paymentMethod)}</div>
                  </div>
                  <div>
                    <small className="text-muted">Purchased</small>
                    <div>{formatDisplayDate(item.startDate)}</div>
                  </div>
                  {/* <div>
                    <small className="text-muted">Valid till</small>
                    <div>{formatDisplayDate(item.expiryDate)}</div>
                  </div> */}
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 999,
                      padding: "6px 11px",
                      background:
                        item.status === "Expired" ? "#fef2f2" : "#ecfdf5",
                      color:
                        item.status === "Expired" ? "#dc2626" : "#047857",
                      border:
                        item.status === "Expired"
                          ? "1px solid #fecaca"
                          : "1px solid #a7f3d0",
                      fontSize: 11,
                      fontWeight: 800,
                    }}
                  >
                    <i
                      className={`fa ${
                        item.status === "Expired"
                          ? "fa-clock-o"
                          : "fa-check-circle"
                      }`}
                      style={{ marginRight: 5 }}
                    />
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
