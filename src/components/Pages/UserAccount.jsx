import React, { useState, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { safeJsonParse } from "../../utils/safeJsonParse";
import { clearAppStorage } from "../../utils/authStorage";
import Header2 from "../Common/Header2";
import Footer2 from "../Common/Footer2";
import SEO from "../Common/SEO";
import Banner from "../Elements/Banner";
import ProductDetailModal from "../Elements/ProductDetailModal";
import {
  fetchUserPropertyInquiries,
  fetchUserPropertyInquiryDetail,
  normalizePropertyInquiry,
} from "../../api/propertyInquiries";
import { getCurrentInquiryUserId } from "../../api/solarInquiry";
import { SOLAR_IMAGES } from "../../data/solarImages";

const bannerImg = require("./../../images/banner/10.jpg");
const bgimg2 = require("./../../images/background/cross-line2.png");

const QUOTATION_LIST_API =
  "https://www.admin.infrioindia.com/api/v2/auth/product-inquery-get";
const THEME_PRIMARY = "#ff6b00";

function formatUserDate(value) {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-IN");
}

function statusBadgeStyle(status) {
  const text = String(status || "").toLowerCase();
  if (text.includes("new")) {
    return {
      background: "#e7f1ff",
      color: "#084298",
      border: "1px solid #b6d4fe",
    };
  }
  if (text.includes("contacted")) {
    return {
      background: "#fff3cd",
      color: "#664d03",
      border: "1px solid #ffecb5",
    };
  }
  if (text.includes("follow")) {
    return {
      background: "#e8f7ef",
      color: "#0f5132",
      border: "1px solid #badbcc",
    };
  }
  if (text.includes("closed")) {
    return {
      background: "#f1f3f5",
      color: "#495057",
      border: "1px solid #dee2e6",
    };
  }
  if (text.includes("converted")) {
    return {
      background: "#d1e7dd",
      color: "#0f5132",
      border: "1px solid #badbcc",
    };
  }
  if (text.includes("not")) {
    return {
      background: "#f8d7da",
      color: "#842029",
      border: "1px solid #f5c2c7",
    };
  }
  if (text.includes("working") || text.includes("discussion")) {
    return {
      background: "#cff4fc",
      color: "#055160",
      border: "1px solid #b6effb",
    };
  }
  return {
    background: "#fff3cd",
    color: "#664d03",
    border: "1px solid #ffecb5",
  };
}

function mapInquiryItemToProduct(item) {
  if (!item) return null;
  const photos =
    Array.isArray(item.product_photos) && item.product_photos.length > 0
      ? item.product_photos
      : item.product_thumbnail_img
        ? [item.product_thumbnail_img]
        : [];
  return {
    id: item.product_id || item.id,
    title: item.name,
    price:
      item.price != null
        ? parseFloat(String(item.price).replace(/[^0-9.]/g, "")) || 0
        : null,
    images: photos,
    brand_name: item.brand_name || "",
    short_description:
      item.product_short_description || item.product_description || "",
    full_description:
      item.product_description || item.product_short_description || "",
    specifications: item.product_specification || [],
  };
}

function formatPropertyDisplayPrice(value, fallbackValue) {
  const raw = value || fallbackValue;
  if (!raw) return "N/A";
  const text = String(raw).trim();
  if (/₹|rs\.?|lac|lakh|cr|crore/i.test(text)) return text;
  const amount = Number(text.replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(amount) || amount <= 0) return text;
  if (amount >= 10000000) {
    const cr = amount / 10000000;
    return `₹${Number.isInteger(cr) ? cr : cr.toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    const lac = amount / 100000;
    return `₹${Number.isInteger(lac) ? lac : lac.toFixed(2)} Lac`;
  }
  return `₹${amount.toLocaleString("en-IN")}`;
}

function normalizeUserPropertyItem(property = {}) {
  return {
    id: `property-${property.id}`,
    propertyId: property.id || "",
    propertyName: property.title || "Property",
    propertyTitle: property.title || "Property",
    propertyPrice: property.price || "",
    propertyPriceValue: property.priceValue || property.price_value || "",
    propertyCity: property.city || "",
    propertyLocation: property.location || "",
    propertyArea: property.area || "",
    propertyType: property.property_type_name || property.type || "",
    propertyImage: property.image || property.thumbnail || "",
    message: property.shortDescription || "",
    status: Number(property.status) === 1 ? "Active" : "Inactive",
    createdAt: property.created_at || "",
    followUps: [],
    isPropertyOnly: true,
    raw: property,
  };
}

function formatUserAccountPropertyPrice(value, fallbackValue) {
  const raw = value || fallbackValue;
  if (!raw) return "N/A";
  const text = String(raw).trim();
  if (/₹|rs\.?|lac|lakh|cr|crore/i.test(text)) return text;
  const amount = Number(text.replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(amount) || amount <= 0) return text;
  if (amount >= 10000000) {
    const cr = amount / 10000000;
    return `₹${Number.isInteger(cr) ? cr : cr.toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    const lac = amount / 100000;
    return `₹${Number.isInteger(lac) ? lac : lac.toFixed(2)} Lac`;
  }
  return `₹${amount.toLocaleString("en-IN")}`;
}

const UserAccount = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState("requests");
  const [customLayouts, setCustomLayouts] = useState([]);
  const [customLayoutsLoading, setCustomLayoutsLoading] = useState(false);
  const [customLayoutsError, setCustomLayoutsError] = useState(null);
  const [quotations, setQuotations] = useState([]);
  const [quotationsLoading, setQuotationsLoading] = useState(false);
  const [quotationsError, setQuotationsError] = useState(null);
  const [solarEnquiries, setSolarEnquiries] = useState([]);
  const [solarEnquiriesLoading, setSolarEnquiriesLoading] = useState(false);
  const [solarEnquiriesError, setSolarEnquiriesError] = useState(null);
  const [solarEnquiryDetails, setSolarEnquiryDetails] = useState({});
  const [solarEnquiryDetailLoading, setSolarEnquiryDetailLoading] =
    useState("");
  const [expandedQuotationId, setExpandedQuotationId] = useState(null);
  const [expandedSolarEnquiryId, setExpandedSolarEnquiryId] = useState(null);
  const [selectedQuotationProduct, setSelectedQuotationProduct] =
    useState(null);
  const [feedbackData, setFeedbackData] = useState({});
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedLayout, setSelectedLayout] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const authData = localStorage.getItem("infrioAuth");
    if (!authData) {
      navigate("/login");
      return;
    }

    const auth = safeJsonParse(authData, null);
    if (!auth || typeof auth !== "object") {
      clearAppStorage();
      navigate("/login");
      return;
    }
    if (auth.role !== "normal") {
      if (auth.role === "seller") {
        navigate("/seller-dashboard");
      } else {
        navigate("/partner-account");
      }
      return;
    }

    // Fetch user details from API
    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        setCustomLayoutsError(null);

        // Get user_id from auth or userInfo
        let userId = auth.userId || auth.id;
        if (!userId) {
          const userInfo = localStorage.getItem("userInfo");
          if (userInfo) {
            const user = safeJsonParse(userInfo, null);
            if (user && typeof user === "object") userId = user.id;
          }
        }

        if (!userId) {
          // If no userId available, use localStorage data
          const userInfo = localStorage.getItem("userInfo");
          if (userInfo) {
            const parsed = safeJsonParse(userInfo, null);
            if (parsed && typeof parsed === "object") setUserData(parsed);
          }
          setLoading(false);
          return;
        }

        const formData = new FormData();
        formData.append("user_id", userId);
        console.log(userId);

        const response = await fetch(
          "https://www.admin.infrioindia.com/api/v2/auth/get-user-details",
          {
            method: "POST",
            body: formData,
          },
        );

        const result = await response.json();

        if (result.success && result.data) {
          // Update user data with API response
          setUserData({
            id: result.data.id,
            name: result.data.name,
            email: result.data.email,
            phone: result.data.phone,
            city: result.data.city,
            user_type: result.data.user_type,
            email_verified_at: result.data.email_verified_at,
            address: result.data.address,
            state: result.data.state,
            country: result.data.country,
            postal_code: result.data.postal_code,
            our_service_type: result.data.our_service_type,
            created_at: result.data.created_at,
            updated_at: result.data.updated_at,
            properties: Array.isArray(result.data.properties)
              ? result.data.properties
              : [],
          });

          // Also update localStorage
          localStorage.setItem(
            "userInfo",
            JSON.stringify({
              id: result.data.id,
              name: result.data.name,
              email: result.data.email,
              phone: result.data.phone,
              city: result.data.city,
              user_type: result.data.user_type,
              properties: Array.isArray(result.data.properties)
                ? result.data.properties
                : [],
            }),
          );

          // Fetch user custom layouts from API
          fetchCustomLayouts(result.data.id);
        } else {
          // Fallback to localStorage if API fails
          const userInfo = localStorage.getItem("userInfo");
          if (userInfo) {
            const parsed = safeJsonParse(userInfo, null);
            if (parsed && typeof parsed === "object") setUserData(parsed);
          }
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
        // Fallback to localStorage if API fails
        const userInfo = localStorage.getItem("userInfo");
        if (userInfo) {
          const parsed = safeJsonParse(userInfo, null);
          if (parsed && typeof parsed === "object") setUserData(parsed);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [navigate]);

  // Fetch custom layouts API
  const fetchCustomLayouts = async (userId) => {
    try {
      setCustomLayoutsLoading(true);
      setCustomLayoutsError(null);
      const formData = new FormData();
      formData.append("user_id", userId);
      // console.log(userId)
      const response = await fetch(
        "https://www.admin.infrioindia.com/api/v2/auth/architecture-form-list",
        {
          method: "POST",
          body: formData,
        },
      );
      const result = await response.json();

      if (result.status && Array.isArray(result.data)) {
        setCustomLayouts(result.data);
        localStorage.setItem("userCustomLayouts", JSON.stringify(result.data));
      } else {
        setCustomLayoutsError(
          result.message || "Failed to load custom layouts",
        );
        // fallback to local storage
        const saved = localStorage.getItem("userCustomLayouts");
        const parsedSaved = safeJsonParse(saved, []);
        if (Array.isArray(parsedSaved)) setCustomLayouts(parsedSaved);
      }
    } catch (err) {
      console.error("Error fetching custom layouts:", err);
      setCustomLayoutsError(
        "Something went wrong while loading custom layouts.",
      );
      const saved = localStorage.getItem("userCustomLayouts");
      const parsedSaved = safeJsonParse(saved, []);
      if (Array.isArray(parsedSaved)) setCustomLayouts(parsedSaved);
    } finally {
      setCustomLayoutsLoading(false);
    }
  };

  // Fetch product quotations (inquiries) for the user
  const fetchQuotations = async (userId) => {
    if (!userId) return;
    try {
      setQuotationsLoading(true);
      setQuotationsError(null);
      const url = `${QUOTATION_LIST_API}?user_id=${encodeURIComponent(userId)}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { Accept: "application/json" },
      });
      const result = await response.json();
      if (result.status && Array.isArray(result.data)) {
        setQuotations(result.data);
      } else {
        setQuotationsError(result.message || "Failed to load quotations");
        setQuotations([]);
      }
    } catch (err) {
      console.error("Error fetching quotations:", err);
      setQuotationsError("Something went wrong while loading your quotations.");
      setQuotations([]);
    } finally {
      setQuotationsLoading(false);
    }
  };

  const fetchSolarUserEnquiries = async (user) => {
    if (!user?.id && !user?.email && !user?.phone) return;
    const userProperties = Array.isArray(user?.properties)
      ? user.properties.map(normalizeUserPropertyItem)
      : [];
    try {
      setSolarEnquiriesLoading(true);
      setSolarEnquiriesError(null);
      const inquiryUserId = getCurrentInquiryUserId() || user?.id;
      const request = {
        userId: inquiryUserId,
        page: 1,
        perPage: 50,
      };
      const result = await fetchUserPropertyInquiries(request);
      const rootInquiries = Array.isArray(result.raw?.inquiries)
        ? result.raw.inquiries.map(normalizePropertyInquiry)
        : [];
      const apiItems = result.items?.length ? result.items : rootInquiries;
      setSolarEnquiries(
        apiItems.length ? apiItems : userProperties,
      );
    } catch (err) {
      console.error("Error fetching property enquiries:", err);
      if (userProperties.length) {
        setSolarEnquiries(userProperties);
        setSolarEnquiriesError(null);
      } else {
        setSolarEnquiriesError("Unable to load your property enquiries right now.");
        setSolarEnquiries([]);
      }
    } finally {
      setSolarEnquiriesLoading(false);
    }
  };

  const toggleSolarEnquiryDetail = async (item) => {
    const rowId = item?.id || item?.createdAt;
    if (!rowId) return;
    const isOpen = String(expandedSolarEnquiryId) === String(rowId);
    if (isOpen) {
      setExpandedSolarEnquiryId(null);
      return;
    }

    setExpandedSolarEnquiryId(rowId);
    if (solarEnquiryDetails[rowId]) return;
    if (item?.isPropertyOnly) {
      setSolarEnquiryDetails((prev) => ({
        ...prev,
        [rowId]: item,
      }));
      return;
    }

    try {
      setSolarEnquiryDetailLoading(String(rowId));
      const detail = await fetchUserPropertyInquiryDetail({
        userId: userData?.id,
        inquiryId: rowId,
      });
      setSolarEnquiryDetails((prev) => ({
        ...prev,
        [rowId]: detail || item,
      }));
    } catch (error) {
      console.error("Error fetching property enquiry detail:", error);
      setSolarEnquiryDetails((prev) => ({
        ...prev,
        [rowId]: item,
      }));
    } finally {
      setSolarEnquiryDetailLoading("");
    }
  };

  useEffect(() => {
    if (activeTab === "quotations" && userData?.id) {
      fetchQuotations(userData.id);
    }
  }, [activeTab, userData?.id]);

  useEffect(() => {
    if (activeTab === "requests" && userData) {
      fetchSolarUserEnquiries(userData);
    }
  }, [activeTab, userData]);

  const handleLogout = () => {
    clearAppStorage();
    navigate("/login");
  };

  const handleFeedbackChange = (layoutId, feedback) => {
    setFeedbackData((prev) => ({ ...prev, [layoutId]: feedback }));
  };

  const handleSubmitFeedback = (layout) => {
    if (layout.correctionsUsed >= 1) {
      alert(
        "You have already used your one correction. Please contact support for further changes.",
      );
      return;
    }

    const feedback = feedbackData[layout.id];
    if (!feedback || feedback.trim() === "") {
      alert("Please enter your feedback");
      return;
    }

    // Update layout with feedback
    const updatedLayouts = customLayouts.map((l) =>
      l.id === layout.id
        ? {
            ...l,
            feedbackGiven: true,
            correctionsUsed: l.correctionsUsed + 1,
            feedback,
          }
        : l,
    );
    setCustomLayouts(updatedLayouts);
    localStorage.setItem("userCustomLayouts", JSON.stringify(updatedLayouts));

    // Here you would send feedback to API
    console.log("Feedback submitted:", { layoutId: layout.id, feedback });

    alert(
      "Feedback submitted successfully! The partner will review and make corrections.",
    );
    setShowFeedbackModal(false);
    setFeedbackData((prev) => {
      const newData = { ...prev };
      delete newData[layout.id];
      return newData;
    });
  };

  const openFeedbackModal = (layout) => {
    setSelectedLayout(layout);
    setShowFeedbackModal(true);
  };

  /** High-contrast status chips: Completed / Pending / Task Under Working */
  const renderCustomLayoutStatusBadge = (layout) => {
    const base = {
      display: "inline-block",
      padding: "6px 14px",
      borderRadius: 8,
      fontSize: 13,
      fontWeight: 700,
      letterSpacing: "0.02em",
      border: "1px solid rgba(0,0,0,0.12)",
      boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
    };
    if (layout.approved_document) {
      return (
        <span style={{ ...base, backgroundColor: "#198754", color: "#ffffff" }}>
          Completed
        </span>
      );
    }
    if (layout.status === 1 || layout.status === 0) {
      return (
        <span style={{ ...base, backgroundColor: "#0b5ed7", color: "#ffffff" }}>
          Pending
        </span>
      );
    }
    return (
      <span style={{ ...base, backgroundColor: "#6f42c1", color: "#ffffff" }}>
        Task Under Working
      </span>
    );
  };

  const customLayoutPrimaryBtnStyle = {
    display: "inline-block",
    padding: "10px 20px",
    borderRadius: 8,
    fontWeight: 600,
    fontSize: 14,
    textDecoration: "none",
    color: "#ffffff",
    backgroundColor: "#1a1a1a",
    border: `2px solid ${THEME_PRIMARY}`,
    boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
  };

  if (loading || !userData) {
    return (
      <div
        className="section-full p-t80 p-b80 bg-gray"
        style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="container text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="m-t20">Loading your account...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO title="User Account" noindex />
      <Header2 />
      <div className="page-content">
        <Banner
          title="My Account"
          pagename="User Dashboard"
          description="Manage your property enquiries."
          bgimage={SOLAR_IMAGES.bannerSolutions}
        />

        <div className="section-full p-t80 p-b80 bg-gray">
          <div className="container">
            {/* User Info Card */}
            <div className="row m-b30">
              <div className="col-lg-12">
                <div className="bg-white shadow-sm p-a30 border-radius-10">
                  <div className="d-flex justify-content-between align-items-center flex-wrap">
                    <div>
                      <h3 className="m-b10">
                        Welcome, {userData.name || "User"}
                      </h3>
                      <p className="text-muted m-b0">
                        <i className="fa fa-envelope m-r10"></i>
                        {userData.email || "N/A"}
                      </p>
                      <p className="text-muted m-b0">
                        <i className="fa fa-phone m-r10"></i>
                        {userData.phone || "N/A"}
                      </p>
                      <p className="text-muted m-b0">
                        <i className="fa fa-map-marker m-r10"></i>
                        {userData.city || "N/A"}
                      </p>
                    </div>
                    <button
                      className="site-button-secondry"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="row">
              <div className="col-lg-12">
                <div className="bg-white shadow-sm border-radius-10 overflow-hidden">
                  <ul
                    className="nav nav-tabs p-a20 m-b0"
                    style={{ borderBottom: "2px solid #f0f0f0" }}
                  >
                    <li className="nav-item">
                      <button
                        className={`nav-link ${activeTab === "requests" ? "active" : ""}`}
                        onClick={() => setActiveTab("requests")}
                        style={{
                          border: "none",
                          background: "transparent",
                          padding: "10px 20px",
                          cursor: "pointer",
                        }}
                      >
                        My Property Enquiries
                      </button>
                    </li>
                    {/* <li className="nav-item">
                      <button 
                        className={`nav-link ${activeTab === 'quotations' ? 'active' : ''}`}
                        onClick={() => setActiveTab('quotations')}
                        style={{ border: 'none', background: 'transparent', padding: '10px 20px', cursor: 'pointer' }}
                      >
                        My Quotations
                      </button>
                    </li> */}
                    {/* <li className="nav-item">
                      <button
                        className={`nav-link ${activeTab === 'solar-enquiries' ? 'active' : ''}`}
                        onClick={() => setActiveTab('solar-enquiries')}
                        style={{ border: 'none', background: 'transparent', padding: '10px 20px', cursor: 'pointer' }}
                      >
                        Solar Enquiries
                      </button>
                    </li> */}
                    <li className="nav-item">
                      <button
                        className={`nav-link ${activeTab === "profile" ? "active" : ""}`}
                        onClick={() => setActiveTab("profile")}
                        style={{
                          border: "none",
                          background: "transparent",
                          padding: "10px 20px",
                          cursor: "pointer",
                        }}
                      >
                        Profile
                      </button>
                    </li>
                  </ul>

                  <div className="p-a30">
                    {false && activeTab === "requests" && (
                      <div>
                        <h4 className="m-b20">Solar Enquiries</h4>
                        {customLayoutsLoading ? (
                          <div className="text-center p-a40">
                            <div
                              className="spinner-border text-primary"
                              role="status"
                            >
                              <span className="sr-only">Loading...</span>
                            </div>
                            <p className="m-t20 text-muted">
                              Loading your Solar Enquiries...
                            </p>
                          </div>
                        ) : customLayoutsError ? (
                          <div className="alert alert-danger">
                            <i className="fa fa-exclamation-triangle m-r10"></i>
                            {customLayoutsError}
                            <button
                              className="btn btn-sm btn-outline-danger m-l10"
                              onClick={() => fetchCustomLayouts(userData.id)}
                            >
                              Retry
                            </button>
                          </div>
                        ) : customLayouts.length === 0 ? (
                          <div className="text-center p-a40">
                            <p className="text-muted">
                              No Solar Enquiries yet.
                            </p>
                            <NavLink
                              to="/add-solar-enquiry"
                              className="site-button btn-half m-t20"
                            >
                              Add Solar Enquiry
                            </NavLink>
                          </div>
                        ) : (
                          <div className="row" key="custom-layouts-list">
                            {customLayouts.map((layout) => (
                              <div
                                key={layout.id}
                                className="col-lg-6 col-md-12 m-b30"
                              >
                                <div
                                  className="bg-gray-light p-a20 border-radius-10 h-100"
                                  style={{
                                    border: "1px solid rgba(0,0,0,0.06)",
                                  }}
                                >
                                  <div className="d-flex justify-content-between align-items-start m-b15">
                                    <div>
                                      <h5
                                        className="m-b10"
                                        style={{
                                          color: "#1a1a1a",
                                          fontWeight: 700,
                                        }}
                                      >
                                        Solar Enquiry:{" "}
                                        {layout.plot_size || "N/A"}
                                      </h5>
                                      {renderCustomLayoutStatusBadge(layout)}
                                    </div>
                                  </div>
                                  {(() => {
                                    const detailItems = [
                                      {
                                        label: "Service Type",
                                        value: layout.property_type,
                                      },
                                      {
                                        label: "Location",
                                        value: layout.plot_type,
                                      },
                                      {
                                        label: "Assigned Staff",
                                        value: layout.plot_direction,
                                      },
                                      {
                                        label: "Last Update",
                                        value: layout.construction_type,
                                      },
                                      {
                                        label: "Assigned Staff Phone",
                                        value: layout.construction_stage,
                                      },
                                      {
                                        label: "Created",
                                        value: layout.created_at,
                                      },
                                    ].filter(
                                      (item) =>
                                        item.value !== null &&
                                        item.value !== undefined &&
                                        item.value !== "",
                                    );

                                    if (!detailItems.length) return null;

                                    return (
                                      <ul
                                        className="list-unstyled small m-b15"
                                        style={{
                                          color: "#333333",
                                          lineHeight: 1.55,
                                        }}
                                      >
                                        {detailItems.map((item, idx) => (
                                          <li key={idx} className="m-b5">
                                            <strong
                                              style={{ color: "#1a1a1a" }}
                                            >
                                              {item.label}:
                                            </strong>{" "}
                                            <span style={{ color: "#424242" }}>
                                              {item.value}
                                            </span>
                                          </li>
                                        ))}
                                      </ul>
                                    );
                                  })()}
                                  {/* Show approved document if available */}
                                  {layout.approved_document &&
                                    layout.approved_document.document && (
                                      <div className="m-b15">
                                        <a
                                          href={
                                            layout.approved_document.document
                                          }
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          style={customLayoutPrimaryBtnStyle}
                                        >
                                          View Approved Document
                                        </a>
                                      </div>
                                    )}
                                  {layout.status === 1 && layout.plan_url && (
                                    <div className="m-b15">
                                      <a
                                        href={layout.plan_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={customLayoutPrimaryBtnStyle}
                                      >
                                        View Layout
                                      </a>
                                    </div>
                                  )}
                                  {layout.status === 1 && (
                                    <>
                                      {layout.correctionsUsed < 1 && (
                                        <button
                                          type="button"
                                          className="btn-sm m-t5"
                                          style={{
                                            padding: "8px 16px",
                                            borderRadius: 8,
                                            fontWeight: 600,
                                            color: "#1a1a1a",
                                            backgroundColor: "#fff",
                                            border: `2px solid ${THEME_PRIMARY}`,
                                            cursor: "pointer",
                                          }}
                                          onClick={() =>
                                            openFeedbackModal(layout)
                                          }
                                        >
                                          Give Feedback / Request Correction
                                        </button>
                                      )}
                                      {layout.feedbackGiven && (
                                        <p
                                          className="m-t10 m-b0"
                                          style={{
                                            color: "#0f5132",
                                            fontWeight: 600,
                                            fontSize: 14,
                                          }}
                                        >
                                          ✓ Feedback submitted. Awaiting
                                          corrections.
                                        </p>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === "quotations" && (
                      <div>
                        <h4
                          className="m-b20"
                          style={{ color: "#1a1a1a", fontWeight: 700 }}
                        >
                          My Quotations
                        </h4>
                        {quotationsLoading ? (
                          <div className="text-center p-a40">
                            <div
                              className="spinner-border text-primary"
                              role="status"
                            >
                              <span className="sr-only">Loading...</span>
                            </div>
                            <p className="m-t20 text-muted">
                              Loading your quotations...
                            </p>
                          </div>
                        ) : quotationsError ? (
                          <div className="alert alert-danger d-flex align-items-center justify-content-between flex-wrap">
                            <span>
                              <i className="fa fa-exclamation-triangle m-r10"></i>
                              {quotationsError}
                            </span>
                            <button
                              className="btn btn-sm btn-outline-danger m-t10 m-t0"
                              onClick={() => fetchQuotations(userData.id)}
                            >
                              Retry
                            </button>
                          </div>
                        ) : quotations.length === 0 ? (
                          <div className="text-center p-a40">
                            <p className="text-muted">No quotations yet.</p>
                            <NavLink
                              to="/shop"
                              className="site-button btn-half m-t20"
                              style={{
                                background: THEME_PRIMARY,
                                borderColor: THEME_PRIMARY,
                              }}
                            >
                              Request New Quotation
                            </NavLink>
                          </div>
                        ) : (
                          <div className="row">
                            <div className="col-lg-12 quotation-list-wrap">
                              {quotations.map((q) => (
                                <div key={q.id} className="quotation-list-card">
                                  <div
                                    className="d-flex justify-content-between align-items-center flex-wrap"
                                    style={{ cursor: "pointer" }}
                                    onClick={() =>
                                      setExpandedQuotationId(
                                        expandedQuotationId === q.id
                                          ? null
                                          : q.id,
                                      )
                                    }
                                  >
                                    <div
                                      className="d-flex align-items-center flex-wrap"
                                      style={{ gap: 12 }}
                                    >
                                      <span className="quotation-list-id">
                                        Quotation #{q.id}
                                      </span>
                                      <span className="quotation-list-date">
                                        Requested: {q.created_at || "N/A"}
                                      </span>
                                      <span className="quotation-list-total">
                                        Total: ₹
                                        {Number(
                                          q.total_price ?? 0,
                                        ).toLocaleString()}
                                      </span>
                                    </div>
                                    <span className="quotation-list-view">
                                      {expandedQuotationId === q.id
                                        ? "▼ Hide details"
                                        : "▶ View details"}
                                    </span>
                                  </div>
                                  {expandedQuotationId === q.id &&
                                    Array.isArray(q.items) &&
                                    q.items.length > 0 && (
                                      <div className="m-t20 p-t20 border-top">
                                        <h6
                                          className="m-b15"
                                          style={{
                                            color: "#333",
                                            fontWeight: 600,
                                          }}
                                        >
                                          Products in this quotation
                                        </h6>
                                        <div className="table-responsive">
                                          <table className="table table-bordered table-sm">
                                            <thead>
                                              <tr
                                                style={{
                                                  background: "#f5f2ef",
                                                }}
                                              >
                                                <th
                                                  style={{ color: "#1a1a1a" }}
                                                >
                                                  Product
                                                </th>
                                                <th
                                                  style={{ color: "#1a1a1a" }}
                                                >
                                                  Brand
                                                </th>
                                                <th
                                                  style={{ color: "#1a1a1a" }}
                                                >
                                                  Category
                                                </th>
                                                <th
                                                  className="text-end"
                                                  style={{ color: "#1a1a1a" }}
                                                >
                                                  Price
                                                </th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {q.items.map((item) => (
                                                <tr
                                                  key={
                                                    item.id || item.product_id
                                                  }
                                                >
                                                  <td>
                                                    <div
                                                      className="d-flex align-items-center"
                                                      style={{ gap: 12 }}
                                                    >
                                                      {(item.product_thumbnail_img ||
                                                        item
                                                          .product_photos?.[0]) && (
                                                        <img
                                                          src={
                                                            item.product_thumbnail_img ||
                                                            item
                                                              .product_photos[0]
                                                          }
                                                          alt=""
                                                          style={{
                                                            width: 48,
                                                            height: 48,
                                                            objectFit: "cover",
                                                            borderRadius: 8,
                                                            flexShrink: 0,
                                                          }}
                                                        />
                                                      )}
                                                      <button
                                                        type="button"
                                                        className="btn btn-link p-0 align-baseline text-start"
                                                        style={{
                                                          fontWeight: 500,
                                                        }}
                                                        onClick={() =>
                                                          setSelectedQuotationProduct(
                                                            mapInquiryItemToProduct(
                                                              item,
                                                            ),
                                                          )
                                                        }
                                                      >
                                                        {item.name || "—"}
                                                      </button>
                                                    </div>
                                                  </td>
                                                  <td>
                                                    {item.brand_name || "—"}
                                                  </td>
                                                  <td>
                                                    {item.category_name || "—"}
                                                  </td>
                                                  <td className="text-end">
                                                    ₹
                                                    {Number(
                                                      item.price ?? 0,
                                                    ).toLocaleString()}
                                                  </td>
                                                </tr>
                                              ))}
                                            </tbody>
                                          </table>
                                        </div>
                                      </div>
                                    )}
                                </div>
                              ))}
                            </div>
                            <div className="col-12 text-center m-t20">
                              <NavLink
                                to="/shop"
                                className="site-button btn-sm"
                                style={{
                                  background: THEME_PRIMARY,
                                  borderColor: THEME_PRIMARY,
                                }}
                              >
                                Request New Quotation
                              </NavLink>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === "requests" && (
                      <div>
                        <div className="d-flex justify-content-between align-items-center flex-wrap m-b20">
                          <div>
                            <h4
                              className="m-b5"
                              style={{ color: "#1a1a1a", fontWeight: 700 }}
                            >
                              Property Enquiries
                            </h4>
                            <p className="text-muted m-b0">
                              Track your property enquiries and seller replies.
                            </p>
                          </div>
                          <button
                            type="button"
                            className="site-button-secondry btn-sm"
                            onClick={() => fetchSolarUserEnquiries(userData)}
                            disabled={solarEnquiriesLoading}
                          >
                            Refresh
                          </button>
                        </div>
                        {solarEnquiriesLoading ? (
                          <div className="text-center p-a40">
                            <div
                              className="spinner-border text-primary"
                              role="status"
                            >
                              <span className="sr-only">Loading...</span>
                            </div>
                            <p className="m-t20 text-muted">
                              Loading your property enquiries...
                            </p>
                          </div>
                        ) : solarEnquiriesError ? (
                          <div className="alert alert-danger d-flex align-items-center justify-content-between flex-wrap">
                            <span>
                              <i className="fa fa-exclamation-triangle m-r10"></i>
                              {solarEnquiriesError}
                            </span>
                            <button
                              className="btn btn-sm btn-outline-danger m-t10 m-t0"
                              onClick={() => fetchSolarUserEnquiries(userData)}
                            >
                              Retry
                            </button>
                          </div>
                        ) : solarEnquiries.length === 0 ? (
                          <div className="text-center p-a40">
                            <p className="text-muted">
                              No property enquiries found.
                            </p>
                            <NavLink
                              to="/properties"
                              className="site-button btn-half m-t20"
                              style={{
                                background: THEME_PRIMARY,
                                borderColor: THEME_PRIMARY,
                              }}
                            >
                              Browse Properties
                            </NavLink>
                          </div>
                        ) : (
                          <div className="table-responsive">
                            <table className="table table-bordered align-middle">
                              <thead>
                                <tr style={{ background: "#f5f2ef" }}>
                                  <th>Property</th>
                                  <th>Location</th>
                                  <th>Price</th>
                                  <th>Status</th>
                                  <th>Created</th>
                                  <th>Details</th>
                                </tr>
                              </thead>
                              <tbody>
                                {solarEnquiries.map((item) => {
                                  const rowId = item.id || item.createdAt;
                                  const isOpen =
                                    String(expandedSolarEnquiryId) ===
                                    String(rowId);
                                  const detail =
                                    solarEnquiryDetails[rowId] || item;
                                  const serviceText =
                                    detail.propertyTitle ||
                                    item.propertyTitle ||
                                    detail.propertyName ||
                                    item.propertyName ||
                                    detail.title ||
                                    item.title ||
                                    item.property_name ||
                                    "Property enquiry";
                                  const locationText =
                                    detail.propertyLocation ||
                                    item.propertyLocation ||
                                    detail.location ||
                                    item.location ||
                                    detail.propertyCity ||
                                    item.propertyCity ||
                                    "N/A";
                                  const priceText =
                                    formatUserAccountPropertyPrice(
                                      detail.propertyPrice ||
                                        item.propertyPrice ||
                                        detail.price ||
                                        item.price,
                                      detail.propertyPriceValue ||
                                        item.propertyPriceValue,
                                    );
                                  const propertyType =
                                    detail.propertyType ||
                                    item.propertyType ||
                                    "N/A";
                                  const propertyImage =
                                    detail.propertyImage || item.propertyImage;
                                  const assignedName =
                                    detail.seller?.name ||
                                    item.seller?.name ||
                                    detail.sellerName ||
                                    item.sellerName ||
                                    detail.seller_name ||
                                    item.seller_name ||
                                    "Seller";
                                  const statusText =
                                    detail.status || item.status || "New";
                                  const progressText =
                                    detail.followUps?.length ||
                                    item.followUps?.length
                                      ? "Follow-up Added"
                                      : "No Follow-up";
                                  const converted = {
                                    systemSize: serviceText,
                                    dealAmount: detail.propertyPriceValue || item.propertyPriceValue || "",
                                    interestStatusLabel: statusText,
                                    createdBy: detail.message || item.message || "N/A",
                                    crmStatus: progressText,
                                  };
                                  return (
                                    <React.Fragment key={rowId}>
                                      <tr>
                                        <td>
                                          <div
                                            className="d-flex align-items-center"
                                            style={{ gap: 12, minWidth: 280 }}
                                          >
                                            {propertyImage ? (
                                              <img
                                                src={propertyImage}
                                                alt={serviceText}
                                                style={{
                                                  width: 74,
                                                  height: 58,
                                                  objectFit: "cover",
                                                  borderRadius: 8,
                                                  flexShrink: 0,
                                                }}
                                              />
                                            ) : null}
                                            <div>
                                              <strong>{serviceText}</strong>
                                              <div className="text-muted small">
                                                {propertyType}
                                              </div>
                                              {item.message ? (
                                                <div className="small">
                                                  Message: {item.message}
                                                </div>
                                              ) : null}
                                            </div>
                                          </div>
                                        </td>
                                        <td>
                                          <strong>{locationText}</strong>
                                          {(detail.propertyArea ||
                                            item.propertyArea) && (
                                            <div className="text-muted small">
                                              {detail.propertyArea ||
                                                item.propertyArea}
                                            </div>
                                          )}
                                        </td>
                                        <td>
                                          <strong>{priceText}</strong>
                                        </td>
                                        <td>
                                          <span
                                            style={{
                                              display: "inline-block",
                                              padding: "6px 12px",
                                              borderRadius: 999,
                                              fontWeight: 700,
                                              fontSize: 13,
                                              ...statusBadgeStyle(statusText),
                                            }}
                                          >
                                            {statusText}
                                          </span>
                                        </td>
                                        <td>
                                          {formatUserDate(item.createdAt)}
                                        </td>
                                        <td>
                                          <button
                                            type="button"
                                            className="btn btn-sm btn-outline-primary"
                                            onClick={() =>
                                              toggleSolarEnquiryDetail(item)
                                            }
                                            disabled={
                                              solarEnquiryDetailLoading ===
                                              String(rowId)
                                            }
                                          >
                                            {solarEnquiryDetailLoading ===
                                            String(rowId)
                                              ? "Loading..."
                                              : isOpen
                                                ? "Hide"
                                                : "View"}
                                          </button>
                                        </td>
                                      </tr>
                                      {isOpen ? (
                                        <tr>
                                          <td colSpan="6">
                                            <div className="row">
                                              
                                              <div className="col-md-6 m-b15">
                                                <h6>Property</h6>
                                                {converted ? (
                                                  <>
                                                    <p className="m-b5">
                                                      <strong>
                                                        Property Name:
                                                      </strong>{" "}
                                                      {serviceText}
                                                    </p>
                                                    <p className="m-b5">
                                                      <strong>
                                                        Property Type:
                                                      </strong>{" "}
                                                      {propertyType}
                                                    </p>
                                                    <p className="m-b5">
                                                      <strong>
                                                        Location:
                                                      </strong>{" "}
                                                      {locationText}
                                                    </p>
                                                  
                                                    <p className="m-b5">
                                                      <strong>
                                                        Price:
                                                      </strong>{" "}
                                                      {converted.dealAmount
                                                        ? `₹${Number(converted.dealAmount).toLocaleString()}`
                                                        : "N/A"}
                                                    </p>
                                                    
                                                  </>
                                                ) : (
                                                  <p className="text-muted">
                                                    This enquiry is not
                                                    converted yet.
                                                  </p>
                                                )}
                                              </div>
                                              
                                            </div>
                                          </td>
                                        </tr>
                                      ) : null}
                                    </React.Fragment>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === "profile" && (
                      <div>
                        <h4 className="m-b20">Profile Information</h4>
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Name</label>
                            <input
                              type="text"
                              className="form-control"
                              value={userData.name || ""}
                              readOnly
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Email</label>
                            <div className="d-flex align-items-center">
                              <input
                                type="email"
                                className="form-control"
                                value={userData.email || ""}
                                readOnly
                              />
                              {userData.email_verified_at && (
                                <span
                                  className="badge bg-success m-l10"
                                  title="Email Verified"
                                >
                                  <i className="fa fa-check-circle"></i>{" "}
                                  Verified
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Phone</label>
                            <input
                              type="text"
                              className="form-control"
                              value={userData.phone || ""}
                              readOnly
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">City</label>
                            <input
                              type="text"
                              className="form-control"
                              value={userData.city || ""}
                              readOnly
                            />
                          </div>
                          {userData.state && (
                            <div className="col-md-6 mb-3">
                              <label className="form-label">State</label>
                              <input
                                type="text"
                                className="form-control"
                                value={userData.state}
                                readOnly
                              />
                            </div>
                          )}
                          {userData.country && (
                            <div className="col-md-6 mb-3">
                              <label className="form-label">Country</label>
                              <input
                                type="text"
                                className="form-control"
                                value={userData.country}
                                readOnly
                              />
                            </div>
                          )}
                          {userData.postal_code && (
                            <div className="col-md-6 mb-3">
                              <label className="form-label">Postal Code</label>
                              <input
                                type="text"
                                className="form-control"
                                value={userData.postal_code}
                                readOnly
                              />
                            </div>
                          )}
                          {userData.address && (
                            <div className="col-md-12 mb-3">
                              <label className="form-label">Address</label>
                              <textarea
                                className="form-control"
                                rows="3"
                                value={userData.address}
                                readOnly
                              />
                            </div>
                          )}
                          {userData.our_service_type && (
                            <div className="col-md-6 mb-3">
                              <label className="form-label">Service Type</label>
                              <input
                                type="text"
                                className="form-control"
                                value={userData.our_service_type}
                                readOnly
                              />
                            </div>
                          )}
                          {userData.email_verified_at && (
                            <div className="col-md-6 mb-3">
                              <label className="form-label">
                                Email Verified At
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                value={new Date(
                                  userData.email_verified_at,
                                ).toLocaleString()}
                                readOnly
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer2 />

      {/* Feedback Modal */}
      {showFeedbackModal && selectedLayout && (
        <div
          className="modal-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.6)",
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            className="modal-content bg-white"
            style={{
              borderRadius: "10px",
              width: "min(95vw, 600px)",
              padding: "30px",
              position: "relative",
            }}
          >
            <button
              onClick={() => setShowFeedbackModal(false)}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                background: "transparent",
                border: "none",
                fontSize: "24px",
                cursor: "pointer",
              }}
            >
              ✖
            </button>
            <h3 className="m-b20">Provide Feedback / Request Correction</h3>
            <p className="text-muted m-b20">
              You can request one correction. Please provide detailed feedback.
            </p>
            <textarea
              className="form-control m-b20"
              rows="6"
              placeholder="Enter your feedback or correction requirements..."
              value={feedbackData[selectedLayout.id] || ""}
              onChange={(e) =>
                handleFeedbackChange(selectedLayout.id, e.target.value)
              }
            />
            <div className="text-right">
              <button
                className="site-button-secondry btn-half m-r10"
                onClick={() => setShowFeedbackModal(false)}
              >
                Cancel
              </button>
              <button
                className="site-button btn-half"
                onClick={() => handleSubmitFeedback(selectedLayout)}
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedQuotationProduct && (
        <ProductDetailModal
          product={selectedQuotationProduct}
          onClose={() => setSelectedQuotationProduct(null)}
        />
      )}
    </>
  );
};

export default UserAccount;
