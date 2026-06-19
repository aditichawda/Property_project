import React, { useEffect, useMemo, useState } from "react";
import { NavLink, Navigate, useLocation, useParams } from "react-router-dom";
import Header2 from "../Common/Header2";
import Footer2 from "../Common/Footer2";
import SEO from "../Common/SEO";
import Banner from "../Elements/Banner";
import { fetchPropertyDetail } from "../../api/properties";
import {
  getCurrentInquiryUserId,
  submitSolarInquiry,
} from "../../api/solarInquiry";
import { useAuth } from "../../context/AuthContext";
const bnrimg = require("./../../images/property/2.jpg");
function SellerDetail() {
  const { sellerId } = useParams();
  const location = useLocation();
  const { auth } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const galleryImages = useMemo(
    () =>
      property
        ? [property.image, ...(property.gallery || [])].filter(
            (image, index, list) => image && list.indexOf(image) === index,
          )
        : [],
    [property],
  );
  const [selectedImage, setSelectedImage] = useState(galleryImages[0] || "");
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    email: "",
    city: "",
    message: "",
  });
  const [showThankYou, setShowThankYou] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const detail = await fetchPropertyDetail({ id: sellerId });
        if (!cancelled && detail?.id) setProperty(detail);
      } catch {
        if (!cancelled) setProperty(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sellerId]);

  useEffect(() => {
    setSelectedImage(galleryImages[0] || "");
  }, [galleryImages, sellerId]);

  if (!loading && !property) {
    return <Navigate to="/error-404" replace />;
  }

  if (!loading && property?.status !== "Active") {
    return <Navigate to="/error-404" replace />;
  }

  if (!property) {
    return null;
  }

  const cameFromPropertySeller =
    location.state?.activeNav === "property-sellers";
  const isNormalUserLoggedIn = auth?.role === "normal";
  const canShowInquiryForm = !auth || isNormalUserLoggedIn;

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const submitInquiry = async (event) => {
    event.preventDefault();
    setSubmitError("");
    if (auth && !isNormalUserLoggedIn) {
      setSubmitError("Please login as normal user to submit property enquiry.");
      return;
    }
    const userId = auth?.userId || getCurrentInquiryUserId();
    if (!userId) {
      setSubmitError("Please login first to submit property enquiry.");
      return;
    }
    try {
      setSubmitting(true);
      await submitSolarInquiry(
        {
          name: form.name,
          email: form.email,
          phone: form.mobile,
          city: form.city,
          message: form.message,
          sellerId: property.seller_id || property.seller?.id,
          propertyId: property.id,
          propertyName: property.title,
          propertyType: property.property_type_name || property.type,
          propertyLocation: property.location,
          userId,
        },
        userId,
      );
      setShowThankYou(true);
      setForm({ name: "", mobile: "", email: "", message: "", city: "" });
      setTimeout(() => {
        setShowThankYou(false);
      }, 3000);
    } catch (error) {
      setSubmitError(
        error?.message || "Unable to submit enquiry. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <SEO
        titleExact
        title={`${property.title} - Property Details`}
        description={`${property.title} in ${property.location}. ${property.shortDescription}`}
        canonicalPath={`/properties/${property.id}`}
        keywords={`${property.title}, ${property.type}, property in ${property.location}`}
      />
      <Header2 />
      <div className="page-content">
        <Banner
          title={property.title}
          pagename="Property Details"
          description={`${property.location} | ${property.type} | ${property.price}`}
          bgimage={bnrimg}
        />

        <div className="section-full p-t50 p-b80 bg-white mobile-page-padding solar-seller-detail">
          <div className="container">
            <nav
              className="solar-seller-detail__breadcrumb m-b30"
              aria-label="Breadcrumb"
            >
              <NavLink to="/">Home</NavLink>
              <span className="solar-seller-detail__crumb-sep"> / </span>
              <NavLink
                to={
                  cameFromPropertySeller && location.state?.fromSellerId
                    ? `/property-sellers/${location.state.fromSellerId}`
                    : "/properties"
                }
                state={{
                  activeNav: cameFromPropertySeller
                    ? "property-sellers"
                    : "properties",
                }}
              >
                {cameFromPropertySeller ? "Property Seller" : "Properties"}
              </NavLink>
              <span className="solar-seller-detail__crumb-sep"> / </span>
              <span className="text-muted">{property.title}</span>
            </nav>

            <div className="row">
              <div className="col-lg-7 col-md-12 m-b40">
                <div className="solar-seller-detail__media-wrap">
                  <div className="solar-seller-detail__image">
                    <img src={selectedImage} alt={property.title} />
                  </div>
                </div>
                <div className="seller-crm-media-preview__gallery m-t15">
                  {galleryImages.map((image, index) => (
                    <button
                      type="button"
                      className={
                        selectedImage === image
                          ? "seller-crm-thumb seller-crm-thumb--active"
                          : "seller-crm-thumb"
                      }
                      key={image}
                      onClick={() => setSelectedImage(image)}
                      aria-label={`Show property image ${index + 1}`}
                    >
                      <img src={image} alt={`${property.title} ${index + 1}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="col-lg-5 col-md-12">
                <div className="bg-white shadow rounded p-a25 m-b20">
                  <h3 className="m-t0 m-b10" style={{ fontWeight: 800 }}>
                    {property.price}
                  </h3>
                  {loading ? <p className="text-muted">Loading latest details...</p> : null}
                  <p className="m-b10">
                    <i className="fa fa-map-marker sx-text-primary m-r5" />
                    {property.location}
                  </p>
                  <p className="m-b20">{property.shortDescription}</p>
                  <div className="seller-crm-service-view__grid">
                    <div>
                      <div className="seller-crm-k">Property Type</div>
                      <div className="seller-crm-v">
                        {property.property_type_name || property.type}
                      </div>
                    </div>

                    <div>
                      <div className="seller-crm-k">Area Size</div>
                      <div className="seller-crm-v">
                        {property.specifications.areaSize}
                      </div>
                    </div>
                    <div>
                      <div className="seller-crm-k">Bedrooms</div>
                      <div className="seller-crm-v">
                        {property.specifications.bedrooms}
                      </div>
                    </div>
                    <div>
                      <div className="seller-crm-k">Bathrooms</div>
                      <div className="seller-crm-v">
                        {property.specifications.bathrooms}
                      </div>
                    </div>
                    <div>
                      <div className="seller-crm-k">Parking</div>
                      <div className="seller-crm-v">
                        {property.specifications.parking}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              <div className={canShowInquiryForm ? "col-lg-7 m-b30" : "col-lg-12 m-b30"}>
                <div className="bg-white shadow rounded p-a25 h-100">
                  <h4 className="m-t0">Full Description</h4>
                  <p>{property.description}</p>
                  <h5>Amenities</h5>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {property.amenities.map((item) => (
                      <span
                        className="badge badge-light"
                        style={{ padding: "8px 12px" }}
                        key={item}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                  <h5 className="mt-3">Seller Details</h5>
                  <p className="m-b5">
                    <strong>{property.seller.name}</strong> 
                    {/* {property.seller.company} */}
                  </p>
                  <p className="m-b5">{property.seller.mobile}</p>
                  <p className="m-b0">{property.seller.email}</p>
                </div>
              </div>
              {canShowInquiryForm ? (
                <div className="col-lg-5 m-b30">
                  <form
                    className="bg-white shadow rounded p-a25 h-100"
                    onSubmit={submitInquiry}
                  >
                    <h4 className="m-t0">Enquiry Form</h4>
                    {submitError ? (
                      <div className="alert alert-danger">{submitError}</div>
                    ) : null}
                    <div className="form-group">
                      <input
                        className="form-control"
                        name="name"
                        value={form.name}
                        onChange={updateField}
                        placeholder="Name"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <input
                        className="form-control"
                        name="mobile"
                        value={form.mobile}
                        onChange={updateField}
                        placeholder="Mobile Number"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <input
                        className="form-control"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={updateField}
                        placeholder="Email"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <input
                        className="form-control"
                        name="city"
                        type="text"
                        value={form.city}
                        onChange={updateField}
                        placeholder="City"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <input
                        className="form-control"
                        value={property.title}
                        readOnly
                      />
                    </div>
                    <div className="form-group">
                      <textarea
                        className="form-control"
                        name="message"
                        value={form.message}
                        onChange={updateField}
                        placeholder="Message"
                        rows="4"
                        required
                      />
                    </div>
                    <button
                      className="site-button btn-half"
                      type="submit"
                      disabled={submitting}
                    >
                      <span>
                        {submitting ? "Submitting..." : "Submit Enquiry"}
                      </span>
                    </button>
                  </form>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
      <Footer2 />
      {showThankYou ? (
        <div
          className="modal fade show"
          style={{
            display: "block",
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 9999,
          }}
          tabIndex="-1"
          role="dialog"
          aria-modal="true"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header border-0">
                <button
                  type="button"
                  className="close"
                  onClick={() => setShowThankYou(false)}
                  aria-label="Close"
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body text-center p-4">
                <div
                  className="mb-3"
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "50%",
                    backgroundColor: "#28a745",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto",
                  }}
                >
                  <i
                    className="fa fa-check"
                    style={{ color: "white", fontSize: "30px" }}
                  />
                </div>
                <h3 style={{ color: "#28a745", marginBottom: "15px" }}>
                  Thank You!
                </h3>
                <p>Your property enquiry has been submitted successfully.</p>
                <p>Seller will contact you soon.</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default SellerDetail;
