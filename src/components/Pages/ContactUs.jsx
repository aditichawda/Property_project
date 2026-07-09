import React, { useState, useCallback } from "react";
import Header2 from "./../Common/Header2";
import SEO from "./../Common/SEO";
import Banner from "./../Elements/Banner";
import GoogleMapReact from "google-map-react";
import Footer2 from "../Common/Footer2";
import { submitInfrInquiry } from "../../api/solarInquiry";
var bnrimg = require("./../../images/property/4.jpg");

const AnyReactComponent = ({ text }) => <div>{text}</div>;

const consultationServices = [
  "Residential Property",
  "Commercial Property",
  "Plot / Land",
  "Buy Property",
  "Sell Property",
  "Rental Property",
];

function ContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (submitError) setSubmitError("");
      // Clear error when user starts typing
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: "" }));
      }
    },
    [errors, submitError],
  );

  const handleServiceCheckbox = useCallback(
    (e) => {
      const { value, checked } = e.target;
      setFormData((prev) => {
        let services = [...prev.service];
        if (checked) {
          if (!services.includes(value)) {
            services.push(value);
          }
        } else {
          services = services.filter((s) => s !== value);
        }
        return { ...prev, service: services };
      });
      if (submitError) setSubmitError("");
      // Clear error when user selects a service
      if (errors.service) {
        setErrors((prev) => ({ ...prev, service: "" }));
      }
    },
    [errors.service, submitError],
  );

  const validateForm = () => {
    const errors = {};

    // Name validation
    if (!formData.name.trim()) {
      errors.name = "Name is required";
    }

    // Phone validation - must be 10 digits
    if (!formData.phone.trim()) {
      errors.phone = "Phone is required";
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ""))) {
      errors.phone = "Phone must be exactly 10 digits";
    }

    // Email validation
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email";
    }

    // City validation
    if (!formData.city) {
      errors.city = "City is required";
    }

    // Message validation
    if (!formData.message.trim()) {
      errors.message = "Message is required";
    }

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      await submitInfrInquiry(formData);
      setShowThankYou(true);
      setFormData({
        name: "",
        phone: "",
        email: "",  
        city: "",
        message: "",
      });
      setErrors({});
      setTimeout(() => {
        setShowThankYou(false);
        setIsSubmitting(false);
      }, 5000);
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
      setSubmitError(
        error?.message ||
          "Unable to submit enquiry right now. Please try again.",
      );
    }
  };

  const defaultProps = {
    center: {
      lat: 34.07328,
      lng: -118.25141,
    },
    zoom: 12,
  };

  return (
    <>
      <SEO
        titleExact
        title="Contact Infrio | Property Marketplace Support"
        description="Get in touch with Infrio Property Marketplace for property listings, buying, selling, and enquiry support. Contact our team for assistance with residential, commercial, and investment property solutions."
        keywords="contact infrio, property marketplace contact, real estate support, property enquiry, contact property seller, contact property buyer, real estate contact, property listing support, property marketplace support, buy property assistance, sell property assistance, real estate consultation, property management support"
        canonicalPath="/contact-us"
      />
      <Header2 />
      <div className="page-content">
        <Banner
          title="Contact Us"
          pagename="Contact us"
          description="Contact us for property listings, seller support and buyer enquiries."
          bgimage={bnrimg}
        />
        {/* SECTION CONTENTG START */}
        <div className="section-full p-tb80 inner-page-padding">
          {/* LOCATION BLOCK*/}
          <div className="container">
            {/* GOOGLE MAP & CONTACT FORM */}
            <div className="section-content">
              <div className="row">
                <div className="col-lg-5 col-md-12">
                  <div className="p-a30 bg-white radius-md block-shadow h-100">
                    <h3 className="m-t0 m-b10">Contact Property Experts</h3>
                    <p className="text-muted m-b25">
                      Reach out to us for property enquiries, seller support, or
                      listing assistance. Our team will respond during business
                      hours.
                    </p>

                    <div className="sx-icon-box-wraper left p-b20">
                      <div className="icon-xs sx-text-primary">
                        <i className="fa fa-phone" />
                      </div>
                      <div className="icon-content">
                        <h5 className="m-t0">Phone</h5>
                        <p className="m-b0">(+91) 900-1457-000</p>
                      </div>
                    </div>

                    <div className="sx-icon-box-wraper left p-b20">
                      <div className="icon-xs sx-text-primary">
                        <i className="fa fa-envelope" />
                      </div>
                      <div className="icon-content">
                        <h5 className="m-t0">Email</h5>
                        <p className="m-b0">properties@infrioindia.com</p>
                      </div>
                    </div>

                    <div className="sx-icon-box-wraper left">
                      <div className="icon-xs sx-text-primary">
                        <i className="fa fa-map-marker" />
                      </div>
                      <div className="icon-content">
                        <h5 className="m-t0">Address</h5>
                        <p className="m-b0">
                         1st floor, Above Swastik Plywood, 27, New Grain Mandi, Kota, 324005
                        </p>
                      </div>
                    </div>

                  
                  </div>
                </div>

                <div className="col-lg-7 col-md-12">
                  <div className="p-a30 bg-white radius-md block-shadow">
                    <h3 className="m-t0 m-b5">Get Expert Property Guidance</h3>
                    <p className="text-muted m-b20">
                      Share your property requirements with us and our team will
                      help you find the right property or connect with genuine
                      buyers.
                    </p>

                    <form className="contact-form" onSubmit={handleSubmit}>
                      {submitError ? (
                        <div className="alert alert-warning m-b20">
                          {submitError}
                        </div>
                      ) : null}
                      <div className="row">
                        <div className="col-md-6">
                          <div className="form-group">
                            <input
                              name="name"
                              type="text"
                              required
                              className={`form-control ${errors.name ? "is-invalid" : ""}`}
                              placeholder="Full Name  *"
                              value={formData.name}
                              onChange={handleChange}
                            />
                            {errors.name && (
                              <div className="text-danger mt-1">
                                {errors.name}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <input
                              name="phone"
                              type="tel"
                              required
                              className={`form-control ${errors.phone ? "is-invalid" : ""}`}
                              placeholder="Mobile No. *"
                              value={formData.phone}
                              onChange={handleChange}
                            />
                            {errors.phone && (
                              <div className="text-danger mt-1">
                                {errors.phone}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <input
                              name="email"
                              type="email"
                              required
                              className={`form-control ${errors.email ? "is-invalid" : ""}`}
                              placeholder="Email *"
                              value={formData.email}
                              onChange={handleChange}
                            />
                            {errors.email && (
                              <div className="text-danger mt-1">
                                {errors.email}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-group">
                            <input
                              name="city"
                              type="text"
                              required
                              className={`form-control ${errors.city ? "is-invalid" : ""}`}
                              placeholder="city *"
                              value={formData.city}
                              onChange={handleChange}
                            />
                            {errors.city && (
                              <div className="text-danger mt-1">
                                {errors.city}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* <div className="form-group m-t10">
                        <label className="d-block mb-2 font-13 text-uppercase solar-filter-label">
                          Property Type *
                        </label>
                        <div className="row">
                          {consultationServices.map((service, index) => {
                            const id = `consultation-service-${index + 1}`;
                            return (
                              <div className="col-sm-6" key={service}>
                                <div className="form-check mb-2">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    value={service}
                                    id={id}
                                    checked={formData.service.includes(service)}
                                    onChange={handleServiceCheckbox}
                                  />
                                  <label
                                    className="form-check-label"
                                    htmlFor={id}
                                  >
                                    {service}
                                  </label>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        {errors.service && (
                          <div className="text-danger mt-1">
                            {errors.service}
                          </div>
                        )}
                      </div> */}

                      <div className="form-group">
                        <textarea
                          name="message"
                          rows={4}
                          className={`form-control ${errors.message ? "is-invalid" : ""}`}
                          required
                          placeholder="Message *"
                          value={formData.message}
                          onChange={handleChange}
                        />
                        {errors.message && (
                          <div className="text-danger mt-1">
                            {errors.message}
                          </div>
                        )}
                      </div>

                      <div className="d-flex justify-content-end">
                        <button
                          name="submit"
                          type="submit"
                          className="site-button btn-half"
                          disabled={isSubmitting}
                        >
                          <span>
                            {isSubmitting ? "Submitting..." : "Submit"}
                          </span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="gmap-outline">
          <GoogleMapReact
            bootstrapURLKeys={{
              key: "AIzaSyAfY1DRbspf6E3jYUso-PeI_tdfRXA59i0",
              libraries: ["places"],
            }}
            defaultCenter={defaultProps.center}
            defaultZoom={defaultProps.zoom}
            options={{
              loading: "async",
            }}
          >
            <AnyReactComponent
              lat={34.07328}
              lng={-118.25141}
              text={<i className="fa fa-map-marker" />}
            />
          </GoogleMapReact>
        </div>
        {/* SECTION CONTENT END */}
      </div>

      <Footer2 />

      {/* Thank You Popup Modal */}
      {showThankYou && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header border-0">
                <button
                  type="button"
                  className="close"
                  onClick={() => {
                    setShowThankYou(false);
                    setIsSubmitting(false);
                  }}
                >
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body text-center p-4">
                <div className="mb-3">
                  <i
                    className="fa fa-check-circle"
                    style={{ fontSize: "60px", color: "#28a745" }}
                  ></i>
                </div>
                <h3 style={{ color: "#28a745", marginBottom: "20px" }}>
                  Thank You!
                </h3>
                <p>Your property enquiry has been submitted successfully.</p>
                <p>We'll get back to you soon!</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ContactUs;
