import React, { useState, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  getCurrentInquiryUserId,
  submitSolarInquiry,
} from "../../api/solarInquiry";

var bgimg1 = require("./../../images/background/bg-form.jpg");
var bgimg2 = require("./../../images/background/cross-line2.png");
var bgimg3 = require("./../../images/background/bg-map.png");

function ContactUs1() {
  const { auth, isLoggedIn } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    service: [],
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
          if (!services.includes(value)) services.push(value);
        } else {
          services = services.filter((s) => s !== value);
        }
        return { ...prev, service: services };
      });
      if (submitError) setSubmitError("");
      // Clear service error when user selects something
      if (errors.service) {
        setErrors((prev) => ({ ...prev, service: "" }));
      }
    },
    [errors.service, submitError],
  );

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone is required";
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ""))) {
      newErrors.phone = "Phone must be exactly 10 digits";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.service || formData.service.length === 0) {
      newErrors.service = "Please select at least one service";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = auth?.userId || getCurrentInquiryUserId();

    if (!isLoggedIn && !userId) {
      setSubmitError("Please login first to submit the enquiry form.");
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      await submitSolarInquiry(formData, userId);
      setIsSubmitting(false);
      setShowThankYou(true);
      setFormData({
        name: "",
        phone: "",
        email: "",
        service: [],
        city: "",
        message: "",
      });
      setErrors({});
      setTimeout(() => {
        setShowThankYou(false);
      }, 3000);
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
      setSubmitError(
        error?.message ||
          "Unable to submit enquiry right now. Please try again.",
      );
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      email: "",
      service: [],
      city: "",
      message: "",
    });
    setErrors({});
  };

  return (
    <>
      <div
        className="section-full p-tb80 mobile-page-padding bg-center bg-no-repeat bg-fixed"
        style={{ backgroundImage: "url(" + bgimg1 + ")" }}
      >
        <div className="section-content">
          <div className="container get-in-touch-form">
            {/* TITLE START */}
            <div className="section-head">
              <div className="sx-separator-outer separator-left">
                <div
                  className="sx-separator bg-white bg-moving bg-repeat-x"
                  style={{ backgroundImage: "url(" + bgimg2 + ")" }}
                >
                  <h3 className="sep-line-one">Contact Us</h3>
                </div>
              </div>
            </div>
            {/* TITLE END */}
            <div className="row">
              <div className="col-lg-8 col-md-12 col-sm-12">
                <div
                  className="contact-home1-left contact-home1-left-v2 shadow-lg bg-white p-a30"
                  style={{ backgroundImage: "url(" + bgimg3 + ")" }}
                >
                  {showThankYou ? (
                    <div className="text-center p-4">
                      <h3 style={{ color: "#28a745", marginBottom: "20px" }}>
                        Thank You!
                      </h3>
                      <p>Your message has been submitted successfully.</p>
                      <p>We'll get back to you soon!</p>
                    </div>
                  ) : (
                    <form
                      className="cons-contact-form2 form-transparent"
                      onSubmit={handleSubmit}
                    >
                      {submitError ? (
                        <div className="alert alert-warning mb-3">
                          {submitError}
                        </div>
                      ) : null}
                      <div className="input input-animate">
                        <label htmlFor="name">Name *</label>
                        <input
                          type="text"
                          name="name"
                          id="name"
                          value={formData.name}
                          onChange={handleChange}
                          className={errors.name ? "is-invalid" : ""}
                          required
                        />
                        <span className="spin" />
                        {errors.name && (
                          <div className="text-danger mt-1">{errors.name}</div>
                        )}
                      </div>

                      <div className="input input-animate">
                        <label htmlFor="email">Email *</label>
                        <input
                          type="email"
                          name="email"
                          id="email"
                          value={formData.email}
                          onChange={handleChange}
                          className={errors.email ? "is-invalid" : ""}
                          required
                        />
                        <span className="spin" />
                        {errors.email && (
                          <div className="text-danger mt-1">{errors.email}</div>
                        )}
                      </div>

                      <div className="input input-animate">
                        <label htmlFor="phone">Phone (10 digits) *</label>
                        <input
                          type="text"
                          name="phone"
                          id="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className={errors.phone ? "is-invalid" : ""}
                          required
                        />
                        <span className="spin" />
                        {errors.phone && (
                          <div className="text-danger mt-1">{errors.phone}</div>
                        )}
                      </div>

                      <div className="input input-animate">
                        <label htmlFor="city">City *</label>
                        <input
                          type="text"
                          name="city"
                          id="city"
                          value={formData.city}
                          onChange={handleChange}
                          className={errors.city ? "is-invalid" : ""}
                          required
                        />
                        <span className="spin" />
                        {errors.city && (
                          <div className="text-danger mt-1">{errors.city}</div>
                        )}
                      </div>

                      <div className="input input-animate">
                        <label className="d-block mb-2">
                          Select Services *
                        </label>
                        <div className="row">
                          <div className="col-md-4">
                            <div className="form-check">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                id="service1"
                                value="Architectural"
                                checked={formData.service.includes(
                                  "Architectural",
                                )}
                                onChange={handleServiceCheckbox}
                              />
                              <label
                                className="form-check-label"
                                htmlFor="service1"
                              >
                                Architectural
                              </label>
                            </div>
                          </div>
                          <div className="col-md-4">
                            <div className="form-check">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                id="service2"
                                value="Interior"
                                checked={formData.service.includes("Interior")}
                                onChange={handleServiceCheckbox}
                              />
                              <label
                                className="form-check-label"
                                htmlFor="service2"
                              >
                                Interior
                              </label>
                            </div>
                          </div>
                          <div className="col-md-4">
                            <div className="form-check">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                id="service3"
                                value="Turnkey"
                                checked={formData.service.includes("Turnkey")}
                                onChange={handleServiceCheckbox}
                              />
                              <label
                                className="form-check-label"
                                htmlFor="service3"
                              >
                                Turnkey Construction Projects
                              </label>
                            </div>
                          </div>
                          <div className="col-md-4">
                            <div className="form-check">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                id="service4"
                                value="Others"
                                checked={formData.service.includes("Others")}
                                onChange={handleServiceCheckbox}
                              />
                              <label
                                className="form-check-label"
                                htmlFor="service4"
                              >
                                Others
                              </label>
                            </div>
                          </div>
                        </div>
                        {errors.service && (
                          <div className="text-danger mt-1">
                            {errors.service}
                          </div>
                        )}
                      </div>

                      <div className="input input-animate">
                        <label htmlFor="message">Message *</label>
                        <textarea
                          name="message"
                          id="message"
                          value={formData.message}
                          onChange={handleChange}
                          className={errors.message ? "is-invalid" : ""}
                          required
                          rows="4"
                        />
                        <span className="spin" />
                        {errors.message && (
                          <div className="text-danger mt-1">
                            {errors.message}
                          </div>
                        )}
                      </div>

                      <div className="text-left p-t10">
                        <button
                          type="submit"
                          className="site-button-secondry btn-half"
                          disabled={isSubmitting}
                        >
                          <span>
                            {isSubmitting ? "Submitting..." : "Submit Now"}
                          </span>
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ContactUs1;
