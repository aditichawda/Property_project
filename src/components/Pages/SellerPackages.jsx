import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header2 from "../Common/Header2";
import Footer2 from "../Common/Footer2";
import SEO from "../Common/SEO";
import Banner from "../Elements/Banner";
import {
  extractSellerPackageHistory,
  saveSellerPackage,
  sellerPackages,
  syncSellerPackageFromApi,
} from "../../data/sellerPackages";
import {
  fetchPropertyPackages,
  purchasePropertyPackage,
} from "../../api/propertyPackages";
import {
  fetchProperties,
  getCurrentSellerId,
  normalizePropertyPaginationResponse,
} from "../../api/properties";
import { fetchSellerDetail } from "../../api/sellerDashboard";
import { useAuth } from "../../context/AuthContext";
var bnrimg = require("./../../images/property/4.jpg");
const bannerImg = require("./../../images/property/banner2.jpg");

function featureIconStyle(active) {
  return {
    width: 24,
    height: 24,
    borderRadius: "50%",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: active ? "#ecfdf5" : "#fff7ed",
    color: active ? "#059669" : "#f59e0b",
    flexShrink: 0,
  };
}

function formatHistoryDate(value) {
  if (!value) return "-";
  const raw = String(value).trim();
  const match = raw.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (match) return raw;
  const date = new Date(raw);
  return Number.isNaN(date.getTime())
    ? raw
    : date.toLocaleDateString("en-IN");
}

function formatHistoryPrice(value) {
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

export default function SellerPackages() {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [packageToConfirm, setPackageToConfirm] = useState(null);
  const [packages, setPackages] = useState(() =>
    sellerPackages.filter((pkg) => pkg.id !== "free"),
  );
  const [packagesLoading, setPackagesLoading] = useState(true);
  const [packageError, setPackageError] = useState("");
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [purchaseError, setPurchaseError] = useState("");
  const [purchaseConfirmed, setPurchaseConfirmed] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(null);
  const [packageHistory, setPackageHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");

  useEffect(() => {
    let active = true;
    fetchPropertyPackages()
      .then((list) => {
        if (active && list.length) setPackages(list);
      })
      .catch((error) => {
        if (active) setPackageError(error?.message || "Could not load packages.");
      })
      .finally(() => {
        if (active) setPackagesLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const refreshPackageHistory = async () => {
    const sellerId = getCurrentSellerId();
    if (!sellerId) {
      setPackageHistory([]);
      return;
    }
    try {
      setHistoryLoading(true);
      setHistoryError("");
      const detail = await fetchSellerDetail(sellerId);
      setPackageHistory(extractSellerPackageHistory(detail));
      syncSellerPackageFromApi(detail);
    } catch (error) {
      setHistoryError(
        error?.response?.data?.message ||
          error?.message ||
          "Could not refresh package history.",
      );
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    refreshPackageHistory();
    // Package history must load once for the currently logged-in seller.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const apiBanner =
    packages.find((pkg) => String(pkg.bannerUrl || "").trim())?.bannerUrl ||
    bannerImg;

  const activatePurchasedPackage = (pkg, result, existingPropertyCount) => {
    saveSellerPackage({
      ...pkg,
      purchaseDetails: result?.data || null,
    }, { existingPropertyCount });
    setSelectedPackage(pkg);
    setPackageToConfirm(null);
    setPurchaseSuccess({
      package: pkg,
      message: result?.message || "COD package order submitted successfully.",
      details: result?.data || {},
    });
  };

  const isPropertySellerLoggedIn =
    auth?.role === "seller" &&
    (auth?.loginType === "seller" ||
      auth?.accountType === "seller" ||
      auth?.user_type === "seller");

  const openPackagePurchase = (pkg) => {
    if (!isPropertySellerLoggedIn) {
      setPackageToConfirm(null);
      setPurchaseError("");
      navigate("/seller-login", {
        state: {
          redirect: "/property-seller-packages",
          message: "Please login as a property seller to buy a package.",
        },
      });
      return;
    }

    setPurchaseError("");
    setPurchaseConfirmed(false);
    setPackageToConfirm(pkg);
  };

  const buyPackage = async (pkg) => {
    if (!isPropertySellerLoggedIn) {
      setPackageToConfirm(null);
      navigate("/seller-login", {
        state: {
          redirect: "/property-seller-packages",
          message: "Please login as a property seller to buy a package.",
        },
      });
      return;
    }

    const propertyUserId = getCurrentSellerId();
    if (!propertyUserId) {
      setPurchaseError("Please login as a property seller before buying a package.");
      return;
    }

    try {
      setPurchaseLoading(true);
      setPurchaseError("");
      let existingPropertyCount = 0;
      try {
        const propertyResponse = await fetchProperties({
          seller_id: propertyUserId,
          page: 1,
          per_page: 1,
        });
        existingPropertyCount =
          normalizePropertyPaginationResponse(propertyResponse, {
            page: 1,
            perPage: 1,
          }).pagination.total;
      } catch {
        existingPropertyCount = 0;
      }
      const result = await purchasePropertyPackage({
        propertyUserId,
        packageId: pkg.id,
        paymentMethod: "cod",
      });
      activatePurchasedPackage(pkg, result, existingPropertyCount);
      await refreshPackageHistory();
    } catch (error) {
      setPurchaseError(
        error?.response?.data?.message ||
          error?.message ||
          "Package purchase failed. Please try again.",
      );
    } finally {
      setPurchaseLoading(false);
    }
  };

  return (
    <>
      <SEO
        titleExact
        title="Property Seller Packages - Infrio Properties"
        description="Choose an Infrio Properties seller package to list properties, manage buyer enquiries and use seller dashboard tools."
        canonicalPath="/property-seller-packages"
        keywords="property seller packages, seller listing plans, real estate seller dashboard, property listing package"
      />
      <Header2 />
      <div className="page-content">
        {purchaseSuccess ? (
          <div className="seller-crm-modal-overlay" role="dialog" aria-modal="true">
            <div className="seller-crm-modal-card seller-crm-modal-card--md">
              <div className="seller-crm-modal-body text-center p-a30">
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    background: "#ecfdf5",
                    color: "#059669",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 28,
                    marginBottom: 16,
                  }}
                >
                  <i className="fa fa-check" />
                </div>
                <h3>Order Submitted Successfully</h3>
                {/* <p className="text-muted">{purchaseSuccess.message}</p> */}
               
                <p>
                  Our team will contact you. Your package will activate after
                  payment confirmation and admin approval.
                </p>
                <div className="seller-crm-modal-actions justify-content-center">
                  <button
                    type="button"
                    className="seller-crm-btn-outline"
                    onClick={() => setPurchaseSuccess(null)}
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    className="seller-crm-btn-orange"
                    onClick={() => navigate("/seller-dashboard")}
                  >
                    Go to Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
        {packageToConfirm ? (
          <div
            className="seller-crm-modal-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="package-confirm-title"
          >
            <div
              className="seller-crm-modal-card"
              style={{ width: "min(960px, 94vw)", maxWidth: 960 }}
            >
              <div className="seller-crm-modal-head">
                <h3 id="package-confirm-title">Confirm package purchase</h3>
                <button
                  type="button"
                  className="seller-crm-modal-close"
                  onClick={() => setPackageToConfirm(null)}
                  aria-label="Close"
                >
                  x
                </button>
              </div>
              <div className="seller-crm-modal-body">
                {purchaseError ? (
                  <div className="alert alert-danger">{purchaseError}</div>
                ) : null}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "minmax(0, 1.1fr) minmax(300px, .9fr)",
                    gap: 24,
                  }}
                  className="seller-package-checkout-grid"
                >
                  <section style={{ padding: 22, background: "#f8fafc" }}>
                    <span style={{ color: "#d97706", fontWeight: 800 }}>
                      Selected Package
                    </span>
                    <h2 style={{ margin: "8px 0" }}>{packageToConfirm.name}</h2>
                    <div
                      style={{
                        color: "#f59e0b",
                        fontSize: 40,
                        fontWeight: 900,
                        marginBottom: 12,
                      }}
                    >
                      {packageToConfirm.price}
                    </div>
                    <p><strong>Validity:</strong> {packageToConfirm.duration}</p>
                    <p><strong>Listings:</strong> {packageToConfirm.listings}</p>
                    <ul style={{ paddingLeft: 20, marginBottom: 0 }}>
                      {(packageToConfirm.features || []).map((feature) => (
                        <li key={feature} style={{ marginBottom: 8 }}>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section style={{ padding: 22, border: "1px solid #e2e8f0" }}>
                    <h3 style={{ marginTop: 0 }}>Payment</h3>
                    <label
                      style={{
                        display: "flex",
                        gap: 10,
                        padding: 14,
                        border: "1px solid #e2e8f0",
                        marginBottom: 18,
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="radio"
                        name="packagePayment"
                        value="cod"
                        checked
                        readOnly
                      />
                      <span><strong>COD</strong><br /><small>Pay after confirmation</small></span>
                    </label>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "14px 0",
                        borderTop: "1px solid #e2e8f0",
                        fontSize: 18,
                      }}
                    >
                      <span>Total payable</span>
                      <strong>{packageToConfirm.price}</strong>
                    </div>
                    <label style={{ display: "flex", gap: 10, margin: "12px 0 18px" }}>
                      <input
                        type="checkbox"
                        checked={purchaseConfirmed}
                        onChange={(event) =>
                          setPurchaseConfirmed(event.target.checked)
                        }
                      />
                      <span>I confirm this package and payable amount.</span>
                    </label>
                    <button
                      type="button"
                      className="seller-crm-btn-orange"
                      style={{ width: "100%" }}
                      onClick={() => buyPackage(packageToConfirm)}
                      disabled={purchaseLoading || !purchaseConfirmed}
                    >
                      {purchaseLoading
                        ? "Processing..."
                        : "Submit COD Order"}
                    </button>
                  </section>
                </div>
              </div>
            </div>
          </div>
        ) : null}
        <Banner
          title="Property Seller Packages"
          pagename="Seller Packages"
          description="Choose a package to activate seller listing tools."
          bgimage={bnrimg}
          height={400}
        />

        <section className="section-full p-t70 p-b80 bg-light">
          <div className="container">
            <div className="section-head text-center">
              <h2 style={{ fontWeight: 900 }}>Choose Your Package</h2>
              <p style={{ maxWidth: 720, margin: "0 auto", color: "#64748b" }}>
                These packages help property sellers publish property listings, receive
                buyer enquiries and manage follow-ups from the property seller dashboard.
              </p>
            </div>

          {selectedPackage ? (
            <div className="alert alert-success text-center" role="status">
              {selectedPackage.name} COD order submitted successfully.
            </div>
          ) : null}
            {packagesLoading ? (
              <div className="text-center m-b25"></div>
            ) : null}
            {packageError ? (
              <div className="alert alert-warning text-center">
                {packageError} Showing available package information.
              </div>
            ) : null}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 24,
                alignItems: "stretch",
              }}
              className="property-api-package-grid"
            >
              {packages.map((pkg, index) => {
                const isRecommended = pkg.id === "standard";
                return (
                  <div
                    key={pkg.id}
                    style={{
                      background: "#fff",
                      borderRadius: 8,
                      border: isRecommended
                        ? "2px solid #f59e0b"
                        : "1px solid #e5e7eb",
                      boxShadow: isRecommended
                        ? "0 18px 50px rgba(245,158,11,0.18)"
                        : "0 10px 30px rgba(15,23,42,0.08)",
                      padding: 28,
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        display: "inline-flex",
                        padding: "6px 12px",
                        borderRadius: 999,
                        background: isRecommended ? "#fffbeb" : "#f8fafc",
                        color: isRecommended ? "#d97706" : "#475569",
                        fontWeight: 800,
                        fontSize: 12,
                        marginBottom: 16,
                      }}
                    >
                      {pkg.badge}
                    </div>
                    <h3 style={{ fontWeight: 900, marginBottom: 8 }}>
                      {pkg.name}
                    </h3>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: 8,
                        marginBottom: 18,
                      }}
                    >
                      <span
                        style={{
                          color: "#f59e0b",
                          fontSize: 38,
                          lineHeight: 1,
                          fontWeight: 900,
                        }}
                      >
                        {pkg.price}
                      </span>
                      <span style={{ color: "#64748b" }}>{pkg.duration}</span>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gap: 10,
                        marginBottom: 22,
                        color: "#334155",
                      }}
                    >
                      <div>
                        <strong>{pkg.listings}</strong>
                      </div>
                      <div>{pkg.enquiries}</div>
                    </div>

                    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                      {(pkg.features.length
                        ? pkg.features
                        : [pkg.listings, "Property seller dashboard access", pkg.duration]
                      ).map((feature) => (
                        <li
                          key={feature}
                          style={{
                            display: "flex",
                            gap: 10,
                            alignItems: "flex-start",
                            marginBottom: 12,
                            color: "#334155",
                          }}
                        >
                          <span style={featureIconStyle(index === 0)}>
                            <i className="fa fa-check" style={{ fontSize: 12 }} />
                          </span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      type="button"
                      className="site-button btn-block"
                      style={{ marginTop: 24 }}
                      onClick={() => openPackagePurchase(pkg)}
                    >
                      <span>Buy Now</span>
                    </button>
                  </div>
                );
              })}
            </div>

          </div>
        </section>
      </div>
      <Footer2 />
    </>
  );
}
